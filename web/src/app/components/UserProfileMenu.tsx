import React, { useRef, useState } from 'react';
import { Camera, Sun, Moon, LogOut, ChevronDown, Loader2, Globe } from "@/shared/icons";
import { useTheme } from 'next-themes';
import { useAuth } from "@/app/auth/useAuth";
import { api } from "@/api";
import { useLocale, useT } from '@/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/app/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";

export function UserProfileMenu() {
  const { theme, setTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { locale, setLocale } = useLocale();
  const t = useT();
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? '?';

  const avatarUrl = user ? `${api.users.getAvatarUrl(user.id)}?v=${avatarVersion}` : undefined;
  const hasAvatar = !!(user && user.avatar);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    api.users.uploadAvatar(user.id, file)
      .then((updatedUser) => {
        updateUser(updatedUser);
        setAvatarVersion(v => v + 1);
      })
      .catch(err => console.error('Avatar upload failed:', err))
      .finally(() => setUploading(false));
    e.target.value = '';
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20';
      case 'developer': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20';
      default: return 'bg-secondary dark:bg-secondary/10 text-foreground/70 dark:text-muted-foreground/70 border-border dark:border-neutral-500/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return t('userMenu.roleAdmin');
      case 'developer': return t('userMenu.roleDeveloper');
      case 'editor': return t('userMenu.roleEditor');
      case 'viewer': return t('userMenu.roleViewer');
      default: return role;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full">
          <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-neutral-700 shadow-sm">
            <AvatarImage src={hasAvatar ? avatarUrl : undefined} alt={user?.name ?? ''} />
            <AvatarFallback className="bg-gradient-to-br from-gradient-start to-gradient-end text-xs font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block max-w-[120px] truncate">{user?.name ?? user?.email ?? '—'}</span>
          <ChevronDown size={14} className="text-muted-foreground/70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-12 h-12 ring-2 ring-neutral-200 dark:ring-neutral-700 shadow-sm">
            <AvatarImage src={hasAvatar ? avatarUrl : undefined} alt={user?.name ?? ''} />
            <AvatarFallback className="bg-gradient-to-br from-gradient-start to-gradient-end text-sm font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground truncate">
              {user?.name ?? user?.email ?? '—'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email}
            </div>
            <span className={`inline-flex items-center mt-1 px-1.5 py-1 rounded text-xs font-semibold border leading-none ${getRoleBadge(user?.role ?? 'viewer')}`}>
              {getRoleLabel(user?.role ?? 'viewer')}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleUpload}
        />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} className="cursor-pointer" disabled={uploading}>
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          {uploading ? t('common.loading') : hasAvatar ? t('userMenu.changePhoto') : t('userMenu.uploadPhoto')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} />
              {t('userMenu.lightTheme')}
            </>
          ) : (
            <>
              <Moon size={16} />
              {t('userMenu.darkTheme')}
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup value={locale} onValueChange={(value) => setLocale(value as 'ru' | 'en')}>
          <DropdownMenuRadioItem value="ru" className="cursor-pointer">
            <Globe size={16} />
            Русский
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en" className="cursor-pointer">
            <Globe size={16} />
            English
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
          <LogOut size={16} />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
