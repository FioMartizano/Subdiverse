import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReservationFlow from "../../../components/ReservationComponents/ReservationFlow";
import { db, auth } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  runTransaction,
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
                    /*
                     * SECURITY NOTE — ALREADY CORRECT:
                     * The resident document ID matches the Firebase Auth UID.
                     * This reads only the currently logged-in resident's profile.
                     */
                    const userDoc = await getDoc(
                        doc(db, "residents", currentUser.uid)
                    );
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
                /*
                 * SECURITY NOTE:
                 * Residents only READ the shared court configuration.
                 * Creating or editing court prices should be admin-only.
                 */
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
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const dateString = `${year}-${month}-${day}`;

            /*
             * SECURITY CHANGE 1 — SAFE AVAILABILITY QUERY:
             *
             * BEFORE:
             * This page queried the full "reservations" collection.
             * Those documents contain private resident and payment details.
             *
             * NOW:
             * It reads "reservationAvailability", which contains only safe
             * booking information such as venue, date, and slot ID.
             */
            const venueDate = `basketball-court_${dateString}`;

            const availabilityQuery = query(
                collection(db, "reservationAvailability"),
                where("venueDate", "==", venueDate)
            );

            const querySnapshot = await getDocs(availabilityQuery);

            /*
             * Each availability document represents one occupied time slot.
             * The page only needs slotId to disable booked buttons.
             */
            const bookedIds = querySnapshot.docs
                .map((document) => document.data().slotId)
                .filter(Boolean);

            setBookedSlotIds(bookedIds);

            console.log(
                `Found ${bookedIds.length} booked slots for ${dateString}:`,
                bookedIds
            );
        } catch (error) {
            console.error("Error fetching booked slots:", error);
            setBookedSlotIds([]);
        }
    };

    const handleSubmitReservation = async (booking) => {
        try {
            if (!user) {
                throw new Error("You must be logged in to make a reservation.");
            }

            if (!booking.date) {
                throw new Error("Please select a reservation date.");
            }

            if (!Array.isArray(booking.slotIds) || booking.slotIds.length === 0) {
                throw new Error("Please select at least one time slot.");
            }

            const year = booking.date.getFullYear();
            const month = String(booking.date.getMonth() + 1).padStart(2, "0");
            const day = String(booking.date.getDate()).padStart(2, "0");
            const dateString = `${year}-${month}-${day}`;

            const finalResidentCategory =
                booking.residentCategory ||
                userData?.residentCategory ||
                "owner";

            /*
             * SECURITY CHANGE 2 — GENERATE THE PRIVATE RESERVATION ID FIRST:
             *
             * We need this ID before writing so each safe availability record
             * can point to its matching private reservation.
             */
            const reservationRef = doc(collection(db, "reservations"));

            const reservationData = {
                /*
                 * SECURITY CHANGE 3 — CUSTOM FIELDS GO FIRST:
                 *
                 * Protected fields below are written after customFields so
                 * custom input cannot overwrite uid, venue, status, or timestamps.
                 */
                ...(booking.customFields || {}),

                // Fixed by this Basketball page; not trusted from user input.
                venue: "Basketball Court",
                venueName: "Basketball Court",

                residentName: booking.residentName,
                residentCategory: finalResidentCategory,

                // Ownership always comes from Firebase Authentication.
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
            };

            /*
             * SECURITY CHANGE 4 — ONE SAFE DOCUMENT PER SLOT:
             *
             * Example document ID:
             * basketball-court_2026-07-15_19-20
             *
             * Using a predictable ID means the same date and slot cannot be
             * represented by two different availability documents.
             */
            const availabilityItems = booking.slotIds.map((slotId) => ({
                slotId,
                ref: doc(
                    db,
                    "reservationAvailability",
                    `basketball-court_${dateString}_${slotId}`
                ),
            }));

            /*
             * SECURITY CHANGE 5 — TRANSACTION:
             *
             * The transaction checks every slot before saving anything.
             * If another resident reserved one of the slots first, the entire
             * transaction stops and no partial reservation is created.
             */
            await runTransaction(db, async (transaction) => {
                // Firestore transaction reads must happen before writes.
                const availabilitySnapshots = [];

                for (const item of availabilityItems) {
                    const availabilitySnapshot = await transaction.get(item.ref);

                    availabilitySnapshots.push({
                        slotId: item.slotId,
                        snapshot: availabilitySnapshot,
                    });
                }

                const unavailableSlot = availabilitySnapshots.find(
                    (item) => item.snapshot.exists()
                );

                if (unavailableSlot) {
                    throw new Error(
                        `The ${unavailableSlot.slotId} time slot was just reserved. Please select another slot.`
                    );
                }

                /*
                 * PRIVATE RECORD:
                 * Readable only by its owner and authorized admin users.
                 */
                transaction.set(reservationRef, reservationData);

                /*
                 * SHARED SAFE RECORDS:
                 * Readable by logged-in residents for availability checking.
                 * These documents contain no name, email, payment, note, or file.
                 */
                for (const item of availabilityItems) {
                    transaction.set(item.ref, {
                        reservationId: reservationRef.id,
                        venue: "Basketball Court",
                        date: dateString,
                        venueDate: `basketball-court_${dateString}`,
                        slotId: item.slotId,
                        createdAt: serverTimestamp(),
                    });
                }
            });

            console.log("Reservation saved! ID:", reservationRef.id);

            return {
                id: reservationRef.id,
            };
        } catch (error) {
            console.error("Error saving reservation:", error);

            throw new Error(
                error.message ||
                "Failed to save reservation. Please try again."
            );
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