export function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 7 ? year : year - 1;
}

export function parseSwissDate(dateStr) {
  if (dateStr.toLowerCase() === 'gestern') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }
  const [day, month, year] = dateStr.split('.').map(num => parseInt(num, 10));
  return new Date(year, month - 1, day);
}
