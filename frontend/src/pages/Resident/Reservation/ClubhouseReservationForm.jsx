import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ReservationFlow from "../../../components/ReservationComponents/ReservationFlow";

// import { db } from "@/firebase/config";
// import { collection, query, where, getDocs } from "firebase/firestore";

const clubhouseConfig = {
    venueName: "Function Hall",
    slots: [
        { id: "8-16", label: "8:00 AM - 4:00 PM" },
        { id: "17-22", label: "6:00 PM - 10:00 PM" },
    ],
    rates: { 
        homeowner: {
            "8-16": 3500,  // ₱2500 for daytime block
            "17-22": 3000, // ₱4500 for evening block
        },
        renter: {
            "8-16": 4000,  // ₱200/hr for daytime block
            "17-22": 3700, // ₱250/hr for evening block
        }
    },
    requireContiguous: false, // Not needed since only 2 slots
    allowMultiple: true,     // Only one block can be selected
};

// NEW: Define custom fields for the clubhouse
const customFields = [
    {
        id: "occasion",
        label: "Occasion",
        type: "select",
        required: true,
        options: [
            "Birthday Party",
            "Wedding Reception",
            "Anniversary",
            "Family Reunion",
            "Corporate Event",
            "Meeting",
            "Seminar",
            "Other"
        ],
        helpText: "Select the type of event you're hosting"
    },
    {
        id: "paymentMode",
        label: "Payment Mode",
        type: "select",
        required: true,
        options: [
            "Cash",
            "Downpayment"
        ],
        helpText: "Select your preferred payment method"
    },
    {
        id: "paymentOption",
        label: "Payment Option",
        type: "select",
        required: true,
        options: [
            "Cash",
            "GCash",
            "Cheque"
        ],
        helpText: "Select how you will pay"
    }
];

export function ClubhouseReservationForm() {
    const navigate = useNavigate();

    // Holds the slot IDs that are already booked for the selected date
    const [bookedSlotIds, setBookedSlotIds] = useState([]);

    // ==========================================
    // TODO (Firebase Dev): Fetch reserved slots
    // This runs whenever the user picks a new date in the UI.
    // Steps needed:
    // 1. Format the 'date' parameter to match your Firestore date format.
    // 2. Query the reservations collection where date == selectedDate & venue == "Function Hall".
    // 3. Extract the booked slot IDs from the query snapshot.
    // 4. Update state: setBookedSlotIds(retrievedSlotIdsArray).
    // ==========================================
    const handleDateChange = async (date) => {
        console.log("Date selected, ready for Firestore query:", date);
        // Example: setBookedSlotIds(["8-17"]); // This would mark the daytime block as booked
    };

    // ==========================================
    // TODO (Firebase Dev): Handle Reservation Submission
    // Triggered when 'Proceed to Payment' is clicked.
    // The 'booking' object contains the user's selected slots and pricing.
    // You can write a temporary/pending reservation to Firestore here, 
    // or pass it to the payment page state to save after successful checkout.
    // ==========================================
    const handleProceedToPayment = async (booking) => {
        // The booking object now includes occasion, paymentMode, and paymentOption from custom fields
        console.log("Booking with custom fields:", booking);
        navigate("/reservation/clubhouse/payment", { state: { booking } });
    };

    return (
        <ReservationFlow
            config={clubhouseConfig}
            // TODO (Firebase Dev): Dynamically pass user type ('homeowner' vs 'renter') 
            // by checking the logged-in user's profile in Firebase Auth/Firestore.
            residentType={"homeowner"} 
            bookedSlotIds={bookedSlotIds}
            onDateChange={handleDateChange}
            onSubmit={handleProceedToPayment}
            onBack={() => navigate(-1)}
            confirmButtonLabel="Proceed to Payment"
            customFields={customFields} // NEW: Pass custom fields to the flow
        />
    );
}

export default ClubhouseReservationForm;