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
    // `residents` collection: "owner", "renter", "household"
    rates: {
        owner: 100,
        renter: 150,
        household: 150, // same rate as renter ba?
    },
    pricingMode: "perHead", // rate × duration × paying adults
    kidsFree: true, // kids 7 & below don't pay, only accompanying adults do
    // Placeholder for future bulk/group discount tier — not wired up yet
    bigPax: {
        enabled: false,
        threshold: null,   // e.g. 15+ heads
        discount: null,    // e.g. 0.1 for 10% off (kung meron?)
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
    // booking now also includes { adults, kids, residentName } from
    // ReservationFlow, plus { occasion } from custom fields and
    // paymentMethod/paymentType/amountDue from the Payment step
    // ==========================================
    const handleSubmitReservation = async (booking) => {
        console.log("Booking ready to save (occasion + headcount + payment + name):", booking);
    };

    return (
        <ReservationFlow
            config={poolConfig}
            // TODO (Firebase Dev): Dynamically pass the logged-in user's
            // residentCategory field by looking up their document in the
            // `residents` Firestore collection.
            // NOTE: key must match one of poolConfig.rates — "owner" | "renter" | "household"
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
            customFields={customFields}
        />
    );
}

export default PoolReservationForm;