"use client";

import { memo } from "react";

const Skeleton = memo(({ 
  width = "100%", 
  height = "20px", 
  className = "",
  variant = "rectangular" 
}) => {
  const baseClasses = "animate-pulse bg-gray-200";
  const variantClasses = {
    rectangular: "rounded",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
      aria-label="Loading content"
    />
  );
});

Skeleton.displayName = 'Skeleton';

export const SkeletonCard = memo(() => (
  <div className="p-4 border rounded-lg space-y-3">
    <Skeleton height="24px" width="60%" />
    <Skeleton height="16px" width="100%" />
    <Skeleton height="16px" width="80%" />
    <div className="flex space-x-2">
      <Skeleton height="32px" width="80px" />
      <Skeleton height="32px" width="80px" />
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonTable = memo(({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    {/* Header */}
    <div className="flex space-x-4 p-4 bg-gray-50 rounded">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height="20px" width="100px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 p-4 border-b">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} height="16px" width="80px" />
        ))}
      </div>
    ))}
  </div>
));

SkeletonTable.displayName = 'SkeletonTable';

export default Skeleton;