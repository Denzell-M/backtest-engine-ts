import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        // Keep eslint config out of the TypeScript project graph.
        // We only want type-aware linting for src/**.
        projectService: false,
      },
    },
  },
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
    },
  },
);
