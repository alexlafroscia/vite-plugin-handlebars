import { resolve } from 'path';
import { build, fixtureFor, getHtmlSource } from './helpers';

const APP_PATH = fixtureFor('partials');

test('it allows for injecting a partial', async () => {
  const result = await build(APP_PATH, {
    partialDirectory: resolve(APP_PATH, 'partials'),
  });
  const html = getHtmlSource(result);

  // Inject a HTML file as a partial
  expect(html).toContain('<header><h1>Title</h1></header>');

  // Inject a HBS file as a partial
  expect(html).toContain('<footer></footer>');
});
