export interface Theme {
  tenantDomain: string;
  branding: {
    name: string;
    primaryColor: string;
    primaryContrastColor: string;
    secondaryColor: string;
    secondaryContrastColor: string;
    logoUrl: string | null;
    faviconUrl: string | null;
  };
  content: {
    links: { label: string; url: string }[];
    footer: string | null;
    onboardingUrl: string | null;
    supportUrl: string | null;
    walletUrl: string | null;
  };
  i18n: {
    defaultLang: string;
    available: string[];
  };
}
