import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Rocket, ShieldOff, X, Archive, ArchiveRestore, Trash2, User, Clock } from "@/shared/icons";
import { FormField, adjustColor, GradientButton, formatDateTime } from "@/shared";
import { useT } from '@/i18n';
import { editFlagSchema, EditFlagFormValues } from "@/app/components/flags/schemas";
import type { FlagTagValue, Tag as TagType } from "@/api";
import type { FlagView } from "@/app/hooks/flagTypes";

interface FlagEditPanelProps {
  flag: FlagView;
  allTags: TagType[];
  onSave: (data: EditFlagFormValues, tags: FlagTagValue[]) => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function FlagEditPanel({
 flag, allTags, onSave, onArchive, onUnarchive, onDelete, onDirtyChange }: FlagEditPanelProps) {
  const t = useT();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditFlagFormValues>({
    resolver: zodResolver(editFlagSchema),
    defaultValues: {
      name: flag.name,
      description: flag.description,
      flagType: flag.flagType as 'RELEASE' | 'KILLSWITCH',
    },
  });

  const [formTags, setFormTags] = useState<FlagTagValue[]>(flag.tags ?? []);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagId, setNewTagId] = useState<number | null>(null);
  const [newTagVal, setNewTagVal] = useState('');

  const flagType = watch('flagType');
  const watchedName = watch('name');
  const watchedDesc = watch('description');
  const { ref: descRef, ...descReg } = register('description');

  useEffect(() => {
    const nameChanged = watchedName !== flag.name;
    const descChanged = (watchedDesc ?? '') !== (flag.description ?? '');
    const typeChanged = flagType !== flag.flagType;
    const tagsChanged = JSON.stringify(formTags) !== JSON.stringify(flag.tags ?? []);
    const dirty = nameChanged || descChanged || typeChanged || tagsChanged;
    onDirtyChange?.(dirty);
  }, [watchedName, watchedDesc, flagType, formTags, flag, onDirtyChange]);

  const addTag = useCallback(() => {
    if (formTags.length >= 10) return;
    if (newTagVal.trim() && newTagId) {
      const tg = allTags.find(t => t.id === newTagId);
      if (tg) {
        setFormTags(prev => [...prev, { tagId: tg.id, tagName: tg.name, tagColor: tg.color, value: newTagVal.trim() }]);
        setAddingTag(false);
        setNewTagId(null);
        setNewTagVal('');
      }
    }
  }, [newTagVal, newTagId, allTags, formTags.length]);

  const onSubmit = (data: EditFlagFormValues) => {
    onSave(data, formTags);
  };

  return (
    <form id="flag-edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormField label={t('common.name')} maxLength={120} value={watch('name')}>
        <input type="text" {...register('name')} maxLength={120} placeholder={t('flags.namePlaceholderEdit')} className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground" />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </FormField>

      <FormField label={t('common.key')} hint={t('flags.keyHint')}>
        <input type="text" value={flag.key} disabled className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground disabled:opacity-50 font-mono" />
      </FormField>

      <FormField label={t('common.description')} maxLength={160} value={watch('description')}>
        <textarea {...descReg} maxLength={160} placeholder={t('flags.descriptionPlaceholder')} rows={3} ref={(el) => { descRef(el); if (el) { el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 80) + 'px'; } }} onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 80) + 'px'; }} className="w-full bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none overflow-hidden" />
      </FormField>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground/80">{t('flags.flagType')}</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setValue('flagType', 'RELEASE')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${flagType === 'RELEASE' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 shadow-sm' : 'border-border text-muted-foreground hover:border-blue-300 dark:hover:border-blue-700'}`}>
            <Rocket size={18} className={flagType === 'RELEASE' ? 'text-blue-500' : 'text-muted-foreground'} />{t('flags.release')}
          </button>
          <button type="button" onClick={() => setValue('flagType', 'KILLSWITCH')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${flagType === 'KILLSWITCH' ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 shadow-sm' : 'border-border text-muted-foreground hover:border-red-300 dark:hover:border-red-700'}`}>
            <ShieldOff size={18} className={flagType === 'KILLSWITCH' ? 'text-red-500' : 'text-muted-foreground'} />{t('flags.killswitch')}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">{t('flags.tagsLabel')}</label>
        {formTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formTags.map((tv, i) => {
              const tg = allTags.find(t => t.id === tv.tagId);
              if (!tg) return null;
              return (
                <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium text-white shadow-sm" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }}>
                  <span>{tv.value}</span>
                  <button type="button" onClick={() => setFormTags(prev => prev.filter((_, j) => j !== i))} className="hover:opacity-80"><X size={12} /></button>
                </div>
              );
            })}
          </div>
        )}
        {!addingTag ? (
          <button type="button" onClick={() => setAddingTag(true)} disabled={formTags.length >= 10} title={formTags.length >= 10 ? t('flags.maxTagsReached') : undefined} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl border border-dashed border-violet-300 dark:border-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus size={14} />{t('flags.addTag')}
          </button>
        ) : (
          <div className="space-y-3 p-3 bg-secondary rounded-lg border border-border">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t('flags.selectTagType')}</label>
              <div className="grid grid-cols-2 gap-2">
                {allTags.map(tg => (
                  <button type="button" key={tg.id} onClick={() => setNewTagId(tg.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${newTagId === tg.id ? 'shadow-sm' : 'hover:shadow-sm border-border'}`} style={newTagId === tg.id ? { borderColor: tg.color, borderWidth: '2px' } : {}}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }} />
                    <span className="text-foreground/80">{tg.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {newTagId && (
              <div className="flex gap-2 items-center pt-1">
                <input type="text" value={newTagVal} onChange={e => setNewTagVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTagVal.trim()) addTag(); else if (e.key === 'Escape') { setAddingTag(false); setNewTagId(null); setNewTagVal(''); } }} placeholder={t('flags.enterTagValue')} maxLength={255} autoFocus className="flex-1 bg-white dark:bg-neutral-950 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground" />
                <GradientButton type="button" onClick={addTag} disabled={!newTagVal.trim()} size="sm">{t('common.add')}</GradientButton>
              </div>
            )}
            <button type="button" onClick={() => { setAddingTag(false); setNewTagId(null); setNewTagVal(''); }} className="w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-xl">{t('common.cancel')}</button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User size={12} className="text-muted-foreground" />
          <span>{t('flags.createdBy')} <span className="font-medium text-foreground/80">{flag.createdBy ?? t('flags.unknown')}</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={12} className="text-muted-foreground" />
          <span>{t('flags.createdAt')} <span className="font-medium text-foreground/80">{formatDateTime(flag.createdAt) ?? '-'}</span></span>
        </div>
        {flag.archivedBy && (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Archive size={12} className="text-violet-500" />
              <span>{t('flags.archivedBy')} <span className="font-medium text-foreground/80">{flag.archivedBy}</span></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={12} className="text-violet-500" />
              <span>{t('flags.archivedAt')} <span className="font-medium text-foreground/80">{formatDateTime(flag.archivedAt) ?? '-'}</span></span>
            </div>
          </>
        )}
      </div>

      <div className="pt-6 border-t border-border space-y-3">
        {flag.archived
          ? (
            <button type="button" onClick={onUnarchive} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl border border-violet-200 dark:border-violet-500/20">
              <ArchiveRestore size={16} />{t('flags.unarchiveFlag')}
            </button>
          )
          : (
            <button type="button" onClick={onArchive} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl border border-violet-200 dark:border-violet-500/20">
              <Archive size={16} />{t('flags.archiveFlag')}
            </button>
          )}
        <button type="button" onClick={onDelete} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
          <Trash2 size={16} />{t('flags.deleteFromAllEnvs')}
        </button>
      </div>
    </form>
  );
}