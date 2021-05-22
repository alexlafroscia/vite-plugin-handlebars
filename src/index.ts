import { compile, registerHelper, RuntimeOptions } from 'handlebars';
import { resolve } from 'path';
import { IndexHtmlTransformContext, Plugin as VitePlugin, normalizePath } from 'vite';
import { Context, resolveContext } from './context';
import { registerPartials } from './partials';

type CompileArguments = Parameters<typeof compile>;
type CompileOptions = CompileArguments[1];

export interface HandlebarsPluginConfig {
  context?: Context;
  reloadOnPartialChange?: boolean;
  compileOptions?: CompileOptions;
  runtimeOptions?: RuntimeOptions;
  partialDirectory?: string | Array<string>;
  registerHelpers?: { [key: string]: any };
}

export default function handlebars({
  context,
  reloadOnPartialChange = true,
  compileOptions,
  runtimeOptions,
  partialDirectory,
  registerHelpers,
}: HandlebarsPluginConfig = {}): VitePlugin {
  // Keep track of what partials are registered
  const partialsSet = new Set<string>();

  let root: string;

  registerHelper('resolve-from-root', function (path) {
    return resolve(root, path);
  });

  if (registerHelpers) {
    const helpers = Object.keys(registerHelpers);

    if (helpers?.length) {
      helpers.forEach((helper) => {
        if (typeof registerHelpers[helper] === 'function') {
          registerHelper(helper, registerHelpers[helper]);
        }
      });
    }
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
      enforce: 'pre',

      async transform(html: string, ctx: IndexHtmlTransformContext): Promise<string> {
        if (partialDirectory) {
          await registerPartials(partialDirectory, partialsSet);
        }

        const template = compile(html, compileOptions);

        const resolvedContext = await resolveContext(context, normalizePath(ctx.path));
        const result = template(resolvedContext, runtimeOptions);

        return result;
      },
    },
  };
}
