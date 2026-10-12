export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  image: string;
  weight: string;
  alt: string;
  isDemonstrationData: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "charcoal-cinnamon-powder",
    name: "Charcoal Cinnamon Powder",
    tagline: "Micronized Coconut Carbon · Ceylon Cinnamon",
    description: "Ultra-fine cosmetic and culinary grade formulation combining high-surface porous charcoal with true cinnamon.",
    price: "$38.00",
    weight: "120g / 4.2 oz",
    image: "/powder.jpg",
    alt: "COCO-VANTAGE Charcoal Cinnamon Powder in matte black jar on stone",
    isDemonstrationData: true,
  },
  {
    id: "charcoal-cinnamon-sticks",
    name: "Charcoal Cinnamon Sticks",
    tagline: "Hand-Crafted · Botanical Infusion",
    description: "Select Ceylon quills prepared with purified botanical carbon, created for artisanal infusions and slow decoctions.",
    price: "$44.00",
    weight: "100g / 3.5 oz",
    image: "/sticks.jpg",
    alt: "COCO-VANTAGE Charcoal Cinnamon Sticks beside monochrome box package",
    isDemonstrationData: true,
  },
  {
    id: "signature-cinnamon-blend",
    name: "Signature Cinnamon Blend",
    tagline: "Architectural Blend · Single Origin",
    description: "Our definitive expression balancing single-origin cinnamon bark with micro-porous coconut charcoal essence.",
    price: "$52.00",
    weight: "240g / 8.5 oz",
    image: "/blend.jpg",
    alt: "COCO-VANTAGE Signature Cinnamon Blend tall matte black container",
    isDemonstrationData: true,
  },
];
