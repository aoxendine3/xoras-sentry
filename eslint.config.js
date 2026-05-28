// eslint.config.js
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // Ignore generated build artifacts and Next.js output
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
    ],
  },
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
