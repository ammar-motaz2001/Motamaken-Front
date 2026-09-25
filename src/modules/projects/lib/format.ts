const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function formatMoney(amount: number) {
  return money.format(amount);
}

export function shareAmount(total: number, share: number) {
  return Math.round((total * share) / 100);
}
