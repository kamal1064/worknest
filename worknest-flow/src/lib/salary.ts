export function computeSalary(opts: {
  monthlySalary: number;
  absentDays: number;
  advanceSalary: number;
}) {
  const dailySalary = opts.monthlySalary / 30;
  const deductedAmount = dailySalary * opts.absentDays + opts.advanceSalary;
  const finalSalary = Math.max(0, opts.monthlySalary - deductedAmount);
  return {
    dailySalary: Number(dailySalary.toFixed(2)),
    deductedAmount: Number(deductedAmount.toFixed(2)),
    finalSalary: Number(finalSalary.toFixed(2)),
  };
}

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
