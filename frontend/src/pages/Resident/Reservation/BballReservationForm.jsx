import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ReservationFlow from "../../../components/ReservationComponents/ReservationFlow";

// import { db } from "@/firebase/config";
// import { collection, query, where, getDocs } from "firebase/firestore";


const courtConfig = {
    venueName: "Basketball Court",
    slots: [
        { id: "18-19", label: "6:00 - 7:00 PM" },
        { id: "19-20", label: "7:00 - 8:00 PM" },
        { id: "20-21", label: "8:00 - 9:00 PM" },
        { id: "21-22", label: "9:00 - 10:00 PM" },
    ],
    rates: { homeowner: 100, renter: 120 },
    requireContiguous: true,
    allowMultiple: true,
};

export function BballReservationForm() {
    const navigate = useNavigate();

    // Holds the slot IDs that are already booked for the selected date
    const [bookedSlotIds, setBookedSlotIds] = useState([]);

    // ==========================================
    // TODO (Firebase Dev): Fetch reserved slots
    // This runs whenever the user picks a new date in the UI.
    // Steps needed:
    // 1. Format the 'date' parameter to match your Firestore date format.
    // 2. Query the reservations collection where date == selectedDate & venue == "Basketball Court".
    // 3. Extract the booked slot IDs from the query snapshot.
    // 4. Update state: setBookedSlotIds(retrievedSlotIdsArray).
    // ==========================================
    const handleDateChange = async (date) => {
        console.log("Date selected, ready for Firestore query:", date);
    };

    // ==========================================
    // TODO (Firebase Dev): Handle Reservation Submission
    // Triggered when 'Proceed to Payment' is clicked.
    // The 'booking' object contains the user's selected slots and pricing.
    // You can write a temporary/pending reservation to Firestore here, 
    // or pass it to the payment page state to save after successful checkout.
    // ==========================================
    const handleProceedToPayment = async (booking) => {
        navigate("/reservation/court/payment", { state: { booking } });
    };

    return (
        <ReservationFlow
            config={courtConfig}
            // TODO (Firebase Dev): Dynamically pass user type ('homeowner' vs 'renter') 
            // by checking the logged-in user's profile in Firebase Auth/Firestore.
            residentType={"homeowner"} 
            bookedSlotIds={bookedSlotIds}
            onDateChange={handleDateChange}
            onSubmit={handleProceedToPayment}
            onBack={() => navigate(-1)}
            confirmButtonLabel="Proceed to Payment"
        />
    );
}

export default BballReservationForm;
