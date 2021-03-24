import type { IndexHtmlTransformContext } from 'vite';
import * as path from 'path';

export type Context =
  | Record<string, unknown>
  | ((path: string) => Record<string, unknown>)
  | ((path: string) => Promise<Record<string, unknown>>);

export async function resolveContext(
  context: Context | undefined,
  pageId: string
): Promise<Record<string, unknown> | undefined> {
  if (typeof context === 'undefined') {
    return context;
  }

  if (typeof context === 'function') {
    return resolveContext(await context(pageId), pageId);
  }

  const output: Record<string, unknown> = {};

  for (const key of Object.keys(context)) {
    const value = context[key];

    if (typeof value === 'function') {
      output[key] = await value(pageId);
    } else {
      output[key] = value;
    }
  }

  return output;
}

export function determineContextPageId(ctx: IndexHtmlTransformContext): string {
  // make sure paths are consistent on win32/posix
  const fullFilePath = ctx.path.split(path.sep).join(path.posix.sep);

  // determine filename without extention
  const filePath = path.basename(fullFilePath, path.extname(fullFilePath));

  // determine dir & remove leading slash
  let fileDir = path.dirname(fullFilePath);
  fileDir = fileDir.replace(/^\/+/g, '');

  if (fileDir) {
    return `${fileDir}/${filePath}`;
  }

  return filePath;
}
