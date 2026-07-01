import { useRef } from "react";
import NewsCard from "./NewsCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

function NewsScroller({ latestNews }) {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const cardWidth = 260; // roughly card width + gap, adjust to match your NewsCard width
        scrollRef.current.scrollBy({
            left: direction === "left" ? -cardWidth : cardWidth,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative lg:col-span-3 w-full">
            {/* Left button */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-sm hover:bg-gray-100 transition-all duration-200"
                aria-label="Scroll left"
            >
                <ChevronLeft className="w-5 h-5 text-primary" />
            </button>

            {/* Scrollable row */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-20 px-12 pb-4 min-w-0 scroll-hide scroll-smooth"
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

            {/* Right button */}
            <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-sm hover:bg-gray-100 transition-all duration-200"
                aria-label="Scroll right"
            >
                <ChevronRight className="w-5 h-5 text-primary" />
            </button>
        </div>
    );
}

export default NewsScroller;