import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReservationFlow from "../../../components/ReservationComponents/ReservationFlow";

// import { db } from "@/firebase/config";
// import { collection, query, where, getDocs, addDoc } from "firebase/firestore";


const courtConfig = {
    venueName: "Basketball Court",
    slots: [
        { id: "18-19", label: "6:00 - 7:00 PM" },
        { id: "19-20", label: "7:00 - 8:00 PM" },
        { id: "20-21", label: "8:00 - 9:00 PM" },
        { id: "21-22", label: "9:00 - 10:00 PM" },
    ],
    // `residents` collection: "owner", "renter", "household"
    rates: { owner: 100, renter: 120, household: 120 },
    requireContiguous: true,
    allowMultiple: true,
    payment: {
        methods: ["gcash", "cash"],
        allowDownpayment: false,
    },
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
    // TODO (Firebase Dev): Handle Final Reservation Submission
    // This fires AFTER the Payment step inside ReservationFlow
    // (once the resident picks a payment method and hits "Finish Reservation"),
    // not right after Confirm.
    //
    // The 'booking' object already includes a 'paymentMethod' field
    // (see PaymentStep.jsx / handleFinalSubmit in ReservationFlow.jsx).
    //
    // Steps needed:
    // 1. Write the booking to the reservations collection in Firestore.
    // 2. Include the logged-in user's uid so it can be tied to their account.
    // 3. Throw an error here if the write fails — ReservationFlow already
    //    catches it and displays it via the 'error' prop.
    // ==========================================
    const handleSubmitReservation = async (booking) => {
        console.log("Booking ready to save (includes paymentMethod):", booking);
        // e.g. await addDoc(collection(db, "reservations"), { ...booking, uid: currentUser.uid });
    };

    return (
        <ReservationFlow
            config={courtConfig}
            // TODO (Firebase Dev): Dynamically pass the logged-in user's
            // residentCategory field by looking up their document in the
            // `residents` Firestore collection.
            // NOTE: key must match one of courtConfig.rates — "owner" | "renter" | "household"
            residentCategory={"owner"}
            // TODO (Firebase Dev): pass the actual resident's name fields
            // (firstName/middleName/lastName/suffix) from their `residents`
            // collection document, instead of this placeholder.
            residentInfo={{ firstName: "", middleName: "", lastName: "", suffix: "" }}
            bookedSlotIds={bookedSlotIds}
            onDateChange={handleDateChange}
            onSubmit={handleSubmitReservation}
            onBack={() => navigate(-1)}
            confirmButtonLabel="Proceed to Payment"
        />
    );
}

export default BballReservationForm;