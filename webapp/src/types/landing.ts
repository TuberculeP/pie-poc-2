// Types and Interfaces for Landing Page

export interface HeroStat {
  value: string;
  raw?: number;
  suffix?: string;
  label: string;
}

export interface Feature {
  icon: any;
  title: string;
  description: string;
  color: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  visual?: string;
}

export interface PricingPlan {
  name: string;
  price: number | string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export interface TrustAvatar {
  id: string;
  url: string;
  alt: string;
}

export interface MockupTrack {
  name: string;
  color: string;
  blocks: Array<{ start: number; width: number }>;
}

export interface NavLink {
  name: string;
  href: string;
}

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
}
