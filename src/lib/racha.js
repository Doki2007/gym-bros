function toLocalDateKey(value) {
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateFromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Consecutive calendar days (local TZ) with at least one session.
 * Returns 0 if the most recent session is older than yesterday.
 */
export function calcRacha(fechas) {
  if (!fechas?.length) return 0;

  const unique = [...new Set(fechas.map(toLocalDateKey))].sort().reverse();
  const today = toLocalDateKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = toLocalDateKey(yesterdayDate);

  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const newer = dateFromKey(unique[i - 1]);
    const older = dateFromKey(unique[i]);
    const diffDays = Math.round((newer - older) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak += 1;
    else break;
  }
  return streak;
}
