import type { Meta, StoryObj } from '@storybook/react';
import { UserProfileMenu } from '@/app/components/UserProfileMenu';
import { TooltipProvider } from '@/app/components/ui/tooltip';
import { AuthContext } from '@/app/auth/AuthContext';
import type { UserDto } from '@/api';

const ADMIN_USER: UserDto = {
  id: 1,
  email: 'admin@mozhno.dev',
  name: 'Anna Lee',
  role: 'ADMIN',
  status: 'ACTIVE',
  avatar: null,
  locale: 'ru',
  createdAt: '2026-01-01T00:00:00Z',
  lastActiveAt: '2026-06-01T12:00:00Z',
};

const DEVELOPER_USER: UserDto = {
  ...ADMIN_USER,
  name: 'Ivan Petrov',
  role: 'DEVELOPER',
};

const VIEWER_USER: UserDto = {
  ...ADMIN_USER,
  name: 'Maria Reader',
  role: 'VIEWER',
};

function makeAuthState(user: UserDto) {
  return {
    user,
    loading: false,
    login: async () => {},
    logout: () => {},
    updateUser: () => {},
  };
}

const meta: Meta<typeof UserProfileMenu> = {
  title: 'App/UserProfileMenu',
  component: UserProfileMenu,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <AuthContext.Provider value={makeAuthState(ADMIN_USER)}>
          <Story />
        </AuthContext.Provider>
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserProfileMenu>;

export const Admin: Story = {};

export const Developer: Story = {
  decorators: [
    (Story) => (
      <TooltipProvider>
        <AuthContext.Provider value={makeAuthState(DEVELOPER_USER)}>
          <Story />
        </AuthContext.Provider>
      </TooltipProvider>
    ),
  ],
};

export const Viewer: Story = {
  decorators: [
    (Story) => (
      <TooltipProvider>
        <AuthContext.Provider value={makeAuthState(VIEWER_USER)}>
          <Story />
        </AuthContext.Provider>
      </TooltipProvider>
    ),
  ],
};
