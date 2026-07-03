import { useRef } from "react";
import NewsCard from "./NewsCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

function NewsScroller({ latestNews }) {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = 300; 
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        /* 1. Added px-16 to create the "gutters" on the left and right */
        <div className="relative w-full px-16">
            
            {/* 2. Absolute positioning stays, but now they sit in the px-16 space */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:shadow-lg hover:border-emerald-500 transition-all"
                aria-label="Scroll left"
            >
                <ChevronLeft className="w-6 h-6 text-emerald-600" />
            </button>

            {/* 3. The card container is now safely inside the gutters */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-8 py-4 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: 'none' }}
            >
                {latestNews.map((news, index) => (
                    <div key={index} className="flex-shrink-0">
                        <NewsCard
                            image={news.image}
                            title={news.title}
                            excerpt={news.excerpt}
                            office={news.office}
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:shadow-lg hover:border-emerald-500 transition-all"
                aria-label="Scroll right"
            >
                <ChevronRight className="w-6 h-6 text-emerald-600" />
            </button>
        </div>
    );
}

export default NewsScroller;