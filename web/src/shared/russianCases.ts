type CaseForm = 'nom' | 'gen' | 'pre' | 'acc';
type Gender = 'm' | 'f';

interface CaseForms {
  nom: string;
  gen: string;
  pre: string;
  acc: string;
  gender: Gender;
}

/**
 * Grammatical cases and gender for resource nouns.
 *
 * Cases:
 * - `nom` — именительный (кто? что?): subject, labels, filter chips.
 *   «Создан флаг», «Фильтр: Сегмент»
 * - `gen` — родительный (кого? чего?): possession, count.
 *   «3 флага», «экспорт сегмента»
 * - `pre` — предложный (о ком? о чём?): location.
 *   «изменения во флаге», «ошибка в среде»
 * - `acc` — винительный (кого? что?): direct object.
 *   «вижу флаг», «настроил среду»
 *
 * Gender:
 * - `m` — masculine: flag, segment, user, etc.
 * - `f` — feminine: strategy, integration, etc.
 *
 * When adding a new resource type, register all five fields here.
 * The i18n keys (audit.resource.*) store only nominative forms.
 *
 * @see web/SKILL.md — "Russian grammatical cases"
 */
const CASES: Record<string, CaseForms> = {
  flag:        { nom: 'флаг',         gen: 'флага',         pre: 'флаге',         acc: 'флаг',         gender: 'm' },
  user:        { nom: 'пользователь', gen: 'пользователя',  pre: 'пользователе',  acc: 'пользователя',  gender: 'm' },
  tag:         { nom: 'тег',          gen: 'тега',          pre: 'теге',          acc: 'тег',          gender: 'm' },
  apikey:      { nom: 'API-ключ',     gen: 'API-ключа',     pre: 'API-ключе',     acc: 'API-ключ',     gender: 'm' },
  segment:     { nom: 'сегмент',      gen: 'сегмента',      pre: 'сегменте',      acc: 'сегмент',      gender: 'm' },
  project:     { nom: 'проект',       gen: 'проекта',       pre: 'проекте',       acc: 'проект',       gender: 'm' },
  environment: { nom: 'среда',        gen: 'среды',         pre: 'среде',         acc: 'среду',        gender: 'f' },
  context:     { nom: 'контекст',     gen: 'контекста',     pre: 'контексте',     acc: 'контекст',     gender: 'm' },
  strategy:    { nom: 'стратегия',    gen: 'стратегии',     pre: 'стратегии',     acc: 'стратегию',    gender: 'f' },
  integration: { nom: 'интеграция',   gen: 'интеграции',    pre: 'интеграции',    acc: 'интеграцию',   gender: 'f' },
};

/**
 * Return a resource noun in the requested grammatical case.
 *
 * ```
 * getCase('flag', 'gen')  // → 'флага'
 * getCase('segment', 'pre') // → 'сегменте'
 * getCase('strategy', 'acc') // → 'стратегию'
 * ```
 */
export function getCase(key: string, form: CaseForm): string {
  return CASES[key]?.[form] ?? key;
}

/**
 * Return the grammatical gender of a resource.
 *
 * ```
 * getGender('flag')    // → 'm'
 * getGender('strategy') // → 'f'
 * ```
 */
export function getGender(key: string): Gender {
  return CASES[key]?.gender ?? 'm';
}

/**
 * Russian plural form selection.
 *
 * ```
 * russianPlural(1, 'флаг', 'флага', 'флагов')     // → 'флаг'
 * russianPlural(3, 'флаг', 'флага', 'флагов')     // → 'флага'
 * russianPlural(7, 'флаг', 'флага', 'флагов')     // → 'флагов'
 * russianPlural(21, 'флаг', 'флага', 'флагов')    // → 'флаг'
 * ```
 */
export function russianPlural(n: number, one: string, few: string, many: string): string {
  const m = n % 10;
  const h = n % 100;
  if (h >= 11 && h <= 19) return many;
  if (m === 1) return one;
  if (m >= 2 && m <= 4) return few;
  return many;
}

/**
 * Gendered short-form passive participles for audit actions.
 *
 * Used in the activity feed to produce grammatically correct sentences:
 * «Создан флаг» (m), «Изменена стратегия» (f).
 */
const ACTION_PARTICIPLES: Record<string, { m: string; f: string }> = {
  created:    { m: 'создан',          f: 'создана' },
  updated:    { m: 'изменён',         f: 'изменена' },
  deleted:    { m: 'удалён',          f: 'удалена' },
  archived:   { m: 'архивирован',     f: 'архивирована' },
  unarchived: { m: 'разархивирован',  f: 'разархивирована' },
  purged:     { m: 'очищен',          f: 'очищена' },
};

/**
 * Return the gendered short-form passive participle for an audit action.
 *
 * ```
 * getActionParticiple('created', 'm')  // → 'создан'
 * getActionParticiple('updated', 'f')  // → 'изменена'
 * ```
 */
export function getActionParticiple(action: string, gender: Gender): string {
  const suffix = action.split('.').pop() ?? action;
  return ACTION_PARTICIPLES[suffix]?.[gender] ?? action;
}
