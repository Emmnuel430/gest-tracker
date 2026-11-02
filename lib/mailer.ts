import nodemailer from 'nodemailer';
import { formatCurrency, APP_CONFIG } from '@/constants/config';
import { formatDisplayDate } from '@/lib/dates';

export interface SendReminderOptions {
  to: string;
  category: string;
  payment?: string | null;
  type: string;
  amount: number;
  dueDate: Date;
  offsetDays: number;
  note?: string | null;
}

export interface MailerResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Échappe les caractères spéciaux HTML pour prévenir toute injection HTML/XSS
 * dans les gabarits d'e-mails (MAIL-04).
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Normalise l'adresse d'expédition (en-tête From) en fonction du fournisseur SMTP (MAIL-03).
 * Avec Gmail SMTP (smtp.gmail.com), garantit un format "Gest Tracker <adresse>" propre.
 */
export function resolveSenderAddress(env: NodeJS.ProcessEnv = process.env): string {
  const rawFrom = env.SMTP_FROM?.trim();
  const smtpUser = env.SMTP_USER?.trim();
  const smtpHost = (env.SMTP_HOST || '').trim().toLowerCase();

  if (smtpHost.includes('gmail.com') && smtpUser) {
    if (!rawFrom || rawFrom.includes('.local')) {
      return `Gest Tracker <${smtpUser}>`;
    }
    if (!rawFrom.includes('<')) {
      return `Gest Tracker <${rawFrom}>`;
    }
    return rawFrom;
  }

  if (!rawFrom) {
    if (smtpUser && smtpUser.includes('@')) {
      return `Gest Tracker <${smtpUser}>`;
    }
    return 'GEST TRACKER <notifications@gest-tracker.local>';
  }

  if (!rawFrom.includes('<')) {
    return `Gest Tracker <${rawFrom}>`;
  }

  return rawFrom;
}

/**
 * Construit le sujet, le corps texte et le corps HTML sécurisé d'un e-mail de rappel d'échéance.
 */
export function buildReminderEmailContent(options: SendReminderOptions): {
  subject: string;
  text: string;
  html: string;
} {
  let timelineText = `dans ${options.offsetDays} jours`;
  if (options.offsetDays === 0) timelineText = "aujourd'hui";
  else if (options.offsetDays === 1) timelineText = 'demain';
  else if (options.offsetDays === 7) timelineText = 'dans 7 jours';
  else if (options.offsetDays === 3) timelineText = 'dans 3 jours';

  const operationLabel = options.type === 'INCOME' ? 'Entrée prévue' : 'Dépense prévue';
  const amountFormatted = formatCurrency(options.amount);
  const dateFormatted = formatDisplayDate(options.dueDate, 'EEEE dd MMMM yyyy');

  const safeCategory = escapeHtml(options.category);
  const safeDate = escapeHtml(dateFormatted);
  const safePayment = options.payment ? escapeHtml(options.payment) : null;
  const safeNote = options.note ? escapeHtml(options.note) : null;
  const safeAmount = escapeHtml(amountFormatted);
  const safeAppName = escapeHtml(APP_CONFIG.appName);

  const subject = `Rappel d'échéance : ${options.category} (${amountFormatted}) - Échéance ${timelineText}`;

  const textLines = [
    `${APP_CONFIG.appName} - ${operationLabel} (${timelineText})`,
    '',
    `Bonjour, ceci est un rappel automatique concernant votre règle récurrente pour "${options.category}".`,
    '',
    `Montant : ${amountFormatted}`,
    `Catégorie : ${options.category}`,
    ...(options.payment ? [`Portefeuille : ${options.payment}`] : []),
    `Date d'échéance : ${dateFormatted}`,
    ...(options.note ? [`Note : ${options.note}`] : []),
    '',
    'Pensez à vous connecter à votre application pour valider cette opération ou ajuster vos prévisions de trésorerie.',
  ];

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      color: #111827;
      margin: 0;
      padding: 30px 15px;
    }
    .wrapper {
      max-width: 540px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 3px solid #111827;
      border-radius: 12px;
      box-shadow: 6px 6px 0px #111827;
      padding: 30px;
    }
    .header {
      border-bottom: 2px solid #111827;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 20px;
      font-weight: 900;
      text-transform: uppercase;
      margin: 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background-color: ${options.type === 'INCOME' ? '#DCFCE7' : '#FFE4E6'};
      border: 2px solid #111827;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      margin-top: 10px;
    }
    .card {
      background-color: #F8FAFC;
      border: 2px solid #111827;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      box-shadow: 3px 3px 0px #111827;
    }
    .amount {
      font-size: 26px;
      font-weight: 900;
      color: #111827;
    }
    .detail-row {
      margin-top: 8px;
      font-size: 13px;
      color: #4B5563;
    }
    .footer {
      border-top: 1px solid #E5E7EB;
      padding-top: 16px;
      margin-top: 24px;
      font-size: 11px;
      color: #6B7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="title">${safeAppName}</h1>
      <div class="badge">${operationLabel} - ${escapeHtml(timelineText.toUpperCase())}</div>
    </div>

    <p style="font-size: 14px; line-height: 1.5; color: #374151;">
      Bonjour, ceci est un rappel automatique concernant votre règle récurrente pour <strong>${safeCategory}</strong>.
    </p>

    <div class="card">
      <div class="amount">${safeAmount}</div>
      <div class="detail-row"><strong>Catégorie :</strong> ${safeCategory}</div>
      ${safePayment ? `<div class="detail-row"><strong>Portefeuille :</strong> ${safePayment}</div>` : ''}
      <div class="detail-row"><strong>Date d'échéance :</strong> ${safeDate}</div>
      ${safeNote ? `<div class="detail-row"><strong>Note :</strong> ${safeNote}</div>` : ''}
    </div>

    <p style="font-size: 13px; color: #4B5563; line-height: 1.5;">
      Pensez à vous connecter à votre application pour valider cette opération ou ajuster vos prévisions de trésorerie.
    </p>

    <div class="footer">
      GEST TRACKER - Gestion et Souveraineté Financière
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    subject,
    text: textLines.join('\n'),
    html,
  };
}

/**
 * Crée le transporteur SMTP universel (Mailpit en local, Gmail SMTP / Resend / Brevo en production)
 */
export function createMailTransporter() {
  const host = process.env.SMTP_HOST || '127.0.0.1';
  const port = Number(process.env.SMTP_PORT) || 54325;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const auth = user && pass ? { user, pass } : undefined;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/**
 * Envoie un email de rappel d'échéance récurrente avec gabarit néobrutaliste sécurisé
 */
export async function sendRecurringReminderEmail(
  options: SendReminderOptions
): Promise<MailerResult> {
  try {
    const transporter = createMailTransporter();
    const fromAddress = resolveSenderAddress();
    const { subject, text, html } = buildReminderEmailContent(options);

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject,
      text,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
