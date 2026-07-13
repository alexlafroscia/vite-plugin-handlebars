import { resolve } from 'node:path';

import hbs, { HelperDeclareSpec, RuntimeOptions } from 'handlebars';
import { IndexHtmlTransformContext, Plugin as VitePlugin, normalizePath } from 'vite';

import { Context, resolveContext } from './context.js';
import { registerPartials } from './partials.js';

type CompileArguments = Parameters<typeof hbs.compile>;
type CompileOptions = CompileArguments[1];

export interface HandlebarsPluginConfig {
  context?: Context;
  reloadOnPartialChange?: boolean;
  compileOptions?: CompileOptions;
  runtimeOptions?: RuntimeOptions;
  partialDirectory?: string | Array<string>;
  useFileNameForPartial?: boolean;
  helpers?: HelperDeclareSpec;
}

export default function handlebars({
  context,
  reloadOnPartialChange = true,
  compileOptions,
  runtimeOptions,
  partialDirectory,
  useFileNameForPartial,
  helpers,
}: HandlebarsPluginConfig = {}): VitePlugin {
  // Keep track of what partials are registered
  const partialsSet = new Set<string>();

  let root: string;

  hbs.registerHelper('resolve-from-root', function (path) {
    return resolve(root, path);
  });

  if (helpers) {
    hbs.registerHelper(helpers);
  }

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
      order: 'pre',

      async handler(html: string, ctx: IndexHtmlTransformContext): Promise<string> {
        if (partialDirectory) {
          await registerPartials(partialDirectory, partialsSet, useFileNameForPartial);
        }

        const template = hbs.compile(html, compileOptions);

        const resolvedContext = await resolveContext(context, normalizePath(ctx.path));
        const result = template(resolvedContext, runtimeOptions);

        return result;
      },
    },
  };
}
