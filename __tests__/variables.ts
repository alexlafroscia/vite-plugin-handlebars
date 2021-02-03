import { build, fixtureFor, getHtmlSource } from './helpers';

const APP_PATH = fixtureFor('variable-insertion');

test('it processes Handlebars variables', async () => {
  const result = await build(APP_PATH, { context: { foo: 'bar' } });
  const html = getHtmlSource(result);

  expect(html).toContain('<p>bar</p>');
});
