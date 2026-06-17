import { Percent, Split, AlertTriangle } from '@/shared/icons';
import { SectionHeader, Card } from '@/shared';
import { TipCard } from '@/app/components/TipCard';
import { useT } from '@/i18n';

const BUILTIN = [
  {
    nameKey: 'strategies.gradualName' as const,
    descKey: 'strategies.gradualDesc' as const,
    icon: Percent,
    color: 'text-info',
    bg: 'bg-info/10',
  },
  {
    nameKey: 'strategies.abName' as const,
    descKey: 'strategies.abDesc' as const,
    icon: Split,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  {
    nameKey: 'strategies.killswitchName' as const,
    descKey: 'strategies.killswitchDesc' as const,
    icon: AlertTriangle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
];

export function Strategies() {
  const t = useT();
  return (
    <div className="space-y-6">
      <SectionHeader title={t('strategies.title')} description={t('strategies.description')} />
      <TipCard
        text={t('strategies.hygieneTip')}
        label={t('strategies.hygieneLabel')}
        icon={<Percent />}
        storageKey="strategies"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUILTIN.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card
              key={i}
              variant="elevated"
              padded
              className="p-5 hover:shadow-xl transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <Icon size={22} className={s.color} />
              </div>
              <h3 className="font-semibold text-foreground">{t(s.nameKey)}</h3>
              <p className="text-sm text-muted-foreground/80 mt-1">{t(s.descKey)}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
