/**
 * Step: review summary and confirm/submit.
 *
 * Props:
 * - venueName, dateLabel, timeRangeLabel, duration, rate, residentType, total: display values
 * - note: string
 * - onNoteChange: (value: string) => void
 * - error: string
 * - submitting: boolean
 * - confirmButtonLabel: string
 * - onBack: () => void
 * - onSubmit: () => void
 * - customFields: array of custom field configurations (NEW)
 * - customFieldValues: object with custom field values (NEW)
 * - onCustomFieldChange: (id, value) => void (NEW)
 */
export default function ConfirmStep({
  venueName,
  dateLabel,
  timeRangeLabel,
  duration,
  rate,
  residentType,
  total,
  note,
  onNoteChange,
  error,
  submitting,
  confirmButtonLabel = "Confirm Reservation",
  onBack,
  onSubmit,
  customFields = [], // NEW
  customFieldValues = {}, // NEW
  onCustomFieldChange, // NEW
}) {
  return (
    <div className="rounded-cards border border-border p-6">
      <h2 className="font-heading text-lg font-semibold mb-4">Reservation summary</h2>
      <dl className="space-y-2 text-sm mb-4">
        <Row label="Venue" value={venueName} />
        <Row label="Date" value={dateLabel} />
        <Row label="Time" value={timeRangeLabel} />
        <Row label="Duration" value={`${duration} hour${duration > 1 ? "s" : ""}`} />
        <Row label="Rate" value={`₱${rate}/hr (${residentType === "renter" ? "Renter" : "Homeowner"})`} />
      </dl>

      {/* NEW: Custom Fields Section */}
      {customFields.length > 0 && (
        <div className="space-y-4 mb-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">Additional Details</h3>
          {customFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium mb-1" htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === "select" ? (
                <select
                  id={field.id}
                  value={customFieldValues[field.id] || ""}
                  onChange={(e) => onCustomFieldChange(field.id, e.target.value)}
                  className="w-full border border-border rounded-buttons px-3 py-2 text-sm mb-1"
                  required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.id}
                  type={field.type || "text"}
                  value={customFieldValues[field.id] || ""}
                  onChange={(e) => onCustomFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder || `Enter ${field.label}`}
                  className="w-full border border-border rounded-buttons px-3 py-2 text-sm mb-1"
                  required={field.required}
                />
              )}
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <label className="block text-sm font-medium mb-1" htmlFor="note">
        Note (optional)
      </label>
      <textarea
        id="note"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="e.g. team practice"
        className="w-full border border-border rounded-buttons px-3 py-2 text-sm mb-4 resize-none"
        rows={2}
      />

      <div className="flex items-center justify-between bg-accent rounded-buttons px-4 py-3 mb-6">
        <span className="text-sm font-medium">Total</span>
        <span className="font-heading text-lg font-semibold text-primary">
          ₱{total.toLocaleString()}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-between">
        <button
          className="text-muted-foreground text-sm hover-secondary-text"
          onClick={onBack}
          disabled={submitting}
        >
          Back
        </button>
        <button
          className="btn-secondary disabled:opacity-40 disabled:pointer-events-none"
          disabled={submitting}
          onClick={onSubmit}
        >
          {submitting ? "Please wait…" : confirmButtonLabel}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}