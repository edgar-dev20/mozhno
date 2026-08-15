import type { Meta, StoryObj } from '@storybook/react';
import { ActivationConfirmDetails } from '@/app/components/flags/ActivationConfirmDetails';
import type { SegmentResponse, ContextDefinition } from '@/api';

const seg = (
  id: number,
  name: string,
  icon: string,
  color: string,
  description = '',
  context: SegmentResponse['context'] = [],
): SegmentResponse => ({
  id,
  projectId: 1,
  name,
  description,
  icon,
  color,
  context,
  createdAt: '2025-01-01T00:00:00Z',
});

const SEGMENTS: SegmentResponse[] = [
  seg(1, 'Бета-пользователи', 'Rocket', '#2d9484', 'раннее тестирование', [
    { contextDefinitionId: 12, operator: 'eq', contextValues: 'pro' },
    { contextDefinitionId: 14, operator: 'lt', contextValues: '2024-01-01' },
  ]),
  seg(2, 'Внутренние сотрудники', 'Users', '#6d5ae0', 'команда Mozhno', [
    { contextDefinitionId: 13, operator: 'eq', contextValues: 'admin' },
  ]),
  seg(3, 'Клиенты Pro', 'Crown', '#c08140', 'платный тариф', [
    { contextDefinitionId: 10, operator: 'in', contextValues: 'EU,US' },
  ]),
  seg(4, 'QA-инженеры', 'Bug', '#5a82a0', 'тестирование релизов', [
    { contextDefinitionId: 13, operator: 'eq', contextValues: 'qa' },
  ]),
  seg(5, 'Ранний доступ', 'Star', '#c05a52', 'early access'),
  seg(6, 'VIP-клиенты', 'Gem', '#b89430', 'высокий LTV'),
  seg(7, 'Разработчики', 'Code', '#4a8c5e', 'API-интеграторы'),
  seg(8, 'Маркетинг', 'Target', '#9a4860', 'кампании'),
];

const ctx = (id: number, name: string, type = 'string'): ContextDefinition => ({
  id,
  projectId: 1,
  name,
  key: name,
  type,
  createdBy: null,
  description: '',
  isStrict: false,
  validValues: [],
  createdAt: '2025-01-01T00:00:00Z',
});

const CONTEXTS: ContextDefinition[] = [
  ctx(10, 'country'),
  ctx(11, 'app_version', 'semver'),
  ctx(12, 'plan'),
  ctx(13, 'role'),
  ctx(14, 'signup_date', 'time'),
  ctx(15, 'email'),
];

const meta: Meta<typeof ActivationConfirmDetails> = {
  title: 'App/Flags/ActivationConfirmDetails',
  component: ActivationConfirmDetails,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 440 }} className="rounded-2xl border border-border bg-popover p-5">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ActivationConfirmDetails>;

export const Typical: Story = {
  args: {
    percentage: 25,
    segmentIds: [1, 2, 3],
    contextDefinitionId: null,
    contextValuesJson: JSON.stringify([
      { cd: 10, op: 'in', val: 'RU,KZ,BY' },
      { cd: 11, op: 'gte', val: '2.4.0' },
    ]),
    segments: SEGMENTS,
    contexts: CONTEXTS,
  },
};

export const ManySegmentsAndConditions: Story = {
  args: {
    percentage: 60,
    segmentIds: [1, 2, 3, 4, 5, 6, 7, 8],
    contextDefinitionId: null,
    contextValuesJson: JSON.stringify([
      { cd: 10, op: 'in', val: 'RU,KZ,BY,AM,GE,UZ,KG' },
      { cd: 11, op: 'gte', val: '2.4.0' },
      { cd: 12, op: 'eq', val: 'pro' },
      { cd: 13, op: 'not_in', val: 'guest,anonymous' },
      { cd: 14, op: 'lt', val: '2024-01-01' },
      { cd: 15, op: 'contains', val: '@mozhno.dev' },
    ]),
    segments: SEGMENTS,
    contexts: CONTEXTS,
  },
};

export const Everyone: Story = {
  args: {
    percentage: 100,
    segmentIds: [],
    contextDefinitionId: null,
    contextValuesJson: null,
    segments: SEGMENTS,
    contexts: CONTEXTS,
  },
};

export const ConditionsOnly: Story = {
  args: {
    percentage: 100,
    segmentIds: [],
    contextDefinitionId: null,
    contextValuesJson: JSON.stringify([{ cd: 12, op: 'eq', val: 'pro' }]),
    segments: SEGMENTS,
    contexts: CONTEXTS,
  },
};
