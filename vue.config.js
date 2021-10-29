module.exports = {
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup',
    },
  },
  pluginOptions: {
    browserExtension: {
      manifestTransformer: (manifest) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-param-reassign
          manifest.content_security_policy = manifest.content_security_policy.replace('script-src', 'script-src http://localhost:8098');
        }
        return manifest;
      },
      componentOptions: {
        background: {
          entry: 'src/background/index.js',
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/index.js',
            ],
          },
        },
      },
    },
  },
};
