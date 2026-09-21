import { FileText } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import {
  EXPENSE_KIND_LABEL,
  EXPENSE_KIND_TONE,
  canDeleteExpense,
  currentMonth,
  formatAmount,
  formatMonth,
  groupByUser,
  parseMonth,
} from "@/lib/expenses/rules";
import { formatDate } from "@/lib/utils/date";
import { DeleteExpenseButton, MonthPicker, PrintButton } from "@/components/expenses/ExpenseActions";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

function Total({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="rounded-md border border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">{formatAmount(amount)}</p>
    </div>
  );
}

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const month = parseMonth(sp.month ?? "") ?? currentMonth();

  const claims = await db.expenseClaim.findMany({
    where: { month },
    orderBy: [{ user: { name: "asc" } }, { createdAt: "asc" }],
    include: { user: { select: { id: true, name: true } } },
  });

  const groups = groupByUser(
    claims.map((c) => ({
      id: c.id,
      userId: c.user.id,
      userName: c.user.name,
      kind: c.kind,
      amount: c.amount,
      title: c.title,
      note: c.note,
      receiptUrl: c.receiptUrl,
      createdAt: c.createdAt,
    })),
  );
  const spent = groups.reduce((s, g) => s + g.spent, 0);
  const planned = groups.reduce((s, g) => s + g.planned, 0);

  return (
    <>
      <PageHeader title="비용 청구" actions={user.role === "ADMIN" && <PrintButton />} />
      <div className="space-y-6">
        <p className="no-print text-sm text-slate-500">
          월말에 이번 달 사용한 비용을 영수증과 함께 청구하고, 다음 달 사용 예정 금액도 미리 올려 두세요. 등록한 내용은 모든 부원이
          볼 수 있습니다.
        </p>

        <MonthPicker month={month} />

        <ExpenseForm defaultMonth={month} />

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            {formatMonth(month)} 비용 청구 <span className="text-sm font-normal text-slate-500">· {claims.length}건</span>
          </h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <Total label="사용 완료 합계" amount={spent} />
            <Total label="사용 예정 합계" amount={planned} />
            <Total label="전체 합계" amount={spent + planned} />
          </div>

          {groups.length === 0 ? (
            <EmptyState message="이 달에 등록된 비용 청구가 없습니다" />
          ) : (
            groups.map((g) => (
              <div key={g.userId} className="rounded-md border border-slate-200 bg-white p-5 print:break-inside-avoid">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-semibold text-slate-900">{g.userName}</h3>
                  <p className="text-xs tabular-nums text-slate-500">
                    사용 {formatAmount(g.spent)} · 예정 {formatAmount(g.planned)} ·{" "}
                    <span className="font-medium text-slate-700">합계 {formatAmount(g.spent + g.planned)}</span>
                  </p>
                </div>
                <ul className="space-y-3">
                  {g.items.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-start gap-x-3 gap-y-1">
                      <Badge tone={EXPENSE_KIND_TONE[item.kind]}>{EXPENSE_KIND_LABEL[item.kind]}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        {item.note && <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">{item.note}</p>}
                        <p className="mt-0.5 text-xs text-slate-500">
                          등록 {formatDate(item.createdAt)}
                          {item.receiptUrl ? (
                            <>
                              {" · "}
                              <a
                                href={item.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-navy-500 hover:underline"
                              >
                                <FileText size={12} strokeWidth={1.75} aria-hidden />
                                영수증
                              </a>
                            </>
                          ) : (
                            " · 영수증 없음"
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-slate-900">{formatAmount(item.amount)}</p>
                      {canDeleteExpense(user, item) && <DeleteExpenseButton id={item.id} title={item.title} />}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
