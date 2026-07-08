// ReservationFlow.jsx
import { useState, useEffect, useMemo } from "react";
import DateStep from "./DateStep";
import TimeSlotStep from "./TimeSlotStep";
import ConfirmStep from "./ConfirmStep";

/*
|--------------------------------------------------------------------------
| Generic Reservation Flow
|--------------------------------------------------------------------------
| This component controls the entire reservation process.
|
| Current Flow:
| Date Selection
|      ↓
| Time Slot Selection
|      ↓
| Confirmation
|      ↓
| Payment / Completion
|
| This component DOES NOT communicate directly with Firestore. PARENT PAGE AY ANG BBALLRESERVATIONFORM.JSX
| Firestore integration should be handled through:
|
| onDateChange() -> Fetch booked slots
| onSubmit()     -> Save reservation / proceed to payment 
|--------------------------------------------------------------------------
*/

export default function ReservationFlow({
  config,
  residentType = "homeowner",
  bookedSlotIds = [],
  onDateChange,
  onSubmit,
  onBack,
  confirmButtonLabel = "Confirm Reservation",
  customFields = [], // NEW: Array of custom field configurations
}) {
  const { venueName, slots, rates, requireContiguous = true, allowMultiple = true } = config;
  const rate = rates[residentType] ?? Object.values(rates)[0] ?? 0;

  const [step, setStep] = useState("date");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState({}); // NEW: Store custom field values

  useEffect(() => {
    setSelectedSlotIds([]);
    setError("");
    if (selectedDate && onDateChange) onDateChange(selectedDate);
  }, [selectedDate]);

  const toggleSlot = (id) => {
    setError("");
    if (!allowMultiple) {
      setSelectedSlotIds((prev) => (prev[0] === id ? [] : [id]));
      return;
    }
    setSelectedSlotIds((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      if (!requireContiguous) return next;
      const orderedIds = slots.map((s) => s.id);
      const indices = next.map((slotId) => orderedIds.indexOf(slotId)).sort((a, b) => a - b);
      const isContiguous = indices.every((val, i) => i === 0 || val === indices[i - 1] + 1);
      if (!isContiguous) {
        setError("Please select consecutive time slots only.");
        return prev;
      }
      return next;
    });
  };

  const orderedSelected = useMemo(() => {
    const orderedIds = slots.map((s) => s.id);
    return [...selectedSlotIds].sort((a, b) => orderedIds.indexOf(a) - orderedIds.indexOf(b));
  }, [selectedSlotIds, slots]);

  const duration = orderedSelected.length;
  const total = duration * rate;

  const timeRangeLabel = () => {
    if (duration === 0) return "";
    const first = slots.find((s) => s.id === orderedSelected[0]);
    const last = slots.find((s) => s.id === orderedSelected[orderedSelected.length - 1]);
    if (duration === 1) return first.label;
    const startLabel = first.label.split(" - ")[0];
    const endLabel = (last.label.split(" - ")[1] || last.label).trim();
    return `${startLabel} - ${endLabel}`;
  };

  const dateLabel = selectedDate?.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });

  const handleSubmit = async () => {
    if (!selectedDate || duration === 0) return;
    
    // Validate custom fields
    const hasErrors = customFields.some(field => {
      if (field.required && !customFieldValues[field.id]?.trim()) {
        setError(`Please fill in ${field.label}`);
        return true;
      }
      return false;
    });
    
    if (hasErrors) {
      return;
    }
    
    setSubmitting(true);
    setError("");
    const booking = { 
      venue: venueName, 
      date: selectedDate, 
      slotIds: orderedSelected, 
      duration, 
      rate, 
      total, 
      note: note || null,
      ...customFieldValues // NEW: Include custom fields in booking
    };
    try {
      if (onSubmit) await onSubmit(booking);
      setStep("done");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepOrder = ["date", "time", "confirm"];
  const stepLabels = ["Date", "Time", "Confirm"];

  return (

    <div className="w-full min-h-screen pt-13 flex flex-col md:flex-row bg-background">

      {/* Sidebar*/}
      <div className="w-full md:w-80 flex-shrink-0 px-6 py-5 md:px-13 md:py-6 border-b md:border-b-0 md:border-r border-border flex flex-col bg-muted/20">
        <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-10">{venueName}</h2>
        <div className="grid grid-cols-3 gap-3 md:flex md:flex-col md:gap-6 md:space-y-0">
          <SummaryItem label="Selected Date" value={dateLabel || "Select a date"} />
          <SummaryItem label="Time Slots" value={timeRangeLabel() || "None"} />
          <SummaryItem label="Total Amount" value={duration > 0 ? `₱${total.toLocaleString()}` : "—"} />
        </div>
        <div className="mt-auto">
        </div>
      </div>

      <div className="flex-grow p-4 sm:p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {step !== "done" && (
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 mb-6 md:mb-12 overflow-x-auto">
              {stepLabels.map((label, i) => {
                const active = step === stepOrder[i];
                const done = stepOrder.indexOf(step) > i;
                return (
                  <div key={label} className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm
                      ${done ? "bg-primary text-primary-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm md:text-base ${active ? "font-bold text-foreground" : "text-muted-foreground"}`}>{label}</span>
                    {i < stepLabels.length - 1 && <div className="w-6 md:w-16 h-px bg-border ml-1 md:ml-2" />}
                  </div>
                );
              })}
            </div>
          )}

          <div className="w-full">
            {step === "date" && <DateStep selectedDate={selectedDate} onSelectDate={setSelectedDate} onContinue={() => setStep("time")} onBack={onBack} />}
            {step === "time" && <TimeSlotStep slots={slots} selectedSlotIds={selectedSlotIds} bookedSlotIds={bookedSlotIds} onToggleSlot={toggleSlot} allowMultiple={allowMultiple} requireContiguous={requireContiguous} error={error} dateLabel={dateLabel} duration={duration} total={total} onBack={() => setStep("date")} onContinue={() => setStep("confirm")} />}
            {step === "confirm" && (
              <ConfirmStep 
                venueName={venueName} 
                dateLabel={dateLabel} 
                timeRangeLabel={timeRangeLabel()} 
                duration={duration} 
                rate={rate} 
                residentType={residentType} 
                total={total} 
                note={note} 
                onNoteChange={setNote} 
                error={error} 
                submitting={submitting} 
                confirmButtonLabel={confirmButtonLabel} 
                onBack={() => setStep("time")} 
                onSubmit={handleSubmit}
                customFields={customFields} // NEW: Pass custom fields
                customFieldValues={customFieldValues} // NEW: Pass custom field values
                onCustomFieldChange={(id, value) => 
                  setCustomFieldValues(prev => ({ ...prev, [id]: value }))
                }
              />
            )}
            {step === "done" && (
              <div className="text-center py-12 md:py-24">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-accent text-primary rounded-full flex items-center justify-center mx-auto mb-5 md:mb-8 text-3xl md:text-5xl">✓</div>
                <h2 className="font-heading text-2xl md:text-4xl font-bold text-foreground">Reservation Confirmed!</h2>
                <button className="mt-6 md:mt-10 px-6 py-3 md:px-10 md:py-4 btn-primary" onClick={() => window.location.reload()}>Book Another</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="border-b md:border-b border-border pb-2 md:pb-4">
      <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 md:mb-2">{label}</p>
      <p className="font-semibold text-foreground text-sm md:text-lg truncate">{value}</p>
    </div>
  );
}