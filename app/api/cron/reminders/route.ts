import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import {
  getRemindersDueOn,
  getTodayInTimeZone,
  MAX_REMINDER_ATTEMPTS,
} from '@/lib/recurring';
import { sendRecurringReminderEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

/**
 * Résout les adresses e-mail des utilisateurs ciblés sans limite de pagination à 50 inscrits (MAIL-02).
 * Priorise la requête SQL directe sur auth.users pour les identifiants concernés, puis
 * complète au besoin par des appels ciblés auth.admin.getUserById(userId).
 */
async function resolveUserEmails(userIds: string[]): Promise<Map<string, string>> {
  const emailMap = new Map<string, string>();
  if (userIds.length === 0) {
    return emailMap;
  }

  try {
    const users = await prisma.$queryRaw<{ id: string; email: string }[]>`
      SELECT id::text, email FROM auth.users WHERE id::text IN (${Prisma.join(userIds)})
    `;
    for (const u of users) {
      if (u.email) {
        emailMap.set(u.id, u.email);
      }
    }
  } catch (e: unknown) {
    console.warn(
      'Impossible de requêter auth.users via SQL direct, utilisation du fallback Supabase Admin.',
      e
    );
  }

  const missingUserIds = userIds.filter((id) => !emailMap.has(id));
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (missingUserIds.length > 0 && supabaseUrl && serviceRoleKey) {
    const supabaseAdmin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    for (const uid of missingUserIds) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(uid);
        if (!error && data?.user?.email) {
          emailMap.set(uid, data.user.email);
        }
      } catch (err: unknown) {
        console.warn(`Impossible de résoudre l'email pour l'utilisateur ${uid}:`, err);
      }
    }
  }

  return emailMap;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Contrôle d'authentification par CRON_SECRET (Section 8.4 & T4)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: 'Non autorisé: secret cron invalide.' },
          { status: 401 }
        );
      }
    }

    // 2. Récupération des règles récurrentes actives avec rappels activés
    // Exclut les règles dont le portefeuille associé a été supprimé ou archivé.
    const rules = await prisma.recurringRule.findMany({
      where: {
        isActive: true,
        remindersEnabled: true,
        OR: [
          { walletId: null },
          { wallet: { deletedAt: null, isArchived: false } },
        ],
      },
    });

    if (rules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune règle récurrente active avec rappels activés.',
        sent: 0,
        failed: 0,
      });
    }

    // 3. Récupération des logs de rappels existants pour ces règles
    const ruleIds = rules.map((r) => r.id);
    const existingLogs = await prisma.recurringReminderLog.findMany({
      where: {
        ruleId: { in: ruleIds },
      },
    });

    // 4. Calcul des rappels dus aujourd'hui dans le fuseau métier Africa/Abidjan (MAIL-01)
    const today = getTodayInTimeZone();
    const validLogsForFilter = existingLogs.filter(
      (log) => log.status === 'SENT' || log.attempts >= MAX_REMINDER_ATTEMPTS
    );

    const dueReminders = getRemindersDueOn(today, rules, validLogsForFilter);

    if (dueReminders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun rappel dû à ce jour.',
        sent: 0,
        failed: 0,
      });
    }

    // 5. Récupération ciblée des emails des utilisateurs concernés (MAIL-02)
    const userIds = Array.from(new Set(dueReminders.map((r) => r.userId)));
    const emailMap = await resolveUserEmails(userIds);

    let sentCount = 0;
    let failedCount = 0;

    // 6. Envoi des e-mails et enregistrement sécurisé des statuts (Règle 8)
    for (const reminder of dueReminders) {
      const recipientEmail = emailMap.get(reminder.userId);

      if (!recipientEmail) {
        await prisma.recurringReminderLog.upsert({
          where: {
            ruleId_dueDate_offsetDays: {
              ruleId: reminder.ruleId,
              dueDate: reminder.dueDate,
              offsetDays: reminder.offsetDays,
            },
          },
          create: {
            userId: reminder.userId,
            ruleId: reminder.ruleId,
            dueDate: reminder.dueDate,
            offsetDays: reminder.offsetDays,
            status: 'FAILED',
            attempts: 1,
          },
          update: {
            status: 'FAILED',
            attempts: { increment: 1 },
          },
        });
        failedCount++;
        continue;
      }

      const mailResult = await sendRecurringReminderEmail({
        to: recipientEmail,
        category: reminder.category,
        payment: reminder.payment,
        type: reminder.type,
        amount: reminder.amount,
        dueDate: reminder.dueDate,
        offsetDays: reminder.offsetDays,
        note: reminder.note,
      });

      if (mailResult.success) {
        await prisma.recurringReminderLog.upsert({
          where: {
            ruleId_dueDate_offsetDays: {
              ruleId: reminder.ruleId,
              dueDate: reminder.dueDate,
              offsetDays: reminder.offsetDays,
            },
          },
          create: {
            userId: reminder.userId,
            ruleId: reminder.ruleId,
            dueDate: reminder.dueDate,
            offsetDays: reminder.offsetDays,
            status: 'SENT',
            sentAt: new Date(),
            attempts: 1,
          },
          update: {
            status: 'SENT',
            sentAt: new Date(),
            attempts: { increment: 1 },
          },
        });
        sentCount++;
      } else {
        await prisma.recurringReminderLog.upsert({
          where: {
            ruleId_dueDate_offsetDays: {
              ruleId: reminder.ruleId,
              dueDate: reminder.dueDate,
              offsetDays: reminder.offsetDays,
            },
          },
          create: {
            userId: reminder.userId,
            ruleId: reminder.ruleId,
            dueDate: reminder.dueDate,
            offsetDays: reminder.offsetDays,
            status: 'FAILED',
            attempts: 1,
          },
          update: {
            status: 'FAILED',
            attempts: { increment: 1 },
          },
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: dueReminders.length,
      sent: sentCount,
      failed: failedCount,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
