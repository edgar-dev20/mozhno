import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from 'storybook/test';
import { useState } from 'react';
import { FlagEnvironmentPanel } from '@/app/components/flags/FlagEnvironmentPanel';
import type { ConstraintGroup } from '@/app/components/flags/types';
import type { SegmentResponse, ContextDefinition } from '@/api';

const meta: Meta<typeof FlagEnvironmentPanel> = {
  title: 'App/Flags/FlagEnvironmentPanel',
  component: FlagEnvironmentPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlagEnvironmentPanel>;

function DefaultRender() {
  const [p, sp] = useState(50);
  const [sgs, ssgs] = useState<number[]>([]);
  const [cgs, scgs] = useState<ConstraintGroup[]>([]);
  const [en, sen] = useState(true);
  const [ag, sag] = useState<string | null>(null);
  return (
    <FlagEnvironmentPanel
      envRulePercent={p}
      onEnvRulePercentChange={sp}
      envRuleSegments={sgs}
      onEnvRuleSegmentsChange={ssgs}
      envRuleConstraintGroups={cgs}
      onEnvRuleConstraintGroupsChange={scgs}
      envRuleEnabled={en}
      onEnvRuleEnabledChange={sen}
      segments={[]}
      contexts={[]}
      activeGroupId={ag}
      onActiveGroupIdChange={sag}
      envName="Production"
    />
  );
}

export const Default: Story = {
  render: DefaultRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).toBeInTheDocument();
    await expect(toggle).toBeChecked();
    await expect(canvas.getByText('всех пользователей')).toBeInTheDocument();
    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
  },
};

const QA_SEGMENT: SegmentResponse = {
  id: 1,
  projectId: 1,
  name: 'QA',
  description: 'тестирование релизов',
  icon: 'Bug',
  color: '#5a82a0',
  context: [{ contextDefinitionId: 13, operator: 'eq', contextValues: 'qa' }],
  usedByFlags: 3,
  createdAt: '2025-01-01T00:00:00Z',
};

const USER_ID_CTX: ContextDefinition = {
  id: 10,
  projectId: 1,
  name: 'ID пользователя',
  key: 'userId',
  type: 'string',
  createdBy: null,
  description: '',
  isStrict: false,
  validValues: [],
  createdAt: '2025-01-01T00:00:00Z',
};

const ROLE_CTX: ContextDefinition = {
  id: 13,
  projectId: 1,
  name: 'Роль',
  key: 'role',
  type: 'string',
  createdBy: null,
  description: '',
  isStrict: false,
  validValues: [],
  createdAt: '2025-01-01T00:00:00Z',
};

function TargetedRender() {
  const [p, sp] = useState(74);
  const [sgs, ssgs] = useState<number[]>([1]);
  const [cgs, scgs] = useState<ConstraintGroup[]>([
    { id: 'g1', contextDefId: 10, operator: 'in', values: ['312'] },
  ]);
  const [en, sen] = useState(true);
  const [ag, sag] = useState<string | null>(null);
  return (
    <FlagEnvironmentPanel
      envRulePercent={p}
      onEnvRulePercentChange={sp}
      envRuleSegments={sgs}
      onEnvRuleSegmentsChange={ssgs}
      envRuleConstraintGroups={cgs}
      onEnvRuleConstraintGroupsChange={scgs}
      envRuleEnabled={en}
      onEnvRuleEnabledChange={sen}
      segments={[QA_SEGMENT]}
      contexts={[USER_ID_CTX, ROLE_CTX]}
      activeGroupId={ag}
      onActiveGroupIdChange={sag}
      envName="Production"
    />
  );
}

export const TargetedAudience: Story = {
  render: TargetedRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('74%').length).toBeGreaterThan(0);
    await expect(canvas.getByText('из пользователей ниже')).toBeInTheDocument();
    await expect(canvas.getByText('Аудитория')).toBeInTheDocument();
    await expect(canvas.getAllByText('QA').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('312').length).toBeGreaterThan(0);
  },
};
