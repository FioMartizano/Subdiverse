// components/NewsCard.jsx
function NewsCard({ image, title, excerpt, office }) {
    return (
        // Changed w-60 to min-w-[280px] to ensure cards don't shrink too much
        <div className="flex-shrink-0 w-[280px] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="w-full h-48 overflow-hidden bg-gray-100">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
            </div>

            <div className="p-5 flex flex-col gap-2">
                <h3 className="text-neutral-900 font-bold text-lg leading-snug line-clamp-2">
                    {title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {excerpt}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                        {office}
                    </p>
                </div>
            </div>
        </div>
    );
}
export default NewsCard;