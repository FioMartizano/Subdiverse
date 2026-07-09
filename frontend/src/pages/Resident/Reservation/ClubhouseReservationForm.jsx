import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReservationFlow from "../../../components/ReservationComponents/ReservationFlow";

// import { db } from "@/firebase/config";
// import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

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
    requireContiguous: false, 
    allowMultiple: true,     
    payment: {
        methods: ["cash", "gcash", "cheque"],
        allowDownpayment: true,
        // downpaymentPercent: to be added — lagyan kapag may rules na tayo for downpayment
    },
};

// Custom fields for the clubhouse
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
    // TODO (Firebase Dev): Handle Final Reservation Submission
    // CHANGED: This now fires AFTER the Payment step inside ReservationFlow
    // (once the resident picks a payment method and hits "Finish Reservation"),
    // not right after Confirm.
    //
    // The 'booking' object includes occasion from custom fields,
    // PLUS 'paymentMethod'/'paymentType'/'amountDue' from the Payment step
    // (see PaymentStep.jsx / handleFinalSubmit in ReservationFlow.jsx).
    //
    // Steps needed:
    // 1. Write the booking to the reservations collection in Firestore.
    // 2. Include the logged-in user's uid so it can be tied to their account.
    // 3. Throw an error here if the write fails — ReservationFlow already
    //    catches it and displays it via the 'error' prop.
    // ==========================================
    const handleSubmitReservation = async (booking) => {
        console.log("Booking ready to save (occasion + paymentMethod/paymentType):", booking);
        // e.g. await addDoc(collection(db, "reservations"), { ...booking, uid: currentUser.uid });
    };

    return (
        <ReservationFlow
            config={clubhouseConfig}
            // TODO (Firebase Dev): Dynamically pass user type ('homeowner' vs 'renter') 
            // by checking the logged-in user's profile in Firebase Auth/Firestore.
            residentType={"homeowner"} 
            bookedSlotIds={bookedSlotIds}
            onDateChange={handleDateChange}
            onSubmit={handleSubmitReservation}
            onBack={() => navigate(-1)}
            confirmButtonLabel="Proceed to Payment"
            customFields={customFields}
        />
    );
}

export default ClubhouseReservationForm;