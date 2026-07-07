export default function TimeSlotStep({
  slots,
  selectedSlotIds,
  bookedSlotIds,
  onToggleSlot,
  allowMultiple,
  requireContiguous,
  error,
  dateLabel,
  duration,
  total,
  onBack,
  onContinue,
}) {
  const isSlotBooked = (id) => bookedSlotIds.includes(id);

  return (
    <div className="bg-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Available slots</h2>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
        </div>
      </div>

      {requireContiguous && allowMultiple && (
        <p className="text-sm text-secondary bg-accent p-3 rounded-[var(--radius-cards)] mb-6">
          Please select consecutive time slots only.
        </p>
      )}

      {/* Grid of Slot Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {slots.map((slot) => {
          const booked = isSlotBooked(slot.id);
          const selected = selectedSlotIds.includes(slot.id);

          return (
            <button
              key={slot.id}
              disabled={booked}
              onClick={() => onToggleSlot(slot.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-[var(--radius-cards)] border-2 transition-all duration-200 
                ${booked
                  ? "bg-muted border-transparent text-muted-foreground cursor-not-allowed opacity-60"
                  : selected
                    ? "bg-primary border-primary text-white shadow-lg"
                    : "bg-card border-border hover:border-primary text-foreground"
                }`}
            >
              <span className="font-semibold text-sm">{slot.label}</span>
              {slot.lit && !booked && (
                <span className="text-[10px] mt-1 opacity-70">💡 Lighting</span>
              )}
              {booked && <span className="text-[10px] font-bold uppercase mt-1">Booked</span>}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-6 font-medium" role="alert">{error}</p>
      )}

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between bg-accent rounded-[var(--radius-cards)] px-6 py-4 mb-8">
        <span className="text-sm font-semibold text-muted-foreground">
          {duration > 0 ? `${duration} hr${duration > 1 ? "s" : ""} selected` : "No hours selected"}
        </span>
        <span className="font-heading text-xl font-bold text-primary">
          ₱{total.toLocaleString()}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <button 
          className="text-muted-foreground font-medium hover:text-secondary transition" 
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={duration === 0}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}