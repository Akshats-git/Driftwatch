import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next's arrays are written for a config file that lives at the
// app root, so their `files` globs (e.g. "**/*.tsx") have no directory
// prefix. Since this config is shared repo-wide, scope every entry to
// apps/web/** so Next/React-specific rules don't leak into other packages.
// Pure `{ ignores }` entries (no files/rules/languageOptions/plugins) are
// global ignore additions in flat config, not per-file rules — hoist those
// into the top-level ignores block below instead of scoping them.
function scopeToApp(configs, appDir) {
  return configs
    .filter(
      (cfg) => !(cfg.ignores && !cfg.files && !cfg.rules && !cfg.languageOptions && !cfg.plugins),
    )
    .map((cfg) => ({
      ...cfg,
      files: (cfg.files ?? ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"]).map(
        (pattern) => `${appDir}/${pattern}`,
      ),
    }));
}

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
      "**/next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...scopeToApp(nextVitals, "apps/web"),
  ...scopeToApp(nextTypescript, "apps/web"),
  {
    // eslint-config-next's rules (e.g. no-html-link-for-pages) locate the
    // Next.js app by walking from the ESLint working directory, which is the
    // monorepo root here rather than apps/web itself. Point it explicitly.
    files: ["apps/web/**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    settings: {
      next: {
        rootDir: "apps/web",
      },
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        // Root-level tool config files (e.g. packages/db/drizzle.config.ts)
        // that intentionally sit outside their package's own tsconfig
        // `include` still get parsed via a one-off default project here,
        // rather than needing to join the package's build.
        projectService: {
          allowDefaultProject: ["packages/db/drizzle.config.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
  eslintConfigPrettier,
);
