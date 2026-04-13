export type Department =
  | "creative-copy-art"
  | "creative-design"
  | "account-management"
  | "strategy"
  | "tech-ux";

export interface DisciplineConfig {
  professionalBreadth: {
    description: string;
  };
  campaignExamples: {
    label: string;
    hint: string;
    placeholder: string;
  };
  aestheticsSensibility: {
    sliderLabel: string;
    low: string;
    high: string;
    tiers: { high: string; mid: string; low: string };
  };
  aestheticsProcess: {
    title: string;
    hint: string;
    placeholder: string;
  };
  nonWorkObsessions: {
    hint: string;
    placeholder: string;
  };
  industryMotivation: {
    hint: string;
  };
}

const configs: Record<Department, DisciplineConfig> = {
  "creative-copy-art": {
    professionalBreadth: {
      description:
        "A copywriter curious about art direction, typography, strategy, or production",
    },
    campaignExamples: {
      label: "Campaigns or creative work they find inspirational",
      hint: "Campaigns they admire — Amul, Fevicol, Swiggy, Apple, Nike, Spotify Wrapped, etc.",
      placeholder:
        "E.g., 'Amul topicals', 'Swiggy's voice of hunger', 'Apple's Shot on iPhone', 'Spotify Wrapped'...",
    },
    aestheticsSensibility: {
      sliderLabel: "Aesthetic sensibility",
      low: '"I don\'t really think about design"',
      high: '"Beauty matters deeply to me"',
      tiers: {
        high: "Design sensibility detected!",
        mid: "Appreciates good design",
        low: "Functional mindset",
      },
    },
    aestheticsProcess: {
      title: "Process of Design / Creation",
      hint: "Did they show curiosity about how things are designed or created? Note any examples shared.",
      placeholder:
        "E.g., Asked about our design process, mentioned enjoying craftsmanship, shared a creative hobby...",
    },
    nonWorkObsessions: {
      hint: "Deep rabbit holes, cultural diet — pottery, Carnatic music, architecture docs, Murakami, retro gaming...",
      placeholder:
        "e.g., 18th Century Pottery, Carnatic Music, architecture documentaries, reads Murakami, runs a pottery Instagram...",
    },
    industryMotivation: {
      hint: "What drew them here — passion for storytelling, craft, or creative impact?",
    },
  },

  "creative-design": {
    professionalBreadth: {
      description:
        "A designer who digs into copy, strategy, motion, or production workflows",
    },
    campaignExamples: {
      label: "Campaigns or creative work they find inspirational",
      hint: "Campaigns they admire — Amul, Fevicol, Swiggy, Apple, Nike, Spotify Wrapped, etc.",
      placeholder:
        "E.g., 'Amul topicals', 'Swiggy's voice of hunger', 'Apple's Shot on iPhone', 'Spotify Wrapped'...",
    },
    aestheticsSensibility: {
      sliderLabel: "Aesthetic sensibility",
      low: '"I don\'t really think about design"',
      high: '"Beauty matters deeply to me"',
      tiers: {
        high: "Design sensibility detected!",
        mid: "Appreciates good design",
        low: "Functional mindset",
      },
    },
    aestheticsProcess: {
      title: "Process of Design / Creation",
      hint: "Did they show curiosity about how things are designed or created? Note any examples shared.",
      placeholder:
        "E.g., Asked about our design process, mentioned enjoying craftsmanship, shared a creative hobby...",
    },
    nonWorkObsessions: {
      hint: "Deep rabbit holes, cultural diet — pottery, Carnatic music, architecture docs, Murakami, retro gaming...",
      placeholder:
        "e.g., 18th Century Pottery, Carnatic Music, architecture documentaries, reads Murakami, runs a pottery Instagram...",
    },
    industryMotivation: {
      hint: "What drew them here — passion for storytelling, craft, or creative impact?",
    },
  },

  "account-management": {
    professionalBreadth: {
      description:
        "A servicing person interested in creative craft, strategy, media planning, or production",
    },
    campaignExamples: {
      label: "Campaigns or creative work they find inspirational",
      hint: "Campaigns they admire — Amul, Fevicol, Swiggy, Apple, Nike, Spotify Wrapped, etc.",
      placeholder:
        "E.g., 'Amul topicals', 'Swiggy's voice of hunger', 'Apple's Shot on iPhone', 'Spotify Wrapped'...",
    },
    aestheticsSensibility: {
      sliderLabel: "Eye for Craft",
      low: "Doesn't notice design choices",
      high: "Spots craft in everything",
      tiers: {
        high: "Sharp eye for craft!",
        mid: "Notices good work",
        low: "Functional mindset",
      },
    },
    aestheticsProcess: {
      title: "Curiosity About How Things Get Made",
      hint: "Did they ask about production, craft, or creative process?",
      placeholder:
        "E.g., Asked how a campaign was produced, curious about the print process, interested in how teams collaborate...",
    },
    nonWorkObsessions: {
      hint: "Deep rabbit holes, cultural diet — pottery, Carnatic music, architecture docs, Murakami, retro gaming...",
      placeholder:
        "e.g., 18th Century Pottery, Carnatic Music, architecture documentaries, reads Murakami, runs a pottery Instagram...",
    },
    industryMotivation: {
      hint: "What drew them here — love for client relationships, orchestrating great work, or problem-solving?",
    },
  },

  strategy: {
    professionalBreadth: {
      description:
        "A strategist curious about creative execution, media, data, or cultural trends",
    },
    campaignExamples: {
      label: "Campaigns, brand strategies, or business moves they admire",
      hint: "Jio's pricing disruption, Zomato's tone of voice, Nike's Colin Kaepernick bet, D2C brands that punched above their weight",
      placeholder:
        "E.g., 'Jio's pricing play', 'Zomato's brand voice', 'Nike's Kaepernick campaign', 'Boat's D2C playbook'...",
    },
    aestheticsSensibility: {
      sliderLabel: "Cultural & Visual Antenna",
      low: "Rarely notices design or aesthetics",
      high: "Attuned to visual culture and trends",
      tiers: {
        high: "Culturally attuned!",
        mid: "Picks up on trends",
        low: "Strategy-first mindset",
      },
    },
    aestheticsProcess: {
      title: "Curiosity About Strategic Frameworks",
      hint: "Did they discuss how they build strategies, models, or frameworks?",
      placeholder:
        "E.g., Walked through their planning process, referenced strategic frameworks, discussed how they synthesise insights...",
    },
    nonWorkObsessions: {
      hint: "Deep rabbit holes — behavioural economics, geopolitics, podcasts, documentary filmmaking, history, Substack essays...",
      placeholder:
        "e.g., Behavioural economics, geopolitics, documentary filmmaking, reads Substack obsessively, history buff...",
    },
    industryMotivation: {
      hint: "What drew them here — passion for understanding people, brands, or culture?",
    },
  },

  "tech-ux": {
    professionalBreadth: {
      description:
        "A developer or UX designer interested in product strategy, design systems, AI tooling, or data pipelines",
    },
    campaignExamples: {
      label:
        "Apps, websites, AI tools, or digital products they find inspirational",
      hint: "Notion's UX, Linear's speed, Figma's multiplayer, Cursor's AI-native IDE, Vercel's DX, Zerodha's simplicity",
      placeholder:
        "E.g., 'Notion's information architecture', 'Linear's speed obsession', 'Cursor's AI flows', 'Figma's multiplayer'...",
    },
    aestheticsSensibility: {
      sliderLabel: "UI/UX & Interaction Sensibility",
      low: "Ships it if it works",
      high: "Obsesses over every pixel and micro-interaction",
      tiers: {
        high: "Design-obsessed builder!",
        mid: "Cares about polish",
        low: "Function-first mindset",
      },
    },
    aestheticsProcess: {
      title: "Design & Product Craft Process",
      hint: "Did they geek out about design systems, prototyping workflows, interaction patterns, AI-assisted design, or how they bridge design and engineering?",
      placeholder:
        "E.g., Talked about their design system approach, prototyping in Figma, using AI for design iterations, bridging design-dev handoff...",
    },
    nonWorkObsessions: {
      hint: "Deep rabbit holes — open-source projects, AI paper reading groups, mechanical keyboards, home automation, side-project shipping, sci-fi, retro gaming...",
      placeholder:
        "e.g., Open-source contributor, AI paper reading group, mechanical keyboard enthusiast, home automation projects, ships side projects...",
    },
    industryMotivation: {
      hint: "What drew them here — love for building products, AI-native experiences, engineering elegance, or shaping how people interact with technology?",
    },
  },
};

const defaultDepartment: Department = "creative-copy-art";

export function getDisciplineConfig(department?: string): DisciplineConfig {
  if (!department) return configs[defaultDepartment];
  return configs[department as Department] ?? configs[defaultDepartment];
}
