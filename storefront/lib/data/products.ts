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
  alt: string;
  featured: boolean;
  weight: string;
  tagline: string;
  isDemonstrationData: boolean;
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
    alt: "Charcoal Cinnamon Powder in minimalist matte black jar",
    featured: true,
    weight: "120g / 4.2 oz",
    tagline: "Micronized Coconut Carbon · Ceylon Cinnamon",
    isDemonstrationData: true,
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
    alt: "Premium Cinnamon Sticks in monochrome packaging",
    featured: true,
    weight: "100g / 3.5 oz",
    tagline: "Botanical Infusion · Hand-Crafted Quills",
    isDemonstrationData: true,
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
    alt: "Signature Cinnamon Blend in tall matte black container",
    featured: true,
    weight: "240g / 8.5 oz",
    tagline: "Architectural Blend · Single Origin",
    isDemonstrationData: true,
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
    alt: "Fine Cinnamon Powder in matte packaging",
    featured: false,
    weight: "100g / 3.5 oz",
    tagline: "Micro-Milled · Pure Botanical Profile",
    isDemonstrationData: true,
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
    alt: "Whole Cinnamon Sticks bundle with minimalist branding",
    featured: false,
    weight: "120g / 4.2 oz",
    tagline: "Aged Bark · Pure Density",
    isDemonstrationData: true,
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
    alt: "Everyday Cinnamon Blend in black minimalist jar",
    featured: false,
    weight: "180g / 6.3 oz",
    tagline: "Balanced Profile · Daily Formulation",
    isDemonstrationData: true,
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
    alt: "Reserve Cinnamon Powder luxury vessel",
    featured: true,
    weight: "90g / 3.2 oz",
    tagline: "Limited Harvest · Cold Milled",
    isDemonstrationData: true,
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
    alt: "Select Cinnamon Blend container in studio lighting",
    featured: false,
    weight: "200g / 7.0 oz",
    tagline: "Highland Bark · Complex Profile",
    isDemonstrationData: true,
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
