"use client";

import { memo } from "react";
import { useVirtualization } from "@/hooks/useVirtualization";

const VirtualizedList = memo(({
  items,
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  className = "",
}) => {
  const { visibleItems, handleScroll } = useVirtualization(
    items,
    itemHeight,
    containerHeight
  );

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${visibleItems.offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.items.map((item, index) =>
            renderItem(item, visibleItems.startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedList;