import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ImageSlider({ imageUrls, alt }: { imageUrls: string[], alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const mediaList = imageUrls;

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
        Kein Bild vorhanden
      </div>
    );
  }

  const renderMedia = (media: string, isThumbnail = false) => {
    return (
      <img 
        key={media}
        src={media} 
        alt={alt} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    );
  };

  if (mediaList.length === 1) {
    return renderMedia(mediaList[0]);
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-full group">
      {renderMedia(mediaList[currentIndex])}
      
      <button 
        onClick={handlePrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-stone-800 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Vorheriges Bild"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-stone-800 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Nächstes Bild"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
        {mediaList.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
