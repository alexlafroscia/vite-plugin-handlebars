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
    'index.html': '<p>{{foo}}</p>',
  });
  const result = await build(temp.dir, {
    context: {
      foo: () => 'bar',
    },
  });
  const html = getHtmlSource(result);

  expect(html).toContain('<p>bar</p>');
});

test('it evaluates a `context` function', async () => {
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
