'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoverImagePreviewProps {
  coverUrl: string | undefined;
  title: string;
  onClear?: () => void;
  className?: string;
}

export function CoverImagePreview({ coverUrl, title, onClear, className = '' }: CoverImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!coverUrl) return null;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Loading skeleton */}
      {loading && !error && (
        <div className="w-full max-w-[300px] h-[400px] bg-foreground/10 rounded-lg animate-pulse" />
      )}

      {/* Error state */}
      {error && (
        <div className="w-full max-w-[300px] h-[400px] border border-foreground/20 rounded-lg flex flex-col items-center justify-center gap-3 bg-foreground/5">
          <ImageOff className="w-12 h-12 text-foreground/40" />
          <p className="text-sm text-foreground/60">Cover not found</p>
        </div>
      )}

      {/* Image */}
      {!error && (
        <div className="relative w-full max-w-[300px] h-auto">
          <Image
            src={coverUrl}
            alt={`Cover of ${title}`}
            width={300}
            height={400}
            className={`rounded-lg border border-foreground/20 object-cover transition-opacity duration-300 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        </div>
      )}

      {/* Clear button */}
      {onClear && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-background/90 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
