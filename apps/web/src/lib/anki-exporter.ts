/**
 * Anki export — web. Deck text comes from @yapro/core; only the browser
 * download is implemented here.
 */

import { ANKI_FILENAME, generateAnkiExportText, type AnkiExportItem } from '@yapro/core';

export { generateAnkiExportText, type AnkiExportItem };

export function exportAnkiDeck(
  items: AnkiExportItem[],
  deckName: string = 'YAPRO Vocabulary'
): void {
  const content = generateAnkiExportText(items, deckName);

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = ANKI_FILENAME;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
