import React from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/constants/config";
import { formatDisplayDate } from "@/lib/dates";
import { CATEGORY_COLORS } from "@/constants/categories";
import { PAYMENT_METHOD_THEMES } from "@/constants/payment-methods";

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export function RecentTransactionsList({
  transactions,
}: RecentTransactionsListProps) {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#111827]">
          Dernières opérations
        </h3>
        <Link
          href="/historique"
          className="text-xs font-black uppercase text-[#2563EB] hover:text-[#1D4ED8] underline"
        >
          Tout voir ➔
        </Link>
      </div>

      <div className="space-y-2.5">
        {transactions.map((tx) => {
          const isIncome = tx.type === "INCOME";
          const catColor = CATEGORY_COLORS[tx.category] || "#2563EB";
          const paymentTheme = PAYMENT_METHOD_THEMES[tx.payment] || {
            bg: "#EFF6FF",
            text: "#111827",
          };

          return (
            <div
              key={tx.id}
              className="bg-white border-2 border-[#111827] rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#111827] flex items-center justify-between transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 border-2 border-[#111827] rounded-lg flex items-center justify-center shadow-[1px_1px_0px_0px_#111827] ${
                    isIncome ? "bg-[#16A34A] text-white" : "bg-[#FEF2F2] text-[#DC2626]"
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="w-5 h-5 text-white stroke-3" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-[#DC2626] stroke-3" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Badge Catégorie utilisant directement catColor */}
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[#111827] text-xs font-black shadow-[1px_1px_0px_0px_#111827]"
                      style={{ backgroundColor: `${catColor}20` }}
                    >
                      <span
                        className="w-2 h-2 rounded-full border border-[#111827]"
                        style={{ backgroundColor: catColor }}
                      />
                      <span className="text-[#111827]">{tx.category}</span>
                    </span>

                    {/* Badge Moyen de paiement avec son thème */}
                    <span
                      className="text-[10px] font-black px-1.5 py-0.5 border border-[#111827] rounded shadow-[1px_1px_0px_0px_#111827]"
                      style={{
                        backgroundColor: paymentTheme.bg,
                        color: paymentTheme.text,
                      }}
                    >
                      {tx.payment}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-neutral-500 mt-1">
                    {formatDisplayDate(tx.date, "dd MMM")}
                    {tx.note ? ` • ${tx.note}` : ""}
                  </p>
                </div>
              </div>

              <span
                className={`font-black text-sm sm:text-base ${
                  isIncome ? "text-[#16A34A]" : "text-[#DC2626]"
                }`}
              >
                {isIncome ? "+" : "-"} {formatCurrency(Math.abs(Number(tx.amount)))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
