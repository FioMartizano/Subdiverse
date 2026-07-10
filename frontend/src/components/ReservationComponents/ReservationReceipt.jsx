import { useMemo } from "react";

const paymentMethodLabels = {
  gcash: "GCash",
  bank: "Bank Transfer",
  cash: "Cash on Site",
  cheque: "Cheque",
};

const residentTypeLabels = {
  homeowner: "Homeowner",
  resident: "Resident",
  renter: "Renter",
  householdOwner: "Household Owner",
};

export default function ReservationReceipt({
  reservationId,
  submittedAt,
  venueName,
  dateLabel,
  timeRangeLabel,
  duration,
  rate,
  residentType,
  total,
  note,
  customFields = [],
  customFieldValues = {},
  paymentMethod,
  paymentType,
  amountDue,
  adults = null,
  kids = null,
  onBookAnother,
}) {
  const submittedLabel = useMemo(() => {
    if (!submittedAt) return "";
    return submittedAt.toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [submittedAt]);


  const isPerHead = typeof adults === "number";

  return (
    <div className="py-6 md:py-10">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-printable, #receipt-printable * { visibility: visible; }
          #receipt-printable { position: absolute; top: 0; left: 0; width: 100%; }
          #receipt-actions { display: none; }
        }
      `}</style>

      <div className="text-center mb-8">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-accent text-primary rounded-full flex items-center justify-center mx-auto mb-5 md:mb-8 text-3xl md:text-5xl">✓</div>
        <h2 className="font-heading text-2xl md:text-4xl font-bold text-foreground">Reservation Confirmed!</h2>
      </div>

      <div id="receipt-printable" className="max-w-lg mx-auto rounded-cards border border-border bg-background p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div>
            <p className="font-heading text-lg font-bold text-foreground">{venueName}</p>
            <p className="text-xs text-muted-foreground">Reservation Receipt</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Reservation ID</p>
            <p className="text-sm font-semibold text-foreground">{reservationId}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <ReceiptRow label="Date" value={dateLabel} />
          <ReceiptRow label="Time" value={timeRangeLabel} />
          <ReceiptRow label="Duration" value={`${duration} hour${duration === 1 ? "" : "s"}`} />
          <ReceiptRow label="Resident Type" value={residentTypeLabels[residentType] || residentType} />
          <ReceiptRow
            label="Rate"
            value={
              typeof rate === "number" && !Number.isNaN(rate)
                ? isPerHead
                  ? `₱${rate.toLocaleString()} / head / hour`
                  : `₱${rate.toLocaleString()} / hour`
                : "—"
            }
          />

          {isPerHead && (
            <>
              <ReceiptRow label="Adults (paying)" value={adults} />
              <ReceiptRow label="Kids (7 & below, free)" value={kids ?? 0} />
            </>
          )}

          {customFields.map((field) => (
            <ReceiptRow
              key={field.id}
              label={field.label}
              value={customFieldValues[field.id] || "—"}
            />
          ))}

          {note && <ReceiptRow label="Note" value={note} />}

          <ReceiptRow
            label="Payment Method"
            value={paymentMethodLabels[paymentMethod] || paymentMethod || "—"}
          />
          {paymentType && (
            <ReceiptRow
              label="Payment Type"
              value={paymentType === "downpayment" ? "Downpayment" : "Full Payment"}
            />
          )}
          <ReceiptRow label="Submitted" value={submittedLabel} />
        </div>

        <div className="border-t border-border mt-4 pt-4">
          {paymentType === "downpayment" && amountDue != null && amountDue !== total ? (
            <>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <p>Reservation Total</p>
                <p>₱{total.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Amount Paid (Downpayment)</p>
                <p className="font-heading text-xl font-bold text-primary">₱{amountDue.toLocaleString()}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Remaining balance of ₱{(total - amountDue).toLocaleString()} due on/before the event.
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">Total Amount</p>
              <p className="font-heading text-xl font-bold text-primary">₱{total.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <div id="receipt-actions" className="max-w-lg mx-auto mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-6 py-3 rounded-cards border border-border text-foreground font-semibold"
        >
          Print / Save as PDF
        </button>
        <button type="button" className="px-6 py-3 btn-primary" onClick={onBookAnother}>
          Book Another
        </button>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-foreground font-medium text-right">{value || "—"}</p>
    </div>
  );
}