export const EUR = 'EUR';
export const USD = 'USD';
export const PLN = 'PLN';

export function formatDateForRequest(date) {
  // 02-03-2020 will be like `20200302`
  // from https://stackoverflow.com/a/3067896/10849913
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();

  return [date.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('');
}

export function getBankUrl(currency, date) {
  const dateStr = formatDateForRequest(date);

  return `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=${currency}&date=${dateStr}&json`;
}
