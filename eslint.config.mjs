import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "supabase/**",
      "tests/**",
      "scripts/**",
      "*.mjs",
      "*.tsbuildinfo",
    ],
  },
];
