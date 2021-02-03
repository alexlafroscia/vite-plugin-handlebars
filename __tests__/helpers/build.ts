import { resolve } from 'path';
import { build as viteBuild } from 'vite';
import handlebars, { HandlebarsPluginConfig } from '../../src/index';

type BuildResult = ReturnType<typeof viteBuild>;

export function build(root: string, config: HandlebarsPluginConfig = {}): BuildResult {
  return viteBuild({
    root,
    logLevel: 'silent',
    build: {
      write: false,
    },
    plugins: [handlebars(config)],
  });
}

export function fixtureFor(site: string): string {
  return resolve(__dirname, '../../__fixtures__', site);
}
