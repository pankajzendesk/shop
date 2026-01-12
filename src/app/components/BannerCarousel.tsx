'use client';

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface Slide {
  id: string | number;
  title: string;
  subtitle: string;
  image: string;
}

interface BannerCarouselProps {
  initialSlides?: Slide[];
}

const BannerCarousel = ({ initialSlides }: BannerCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const slides = initialSlides || [];

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  if (slides.length === 0) return null;

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative group w-full h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden mb-6">
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full relative h-full">
            <AppImage 
              src={slide.image} 
              alt={slide.title} 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-12 md:px-24">
               <h2 className="text-white text-3xl md:text-5xl font-black mb-2 animate-in fade-in slide-in-from-left duration-700">
                 {slide.title}
               </h2>
               <p className="text-white/90 text-sm md:text-xl font-medium animate-in fade-in slide-in-from-left duration-1000">
                 {slide.subtitle}
               </p>
               <Link 
                href="/product-catalog"
                className="mt-6 w-fit bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-smooth"
               >
                 Shop Now
               </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Icon name="ChevronLeftIcon" size={24} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Icon name="ChevronRightIcon" size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((slide, i) => (
          <button 
            key={slide.id || i}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full transition-all ${current === i ? 'bg-white w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
