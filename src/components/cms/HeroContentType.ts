export interface HeroStat {
  value: number;
  suffix: string;
  label: string;
}

export interface HeroCta {
  label: string;
  link: string;
}

export interface HeroContent {
  headline: string;
  highlightWord: string;
  subtitle: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  stats: HeroStat[];
  heroSize: 'small' | 'default';
}

export const defaultHeroContent: HeroContent = {
  headline: 'Make It',
  highlightWord: 'Yours',
  subtitle: "Discover luxury living with Source Egypt's curated collection of premium properties",
  primaryCta: { label: 'Explore Properties', link: '/properties' },
  secondaryCta: { label: 'Find your property', link: '/find-property' },
  stats: [
    { value: 500, suffix: '+', label: 'Properties' },
    { value: 2421, suffix: '+', label: 'Happy Clients' },
    { value: 13, suffix: '+', label: 'Years Experience' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate' },
  ],
  heroSize: 'default',
};
