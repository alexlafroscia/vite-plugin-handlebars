import { compile, registerHelper, RuntimeOptions } from 'handlebars';
import { resolve } from 'path';
import { Plugin as VitePlugin } from 'vite';
import type { IndexHtmlTransformContext } from 'vite';
import { registerPartials } from './partials';
import { Context, determineContextPageId, resolveContext } from './context';

type CompileArguments = Parameters<typeof compile>;
type CompileOptions = CompileArguments[1];

export interface HandlebarsPluginConfig {
  context?: Context;
  reloadOnPartialChange?: boolean;
  compileOptions?: CompileOptions;
  runtimeOptions?: RuntimeOptions;
  partialDirectory?: string | Array<string>;
}

export default function handlebars({
  context,
  reloadOnPartialChange = true,
  compileOptions,
  runtimeOptions,
  partialDirectory,
}: HandlebarsPluginConfig = {}): VitePlugin {
  // Keep track of what partials are registered
  const partialsSet = new Set<string>();

  let root: string;

  registerHelper('resolve-from-root', function (path) {
    return resolve(root, path);
  });

  return {
    name: 'handlebars',

    configResolved(config) {
      root = config.root;
    },

    async handleHotUpdate({ server, file }) {
      if (reloadOnPartialChange && partialsSet.has(file)) {
        server.ws.send({
          type: 'full-reload',
        });

        return [];
      }
    },

    transformIndexHtml: {
      // Ensure Handlebars runs _before_ any bundling
      enforce: 'pre',

      async transform(html: string, ctx: IndexHtmlTransformContext): Promise<string> {
        if (partialDirectory) {
          await registerPartials(partialDirectory, partialsSet);
        }

        const template = compile(html, compileOptions);

        const contextId = determineContextPageId(ctx);
        const resolvedContext = await resolveContext(context, contextId);
        const result = template(resolvedContext, runtimeOptions);

        return result;
      },
    },
  };
}
