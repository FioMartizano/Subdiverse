// PaymentStep.jsx
import { useState, useMemo } from "react";

/*
|--------------------------------------------------------------------------
| Payment Step (Placeholder, config-driven)
|--------------------------------------------------------------------------
| Final step of the reservation flow, shown after ConfirmStep.
|
| Which payment methods show up, and whether downpayment is offered at all,
| now comes from the venue's config (see courtConfig / clubhouseConfig),
| the same way `slots` and `rates` already do. This is UI-only for now —
| no real payment integration yet.
|
| `downpaymentPercent` may be undefined if the HOA hasn't finalized that
| rule yet — in that case we show "Amount to be confirmed" instead of a
| guessed number, and block Finish until it's resolved.
|
| onFinish receives { method, paymentType, amountDue } — handleFinalSubmit
| in ReservationFlow.jsx uses this to build the booking record.
|--------------------------------------------------------------------------
*/

const methodLabels = {
  gcash: "GCash",
  bank: "Bank Transfer",
  cash: "Cash on Site",
  cheque: "Cheque",
};

export default function PaymentStep({
  venueName,
  dateLabel,
  timeRangeLabel,
  total,
  methods = ["cash"],
  allowDownpayment = false,
  downpaymentPercent, // undefined 
  error,
  submitting,
  onBack,
  onFinish,
}) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentType, setPaymentType] = useState("full"); // "full" | "downpayment"

  const downpaymentAmount = useMemo(() => {
    if (!downpaymentPercent) return null; // pricing wla pa
    return Math.round((total * downpaymentPercent) / 100);
  }, [total, downpaymentPercent]);

  const amountDue = paymentType === "downpayment" ? downpaymentAmount : total;
  const downpaymentPending = paymentType === "downpayment" && downpaymentAmount === null;

  const canFinish = selectedMethod && !downpaymentPending && !submitting;

  const handleFinish = () => {
    onFinish({ method: selectedMethod, paymentType, amountDue });
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">
        Payment
      </h2>

      <div className="rounded-cards border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        <p>{venueName} · {dateLabel} · {timeRangeLabel}</p>
        <p className="mt-1 font-semibold text-foreground">
          Total: ₱{total.toLocaleString()}
        </p>
      </div>

      {/* Full payment vs downpayment — only shown for venues that allow it */}
      {allowDownpayment && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Payment Type</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentType("full")}
              className={`rounded-cards border p-4 text-sm font-medium transition-colors ${
                paymentType === "full"
                  ? "border-primary bg-accent text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              Full Payment
            </button>
            <button
              type="button"
              onClick={() => setPaymentType("downpayment")}
              className={`rounded-cards border p-4 text-sm font-medium transition-colors ${
                paymentType === "downpayment"
                  ? "border-primary bg-accent text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              Downpayment
            </button>
          </div>

          {paymentType === "downpayment" && (
            <p className="mt-3 text-sm text-muted-foreground">
              {downpaymentPending
                ? "Downpayment amount to be confirmed — pricing rules for this venue aren't finalized yet."
                : `Amount due now: ₱${downpaymentAmount.toLocaleString()} (${downpaymentPercent}% of total)`}
            </p>
          )}
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-foreground mb-3">
          Select payment method
        </p>
        <div className="grid grid-cols-3 gap-3">
          {methods.map((methodId) => (
            <button
              key={methodId}
              type="button"
              onClick={() => setSelectedMethod(methodId)}
              className={`rounded-cards border p-4 text-sm font-medium transition-colors ${
                selectedMethod === methodId
                  ? "border-primary bg-accent text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {methodLabels[methodId] || methodId}
            </button>
          ))}
        </div>
      </div>

      {selectedMethod && (
        <div className="rounded-cards border border-dashed border-border p-4 text-sm text-muted-foreground">
          Payment details for "{methodLabels[selectedMethod] || selectedMethod}" will go here later (QR code, account number, or on-site instructions).
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="text-sm text-muted-foreground">
          Back
        </button>
        <button
          type="button"
          className="btn-primary disabled:opacity-50"
          disabled={!canFinish}
          onClick={handleFinish}
        >
          {submitting ? "Submitting..." : "Finish Reservation"}
        </button>
      </div>
    </div>
  );
}