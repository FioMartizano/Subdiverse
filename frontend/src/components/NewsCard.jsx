// components/NewsCard.jsx
function NewsCard({ image, title, excerpt, office }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer w-60">
            {/* Photo */}
            <div className="w-full h-40 overflow-hidden  bg-gray-100 flex items-center justify-center">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-gray-400 text-sm">No image available</span>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-1">
                <h3 className="text-secondary font-bold text-lg leading-snug line-clamp-2">
                    {title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                    {excerpt}
                </p>
                <p className="text-primary font-semibold text-xs mt-2">
                    {office}
                </p>
            </div>
        </div>
    );
}

export default NewsCard;