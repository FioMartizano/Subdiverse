import { Calendar } from "../ui/calendar";

export default function DateStep({ selectedDate, onSelectDate, onContinue, onBack }) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold text-foreground">Select Date</h2>
        <p className="text-sm text-muted-foreground">Choose the date for your reservation.</p>
      </div>

      <div className="flex-grow flex justify-center items-start">
        {/* Minimalistic Calendar Wrapper */}
        <div className="bg-card rounded-[var(--radius-cards)] border border-border shadow-sm p-4 w-full max-w-sm flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            // Ensure the date logic doesn't hide everything by checking date format
            disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
            className="w-full"
         
            
          />
        </div>
      </div>

      {/* Fixed Action Footer */}
      <div className="flex justify-between items-center mt-9 pt-2 border-t border-border">
        {onBack ? (
          <button
            className="text-muted-foreground font-medium hover:text-primary transition"
            onClick={onBack}
          >
            Back
          </button>
        ) : (
          <span />
        )}
        <button
          className="btn-primary px-8 py-3 rounded-[var(--radius-buttons)] disabled:opacity-30 transition-all duration-200"
          disabled={!selectedDate}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}