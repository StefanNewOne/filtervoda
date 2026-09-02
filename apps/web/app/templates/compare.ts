/** Derive catalogue comparison-table cells from a product's chips. Pure + tested. */
export function compareRow(chips: string[]) {
  const has = (re: RegExp) => chips.some((c) => re.test(c));
  const stagesChip = chips.find((c) => /(\d+)\s*степен/i.test(c) || /(\d+)\s*фаз/i.test(c));
  const phChip = chips.find((c) => /pH/i.test(c));
  return {
    stages: stagesChip ? stagesChip.replace(/[^0-9]/g, '') : '—',
    tank: has(/резервоар/i) ? 'Да' : has(/директен/i) ? 'Директен' : '—',
    display: has(/дисплеј/i) ? 'Да' : '—',
    ph: phChip ? '8.5+' : '—',
  };
}
