// ReservationFlow.jsx
import { useState, useEffect, useMemo } from "react";
import DateStep from "./DateStep";
import TimeSlotStep from "./TimeSlotStep";
import ConfirmStep from "./ConfirmStep";
import PaymentStep from "./PaymentStep";
import ReservationReceipt from "./ReservationReceipt";

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
| Confirmation (+ headcount, if venue uses per-head pricing)
|      ↓
| Payment
|      ↓
| Completion
|
| This component DOES NOT communicate directly with Firestore.
| Firestore integration should be handled through:
|
| onDateChange() -> Fetch booked slots
| onSubmit()     -> Save reservation (called from PaymentStep, after payment method is chosen)
|
| NEW (per-head / per-slot pricing support):
| config.pricingMode: "flat" (default, existing behavior — rate × duration)
|                      "perHead" (rate × duration × paying adults)
|                      "perSlot" (each slot has its own price, e.g. Clubhouse's
|                       daytime vs evening block — rates[category] is an object
|                       keyed by slot id instead of a flat number)
| config.kidsFree: bool — if true, kids 7-and-below don't pay, only adults do
| config.bigPax: { enabled, threshold, discount } — PLACEHOLDER ONLY.
|                 Not wired into total calculation yet. Add the discount
|                 logic here once HOA decides the group-size discount rules.
|--------------------------------------------------------------------------
*/

export default function ReservationFlow({
  config,
  residentCategory = "owner",
  // NEW: resident's identity, for display on the receipt.
  // Shape: { firstName, middleName, lastName, suffix }
  // TODO (Firebase Dev): populate this from the logged-in user's document
  // in the `residents` collection (firstName/middleName/lastName/suffix
  // fields), instead of the empty placeholder default below.
  residentInfo = { firstName: "", middleName: "", lastName: "", suffix: "" },
  bookedSlotIds = [],
  onDateChange,
  onSubmit,
  onBack,
  confirmButtonLabel = "Confirm Reservation",
  customFields = [], // Array of custom field configurations
}) {
  const {
    venueName,
    slots,
    rates,
    requireContiguous = true,
    allowMultiple = true,
    payment: paymentConfig = {},
    pricingMode = "flat", // NEW: "flat" | "perHead"
    kidsFree = false, // NEW
    bigPax = { enabled: false, threshold: null, discount: null }, // NEW: placeholder, not yet applied
  } = config;


  const rate = pricingMode === "perSlot"
    ? null
    : (rates[residentCategory] ?? Object.values(rates)[0] ?? 0);

  const slotRateTable = pricingMode === "perSlot"
    ? (rates[residentCategory] ?? Object.values(rates)[0] ?? {})
    : null;
  // paymentConfig shape: { methods: string[], allowDownpayment: bool, downpaymentPercent?: number }

  const [step, setStep] = useState("date");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [paymentDetails, setPaymentDetails] = useState(null); // { method, paymentType, amountDue }
  const [receiptMeta, setReceiptMeta] = useState(null); // { id, submittedAt } for the receipt
  const [adultCount, setAdultCount] = useState(1);
  const [kidCount, setKidCount] = useState(0);

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

  // NEW: for perSlot venues, each selected slot carries its own price.
  // Used by ConfirmStep/Receipt to show a line per slot instead of one
  // flat "Rate" figure.
  const rateBreakdown = useMemo(() => {
    if (pricingMode !== "perSlot") return [];
    return orderedSelected.map((id) => ({
      id,
      label: slots.find((s) => s.id === id)?.label ?? id,
      price: slotRateTable?.[id] ?? 0,
    }));
  }, [pricingMode, orderedSelected, slots, slotRateTable]);

  // NEW: how many heads actually pay. Kids are always free when kidsFree is true,
  // and in "flat"/"perSlot" mode we don't multiply by heads at all (existing
  // behavior preserved).
  const payingHeads = pricingMode === "perHead" ? Math.max(adultCount, 0) : 1;


  // - perSlot: sum of each selected slot's own price (Clubhouse)
  // - perHead: duration × rate × paying adults (Pool)
  // - flat: duration × rate (Basketball Court, and Clubhouse/Pool's old behavior)
  // TODO (bigPax): once the HOA decides group-size discount rules, apply
  // bigPax.discount here when (adultCount + kidCount) >= bigPax.threshold.
  const total = pricingMode === "perSlot"
    ? rateBreakdown.reduce((sum, s) => sum + s.price, 0)
    : duration * rate * payingHeads;

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

  // This validates custom fields, then advances to the Payment step.
  const handleContinueToPayment = () => {
    const hasErrors = customFields.some((field) => {
      if (field.required && !customFieldValues[field.id]?.trim()) {
        setError(`Please fill in ${field.label}`);
        return true;
      }
      return false;
    });

    if (hasErrors) return;

    setError("");
    setStep("payment");
  };

  const handleFinalSubmit = async (details) => {
    setSubmitting(true);
    setError("");
    const booking = {
      venue: venueName,
      residentName: composeFullName(residentInfo),
      date: selectedDate,
      slotIds: orderedSelected,
      duration,
      rate, 

      rateBreakdown: pricingMode === "perSlot" ? rateBreakdown : null,
      total,
      note: note || null,
      // NEW: only meaningful for perHead venues; null otherwise so Firestore
      // docs stay consistent in shape across venue types.
      adults: pricingMode === "perHead" ? adultCount : null,
      kids: pricingMode === "perHead" ? kidCount : null,
      paymentMethod: details.method,
      paymentType: details.paymentType, // "full" | "downpayment"
      amountDue: details.amountDue,
      ...customFieldValues,
    };
    try {

      const result = onSubmit ? await onSubmit(booking) : null;
      setPaymentDetails(details);
      setReceiptMeta({
        id: result?.id || `TEMP-${Date.now()}`,
        submittedAt: new Date(),
      });
      setStep("done");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepOrder = ["date", "time", "confirm", "payment"];
  const stepLabels = ["Date", "Time", "Confirm", "Payment"];

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
                residentCategory={residentCategory}
                total={total}
                note={note}
                onNoteChange={setNote}
                error={error}
                submitting={false}
                confirmButtonLabel={confirmButtonLabel}
                onBack={() => setStep("time")}
                onSubmit={handleContinueToPayment}
                customFields={customFields}
                customFieldValues={customFieldValues}
                onCustomFieldChange={(id, value) =>
                  setCustomFieldValues((prev) => ({ ...prev, [id]: value }))
                }
                // NEW: headcount props — ConfirmStep should only render the
                // adults/kids stepper when pricingMode === "perHead"
                pricingMode={pricingMode}
                kidsFree={kidsFree}
                adultCount={adultCount}
                kidCount={kidCount}
                onAdultCountChange={setAdultCount}
                onKidCountChange={setKidCount}
                // NEW: per-slot price breakdown — only populated when
                // pricingMode === "perSlot" (e.g. Clubhouse)
                rateBreakdown={rateBreakdown}
              />
            )}
            {step === "payment" && (
              <PaymentStep
                venueName={venueName}
                dateLabel={dateLabel}
                timeRangeLabel={timeRangeLabel()}
                total={total}
                methods={paymentConfig.methods || ["cash"]}
                allowDownpayment={paymentConfig.allowDownpayment || false}
                downpaymentPercent={paymentConfig.downpaymentPercent} // may be undefined — pricing TBD
                error={error}
                submitting={submitting}
                onBack={() => setStep("confirm")}
                onFinish={handleFinalSubmit}
              />
            )}
            {step === "done" && (
              <ReservationReceipt
                reservationId={receiptMeta?.id}
                submittedAt={receiptMeta?.submittedAt}
                residentInfo={residentInfo}
                venueName={venueName}
                dateLabel={dateLabel}
                timeRangeLabel={timeRangeLabel()}
                duration={duration}
                rate={rate}
                residentCategory={residentCategory}
                total={total}
                note={note}
                pricingMode={pricingMode}
                rateBreakdown={rateBreakdown}
                customFields={customFields}
                customFieldValues={customFieldValues}
                paymentMethod={paymentDetails?.method}
                paymentType={paymentDetails?.paymentType}
                amountDue={paymentDetails?.amountDue}
                adults={pricingMode === "perHead" ? adultCount : null}
                kids={pricingMode === "perHead" ? kidCount : null}
                onBookAnother={() => window.location.reload()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export function composeFullName({ firstName = "", middleName = "", lastName = "", suffix = "" } = {}) {
  const base = [firstName, middleName, lastName].filter((part) => part && part.trim()).join(" ");
  const trimmedSuffix = suffix && suffix.trim();
  return trimmedSuffix ? `${base} ${trimmedSuffix}` : base;
}

function SummaryItem({ label, value }) {
  return (
    <div className="border-b md:border-b border-border pb-2 md:pb-4">
      <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 md:mb-2">{label}</p>
      <p className="font-semibold text-foreground text-sm md:text-lg truncate">{value}</p>
    </div>
  );
}