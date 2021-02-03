import { resolve } from 'path';
import { mkdtemp } from 'fs/promises';
import { build, fixtureFor, getHtmlSource } from './helpers';

const BASIC_PARTIAL_APP = fixtureFor('partials');
const NO_PARTIAL_DIRECTORY_APP = fixtureFor('no-partial-directory');

test('it allows for injecting a partial', async () => {
  const result = await build(BASIC_PARTIAL_APP, {
    partialDirectory: resolve(BASIC_PARTIAL_APP, 'partials'),
  });
  const html = getHtmlSource(result);

  // Inject a HTML file as a partial
  expect(html).toContain('<header><h1>Title</h1></header>');

  // Inject a HBS file as a partial
  expect(html).toContain('<footer></footer>');
});

test('it handles no partial directory existing', async () => {
  const result = await build(NO_PARTIAL_DIRECTORY_APP, {
    partialDirectory: resolve(NO_PARTIAL_DIRECTORY_APP, 'partials'),
  });
  const html = getHtmlSource(result);

  // Just make sure that we have _some_ HTML output
  expect(html).toBeTruthy();
});

test('it handles the partial directory being empty', async () => {
  // Create an empty "tmp" directory to be the partial directory
  const partialDirectory = await mkdtemp('vite-plugin-handlebars--empty-partial-directory');

  const result = await build(NO_PARTIAL_DIRECTORY_APP, {
    partialDirectory,
  });
  const html = getHtmlSource(result);

  // Just make sure that we have _some_ HTML output
  expect(html).toBeTruthy();
});
