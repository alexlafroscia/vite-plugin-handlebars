import { compile, registerHelper, RuntimeOptions } from 'handlebars';
import { resolve } from 'path';
import { Plugin as VitePlugin } from 'vite';
import { registerPartials } from './partials';

type CompileArguments = Parameters<typeof compile>;
type CompileOptions = CompileArguments[1];

export interface HandlebarsPluginConfig {
  context?: Record<string, unknown>;
  compileOptions?: CompileOptions;
  runtimeOptions?: RuntimeOptions;
  partialDirectory?: string;
}

export default function handlebars({
  context,
  compileOptions,
  runtimeOptions,
  partialDirectory,
}: HandlebarsPluginConfig = {}): VitePlugin {
  let root: string;

  registerHelper('resolve-from-root', function (path) {
    return resolve(root, path);
  });

  return {
    name: 'handlebars',

    configResolved(config) {
      root = config.root;
    },

    transformIndexHtml: {
      // Ensure Handlebars runs _before_ any bundling
      enforce: 'pre',

      async transform(html: string): Promise<string> {
        if (partialDirectory) {
          await registerPartials(partialDirectory);
        }

        const template = compile(html, compileOptions);

        const result = template(context, runtimeOptions);

        return result;
      },
    },
  };
}
