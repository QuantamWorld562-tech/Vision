import { useRef, useState, useEffect } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { VideoData } from "../types";
import { VideoCard } from "./Feed";

interface VirtualizedVideoGridProps {
  videos: VideoData[];
}

function useGridColumns(): number {
  const [columns, setColumns] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    const w = window.innerWidth;
    if (w >= 1280) return 4;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      let cols = 1;
      if (w >= 1280) cols = 4;
      else if (w >= 1024) cols = 3;
      else if (w >= 640) cols = 2;
      setColumns((prev) => (prev !== cols ? cols : prev));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columns;
}

export default function VirtualizedVideoGrid({ videos }: VirtualizedVideoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState<number>(0);
  const columns = useGridColumns();

  useEffect(() => {
    const updateScrollMargin = () => {
      if (containerRef.current) {
        setScrollMargin(containerRef.current.offsetTop);
      }
    };
    updateScrollMargin();
    window.addEventListener("resize", updateScrollMargin);
    return () => window.removeEventListener("resize", updateScrollMargin);
  }, []);

  const rowCount = Math.ceil(videos.length / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 320,
    overscan: 2,
    gap: 24,
    scrollMargin,
  });

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="w-full relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowVideos = videos.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute top-0 left-0 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              style={{
                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
              }}
            >
              {rowVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
