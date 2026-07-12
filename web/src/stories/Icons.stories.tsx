import type { Meta, StoryObj } from '@storybook/react';
import { useState, useMemo } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellRing,
  Bug,
  Info,
  Archive,
  ArchiveRestore,
  Blocks,
  Box,
  Braces,
  Briefcase,
  Building2,
  Cloud,
  Code,
  Code2,
  Container,
  FileText,
  Layers,
  Package,
  Server,
  Type,
  Webhook,
  BadgeCheck,
  Bolt,
  Check,
  Clipboard,
  Copy,
  Diamond,
  Edit2,
  Eye,
  EyeOff,
  Filter,
  Save,
  ScanEye,
  ScanSearch,
  Trash2,
  Upload,
  Calendar,
  Clock,
  Flag,
  Hash,
  Image,
  Mail,
  MapPin,
  Search,
  Split,
  Tag,
  Award,
  Brain,
  Camera,
  Cog,
  Compass,
  Crown,
  Fingerprint,
  Flame,
  Gem,
  Heart,
  Medal,
  Monitor,
  Moon,
  Palette,
  Rocket,
  Settings,
  Settings2,
  Share2,
  Shield,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Star,
  Sun,
  Target,
  ThumbsUp,
  Zap,
  Lock,
  LogOut,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  UserRound,
  Users,
  Crosshair,
  GitBranch,
  Globe,
  Key,
  Percent,
  RotateCcw,
  Loader2,
  MoreHorizontal,
  BarChart3,
  PieChart,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  GripVerticalIcon,
  PanelLeftIcon,
  Plus,
  X,
  MinusIcon,
  SearchIcon,
} from '@/shared/icons';
import type { LucideIcon } from 'lucide-react';

const ICON_CATEGORIES: { name: string; icons: LucideIcon[] }[] = [
  {
    name: 'Navigation & Actions',
    icons: [
      ArrowLeft,
      ArrowRight,
      ChevronDown,
      ChevronLeft,
      ChevronRight,
      ChevronUp,
      ExternalLink,
      GripVerticalIcon,
      PanelLeftIcon,
      Plus,
      X,
      MinusIcon,
    ],
  },
  {
    name: 'Search & Filter',
    icons: [Search, SearchIcon, Filter, ScanEye, ScanSearch, Eye, EyeOff, Crosshair, Target],
  },
  {
    name: 'Data & Charts',
    icons: [BarChart3, PieChart, Activity, Sparkles],
  },
  {
    name: 'Status & Alerts',
    icons: [AlertCircle, AlertTriangle, Info, Bell, BellRing, Bug, Check, BadgeCheck],
  },
  {
    name: 'Dev & Infrastructure',
    icons: [
      Archive,
      ArchiveRestore,
      Blocks,
      Box,
      Braces,
      Briefcase,
      Building2,
      Cloud,
      Code,
      Code2,
      Container,
      FileText,
      Layers,
      Package,
      Server,
      Type,
      Webhook,
      GitBranch,
      Globe,
      Key,
    ],
  },
  {
    name: 'Editing & Tools',
    icons: [
      Bolt,
      Clipboard,
      Copy,
      Diamond,
      Edit2,
      Save,
      Trash2,
      Upload,
      Camera,
      Monitor,
      Smartphone,
      Palette,
      Settings,
      Settings2,
      Cog,
      RotateCcw,
    ],
  },
  {
    name: 'Security & Identity',
    icons: [
      Shield,
      ShieldCheck,
      ShieldOff,
      Lock,
      Fingerprint,
      User,
      UserCheck,
      UserCog,
      UserPlus,
      UserRound,
      Users,
      LogOut,
    ],
  },
  {
    name: 'Date & Data',
    icons: [Calendar, Clock, Flag, Hash, Image, Mail, MapPin, Tag, Split, Percent],
  },
  {
    name: 'Gamification',
    icons: [
      Award,
      Brain,
      Compass,
      Crown,
      Flame,
      Gem,
      Heart,
      Medal,
      Moon,
      Rocket,
      Star,
      Sun,
      ThumbsUp,
      Zap,
      Share2,
    ],
  },
  {
    name: 'Loading & Misc',
    icons: [Loader2, MoreHorizontal],
  },
];

function IconsShowcase() {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search) return ICON_CATEGORIES;
    const q = search.toLowerCase();
    return ICON_CATEGORIES.map((cat) => ({
      ...cat,
      icons: cat.icons.filter((icon) => {
        const name = (icon as { displayName?: string }).displayName || icon.name || '';
        return name.toLowerCase().includes(q);
      }),
    })).filter((cat) => cat.icons.length > 0);
  }, [search]);

  const totalVisible = filteredCategories.reduce((sum, c) => sum + c.icons.length, 0);

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
          />
          <input
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-input-background border border-border text-body-sm placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <span className="text-xs text-muted-foreground/40">{totalVisible} of 116 icons</span>
      </div>

      {filteredCategories.map((category) => (
        <section key={category.name}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3 sticky top-0 bg-background py-1 z-10">
            {category.name} · {category.icons.length}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {category.icons.map((Icon, i) => {
              const name = (Icon as { displayName?: string }).displayName || Icon.name || 'Unknown';
              return (
                <div
                  key={`${category.name}-${i}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:bg-accent transition-colors group cursor-pointer"
                >
                  <Icon
                    size={20}
                    className="text-foreground/70 group-hover:text-foreground transition-colors"
                  />
                  <span className="text-xs text-muted-foreground/40 text-center leading-tight font-mono">
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta: Meta = {
  title: 'Design System/Icons',
  component: IconsShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'All 116 lucide-react icons used in the project, grouped by category: Navigation, Search & Filter, Data & Charts, Status & Alerts, Dev & Infrastructure, Editing & Tools, Security & Identity, Date & Data, Gamification, Loading & Misc. Searchable and filterable.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const AllIcons: Story = {};
