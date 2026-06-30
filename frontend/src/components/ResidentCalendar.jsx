import { useState } from "react";
import { Calendar } from "./ui/calendar";

function ResidentCalendar() {
    const [events, setEvents] = useState([
        { date: new Date(2026, 6, 4), title: "Basketball Tournament" },
    ]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    const eventDates = events.map((e) => e.date);

    const handleAddEvent = () => {
        if (!selectedDate || !newTitle) return;
        setEvents([...events, { date: selectedDate, title: newTitle }]);
        setNewTitle("");
        setShowForm(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-[360px]">

            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                fixedWeeks
                modifiers={{ event: eventDates }}
                modifiersClassNames={{ event: "bg-secondary text-white rounded-full" }}
                className="mx-auto"
            />

            {/* TODO: only show this for officer/admin roles once auth exists */}
            <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-sm text-primary font-semibold self-start"
            >
                + Add Event
            </button>

            {showForm && (
                <div className="mt-2 flex gap-2">
                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Event title"
                        className="border rounded px-2 py-1 text-sm flex-1"
                    />
                    <button
                        onClick={handleAddEvent}
                        className="bg-secondary text-white px-3 rounded text-sm"
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}

export default ResidentCalendar;