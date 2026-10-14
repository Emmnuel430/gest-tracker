import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getRemindersDueOn, ReminderTarget } from '@/lib/recurring';
import { sendRecurringReminderEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

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
    const rules = await prisma.recurringRule.findMany({
      where: {
        isActive: true,
        remindersEnabled: true,
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

    // 4. Calcul des rappels dus aujourd'hui (J-7, J-3, J0)
    const today = new Date();
    // Filtre des logs : ignorer ceux déjà SENT ou ayant atteint le max d'essais (max 3)
    const validLogsForFilter = existingLogs.filter(
      (log) => log.status === 'SENT' || log.attempts >= 3
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

    // 5. Récupération des emails des utilisateurs concernés
    const userIds = Array.from(new Set(dueReminders.map((r) => r.userId)));
    const emailMap = new Map<string, string>();

    try {
      if (userIds.length > 0) {
        const users = await prisma.$queryRaw<{ id: string; email: string }[]>`
          SELECT id::text, email FROM auth.users WHERE id::text IN (${Prisma.join(userIds)})
        `;
        for (const u of users) {
          if (u.email) {
            emailMap.set(u.id, u.email);
          }
        }
      }
    } catch (e: unknown) {
      console.warn('Impossible de requêter auth.users via SQL direct, utilisation du fallback.', e);
    }

    let sentCount = 0;
    let failedCount = 0;

    // 6. Envoi des e-mails et enregistrement sécurisé des statuts (Règle 7)
    for (const reminder of dueReminders) {
      const recipientEmail = emailMap.get(reminder.userId);

      if (!recipientEmail) {
        // Enregistrement d'échec si l'utilisateur n'a pas d'adresse e-mail
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
