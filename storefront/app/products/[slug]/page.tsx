import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { DEMO_PRODUCTS } from "@/lib/data/products";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return DEMO_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = DEMO_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | COCO-VANTAGE`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = DEMO_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const formattedPrice = `$${product.price.toFixed(2)}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      {/* 1. Global Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Global Navigation */}
      <Navigation />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <section aria-label="Breadcrumb" className="w-full border-b border-[#E5E5E5] bg-[#F5F5F2]">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
            <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#777777]">
              <Link href="/" className="hover:text-[#111111] transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3 text-[#777777]" />
              <Link href="/shop" className="hover:text-[#111111] transition-colors">
                Shop
              </Link>
              <ChevronRight className="size-3 text-[#777777]" />
              <span className="text-[#111111] font-semibold">{product.name}</span>
            </nav>
          </div>
        </section>

        {/* Product Detail Content */}
        <section className="w-full py-12 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            {/* Back to Shop link */}
            <div className="mb-8">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#111111] transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>Return to The Collection</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Product Image Gallery Placeholder */}
              <div className="relative aspect-square w-full overflow-hidden border border-[#E5E5E5] bg-[#FFFFFF]">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center grayscale"
                />
                <div className="absolute top-4 left-4 bg-[#111111] text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1">
                  {product.category}
                </div>
              </div>

              {/* Product Specifications & Editorial Narrative */}
              <div className="space-y-8">
                <div className="space-y-3 border-b border-[#E5E5E5] pb-8">
                  <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#777777]">
                    {product.tagline}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-tight text-[#111111]">
                    {product.name}
                  </h1>
                  <div className="flex items-baseline gap-4 pt-2">
                    <span className="text-xl font-mono text-[#111111] font-medium">
                      {formattedPrice} {product.currency}
                    </span>
                    <span className="text-xs font-mono text-[#777777] uppercase tracking-wider">
                      · Weight: {product.weight}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xs font-mono uppercase tracking-widest text-[#111111]">
                    Overview
                  </h2>
                  <p className="text-sm text-[#777777] leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Demonstration Specification Alert */}
                <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#111111] font-medium">
                      Demonstration Specification Notice
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-[#F5F5F2] px-2 py-0.5 text-[#777777]">
                      Provisional
                    </span>
                  </div>
                  <p className="text-xs text-[#777777] leading-relaxed">
                    This formulation is an architectural showcase concept. It is not offered for commercial sale, verified charcoal-infused, medical treatment, or certified organic.
                  </p>
                </div>

                {/* Action button */}
                <div className="pt-4">
                  <Link
                    href="/shop"
                    className="inline-block w-full text-center bg-[#111111] text-[#FFFFFF] py-4 text-xs font-mono uppercase tracking-[0.2em] font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Back to The Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
