import { test, afterAll, expect } from 'vitest';
import { Factory as FixtureFactory } from 'file-fixture-factory';
import { build, getHtmlSource } from './helpers';

const factory = new FixtureFactory('vite-plugin-handlebars', {
  root: __dirname,
});

afterAll(async () => {
  await factory.disposeAll();
});

test('it processes Handlebars variables', async () => {
  const temp = await factory.createDirectory({
    'index.html': '<p>{{capitalize "foo"}}</p>',
  });
  const result = await build(temp.dir, {
    helpers: {
      capitalize: (val: string) => val.toUpperCase(),
    },
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<p>FOO</p>');
});
