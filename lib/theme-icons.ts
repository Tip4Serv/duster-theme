// Icon and visual utilities for different themes
// Using lucide-react and react-icons libraries - NO EMOJIS

import { LucideIcon } from 'lucide-react';
import { IconType } from 'react-icons';
import {
  FaCrown,
  FaStar,
  FaShieldAlt,
  FaRocket,
  FaFire,
  FaGem,
  FaLightbulb,
  FaBolt,
} from 'react-icons/fa';
import {
  SiNintendo,
  SiPlaystation,
  SiXbox,
  SiSteam,
} from 'react-icons/si';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Heart,
  Shield,
  Lock,
  Unlock,
  Clock,
  Package,
  Gift,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export type IconLibrary = 'lucide' | 'fontawesome' | 'siemoji';

// Icon sets for different themes
export const themeIcons = {
  // Premium/Featured indicators
  premium: {
    lucide: Crown,
    fa: FaCrown,
  },
  featured: {
    lucide: Star,
    fa: FaStar,
  },
  
  // Status icons
  security: {
    lucide: ShieldAlert,
    fa: FaShieldAlt,
  },
  exclusive: {
    lucide: Lock,
    fa: FaGem,
  },
  trending: {
    lucide: TrendingUp,
    fa: FaFire,
  },
  
  // Gaming-related
  gaming: {
    lucide: Zap,
    fa: FaBolt,
  },
  boost: {
    lucide: Rocket,
    fa: FaRocket,
  },
  
  // Utility
  sparkle: {
    lucide: Sparkles,
    fa: FaStar,
  },
  award: {
    lucide: Award,
    fa: FaCrown,
  },
  gift: {
    lucide: Gift,
    fa: Gift,
  },
  timer: {
    lucide: Clock,
    fa: Clock,
  },
};

// Get icon based on theme type
export function getThemeIcon(
  iconName: keyof typeof themeIcons,
  library: IconLibrary = 'lucide'
): LucideIcon | IconType | null {
  const icon = themeIcons[iconName] as any;
  if (!icon) return null;

  if (library === 'fa') {
    return icon.fa;
  }
  return icon.lucide;
}

// Badge component with icons
export interface BadgeProps {
  label: string;
  icon?: keyof typeof themeIcons;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

// Status indicator helper
export function getStatusIcon(status: string): React.ReactNode {
  const iconMap: Record<string, LucideIcon> = {
    'active': CheckCircle,
    'inactive': AlertCircle,
    'pending': Clock,
    'locked': Lock,
    'unlocked': Unlock,
  };
  
  return iconMap[status] || null;
}

// Gaming platform icons
export const platformIcons: Record<string, IconType> = {
  nintendo: SiNintendo,
  playstation: SiPlaystation,
  xbox: SiXbox,
  steam: SiSteam,
};
