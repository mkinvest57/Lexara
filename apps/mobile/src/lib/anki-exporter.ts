export type AnkiExportItem = {
  term: string;
  translation: string;
  context?: string;
  ipa?: string;
  audioUrl?: string;
  status: number;
};

export function generateAnkiExportText(items: AnkiExportItem[], deckName: string = 'YAPRO Vocabulary'): string {
  const header = [
    `# separator:tab`,
    `# html:true`,
    `# deck column:1`,
    `# tags column:5`,
    `# Deck: ${deckName}`,
  ].join('\n');

  const rows = items.map((item) => {
    const front = `<div style="font-size:24px; font-weight:bold; color:#063F40;">${item.term}</div>${item.ipa ? `<div style="font-size:14px; color:#888;">/${item.ipa}/</div>` : ''}`;
    const back = `<div style="font-size:20px; color:#222;">${item.translation}</div>${item.context ? `<blockquote style="margin-top:10px; color:#666; font-style:italic;">"${item.context}"</blockquote>` : ''}`;
    const tag = `YAPRO-Status-${item.status}`;
    return `${deckName}\t${front}\t${back}\t${tag}`;
  });

  return `${header}\n${rows.join('\n')}`;
}
