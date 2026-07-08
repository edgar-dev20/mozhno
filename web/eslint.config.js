import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'storybook-static', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'import/no-cycle': ['error', { maxDepth: Infinity }],
      'import/no-self-import': 'error',
      // Guardrail: forbid raw color values — use semantic design tokens only
      // (bg-primary, text-muted-foreground, text-destructive, bg-palette-*, bg-overlay).
      // See web/SKILL.md "Styling Rules". This is a hard error: no custom colors.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Literal[value=/(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|placeholder|caret|accent|decoration|ring-offset|shadow|border-t|border-r|border-b|border-l|border-x|border-y|border-s|border-e)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)|black|white)/]',
          message:
            'Raw Tailwind color detected. Use a semantic design token (bg-primary, text-muted-foreground, text-destructive, bg-palette-*, bg-overlay). See web/SKILL.md.',
        },
        {
          selector:
            'TemplateElement[value.raw=/(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|placeholder|caret|accent|decoration|ring-offset|shadow|border-t|border-r|border-b|border-l|border-x|border-y|border-s|border-e)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)|black|white)/]',
          message:
            'Raw Tailwind color detected in template literal. Use a semantic design token. See web/SKILL.md.',
        },
        {
          selector: 'Literal[value=/\\btext-(?:xs|sm|base|lg|xl|2xl|3xl)\\b/]',
          message:
            'Raw text size detected. Use a typography token (text-display, text-h1, text-h2, text-h3, text-body, text-body-sm, text-caption, text-overline). See web/SKILL.md.',
        },
        {
          selector: 'TemplateElement[value.raw=/\\btext-(?:xs|sm|base|lg|xl|2xl|3xl)\\b/]',
          message:
            'Raw text size detected in template literal. Use a typography token. See web/SKILL.md.',
        },
      ],


    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
  {
    // Config/provider/data modules that intentionally mix a non-component export
    // (router config, i18n provider + hooks, shared icon list) with component
    // definitions — fast-refresh enforcement does not apply to these.
    files: ['src/app/routes.tsx', 'src/i18n/index.tsx', 'src/app/components/SegmentIcon.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // These files AUTHOR the design system (shared components, shadcn/Radix
    // primitives) or showcase/verify it (stories, tests). They legitimately use
    // primitive size/radius utilities, so only the raw-color ban applies here.
    files: [
      'src/shared/components/**/*.{ts,tsx}',
      'src/app/components/ui/**/*.{ts,tsx}',
      'src/stories/**/*.{ts,tsx}',
      'src/test/**/*.{ts,tsx}',
      '**/*.stories.{ts,tsx}',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Literal[value=/(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|placeholder|caret|accent|decoration|ring-offset|shadow|border-t|border-r|border-b|border-l|border-x|border-y|border-s|border-e)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)|black|white)/]',
          message:
            'Raw Tailwind color detected. Use a semantic design token. See web/SKILL.md.',
        },
        {
          selector:
            'TemplateElement[value.raw=/(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|placeholder|caret|accent|decoration|ring-offset|shadow|border-t|border-r|border-b|border-l|border-x|border-y|border-s|border-e)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)|black|white)/]',
          message:
            'Raw Tailwind color detected in template literal. Use a semantic design token. See web/SKILL.md.',
        },
      ],
    },
  },
  prettierConfig,
);
