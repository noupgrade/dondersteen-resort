module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "semi": ["error", "never"],
    "max-len": ["error", {
      "code": 150,
      "tabWidth": 2,
      "ignoreUrls": true,
      "ignoreComments": false,
      "ignoreStrings": true,
      "ignoreTemplateLiterals": true,
    }],
    'no-implicit-any-catch': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
  },
}
