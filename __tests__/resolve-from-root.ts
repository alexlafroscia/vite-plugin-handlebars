import { Factory as FixtureFactory } from 'file-fixture-factory';
import { build, getHtmlSource } from './helpers';

const factory = new FixtureFactory('vite-plugin-handlebars');

afterAll(async () => {
  await factory.disposeAll();
});

test('it can resolve a path from the root', async () => {
  const temp = await factory.createStructure({
    'index.html': '{{> head}}',
    css: {
      'global.css': '.red { color: red; }',
    },
    partials: {
      'head.hbs': `<link rel="stylesheet" href="{{resolve-from-root 'css/global.css'}}" />`,
    },
  });
  const result = await build(temp.dir, {
    partialDirectory: [temp.path('partials')],
  });
  const html = getHtmlSource(result);

  // Vite processed the linked file
  expect(html).toMatch(/href="\/assets\/index\.(.*)\.css"/);
});
