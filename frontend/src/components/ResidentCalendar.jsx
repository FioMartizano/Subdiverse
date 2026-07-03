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
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-[360px] flex flex-col">

            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                fixedWeeks
                modifiers={{ event: eventDates }}
                modifiersClassNames={{ event: "bg-secondary text-white rounded-full" }}
                className="mx-auto"
            />

            {selectedDate && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Selected Date's Events:</p>
                    {events
                        .filter(e => e.date.toDateString() === selectedDate.toDateString())
                        .map((e, index) => (
                            <div key={index} className="text-sm font-semibold text-gray-800 mt-1">
                                🏀 {e.title}
                            </div>
                        ))}
                    {events.filter(e => e.date.toDateString() === selectedDate.toDateString()).length === 0 && (
                        <p className="text-sm text-gray-400 italic mt-1">No events scheduled.</p>
                    )}
                </div>
            )}

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