const config = {
  stories: ['../stories/**/*.stories.@(js|jsx)'],
  staticDirs: [{ from: '../tokens', to: '/tokens' }],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { defaultName: 'Docs' },
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
  core: { allowedHosts: ['localhost', '127.0.0.1'], disableTelemetry: true },
  viteFinal: async (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      dedupe: Array.from(new Set([...(config.resolve?.dedupe || []), 'react', 'react-dom'])),
    },
  }),
};

export default config;
