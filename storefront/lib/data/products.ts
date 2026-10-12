export type ProductCategory = "Powder" | "Sticks" | "Blends";

export interface DemonstrationProduct {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number; // Numeric price in USD for exact sorting
  currency: string;
  image: string;
  gallery?: string[];
  alt: string;
  featured: boolean;
  weight: string;
  tagline: string;
  isDemonstrationData: boolean;
  origin?: string;
  formulation?: string;
  sensoryNotes?: string[];
  suggestedUse?: string;
}

export const DEMO_PRODUCTS: DemonstrationProduct[] = [
  {
    id: "charcoal-cinnamon-powder",
    slug: "charcoal-cinnamon-powder",
    name: "Charcoal Cinnamon Powder",
    category: "Powder",
    description:
      "Ultra-fine formulation combining high-surface porous coconut carbon with select Ceylon cinnamon.",
    price: 15.99,
    currency: "USD",
    image: "/powder.jpg",
    gallery: ["/powder.jpg", "/hero.jpg", "/process.jpg"],
    alt: "Charcoal Cinnamon Powder in minimalist matte black jar",
    featured: true,
    weight: "120g / 4.2 oz",
    tagline: "Micronized Coconut Carbon · Ceylon Cinnamon",
    isDemonstrationData: true,
    origin: "Ceylon (Sri Lanka) Single-Origin Estate",
    formulation: "100% Micro-Milled Botanical Charcoal & Cinnamomum Verum",
    sensoryNotes: ["Smoky Sweetness", "Warm Woody Undertone", "Velvety Texture"],
    suggestedUse: "Incorporate 1/2 tsp into botanical lattes, morning infusions, or artisanal baked goods.",
  },
  {
    id: "premium-cinnamon-sticks",
    slug: "premium-cinnamon-sticks",
    name: "Premium Cinnamon Sticks",
    category: "Sticks",
    description:
      "Select botanical quills hand-finished for artisanal culinary decoctions and slow aromatic infusions.",
    price: 18.99,
    currency: "USD",
    image: "/sticks.jpg",
    gallery: ["/sticks.jpg", "/process.jpg", "/hero.jpg"],
    alt: "Premium Cinnamon Sticks in monochrome packaging",
    featured: true,
    weight: "100g / 3.5 oz",
    tagline: "Botanical Infusion · Hand-Crafted Quills",
    isDemonstrationData: true,
    origin: "Southern Province Ceylon Foothills",
    formulation: "Grade-Alba Selected Quills infused with Coconut Carbon Essence",
    sensoryNotes: ["Citrus Blossom", "Delicate Pungency", "Subtle Charcoal Oak"],
    suggestedUse: "Steep 1 quill in hot water for 8 minutes or simmer in decoctions for slow flavor extraction.",
  },
  {
    id: "signature-cinnamon-blend",
    slug: "signature-cinnamon-blend",
    name: "Signature Cinnamon Blend",
    category: "Blends",
    description:
      "Our definitive architectural expression balancing single-origin cinnamon bark with micro-porous coconut charcoal.",
    price: 24.99,
    currency: "USD",
    image: "/blend.jpg",
    gallery: ["/blend.jpg", "/hero.jpg", "/powder.jpg"],
    alt: "Signature Cinnamon Blend in tall matte black container",
    featured: true,
    weight: "240g / 8.5 oz",
    tagline: "Architectural Blend · Single Origin",
    isDemonstrationData: true,
    origin: "Colombo Reserve Curated Lot",
    formulation: "Proprietary 50/50 Dual-Origin Cinnamon & Coconut Shell Charcoal",
    sensoryNotes: ["Deep Resin", "Earthy Spice", "Dry Mineral Finish"],
    suggestedUse: "Ideal as a table dusting finishing spice, elixir base, or gourmet beverage garnish.",
  },
  {
    id: "fine-cinnamon-powder",
    slug: "fine-cinnamon-powder",
    name: "Fine Cinnamon Powder",
    category: "Powder",
    description:
      "Subtle micro-milled cinnamon powder offering delicate aromatic clarity with refined botanical undertones.",
    price: 12.99,
    currency: "USD",
    image: "/powder.jpg",
    gallery: ["/powder.jpg", "/process.jpg"],
    alt: "Fine Cinnamon Powder in matte packaging",
    featured: false,
    weight: "100g / 3.5 oz",
    tagline: "Micro-Milled · Pure Botanical Profile",
    isDemonstrationData: true,
    origin: "Ratnapura Valley Estates",
    formulation: "Ultra-Fine Micron Powder (Mesh 120)",
    sensoryNotes: ["Bright Cinnamon Sweetness", "Mild Floral Nuance"],
    suggestedUse: "Dust over foams, smoothies, or blend into artisanal dark chocolate.",
  },
  {
    id: "whole-cinnamon-sticks",
    slug: "whole-cinnamon-sticks",
    name: "Whole Cinnamon Sticks",
    category: "Sticks",
    description:
      "Full-length dense cinnamon quills aged and curated for gradual flavor release and visual elegance.",
    price: 16.99,
    currency: "USD",
    image: "/sticks.jpg",
    gallery: ["/sticks.jpg", "/hero.jpg"],
    alt: "Whole Cinnamon Sticks bundle with minimalist branding",
    featured: false,
    weight: "120g / 4.2 oz",
    tagline: "Aged Bark · Pure Density",
    isDemonstrationData: true,
    origin: "Central Highlands Forestry",
    formulation: "Full-Length 6-inch Hand-Rolled Cinnamon Quills",
    sensoryNotes: ["Rich Bark Tannin", "Long-Lasting Warmth", "Subtle Peppery Accent"],
    suggestedUse: "Simmer in spiced ciders, mulled botanicals, or use as an artisanal cocktail stirrer.",
  },
  {
    id: "everyday-cinnamon-blend",
    slug: "everyday-cinnamon-blend",
    name: "Everyday Cinnamon Blend",
    category: "Blends",
    description:
      "A balanced everyday formula calibrated for morning rituals, coffee pairings, and gentle decoctions.",
    price: 14.99,
    currency: "USD",
    image: "/blend.jpg",
    gallery: ["/blend.jpg", "/powder.jpg"],
    alt: "Everyday Cinnamon Blend in black minimalist jar",
    featured: false,
    weight: "180g / 6.3 oz",
    tagline: "Balanced Profile · Daily Formulation",
    isDemonstrationData: true,
    origin: "Coastal Plantation Select",
    formulation: "Smooth Grain Cinnamon Blend calibrated for daily culinary application",
    sensoryNotes: ["Mellow Sweet Spice", "Warm Caramelized Notes"],
    suggestedUse: "Pairs naturally with specialty pour-over coffee, warm oat porridge, or yogurt.",
  },
  {
    id: "reserve-cinnamon-powder",
    slug: "reserve-cinnamon-powder",
    name: "Reserve Cinnamon Powder",
    category: "Powder",
    description:
      "Limited small-batch harvested cinnamon ground with meticulous temperature control to preserve essential volatiles.",
    price: 22.99,
    currency: "USD",
    image: "/powder.jpg",
    gallery: ["/powder.jpg", "/hero.jpg", "/process.jpg"],
    alt: "Reserve Cinnamon Powder luxury vessel",
    featured: true,
    weight: "90g / 3.2 oz",
    tagline: "Limited Harvest · Cold Milled",
    isDemonstrationData: true,
    origin: "Highland Monsoon Harvest Lot #04",
    formulation: "Cryogenically Cold-Milled Single-Clonal Ceylon Cinnamon",
    sensoryNotes: ["Intense Volatile Aromatics", "Crisp Cinnamic Note", "Silky Smoke Finish"],
    suggestedUse: "Savor a pinch in meditative teas or culinary masteries requiring nuanced aromatics.",
  },
  {
    id: "select-cinnamon-blend",
    slug: "select-cinnamon-blend",
    name: "Select Cinnamon Blend",
    category: "Blends",
    description:
      "A nuanced pairing of highland bark and subtle carbon notes designed for culinary depth and complex warmth.",
    price: 19.99,
    currency: "USD",
    image: "/blend.jpg",
    gallery: ["/blend.jpg", "/sticks.jpg"],
    alt: "Select Cinnamon Blend container in studio lighting",
    featured: false,
    weight: "200g / 7.0 oz",
    tagline: "Highland Bark · Complex Profile",
    isDemonstrationData: true,
    origin: "Southern Maritime Hills",
    formulation: "Curated Bark Selection combined with high-grade carbonized botanical ash",
    sensoryNotes: ["Complex Spice", "Subtle Pungent Sweetness", "Clean Mineral Tail"],
    suggestedUse: "Craft cocktails, gourmet dry rubs, and elevated pastry crusts.",
  },
];

export const CATEGORIES: Array<"All Products" | ProductCategory> = [
  "All Products",
  "Powder",
  "Sticks",
  "Blends",
];

export type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export interface SortOptionConfig {
  value: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortOptionConfig[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];
