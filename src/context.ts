export type Context =
  | Record<string, unknown>
  | ((path: string) => Record<string, unknown>)
  | ((path: string) => Promise<Record<string, unknown>>);

export async function resolveContext(
  context: Context | undefined,
  pagePath: string,
): Promise<Record<string, unknown> | undefined> {
  if (typeof context === 'undefined') {
    return context;
  }

  if (typeof context === 'function') {
    return resolveContext(await context(pagePath), pagePath);
  }

  const output: Record<string, unknown> = {};

  for (const key of Object.keys(context)) {
    const value = context[key];

    if (typeof value === 'function') {
      output[key] = await value(pagePath);
    } else {
      output[key] = value;
    }
  }

  return output;
}
