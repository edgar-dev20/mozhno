import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, ChevronDown, ChevronUp, Server, Globe } from '@/shared/icons';
import { JavaIcon } from '@/app/components/LanguageIcons';
import { useT, type MessageKey } from '@/i18n';

type SdkTab = 'java' | 'js-server' | 'js-client';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

function CodeBlock({ code, lang }: CodeBlockProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {lang && (
        <span className="absolute top-2 right-12 text-caption font-mono text-muted-foreground/70 dark:text-muted-foreground uppercase tracking-wider">
          {lang}
        </span>
      )}
      <button
        onClick={handleCopy}
        aria-label={t('sdkInfo.copySnippet')}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-popover/60 hover:bg-background dark:hover:bg-muted text-muted-foreground hover:text-foreground/70 dark:hover:text-muted-foreground transition-colors"
      >
        {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
      </button>
      <pre className="bg-muted dark:bg-muted border border-border rounded-xl p-5 overflow-x-auto text-body-sm leading-relaxed">
        <code className="text-muted-foreground font-mono text-body-sm whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

const tabs: {
  id: SdkTab;
  label: string;
  icon: React.ReactNode;
  keyType: 'SERVER' | 'FRONTEND';
  gradient: string;
}[] = [
  {
    id: 'java',
    label: 'Java SDK',
    icon: <JavaIcon size={14} />,
    keyType: 'SERVER',
    gradient: 'from-gradient-start to-gradient-end',
  },
  {
    id: 'js-server',
    label: 'JS SDK (Server)',
    icon: <Server size={14} />,
    keyType: 'SERVER',
    gradient: 'from-warning to-warning',
  },
  {
    id: 'js-client',
    label: 'JS SDK (Client)',
    icon: <Globe size={14} />,
    keyType: 'FRONTEND',
    gradient: 'from-success to-brand',
  },
];

function buildContent(
  t: (key: MessageKey, params?: Record<string, string>) => string,
): Record<
  SdkTab,
  { desc: string; install: string; usage: string; installLang: string; usageLang: string }
> {
  return {
    java: {
      desc: t('sdkInfo.javaDesc'),
      install: `// build.gradle
dependencies {
    implementation 'dev.mozhno:mozhno-client-java:1.0-SNAPSHOT'
}`,
      usage:
        `// application.yml
mozhno:
  url: https://${window.location.hostname}
  api-key: sk-...          // ` +
        t('sdkInfo.serverKey') +
        `

  app-name: my-app
  instance-id: instance-1
  environment: production

// ` +
        t('sdkInfo.inCode') +
        `
@Autowired
private MozhnoClient mozhno;

if (mozhno.isEnabled("new-feature")) {
    // ` +
        t('sdkInfo.newFeatureCode') +
        `
}`,
      installLang: 'gradle',
      usageLang: 'java',
    },
    'js-server': {
      desc: t('sdkInfo.jsServerDesc'),
      install: `npm install @mozhno/client-js`,
      usage:
        `import { MozhnoClient } from '@mozhno/client-js';

const mozhno = new MozhnoClient({
  url: 'https://${window.location.hostname}',
  apiKey: 'sk-...',           // ` +
        t('sdkInfo.serverKey') +
        `
  appName: 'my-api',
  mode: 'server',
});

await mozhno.start();

if (mozhno.isEnabled('new-feature', { userId: '123' })) {
  // ` +
        t('sdkInfo.newFeatureCode') +
        `
}`,
      installLang: 'bash',
      usageLang: 'ts',
    },
    'js-client': {
      desc: t('sdkInfo.jsClientDesc'),
      install: `npm install @mozhno/client-js`,
      usage:
        `import { MozhnoClient } from '@mozhno/client-js';

const mozhno = new MozhnoClient({
  url: 'https://${window.location.hostname}',
  clientKey: 'sk-...',        // ` +
        t('sdkInfo.frontendKey') +
        `
  appName: 'my-webapp',
  mode: 'client',
});

mozhno.on('ready', () => {
  if (mozhno.isEnabled('new-dashboard')) {
    // ` +
        t('sdkInfo.showNewDashboard') +
        `
  }
});

mozhno.updateContext({ userId: user.id });
mozhno.start();`,
      installLang: 'bash',
      usageLang: 'ts',
    },
  };
}

export function SdkInfo() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<SdkTab>('java');
  const [expanded, setExpanded] = useState(true);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const active = tabs.find((tab) => tab.id === activeTab)!;
  const content = buildContent(t);

  return (
    <div
              className="rounded-2xl border backdrop-blur-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(6,182,212,0.03))',
        borderColor: 'rgba(99,102,241,0.15)',
        boxShadow: '0 0 40px rgba(99,102,241,0.06), inset 0 1px 0 rgba(99,102,241,0.08)',
      }}
    >
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="w-full p-5 flex items-center justify-between hover:bg-background/20 dark:hover:bg-background/5 transition-colors cursor-pointer select-none"
        >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand/10 to-brand/10 flex items-center justify-center">
            <JavaIcon size={18} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground/90">{t('sdkInfo.title')}</h3>
            <p className="text-caption text-muted-foreground">{t('sdkInfo.description')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!expanded && (
            <span className="text-caption text-muted-foreground/70 dark:text-muted-foreground hidden sm:inline">
              {active.label}
            </span>
          )}
          {expanded ? (
            <ChevronUp size={18} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={18} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="px-5 pb-5"
        >
          <div
            role="tablist"
            aria-label={t('sdkInfo.title')}
            className="flex flex-wrap gap-1.5 mb-4 p-1 bg-accent rounded-xl"
          >
            {tabs.map((tab, tabIdx) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
                ref={(el) => {
                  tabRefs.current[tabIdx] = el;
                }}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const idx = tabs.findIndex((t) => t.id === activeTab);
                    const next =
                      e.key === 'ArrowRight'
                        ? tabs[(idx + 1) % tabs.length]
                        : tabs[(idx - 1 + tabs.length) % tabs.length];
                    setActiveTab(next.id);
                    tabRefs.current[tabs.findIndex((t) => t.id === next.id)]?.focus();
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-body-sm font-medium rounded-lg transition-all focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
                  activeTab === tab.id
                    ? 'bg-popover shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground/70 dark:hover:text-muted-foreground'
                }`}
              >
                <span
                  className={
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} bg-clip-text text-transparent`
                      : ''
                  }
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-body-sm text-muted-foreground leading-relaxed max-w-2xl">
                {content[activeTab].desc}
              </p>
              <span
                className={`shrink-0 inline-flex items-center gap-1 text-caption font-semibold px-2.5 py-1 rounded-lg border ${
                  active.keyType === 'SERVER'
                    ? 'text-brand bg-brand/10 border-brand/20'
                    : 'text-success dark:text-palette-success-700 bg-success/10 border-success/20'
                }`}
              >
                {active.keyType === 'SERVER' ? (
                  <Server
                    size={12}
                    className={active.keyType === 'SERVER' ? 'text-brand' : 'text-success'}
                  />
                ) : (
                  <Globe size={12} className="text-success" />
                )}
                {active.keyType === 'SERVER' ? t('sdkInfo.serverKey') : t('sdkInfo.frontendKey')}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-caption font-semibold text-muted-foreground/70 mb-2">
                  {t('sdkInfo.install')}
                </p>
                <CodeBlock
                  code={content[activeTab].install}
                  lang={content[activeTab].installLang}
                />
              </div>
              <div>
                <p className="text-caption font-semibold text-muted-foreground/70 mb-2">
                  {t('sdkInfo.usage')}
                </p>
                <CodeBlock code={content[activeTab].usage} lang={content[activeTab].usageLang} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
