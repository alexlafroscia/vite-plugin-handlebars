import { registerPartial } from 'handlebars';
import { Dir } from 'fs';
import { opendir, readFile } from 'fs/promises';
import { resolve, parse } from 'path';

/**
 * Registers each HTML file in a directory as Handlebars partial
 */
export async function registerPartials(directoryPath: string): Promise<void> {
  let dir: Dir;

  try {
    dir = await opendir(directoryPath);
  } catch (e) {
    // No-op if the directory does not exist
    return;
  }

  for await (const entry of dir) {
    if (entry.isFile) {
      const fullPath = resolve(directoryPath, entry.name);
      const partialName = parse(entry.name).name;
      const content = await readFile(fullPath);

      registerPartial(partialName, content.toString());
    }
  }
}
