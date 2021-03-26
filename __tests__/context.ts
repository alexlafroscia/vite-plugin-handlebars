import { Factory as FixtureFactory } from 'file-fixture-factory';
import { build, getHtmlSource } from './helpers';

const factory = new FixtureFactory('vite-plugin-handlebars');

afterAll(async () => {
  await factory.disposeAll();
});

test('it processes Handlebars variables', async () => {
  const temp = await factory.createStructure({
    'index.html': '<p>{{foo}}</p>',
  });
  const result = await build(temp.dir, { context: { foo: 'bar' } });
  const html = getHtmlSource(result);

  expect(html).toContain('<p>bar</p>');
});

test('it evaluates functions as `context` keys', async () => {
  const temp = await factory.createStructure({
    'index.html': '<p>{{foo}} {{bar}}</p>',
  });
  const result = await build(temp.dir, {
    context: {
      foo: () => 'foo',
      bar: () => Promise.resolve('bar'),
    },
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<p>foo bar</p>');
});

test('it evaluates a synchronous `context` function', async () => {
  const temp = await factory.createStructure({
    'index.html': '<p>{{foo}}</p>',
  });
  const result = await build(temp.dir, {
    context: () => ({
      foo: 'bar',
    }),
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<p>bar</p>');
});

test('it evaluates an asynchronous `context` function', async () => {
  const temp = await factory.createStructure({
    'index.html': '<p>{{foo}}</p>',
  });
  const result = await build(temp.dir, {
    context: () =>
      Promise.resolve({
        foo: 'bar',
      }),
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<p>bar</p>');
});

test('it evaluates an asynchronous `context` function using an id', async () => {
  const temp = await factory.createStructure({
    'index.html': '<p>{{foo}}</p>',
  });
  const data: Record<string, Record<string, unknown>> = {
    '/index.html': {
      foo: 'test',
    },
  };
  const result = await build(temp.dir, {
    context: (pagePath: string) => Promise.resolve(data[pagePath]),
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<p>test</p>');
});
