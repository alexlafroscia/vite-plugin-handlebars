import { Factory as FixtureFactory } from 'file-fixture-factory';
import { build, getHtmlSource } from './helpers';

const factory = new FixtureFactory('vite-plugin-handlebars');

afterAll(async () => {
  await factory.disposeAll();
});

test('it processes Handlebars variables', async () => {
  const temp = await factory.createStructure({
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
