// BballReservationForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReservationFlow from "../../../components/ReservationComponents/ReservationFlow";
import { db, auth } from "../../../firebase";
import { 
  collection, query, where, getDocs, addDoc, 
  serverTimestamp, doc, getDoc 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";

const defaultCourtConfig = {
    venueName: "Basketball Court",
    slots: [
        { id: "17-18", label: "5:00 - 6:00 PM" },
        { id: "18-19", label: "6:00 - 7:00 PM" },
        { id: "19-20", label: "7:00 - 8:00 PM" },
        { id: "20-21", label: "8:00 - 9:00 PM" },
        { id: "21-22", label: "9:00 - 10:00 PM" },
    ],
    rates: { owner: 100, renter: 100, household: 100 }, //if for checking ulit, ibahin per resident category (but it works as of now)
    requireContiguous: true,
    allowMultiple: true,
    payment: {
        methods: ["gcash", "cash"],
        allowDownpayment: false,
    },
};

export function BballReservationForm() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);

    const [bookedSlotIds, setBookedSlotIds] = useState([]);
    const [courtConfig, setCourtConfig] = useState(defaultCourtConfig);
    const [configLoading, setConfigLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const userDoc = await getDoc(doc(db, "residents", currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        console.log("User data from Firestore:", data);
                        console.log("residentCategory from Firestore:", data.residentCategory);
                        setUserData(data);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchCourtPricing = async () => {
            try {
                const docRef = doc(db, "courtPricing", "BasketballCourt");
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const pricingData = docSnap.data();
                    console.log("Court pricing loaded from Firestore:", pricingData);
                    setCourtConfig(prev => ({
                        ...prev,
                        rates: pricingData.rates || prev.rates,
                        slots: pricingData.slots || prev.slots,
                    }));
                } else {
                    console.log("No court pricing found, using defaults");
                }
            } catch (error) {
                console.error("Error fetching court pricing:", error);
            } finally {
                setConfigLoading(false);
            }
        };

        fetchCourtPricing();
    }, []);

    const handleDateChange = async (date) => {
        if (!date) {
            setBookedSlotIds([]);
            return;
        }

        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            const reservationsRef = collection(db, "reservations");
            const q = query(
                reservationsRef,
                where("venue", "==", "Basketball Court"),
                where("date", "==", dateString)
            );

            const querySnapshot = await getDocs(q);
            
            const bookedIds = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.slotIds && Array.isArray(data.slotIds)) {
                    bookedIds.push(...data.slotIds);
                }
            });

            setBookedSlotIds(bookedIds);
            console.log(`Found ${bookedIds.length} booked slots for ${dateString}:`, bookedIds);
        } catch (error) {
            console.error("Error fetching booked slots:", error);
            setBookedSlotIds([]);
        }
    };

    const handleSubmitReservation = async (booking) => {
        try {
            if (!user) {
                throw new Error("You must be logged in to make a reservation");
            }

            console.log("Booking object:", booking);
            console.log("booking.residentCategory:", booking.residentCategory);
            console.log("userData?.residentCategory:", userData?.residentCategory);

            const year = booking.date.getFullYear();
            const month = String(booking.date.getMonth() + 1).padStart(2, '0');
            const day = String(booking.date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            const finalResidentCategory = booking.residentCategory || userData?.residentCategory || "owner";
            console.log("Final residentCategory being saved:", finalResidentCategory);

            const reservationData = {
                venue: booking.venue,
                venueName: "Basketball Court",
                residentName: booking.residentName,
                residentCategory: finalResidentCategory,
                uid: user.uid,
                userEmail: user.email,
                date: dateString,
                dateTimestamp: booking.date,
                slotIds: booking.slotIds,
                duration: booking.duration,
                rate: booking.rate,
                total: booking.total,
                rateBreakdown: booking.rateBreakdown || null,
                paymentMethod: booking.paymentMethod,
                paymentType: booking.paymentType,
                amountDue: booking.amountDue,
                note: booking.note || "",
                adults: booking.adults || null,
                kids: booking.kids || null,
                status: "confirmed",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                ...booking.customFields,
            };

            console.log("Reservation data being saved:", reservationData);

            const docRef = await addDoc(collection(db, "reservations"), reservationData);
            
            console.log("Reservation saved! ID:", docRef.id);
            return { id: docRef.id };
        } catch (error) {
            console.error("Error saving reservation:", error);
            throw new Error(error.message || "Failed to save reservation. Please try again.");
        }
    };

    console.log("Current userData:", userData);
    console.log("residentCategory being passed to ReservationFlow:", userData?.residentCategory);

    if (configLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">Loading pricing information...</p>
                </div>
            </div>
        );
    }

    return (
        <ReservationFlow
            config={courtConfig}
            residentCategory={userData?.residentCategory || "owner"}
            residentInfo={{
                firstName: userData?.firstName || "",
                middleName: userData?.middleName || "",
                lastName: userData?.lastName || "",
                suffix: userData?.suffix || "",
            }}
            bookedSlotIds={bookedSlotIds}
            onDateChange={handleDateChange}
            onSubmit={handleSubmitReservation}
            onBack={() => navigate(-1)}
            confirmButtonLabel="Proceed to Payment"
        />
    );
}

export default BballReservationForm;