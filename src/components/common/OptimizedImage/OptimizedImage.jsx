"use client";

import Image from "next/image";
import { useState } from "react";

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      {!error ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={`transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          {...props}
        />
      ) : (
        <div className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;