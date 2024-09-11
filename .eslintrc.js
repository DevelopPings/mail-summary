export default {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: ['airbnb-base', 'prettier'],
	parserOptions: {
		ecmaVersion: 11,
		sourceType: 'module',
	},
	rules: {
		'no-console': 'error',
		'no-var': 'error',
	},
	ignorePatterns: ['build', 'dist', 'public'],
};
