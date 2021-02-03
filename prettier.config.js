module.exports = {
  ...require('@movable/prettier-config'),
  overrides: [
    {
      files: '**/*.hbs',
      options: {
        parser: 'glimmer',
      },
    },
  ],
};
