import { Factory as FixtureFactory } from 'file-fixture-factory';
import { build, getHtmlSource } from './helpers';

const factory = new FixtureFactory('vite-plugin-handlebars');

afterAll(async () => {
  await factory.disposeAll();
});

test('it allows for injecting an HTML partial', async () => {
  const temp = await factory.createStructure({
    'index.html': '{{> header }}',
    partials: {
      'header.html': '<h1>Title</h1>',
    },
  });
  const result = await build(temp.dir, {
    partialDirectory: temp.path('partials'),
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<h1>Title</h1>');
});

test('it allows for injecting an HBS partial', async () => {
  const temp = await factory.createStructure({
    'index.html': '{{> header }}',
    partials: {
      'header.hbs': '<h1>Title</h1>',
    },
  });
  const result = await build(temp.dir, {
    partialDirectory: temp.path('partials'),
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<h1>Title</h1>');
});

test('it can support multiple partial directories', async () => {
  const temp = await factory.createStructure({
    'index.html': '{{> header }}{{> header2 }}',
    partials1: {
      'header.hbs': '<h1>Title</h1>',
    },
    partials2: {
      'header2.hbs': '<h1>Different title</h1>',
    },
  });
  const result = await build(temp.dir, {
    partialDirectory: [temp.path('partials1'), temp.path('partials2')],
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<h1>Title</h1><h1>Different title</h1>');
});

test('it supports sub-directories in the partial directory', async () => {
  const temp = await factory.createStructure({
    'index.html': '{{> foo/header }}',
    partials: {
      foo: {
        'header.hbs': '<h1>Title</h1>',
      },
    },
  });
  const result = await build(temp.dir, {
    partialDirectory: temp.path('partials'),
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<h1>Title</h1>');
});

test('it handles no partial directory existing', async () => {
  const temp = await factory.createStructure({
    'index.html': '<h1>Title</h1>',
  });
  const result = await build(temp.dir, {
    partialDirectory: temp.path('partials'),
  });
  const html = getHtmlSource(result);

  // Just make sure that we have _some_ HTML output
  expect(html).toBeTruthy();
});

test('it handles the partial directory being empty', async () => {
  const temp = await factory.createStructure({
    'index.html': '<h1>Title</h1>',
    partials: {
      // I think this is empty "enough"?
      '.gitkeep': '',
    },
  });

  const result = await build(temp.dir, {
    partialDirectory: temp.path('partials'),
  });
  const html = getHtmlSource(result);

  // Just make sure that we have _some_ HTML output
  expect(html).toBeTruthy();
});
