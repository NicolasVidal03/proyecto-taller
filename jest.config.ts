import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src/__tests__'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest.setup.ts'],
  moduleNameMapper: {

    '^@/(.*)$': '<rootDir>/src/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/',
    '^@application/(.*)$': '<rootDir>/src/application/',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/',
    '^@/infrastructure/config/env$': '<rootDir>/src/__tests__/setup/envMock.ts',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/',

    '\\.(css|scss|svg|png|jpg|gif|webp)$': '<rootDir>/src/__tests__/setup/fileMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx', strict: false, esModuleInterop: true },
    }],
  },
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/application/**/*.ts',
    'src/presentation/utils/**/*.ts',
    'src/presentation/hooks/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  clearMocks: true,
  restoreMocks: true,
  testMatch: [
    '**/?(*.)+(test).[tj]s?(x)'
  ],
};

export default config;
