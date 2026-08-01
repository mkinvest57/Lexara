/**
 * Anki deck generation. Pure string building only — writing the file is
 * platform-specific (Blob on web, expo-file-system on mobile).
 */

export interface AnkiExportItem {
  term: string;
  translation: string;
  context?: string;
  ipa?: string;
  audioUrl?: string;
  status: number | string;
}

export const ANKI_FILENAME = 'yapro_anki_export.txt';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Tabs and newlines would break Anki's TSV parsing. */
const escapeField = (value: string): string => value.replace(/[\t\r\n]+/g, ' ');

export function generateAnkiExportText(
  items: AnkiExportItem[],
  deckName: string = 'YAPRO Vocabulary'
): string {
  const header = [
    '# separator:tab',
    '# html:true',
    '# deck column:1',
    '# tags column:4',
    `# Deck: ${deckName}`,
  ].join('\n');

  const rows = items.map((item) => {
    const term = escapeHtml(item.term);
    const ipa = item.ipa
      ? `<div style="font-size:14px; color:#888;">/${escapeHtml(item.ipa)}/</div>`
      : '';
    const front = `<div style="font-size:24px; font-weight:bold; color:#063F40;">${term}</div>${ipa}`;

    const context = item.context
      ? `<blockquote style="margin-top:10px; color:#666; font-style:italic;">"${escapeHtml(item.context)}"</blockquote>`
      : '';
    const back = `<div style="font-size:20px; color:#222;">${escapeHtml(item.translation)}</div>${context}`;

    const tag = `YAPRO-Status-${item.status}`;
    return [deckName, escapeField(front), escapeField(back), tag].join('\t');
  });

  return `${header}\n${rows.join('\n')}`;
}
