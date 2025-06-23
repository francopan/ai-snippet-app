import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFiles: ["<rootDir>/jest.polyfill.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      // Habilite o suporte para decorators
      diagnostics: false,  // opcional para silenciar warnings
    },
  },
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(.*\\.esm\\.js$)|(@web3-storage|@remix-run|whatwg-url|fetch-blob|formdata-polyfill)/)"
  ],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/app/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: ["**/__tests__/**/*.(ts|tsx)", "**/?(*.)+(test).(ts|tsx)"],
};

export default config;
