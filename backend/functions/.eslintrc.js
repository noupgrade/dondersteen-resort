module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'google',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json', 'tsconfig.dev.json'],
        sourceType: 'module',
    },
    ignorePatterns: [
        '/lib/**/*', // Ignore built files.
        '/generated/**/*', // Ignore generated files.
        '**/old/**/*', // Ignore old files.
    ],
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        quotes: ['error', 'single', 'avoid-escape'],
        'quote-props': ['error', 'as-needed'],
        'operator-linebreak': ['error', 'before'],
        'import/no-unresolved': 0,
        indent: ['error', 4],
        semi: ['error', 'never'],
        'require-jsdoc': 0,
        'max-len': [
            'error',
            {
                code: 120,
                tabWidth: 2,
                ignoreUrls: true,
                ignoreComments: false,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            },
        ],
        'object-curly-spacing': ['error', 'always'],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'arrow-parens': ['error', 'as-needed'],
    },
}
