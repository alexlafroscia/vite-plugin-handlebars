import { Factory as FixtureFactory } from 'file-fixture-factory';
import { serve, waitFor, TimeoutError } from './helpers';

const testWithoutWindows = (...args: Parameters<typeof test>) =>
  process.platform === 'win32' ? test.skip(...args) : test(...args);

const factory = new FixtureFactory('vite-plugin-handlebars');

afterAll(async () => {
  await factory.disposeAll();
});

testWithoutWindows('it sends a `full-reload` event when an `hbs` partial changes', async () => {
  const temp = await factory.createStructure({
    'index.html': '{{> foo }}',
    partials: {
      'foo.hbs': '<p>foo</p>',
    },
  });
  const devServer = await serve(temp.dir, {
    partialDirectory: temp.path('partials'),
  });

  devServer.ws.send = jest.fn();

  // Fake the user visiting the index page to build it
  await devServer.transformIndexHtml('/', await temp.read('index.html'));

  await temp.write('partials/foo.hbs', '<p>bar</p>');

  await waitFor(
    () => {
      expect(devServer.ws.send).toBeCalledWith({ type: 'full-reload' });
    },
    { timeout: 3000 }
  );

  await devServer.close();
});

testWithoutWindows('it sends a `full-reload` event when an `html` partial changes', async () => {
  const temp = await factory.createStructure({
    'index.html': '{{> foo }}',
    partials: {
      'foo.html': '<p>foo</p>',
    },
  });
  const devServer = await serve(temp.dir, {
    partialDirectory: temp.path('partials'),
  });

  devServer.ws.send = jest.fn();

  // Fake the user visiting the index page to build it
  await devServer.transformIndexHtml('/', await temp.read('index.html'));

  await temp.write('partials/foo.html', '<p>bar</p>');

  await waitFor(
    () => {
      expect(devServer.ws.send).toBeCalledWith({ type: 'full-reload' });
    },
    { timeout: 3000 }
  );

  await devServer.close();
});

testWithoutWindows('reloading the browser can be disabled', async () => {
  // Exact number of assertions between `waitFor` and the thrown TimeoutError
  expect.assertions(305);

  const temp = await factory.createStructure({
    'index.html': '{{> foo }}',
    partials: {
      'foo.hbs': '<p>foo</p>',
    },
  });
  const devServer = await serve(temp.dir, {
    reloadOnPartialChange: false,
    partialDirectory: temp.path('partials'),
  });

  devServer.ws.send = jest.fn();

  // Fake the user visiting the index page to build it
  await devServer.transformIndexHtml('/', await temp.read('index.html'));

  await temp.write('partials/foo.hbs', '<p>bar</p>');

  try {
    await waitFor(
      () => {
        expect(devServer.ws.send).toBeCalledWith({ type: 'full-reload' });
      },
      { timeout: 3000 }
    );
  } catch (e) {
    expect(e).toBeInstanceOf(TimeoutError);
  } finally {
    await devServer.close();
  }
});
