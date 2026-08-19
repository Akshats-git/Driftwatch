export interface Vendor {
  id: string;
  name: string;
  docsRootUrl: string;
  changelogUrl: string;
  /** Bright Data Collector IDs scraping this vendor. Filled in during Phase 1. */
  collectorIds: string[];
}

export const vendors: Vendor[] = [
  {
    id: "clerk",
    name: "Clerk",
    docsRootUrl: "https://clerk.com/docs",
    changelogUrl: "https://clerk.com/changelog",
    collectorIds: [],
  },
  {
    id: "resend",
    name: "Resend",
    docsRootUrl: "https://resend.com/docs",
    changelogUrl: "https://resend.com/changelog",
    collectorIds: [],
  },
  {
    id: "supabase",
    name: "Supabase",
    docsRootUrl: "https://supabase.com/docs",
    changelogUrl: "https://supabase.com/changelog",
    collectorIds: [],
  },
  {
    id: "planetscale",
    name: "PlanetScale",
    docsRootUrl: "https://planetscale.com/docs",
    changelogUrl: "https://planetscale.com/changelog",
    collectorIds: [],
  },
  {
    id: "upstash",
    name: "Upstash",
    docsRootUrl: "https://upstash.com/docs",
    // Upstash moved their product roadmap/changelog off their own domain and onto GitHub.
    changelogUrl: "https://github.com/upstash/product-roadmap",
    collectorIds: [],
  },
  {
    id: "neon",
    name: "Neon",
    docsRootUrl: "https://neon.tech/docs",
    changelogUrl: "https://neon.tech/docs/changelog",
    collectorIds: [],
  },
  {
    id: "trigger-dev",
    name: "Trigger.dev",
    docsRootUrl: "https://trigger.dev/docs",
    changelogUrl: "https://trigger.dev/changelog",
    collectorIds: [],
  },
  {
    id: "better-auth",
    name: "Better Auth",
    docsRootUrl: "https://better-auth.com/docs",
    changelogUrl: "https://better-auth.com/changelog",
    collectorIds: [],
  },
];
