// Fictional presentation data only. No network requests or real attorney records.
export const records = Array.from({ length: 30 }, (_, i) => {
  const id = String(i + 1).padStart(2, '0');
  const experience = i < 8 ? 40 : i < 18 ? 30 : 20;
  return {
    id, name: `Demo Attorney ${id}`, firm: `Demonstration Firm ${String(Math.floor(i / 2) + 1).padStart(2, '0')}`,
    town: ['Hackensack', 'Paramus', 'Ridgewood', 'Fort Lee', 'Englewood'][i % 5],
    practice: 'Divorce & Family Law', scope: 60, experience, score: 60 + experience,
    rank: i < 8 ? 1 : i < 18 ? 9 : 19,
    email: i % 4 === 0 ? '' : `demo-${id}@example.invalid`,
    status: 'Provisional', citation: 'Fictional demonstration record. No live research or license verification.'
  };
});

export function matchingRows({ query = '', contact = 'all', sort = 'rank' } = {}) {
  const q = query.trim().toLowerCase();
  return records.filter(r => `${r.name} ${r.firm} ${r.town}`.toLowerCase().includes(q))
    .filter(r => contact === 'all' || (contact === 'email' ? !!r.email : !r.email))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'firm' ? a.firm.localeCompare(b.firm) || a.name.localeCompare(b.name) : a.rank - b.rank || a.id.localeCompare(b.id));
}

export function pageRows(filters, limit = 10) {
  return matchingRows(filters).slice(0, Math.max(0, limit));
}

export function exportCsv(ids) {
  const selected = records.filter(r => ids.has(r.id));
  const quote = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [['Record type', 'Attorney', 'Firm', 'Town', 'Practice', 'Sample score', 'Sample email', 'Status'],
    ...selected.map(r => ['FICTIONAL DEMO - NOT FOR OUTREACH', r.name, r.firm, r.town, r.practice, r.score, r.email, r.status])]
    .map(row => row.map(quote).join(',')).join('\r\n');
}
