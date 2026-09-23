import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: { name: '@storybook/react-vite', options: {} },
  viteFinal: async (config) => {
    config.resolve ??= {};
    config.resolve.alias = { ...(config.resolve.alias ?? {}), '@': path.resolve(process.cwd(), 'src') };
    config.plugins = [...(config.plugins ?? []), react()];
    return config;
  },
};
export default config;
