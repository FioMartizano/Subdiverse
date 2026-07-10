import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReservationFlow from "../../../components/ReservationComponents/ReservationFlow";

// import { db } from "@/firebase/config";
// import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

//PLACEHOLDER LANG MUNA

const poolConfig = {
    venueName: "Swimming Pool",
    slots: [
        { id: "8-16", label: "8:00 AM - 4:00 PM" },
        { id: "17-22", label: "6:00 PM - 10:00 PM" },
    ],
    
    rates: {
        resident: 100,
        renter: 150,
        householdOwner: NaN, // idk pa
    },
    pricingMode: "perHead",
    kidsFree: true,
    //  placeholder for future bulk/group discount tier — not wired up yet
    bigPax: {
        enabled: false,
        threshold: null,   // e.g. 15+ heads
        discount: null,    // e.g. 0.1 for 10% off
    },
    requireContiguous: false,
    allowMultiple: true,
    payment: {
        methods: ["cash", "gcash", "cheque"],
        allowDownpayment: true,
        // downpaymentPercent: to be added — lagyan kapag may rules na tayo for downpayment
    },
};

// Custom fields for the pool
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

export function PoolReservationForm() {
    const navigate = useNavigate();

    const [bookedSlotIds, setBookedSlotIds] = useState([]);

    // ==========================================
    // TODO (Firebase Dev): Fetch reserved slots
    // ==========================================
    const handleDateChange = async (date) => {
        console.log("Date selected, ready for Firestore query:", date);
    };

    // ==========================================
    // TODO (Firebase Dev): Handle Final Reservation Submission
    // booking now also includes { adults, kids } from the headcount step
    // ==========================================
    const handleSubmitReservation = async (booking) => {
        console.log("Booking ready to save (occasion + headcount + payment):", booking);
    };

    return (
        <ReservationFlow
            config={poolConfig}
            // TODO (Firebase Dev): Dynamically set based on logged-in user's profile.
            // NOTE: key must match one of poolConfig.rates — "resident" | "renter" | "householdOwner"
            residentType={"resident"}
            bookedSlotIds={bookedSlotIds}
            onDateChange={handleDateChange}
            onSubmit={handleSubmitReservation}
            onBack={() => navigate(-1)}
            confirmButtonLabel="Proceed to Payment"
            customFields={customFields}
        />
    );
}

export default PoolReservationForm;