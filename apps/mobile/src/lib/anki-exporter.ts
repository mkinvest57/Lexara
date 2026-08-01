/**
 * Anki export — mobile. Deck text comes from @yapro/core; only the file write
 * and share sheet are implemented here.
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { ANKI_FILENAME, generateAnkiExportText, type AnkiExportItem } from '@yapro/core';

export { generateAnkiExportText, type AnkiExportItem };

export async function exportAnkiDeck(
  items: AnkiExportItem[],
  deckName: string = 'YAPRO Vocabulary'
): Promise<void> {
  const content = generateAnkiExportText(items, deckName);

  // @ts-expect-error expo-file-system types lag the SDK here.
  const directory: string | null = FileSystem.documentDirectory;
  if (!directory) {
    throw new Error('Document directory unavailable on this platform.');
  }

  const filePath = `${directory}${ANKI_FILENAME}`;
  await FileSystem.writeAsStringAsync(filePath, content, { encoding: 'utf8' });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing unavailable on this device.');
  }

  await Sharing.shareAsync(filePath, {
    mimeType: 'text/plain',
    dialogTitle: 'Exporter vers Anki',
    UTI: 'public.plain-text',
  });
}
