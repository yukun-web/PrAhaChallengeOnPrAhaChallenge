import { nextJsConfig } from "@ponp/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
];
