module.exports = {
    coverageDirectory: "coverage",
    coverageReporters: ["lcov"],
    moduleDirectories: ["node_modules", "<rootdir>/src"],
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx"],
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
    testEnvironment: "node",
    testMatch: ["**/tests/**/?(*.)+(spec|test).(ts|tsx|js|jsx)"],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.json",
                useESM: true,
            },
        ],
    },
    preset: "ts-jest/presets/default-esm",
    extensionsToTreatAsEsm: [".ts"],
    transformIgnorePatterns: [
        "/node_modules/(?!file-type/|token-types/|strtok3/|peek-readable/|@tokenizer/|uint8array-extras/).*",
    ],
    // Console control options
    verbose: false,
    silent: false,
    // Allow console output when debugging
    restoreMocks: false,
    clearMocks: false,
};
