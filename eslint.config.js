const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const eslintConfigPrettier = require("eslint-config-prettier");
const importPlugin = require("eslint-plugin-import");
const reactJsxPlugin = require("eslint-plugin-react/configs/jsx-runtime.js");
const reactRecommended = require("eslint-plugin-react/configs/recommended.js");
const unusedImportPlugin = require("eslint-plugin-unused-imports");
const globals = require("globals");

const compat = new FlatCompat();

/** @type { import("eslint").Linter.FlatConfig[] } */
module.exports = [
  // *.d.tsは無視するように
  {
    ignores: ["**/*.d.ts"],
  },
  // 全体項目設定
  {
    files: ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "arrow-body-style": ["error", "as-needed"],
      "prefer-arrow-callback": "error",
    },
  },
  // 推薦項目の設定
  js.configs.recommended,
  // TypeScript 向け設定
  ...compat.extends("plugin:@typescript-eslint/eslint-recommended"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
    },
  },
  // React 向け設定
  reactRecommended,
  {
    rules: {
      "react/jsx-no-leaked-render": "error",
    },
  },
  // import React の強制を無効化
  reactJsxPlugin,
  // import順の整理
  {
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImportPlugin,
    },
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": "warn",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "type",
            "parent",
            "sibling",
            "index",
            "object",
          ],
          pathGroups: [
            {
              pattern: "@/types",
              group: "type",
              position: "after",
            },
            {
              pattern: "@/schema",
              group: "parent",
              position: "before",
            },
            {
              pattern: "@/api",
              group: "parent",
              position: "before",
            },
            {
              pattern: "@/utils",
              group: "parent",
              position: "before",
            },
            {
              pattern: "@/hooks",
              group: "parent",
              position: "before",
            },
            {
              pattern: "@/features",
              group: "parent",
              position: "before",
            },
            {
              pattern: "@/errors",
              group: "parent",
              position: "before",
            },
            {
              pattern: "@/pages",
              group: "parent",
              position: "before",
            },
            {
              pattern: "@/layouts",
              group: "parent",
              position: "before",
            },
            {
              pattern: "@/components",
              group: "parent",
              position: "before",
            },
          ],
          alphabetize: {
            order: "asc",
          },
          "newlines-between": "always",
        },
      ],
    },
  },
  // Prettierとの競合項目を回避
  eslintConfigPrettier,
];
