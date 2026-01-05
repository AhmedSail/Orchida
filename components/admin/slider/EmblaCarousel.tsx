"use client";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import Image from "next/image";

const slides = [
  "/home/orchidaMarketing.jpeg",
  "/home/orchidaMarketing.jpeg",
  "/home/orchidaMarketing.jpeg",
  "/home/orchidaMarketing.jpeg",
  "/home/orchidaMarketing.jpeg",
];

export function EmblaCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" }, [
    ClassNames(),
  ]);

  return (
    <div className="overflow-hidden w-full max-w-5xl mx-auto" ref={emblaRef}>
      <div className="flex">
        {slides.map((src, index) => (
          <div
            key={index}
            className="embla__slide flex-[0_0_20%] min-w-0 px-2 transition-all duration-500"
          >
            <Image
              src={src}
              alt={`slide-${index}`}
              width={400}
              height={300}
              className="w-full h-64 object-cover rounded-lg"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
