import nodemailer from 'nodemailer';
import { formatCurrency, APP_CONFIG } from '@/constants/config';
import { formatDisplayDate } from '@/lib/dates';

interface SendReminderOptions {
  to: string;
  category: string;
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
 * Crée le transporteur SMTP universel (Mailpit en local, Resend/Brevo/Custom en production)
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
 * Envoie un email de rappel d'échéance récurrente avec gabarit néobrutaliste
 */
export async function sendRecurringReminderEmail(
  options: SendReminderOptions
): Promise<MailerResult> {
  try {
    const transporter = createMailTransporter();
    const fromAddress =
      process.env.SMTP_FROM || `GEST TRACKER <notifications@gest-tracker.local>`;

    let timelineText = `dans ${options.offsetDays} jours`;
    if (options.offsetDays === 0) timelineText = "aujourd'hui";
    else if (options.offsetDays === 1) timelineText = 'demain';
    else if (options.offsetDays === 7) timelineText = 'dans 7 jours';
    else if (options.offsetDays === 3) timelineText = 'dans 3 jours';

    const operationLabel = options.type === 'INCOME' ? 'Entrée prévue' : 'Dépense prévue';
    const amountFormatted = formatCurrency(options.amount);
    const dateFormatted = formatDisplayDate(options.dueDate, 'EEEE dd MMMM yyyy');

    const subject = `Rappel d'échéance : ${options.category} (${amountFormatted}) - Échéance ${timelineText}`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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
      <h1 class="title">${APP_CONFIG.appName}</h1>
      <div class="badge">${operationLabel} - ${timelineText.toUpperCase()}</div>
    </div>

    <p style="font-size: 14px; line-height: 1.5; color: #374151;">
      Bonjour, ceci est un rappel automatique concernant votre règle récurrente pour <strong>${options.category}</strong>.
    </p>

    <div class="card">
      <div class="amount">${amountFormatted}</div>
      <div class="detail-row"><strong>Catégorie :</strong> ${options.category}</div>
      <div class="detail-row"><strong>Date d'échéance :</strong> ${dateFormatted}</div>
      ${options.note ? `<div class="detail-row"><strong>Note :</strong> ${options.note}</div>` : ''}
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
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject,
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
