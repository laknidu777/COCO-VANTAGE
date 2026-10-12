import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, ArrowLeft, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { DEMO_PRODUCTS } from "@/lib/data/products";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProductGallery } from "@/components/products/ProductGallery";
import { AddToCartSection } from "@/components/products/AddToCartSection";
import { RelatedProducts } from "@/components/products/RelatedProducts";

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

// Inner component wrapped in Suspense so URL params read does not de-optimize the instant shell
async function ProductDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = DEMO_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const galleryImages =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];

  return (
    <>
      {/* Breadcrumb Navigation */}
      <section
        aria-label="Breadcrumb"
        className="w-full border-b border-[#E5E5E5] bg-[#F5F5F2]"
      >
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
          <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#777777] overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#111111] transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3 text-[#777777] shrink-0" />
            <Link href="/shop" className="hover:text-[#111111] transition-colors">
              Shop
            </Link>
            <ChevronRight className="size-3 text-[#777777] shrink-0" />
            <span className="text-[#111111] font-semibold truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </section>

      {/* Main Product Showcase Section */}
      <section className="w-full py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#777777] hover:text-[#111111] transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Return to The Collection</span>
            </Link>
          </div>

          {/* Split Layout: Left Image Gallery / Right Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Product Gallery */}
            <div className="lg:col-span-6">
              <ProductGallery
                images={galleryImages}
                productName={product.name}
              />
            </div>

            {/* Right Column: Product Narrative & Controls */}
            <div className="lg:col-span-6 space-y-8">
              {/* Header Information */}
              <div className="space-y-3 border-b border-[#E5E5E5] pb-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-block border border-[#111111] bg-white px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#111111]">
                    {product.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
                    SPEC · {product.weight}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-tight text-[#111111]">
                  {product.name}
                </h1>

                <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#777777]">
                  {product.tagline}
                </p>

                <div className="pt-2">
                  <span className="text-2xl font-mono font-medium text-[#111111]">
                    ${product.price.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-[#777777]">
                      {product.currency}
                    </span>
                  </span>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <h2 className="text-xs font-mono uppercase tracking-widest text-[#111111]">
                  Overview
                </h2>
                <p className="text-sm text-[#777777] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Interactive Add to Cart & Quantity Selector */}
              <AddToCartSection product={product} />

              {/* Available Attributes & Specifications */}
              <div className="border border-[#E5E5E5] bg-white divide-y divide-[#E5E5E5]">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                  <span className="font-mono uppercase tracking-wider text-[#777777]">
                    Origin / Terroir
                  </span>
                  <span className="font-medium text-[#111111]">
                    {product.origin || "Ceylon Single Origin"}
                  </span>
                </div>

                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                  <span className="font-mono uppercase tracking-wider text-[#777777]">
                    Formulation
                  </span>
                  <span className="font-medium text-[#111111] text-right">
                    {product.formulation || "Activated Coconut Charcoal & True Cinnamon"}
                  </span>
                </div>

                {product.sensoryNotes && product.sensoryNotes.length > 0 && (
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-xs">
                    <span className="font-mono uppercase tracking-wider text-[#777777]">
                      Sensory Notes
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      {product.sensoryNotes.map((note) => (
                        <span
                          key={note}
                          className="bg-[#F5F5F2] border border-[#E5E5E5] px-2 py-0.5 text-[10px] font-mono text-[#111111] uppercase"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.suggestedUse && (
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                    <span className="font-mono uppercase tracking-wider text-[#777777] shrink-0">
                      Suggested Use
                    </span>
                    <span className="text-[#777777] sm:text-right">
                      {product.suggestedUse}
                    </span>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="border border-[#E5E5E5] bg-white p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#111111]">
                    <Truck className="size-4" />
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                      Dispatch
                    </span>
                  </div>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    Complimentary tracked dispatch on orders above $50. Global shipping within 2–5 business days.
                  </p>
                </div>

                <div className="border border-[#E5E5E5] bg-white p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#111111]">
                    <RotateCcw className="size-4" />
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                      Returns
                    </span>
                  </div>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    30-day return policy for unopened containers in original protective archival packaging.
                  </p>
                </div>

                <div className="border border-[#E5E5E5] bg-white p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#111111]">
                    <ShieldCheck className="size-4" />
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                      Integrity
                    </span>
                  </div>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    Batch-tested purity standards. Airtight obsidian seals protect botanical volatiles.
                  </p>
                </div>
              </div>

              {/* Demonstration Notice */}
              <div className="border border-[#E5E5E5] bg-[#FFFFFF] p-4 text-[11px] font-mono text-[#777777] leading-relaxed">
                [DEMONSTRATION CONCEPT] · Specifications and prices are provisional prototypes for architectural evaluation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      <RelatedProducts
        currentProductId={product.id}
        category={product.category}
        allProducts={DEMO_PRODUCTS}
      />
    </>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="w-full py-16 animate-pulse">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 space-y-8">
        <div className="h-4 w-48 bg-[#E5E5E5]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 aspect-square bg-[#E5E5E5]" />
          <div className="lg:col-span-6 space-y-6">
            <div className="h-8 w-3/4 bg-[#E5E5E5]" />
            <div className="h-4 w-1/2 bg-[#E5E5E5]" />
            <div className="h-24 w-full bg-[#E5E5E5]" />
            <div className="h-12 w-full bg-[#E5E5E5]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      {/* 1. Global Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Global Navigation */}
      <Navigation />

      <main className="flex-1">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailContent params={params} />
        </Suspense>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
