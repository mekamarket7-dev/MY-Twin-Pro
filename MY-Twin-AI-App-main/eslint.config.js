const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2020, sourceType: "module" },
      // تعريف المتغيرات العامة لـ React Native لوقف أخطاء "no-undef"
      globals: {
        React: "readonly",
        console: "readonly",
        process: "readonly",
        window: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        __DEV__: "readonly",
        JSX: "readonly",
        Blob: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      // تخفيض أخطاء المتغيرات غير المستخدمة إلى "تحذير" فقط
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "warn",
      // إيقاف أخطاء "غير معرف" لأننا عرفناها بالأعلى
      "no-undef": "off",
      // السماح بصيغة require
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];
