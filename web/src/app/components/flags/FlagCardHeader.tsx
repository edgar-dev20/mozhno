import { Switch } from "@/app/components/ui/switch";
import { getFlagTypeColor, getFlagTypeLabel, adjustColor } from "@/shared";
import type { FlagView } from "@/app/hooks/flagTypes";
import type { Tag as TagType } from "@/api";

const getTypeIcon = (t: string) => {
  if (t === 'RELEASE') {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    );
  }
  if (t === 'KILLSWITCH') {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  return null;
};

interface FlagCardHeaderProps {
  flag: FlagView;
  expanded: boolean;
  environments: { id: number; name: string }[];
  tags: TagType[];
  onToggleFlag: (flag: FlagView, envId: number) => void;
}

export function FlagCardHeader({ flag, expanded, environments, tags, onToggleFlag }: FlagCardHeaderProps) {
  return (
    <>
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-semibold text-sm text-foreground truncate group-hover:bg-gradient-to-r group-hover:from-gradient-start group-hover:to-gradient-end group-hover:bg-clip-text group-hover:text-transparent transition-all">
            {flag.name}
          </span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold border shrink-0 leading-none ${getFlagTypeColor(flag.flagType)}`}>
            {getTypeIcon(flag.flagType)}
            {getFlagTypeLabel(flag.flagType)}
          </span>
          {!expanded &&
            flag.tags.length > 0 &&
            flag.tags.slice(0, 4).map((tv, i) => {
              const tg = tags.find((t) => t.id === tv.tagId);
              return tg ? (
                <span
                  key={i}
                  className="inline-flex items-center px-1.5 py-1 rounded text-xs font-medium text-white shadow-sm leading-none"
                  style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }}
                >
                  {tv.value}
                </span>
              ) : null;
            })}
          {!expanded && flag.tags.length > 4 && (
            <span className="text-xs text-muted-foreground">+{flag.tags.length - 4}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {!expanded ? (
          environments.map((env) => {
            const es = flag.environments[env.id];
            return (
              <div key={env.id} className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{env.name}</span>
                {es && (
                  <span onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={es.enabled}
                      onCheckedChange={() => onToggleFlag(flag, env.id)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-gradient-start data-[state=checked]:to-gradient-end scale-75 origin-right"
                    />
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="size-7" />
        )}
      </div>
    </>
  );
}
