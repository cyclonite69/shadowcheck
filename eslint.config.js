import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "server/dist/**",
      "client/dist/**",
      "node_modules/**",
      "shared/schema.js",
      "shared/schema.d.ts",
      "compiled_server/**",
      "eslint.config.js",
      "postcss.config.js",
      "tailwind.config.ts",
      "vite.config.ts",
      "client/tailwind.config.ts",
      "client/vite.config.ts",
      "output/security_dashboard_section.tsx",
      "server/routes/__tests__/**"
    ],
  },
  // Configuration for JavaScript files
  {
    files: ["**/*.{js,mjs,cjs}", "server/**/*.js", "client/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      react: pluginReact, // Keep react plugin for potential JSX in JS files
      "react-hooks": pluginReactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": ["error", { "ignore": ["cmdk-input-wrapper"] }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Configuration for TypeScript files
  {
    files: ["**/*.{ts,tsx}", "server/**/*.ts", "client/**/*.ts", "client/**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: true,
        RequestInit: true,
        JSX: true,
        NodeJS: true,
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "@typescript-eslint": tseslint.plugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unknown-property": ["error", { "ignore": ["cmdk-input-wrapper"] }],
      "no-unused-vars": "off",
    },
  },
  eslintConfigPrettier,
];