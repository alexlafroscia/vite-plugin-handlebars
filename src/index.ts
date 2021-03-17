import {
  compile,
  registerHelper,
  RuntimeOptions,
  partials as registeredPartials,
} from 'handlebars';
import { resolve, parse } from 'path';
import { readFile } from 'fs/promises';
import { IndexHtmlTransformResult, Plugin as VitePlugin, TransformResult } from 'vite';
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
  const HMR_CLIENT_SCRIPT_PATH = '/@vite-plugin-handlebars/hmrClient.js';

  registerHelper('resolve-from-root', function (path) {
    return resolve(root, path);
  });

  function compileAndGenerateTemplate(hbTemplateString: string) {
    return compile(hbTemplateString, compileOptions)(context, runtimeOptions);
  }

  return {
    name: 'handlebars',

    configResolved(config) {
      root = config.root;
    },

    resolveId(id) {
      if (id === HMR_CLIENT_SCRIPT_PATH) {
        return HMR_CLIENT_SCRIPT_PATH;
      }
    },
    async load(id) {
      if (id === HMR_CLIENT_SCRIPT_PATH) {
        // Returns the content of the compiled hmrClient/client.js
        return readFile(__dirname + '/hmrClient.js').then((content) => content.toString());
      }
    },

    async handleHotUpdate({ server, file, read }) {
      const partialName = parse(file).name;

      // handleHotUpdate gets called for any changes in project dir so we need to verify
      // that it is a file we care about
      if (registeredPartials[partialName]) {
        // TODO: This could be problematic because we aren't checking if
        //  this file is actually one of our partial files.
        //  So a file with the same name could be mistaken
        server.ws.send({
          type: 'custom',
          event: 'plugin-handlebars-partial-update',
          data: {
            partialName: partialName,
            content: compileAndGenerateTemplate(await read()),
          },
        });
      }

      return [];
    },

    transformIndexHtml: {
      // Ensure Handlebars runs _before_ any bundling
      enforce: 'pre',

      async transform(html: string): Promise<IndexHtmlTransformResult> {
        if (partialDirectory) {
          await registerPartials(partialDirectory, process.env.NODE_ENV !== 'production');
        }

        return {
          html: compileAndGenerateTemplate(html),
          tags: partialDirectory // Only inject partial HMR script if partials are enabled
            ? [
                {
                  injectTo: 'body',
                  tag: 'script',
                  attrs: {
                    type: 'module',
                    src: HMR_CLIENT_SCRIPT_PATH,
                  },
                },
              ]
            : [],
        };
      },
    },
  };
}
