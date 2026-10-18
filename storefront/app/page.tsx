import { Suspense } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { BrandStatement } from "@/components/brand-statement";
import {
  FeaturedCollection,
  FeaturedCollectionSkeleton,
} from "@/components/featured-collection";
import { ProcessSection } from "@/components/process-section";
import { ClosingCta } from "@/components/closing-cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      {/* 1. Announcement bar */}
      <AnnouncementBar />

      {/* 2. Main navigation */}
      <Navigation />

      <main className="flex-1">
        {/* 3. Hero section */}
        <Hero />

        {/* 4. Brand statement */}
        <BrandStatement />

        {/* 5. Featured collection */}
        <Suspense fallback={<FeaturedCollectionSkeleton />}>
          <FeaturedCollection />
        </Suspense>

        {/* 6. Process section */}
        <ProcessSection />

        {/* 7. Brand image / closing CTA */}
        <ClosingCta />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
