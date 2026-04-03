import kurateh from "@kurateh/eslint-plugin";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...kurateh.configs.recommended,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["*.config.*"],
    rules: {
      "import/no-unresolved": 0,
    },
  },
  {
    rules: {
      "@kurateh/import-path": 1,

      "import/order": [
        1,
        {
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },

          "newlines-between": "always",
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
          ],

          pathGroups: [
            {
              pattern: "~*/**",
              group: "internal",
            },
            {
              pattern: "@*/**",
              group: "internal",
            },
          ],
        },
      ],

      "prettier/prettier": [
        1,
        {},
        {
          usePrettierrc: true,
        },
      ],

      "no-console": 1,

      "no-restricted-imports": [2, {}],
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
]);

export default eslintConfig;
