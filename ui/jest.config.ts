import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ["<rootDir>/jest.polyfill.ts"],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/app/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: ['**/__tests__/**/*.(ts|tsx)', '**/*.test.(ts|tsx)'],
};

export default config;
