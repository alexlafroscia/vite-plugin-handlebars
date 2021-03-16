import { registerPartial } from 'handlebars';
import { Dir } from 'fs';
import { opendir, readFile } from 'fs/promises';
import { resolve, parse } from 'path';

/**
 * Registers each HTML file in a directory as Handlebars partial
 */
export async function registerPartials(directoryPath: string | Array<string>): Promise<void> {
  for await (const path of directoryPath) {
    let dir: Dir;

    try {
      dir = await opendir(path);
    } catch (e) {
      // No-op if the directory does not exist
      return;
    }

    for await (const entry of dir) {
      if (entry.isFile) {
        const fullPath = resolve(path, entry.name);
        const partialName = parse(entry.name).name;
        const content = await readFile(fullPath);

        registerPartial(partialName, content.toString());
      }
    }
  }
}
