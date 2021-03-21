import { ViteDevServer, build as viteBuild, createServer } from 'vite';
import handlebars, { HandlebarsPluginConfig } from '../../src/index';

type BuildResult = ReturnType<typeof viteBuild>;

export function build(root: string, config: HandlebarsPluginConfig = {}): BuildResult {
  return viteBuild({
    root,
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
    },
    plugins: [handlebars(config)],
  });
}

export function serve(root: string, config: HandlebarsPluginConfig = {}): Promise<ViteDevServer> {
  return createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
    },
    plugins: [handlebars(config)],
  });
}
