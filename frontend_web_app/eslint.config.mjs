import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/**
 * Standalone flat config for running lint locally/CI with ESLint.
 * CRA uses eslintConfig in package.json for editor integration, but we keep this for CI parity.
 */
export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        document: true,
        window: true,
        // Jest / RTL globals
        test: true,
        expect: true,
        jest: true,
        beforeEach: true,
        describe: true,
        it: true,
        beforeAll: true,
        afterAll: true,
        afterEach: true,
        // RTL helpers sometimes attached to global in older setups
        screen: true
      }
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "React|App" }]
    }
  },
  pluginJs.configs.recommended,
  {
    plugins: { react: pluginReact },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error"
    }
  }
];
