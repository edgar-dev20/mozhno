import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Rocket, ShieldOff, X } from "@/shared/icons";
import { FormField, adjustColor, GradientButton } from "@/shared";
import { useT } from '@/i18n';
import { createFlagSchema, CreateFlagFormValues } from "@/app/components/flags/schemas";
import type { FlagTagValue, Tag as TagType } from "@/api";

interface FlagCreatePanelProps {
  allTags: TagType[];
  onSave: (data: CreateFlagFormValues, tags: FlagTagValue[]) => void;
}

export function FlagCreatePanel({
 allTags, onSave }: FlagCreatePanelProps) {
  const t = useT();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFlagFormValues>({
    resolver: zodResolver(createFlagSchema),
    defaultValues: { name: '', key: '', description: '', flagType: 'RELEASE' },
  });

  const [formTags, setFormTags] = useState<FlagTagValue[]>([]);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagId, setNewTagId] = useState<number | null>(null);
  const [newTagVal, setNewTagVal] = useState('');

  const flagType = watch('flagType');
  const { ref: descRef, ...descReg } = register('description');

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

  const onSubmit = (data: CreateFlagFormValues) => {
    onSave(data, formTags);
  };

  return (
    <form id="flag-create-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
        <p className="text-xs text-indigo-700 dark:text-indigo-300">
          {t('flags.createDescription')}
        </p>
      </div>

      <FormField label={t('common.name')} maxLength={120} value={watch('name')}>
        <input type="text" {...register('name')} maxLength={120} placeholder={t('flags.namePlaceholderEdit')} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:font-normal placeholder:text-muted-foreground" />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </FormField>

      <FormField label={t('common.key')} hint={t('flags.keyHint')} maxLength={100} value={watch('key')}>
        <input type="text" {...register('key')} maxLength={100} placeholder="new-checkout-flow" className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground font-mono" />
        {errors.key && <p className="text-xs text-red-500 mt-1">{errors.key.message}</p>}
      </FormField>

      <FormField label={t('common.description')} maxLength={160} value={watch('description')}>
        <textarea {...descReg} maxLength={160} placeholder={t('flags.descriptionPlaceholder')} rows={3} ref={(el) => { descRef(el); if (el) { el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 80) + 'px'; } }} onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight, 80) + 'px'; }} className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground resize-none overflow-hidden" />
      </FormField>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground/80">{t('flags.flagType')}</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setValue('flagType', 'RELEASE')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${flagType === 'RELEASE' ? 'border-info bg-info/10 text-info shadow-sm' : 'border-border text-muted-foreground hover:border-info/20'}`}>
            <Rocket size={18} className={flagType === 'RELEASE' ? 'text-blue-500' : 'text-muted-foreground'} />{t('flags.release')}
          </button>
          <button type="button" onClick={() => setValue('flagType', 'KILLSWITCH')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${flagType === 'KILLSWITCH' ? 'border-destructive bg-destructive/10 text-destructive shadow-sm' : 'border-border text-muted-foreground hover:border-destructive/20'}`}>
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
          <button type="button" onClick={() => setAddingTag(true)} disabled={formTags.length >= 10} title={formTags.length >= 10 ? t('flags.maxTagsReached') : undefined} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10 rounded-lg border border-dashed border-brand/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus size={14} />{t('flags.addTag')}
          </button>
        ) : (
          <div className="space-y-3 p-3 bg-secondary rounded-lg border border-border">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t('flags.selectTagType')}</label>
              <div className="grid grid-cols-2 gap-2">
                {allTags.map(tg => (
                  <button type="button" key={tg.id} onClick={() => setNewTagId(tg.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${newTagId === tg.id ? 'shadow-sm' : 'hover:shadow-sm border-border'}`} style={newTagId === tg.id ? { borderColor: tg.color, borderWidth: '2px' } : {}}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }} />
                    <span className="text-foreground/80">{tg.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {newTagId && (
              <div className="space-y-1">
                <div className="flex gap-2 items-center pt-1">
                <input type="text" value={newTagVal} onChange={e => setNewTagVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTagVal.trim()) addTag(); else if (e.key === 'Escape') { setAddingTag(false); setNewTagId(null); setNewTagVal(''); } }} placeholder={t('flags.enterTagValue')} maxLength={255} autoFocus className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all placeholder:text-muted-foreground" />
                <GradientButton type="button" onClick={addTag} disabled={!newTagVal.trim()} size="sm">{t('common.add')}</GradientButton>
                </div>
                <div className="text-xs font-normal text-muted-foreground/50 tabular-nums text-right">{newTagVal.length}/255</div>
              </div>
            )}
            <button type="button" onClick={() => { setAddingTag(false); setNewTagId(null); setNewTagVal(''); }} className="w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg">{t('common.cancel')}</button>
          </div>
        )}
      </div>
    </form>
  );
}