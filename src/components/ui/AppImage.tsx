'use client';

import React, { useState, useEffect } from 'react';

interface AppImageProps {
  src: string;
  alt: string | null;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  onClick?: () => void;
  fallbackSrc?: string;
  errorFallback?: React.ReactNode;
  style?: React.CSSProperties;
  [key: string]: any;
}

const AppImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  onClick,
  fallbackSrc = '/assets/images/no_image.svg',
  errorFallback,
  style,
  ...props
}: AppImageProps) => {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (imageSrc !== fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
    }
  };

  const imgStyle: React.CSSProperties = {
    objectFit: fill ? 'cover' : 'contain',
    ...(fill ? { width: '100%', height: '100%', position: 'absolute', inset: 0 } : { width, height }),
    ...style,
  };

  if (hasError && errorFallback) {
    return <>{errorFallback}</>;
  }

  return (
    <img
      src={imageSrc}
      alt={alt || ''}
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={imgStyle}
      onError={handleError}
      onClick={onClick}
      {...props}
    />
  );
};

export default AppImage;
