module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:jest/recommended',
        'prettier'
    ],
    env: {
        browser: true
    },
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
    }
}
