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
    // Firestore's `residents` collection: "owner", "renter", "household".
    rates: {
        owner: {
            "8-16": 3500,  // daytime block
            "17-22": 3000, // evening block
        },
        renter: {
            "8-16": 4000,  // daytime block
            "17-22": 3700, // evening block
        },
        household: {
            "8-16": 4000,  // TODO: confirm — placeholder, same as renter
            "17-22": 3700, // TODO: confirm — placeholder, same as renter
        },
    },
    pricingMode: "perSlot",
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


    const handleDateChange = async (date) => {
        console.log("Date selected, ready for Firestore query:", date);
        // Example: setBookedSlotIds(["8-17"]); // This would mark the daytime block as booked
    };

    const handleSubmitReservation = async (booking) => {
        console.log("Booking ready to save (occasion + rateBreakdown + payment + name):", booking);
        // e.g. await addDoc(collection(db, "reservations"), { ...booking, uid: currentUser.uid });
    };

    return (
        <ReservationFlow
            config={clubhouseConfig}
            // TODO (Firebase Dev): Dynamically pass the logged-in user's
            // residentCategory field by looking up their document in the
            // `residents` Firestore collection.
            // NOTE: key must match one of clubhouseConfig.rates — "owner" | "renter" | "household"
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

export default ClubhouseReservationForm;