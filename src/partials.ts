import { registerPartial } from 'handlebars';
import { opendir, readFile } from 'fs/promises';
import { join, parse } from 'path';

// Borrowed from https://gist.github.com/lovasoa/8691344
async function* walk(dir: string): AsyncGenerator<string> {
  for await (const d of await opendir(dir)) {
    const fullFileName = join(dir, d.name);

    if (d.isDirectory()) {
      yield* walk(fullFileName);
    } else if (d.isFile()) {
      yield fullFileName;
    }
  }
}

/**
 * Registers each HTML file in a directory as Handlebars partial
 */
export async function registerPartials(directoryPath: string | Array<string>): Promise<void> {
  const pathArray: Array<string> = Array.isArray(directoryPath) ? directoryPath : [directoryPath];

  for await (const path of pathArray) {
    try {
      for await (const fileName of walk(path)) {
        const parsedPath = parse(fileName);
        const partialName = join(parsedPath.dir, parsedPath.name).replace(`${path}/`, '');
        const content = await readFile(fileName);

        registerPartial(partialName, content.toString());
      }
    } catch (e) {
      // This error indicates the partial directory doesn't exist; ignore it
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  }
}
