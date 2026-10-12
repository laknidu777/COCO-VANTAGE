"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImage = images[activeImageIndex] || images[0] || "/powder.jpg";

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Product Image */}
      <div className="relative aspect-square w-full overflow-hidden border border-[#E5E5E5] bg-[#FFFFFF] transition-all">
        <Image
          src={activeImage}
          alt={`${productName} - View ${activeImageIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center grayscale contrast-105 transition-all duration-500"
        />
        <div className="absolute top-4 left-4 bg-[#111111] text-white text-[9px] font-mono uppercase tracking-widest px-2.5 py-1">
          FIG. 0{activeImageIndex + 1} / ARCHIVE SPEC
        </div>
      </div>

      {/* Thumbnail Bar if multiple images */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => {
            const isSelected = idx === activeImageIndex;
            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View image ${idx + 1} of ${productName}`}
                className={`relative aspect-square w-20 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#111111] ring-1 ring-[#111111] opacity-100"
                    : "border-[#E5E5E5] opacity-60 hover:opacity-100 hover:border-[#777777]"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center grayscale"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
