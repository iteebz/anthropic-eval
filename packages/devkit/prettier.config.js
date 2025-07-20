module.exports = {
  semi: true,
  trailingComma: "all",
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss", "@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "^@?[a-zA-Z].*",
    "",
    "^[./]"
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
};