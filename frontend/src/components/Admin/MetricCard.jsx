/**
 * A single clickable dashboard metric card with a warm gradient background
 * and a large bleeding icon in the corner. Used in a grid of 2-4 across
 * the top of admin pages (see Users.jsx for an example).
 *
 * onClick/isActive are optional — omit both for a purely informational,
 * non-interactive card.
 */
export default function MetricCard({
  icon: Icon,
  gradient,
  textColor = "#ffffff",
  subTextColor,
  label,
  value,
  description,
  onClick,
  isActive,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-[24px] p-5 min-h-[132px] overflow-hidden shadow-md border text-left transition-all duration-200 ${
        onClick ? "cursor-pointer" : "cursor-default"
      } ${
        isActive
          ? "border-white ring-4 ring-white/60 scale-[1.02]"
          : "border-white/20 hover:-translate-y-0.5 hover:shadow-lg"
      }`}
      style={{ background: gradient }}
    >
      <Icon
        size={100}
        strokeWidth={1.5}
        style={{ color: textColor }}
        className="absolute -right-3 -bottom-3 opacity-20"
      />
      <div className="relative flex items-center gap-2 mb-2">
        <span className="text-sm font-medium" style={{ color: subTextColor || textColor }}>
          {label}
        </span>
      </div>
      <p className="relative text-2xl font-semibold" style={{ color: textColor }}>
        {value}
      </p>
      <p className="relative text-xs mt-1 leading-snug max-w-[85%]" style={{ color: subTextColor || textColor }}>
        {description}
      </p>
    </button>
  );
}