import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReservationFlow from "../../../components/ReservationComponents/ReservationFlow";
import { db, auth } from "../../../firebase";
import {collection, query, where, getDocs, addDoc,serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";

//not super final since wla pa package prices but for now, venue + per head itu

// DAYTIME SLOTS (8:00 AM - 5:00 PM)
const daytimeSlots = [
    { id: "8-9", label: "8:00 AM - 9:00 AM" },
    { id: "9-10", label: "9:00 AM - 10:00 AM" },
    { id: "10-11", label: "10:00 AM - 11:00 AM" },
    { id: "11-12", label: "11:00 AM - 12:00 PM" },
    { id: "12-13", label: "12:00 PM - 1:00 PM" },
    { id: "13-14", label: "1:00 PM - 2:00 PM" },
    { id: "14-15", label: "2:00 PM - 3:00 PM" },
    { id: "15-16", label: "3:00 PM - 4:00 PM" },
    { id: "16-17", label: "4:00 PM - 5:00 PM" },
];

// NIGHTTIME SLOTS (5:00 PM - 10:00 PM) - higher the price due to lighting
const nighttimeSlots = [
    { id: "17-18", label: "5:00 PM - 6:00 PM" },
    { id: "18-19", label: "6:00 PM - 7:00 PM" },
    { id: "19-20", label: "7:00 PM - 8:00 PM" },
    { id: "20-21", label: "8:00 PM - 9:00 PM" },
    { id: "21-22", label: "9:00 PM - 10:00 PM" },
];

const defaultPoolConfig = {
    venueName: "Swimming Pool",
    slots: [...daytimeSlots, ...nighttimeSlots],

    // PER HEAD RATES (per adult per hour) - SINGLE RATES, not per slot
    rates: {
        owner: 100,   // Daytime rate
        renter: 150,
        household: 150,
    },
    // Nighttime rates (+₱50 per head for lighting)
    nighttimeRates: {
        owner: 150,   // Nighttime rate (+₱50)
        renter: 200,
        household: 200,
    },
    pricingMode: "perHead", // rate × duration × paying adults
    kidsFree: true, // kids 7 & below don't pay, only accompanying adults do
    requireContiguous: true,
    allowMultiple: true,
    payment: {
        methods: ["cash", "gcash", "cheque"],
        allowDownpayment: true,
        downpaymentOnly: true, // ONLY DOWNPAYMENT - no full payment (since sabi nila down muna)
        downpaymentPercent: 0.5,
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
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    const [bookedSlotIds, setBookedSlotIds] = useState([]);
    const [poolConfig, setPoolConfig] = useState(defaultPoolConfig);
    const [configLoading, setConfigLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setUserLoading(true);
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
                } finally {
                    setUserLoading(false);
                }
            } else {
                setUser(null);
                setUserData(null);
                setUserLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchPoolPricing = async () => {
            try {
                const docRef = doc(db, "courtPricing", "SwimmingPool");
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const pricingData = docSnap.data();
                    console.log("Pool pricing loaded from Firestore:", pricingData);
                    
                    setPoolConfig(prev => ({
                        ...prev,
                        rates: pricingData.rates || prev.rates,
                        slots: pricingData.slots || prev.slots,
                        pricingMode: pricingData.pricingMode || prev.pricingMode,
                        kidsFree: pricingData.kidsFree !== undefined ? pricingData.kidsFree : prev.kidsFree,
                        nighttimeRates: pricingData.nighttimeRates || prev.nighttimeRates,
                        requireContiguous: pricingData.requireContiguous !== undefined ? pricingData.requireContiguous : prev.requireContiguous,
                        payment: {
                            ...prev.payment,
                            ...pricingData.payment,
                            downpaymentPercent: pricingData.payment?.downpaymentPercent || prev.payment.downpaymentPercent,
                            downpaymentOnly: pricingData.payment?.downpaymentOnly !== undefined ? pricingData.payment.downpaymentOnly : prev.payment.downpaymentOnly,
                        },
                    }));
                } else {
                    console.log("No pool pricing found, using defaults");
                }
            } catch (error) {
                console.error("Error fetching pool pricing:", error);
            } finally {
                setConfigLoading(false);
            }
        };

        fetchPoolPricing();
    }, []);

    const handleDateChange = async (date) => {
        console.log("Date selected, ready for Firestore query:", date);
        
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
                where("venue", "==", "Swimming Pool"),
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
        console.log("Booking ready to save:", booking);
        
        try {
            if (!user) {
                throw new Error("You must be logged in to make a reservation");
            }

            const year = booking.date.getFullYear();
            const month = String(booking.date.getMonth() + 1).padStart(2, '0');
            const day = String(booking.date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            const finalResidentCategory = booking.residentCategory || userData?.residentCategory || "owner";

            const isNighttime = booking.slotIds.some(id => {
                const hour = parseInt(id.split('-')[0]);
                return hour >= 17; // 5:00 PM or later
            });

            // day & night diff price
            const rate = isNighttime 
                ? poolConfig.nighttimeRates?.[finalResidentCategory] || poolConfig.rates[finalResidentCategory]
                : poolConfig.rates[finalResidentCategory];

            // Calculate total: rate × duration × adults
            const adults = booking.adults || 0;
            const total = rate * booking.duration * adults;

            console.log("Is nighttime:", isNighttime);
            console.log("Rate used:", rate);
            console.log("Duration:", booking.duration);
            console.log("Adults:", adults);
            console.log("Total:", total);

            const reservationData = {
                venue: booking.venue,
                venueName: "Swimming Pool",
                residentName: booking.residentName,
                residentCategory: finalResidentCategory,
                uid: user.uid,
                userEmail: user.email,
                date: dateString,
                dateTimestamp: booking.date,
                slotIds: booking.slotIds,
                duration: booking.duration,
                
                // Pricing (perHead mode - rate × duration × paying adults) since wla pa final
                rate: rate,
                total: total,
                adults: adults,
                kids: booking.kids || 0,
                kidsFree: poolConfig.kidsFree,
                isNighttime: isNighttime,
                
                // Payment (ONLY DOWNPAYMENT - no full payment option)
                paymentMethod: booking.paymentMethod,
                paymentType: "downpayment",
                amountDue: total * (poolConfig.payment.downpaymentPercent || 0.5),
                downpaymentPercent: poolConfig.payment.downpaymentPercent || 0.5,
                
                note: booking.note || "",
                occasion: booking.occasion || "",
                status: "confirmed",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                ...booking.customFields,
            };

            console.log("Reservation data being saved:", reservationData);

            const docRef = await addDoc(collection(db, "reservations"), reservationData);
            
            console.log("Reservation saved successfully! ID:", docRef.id);
            return { id: docRef.id };
        } catch (error) {
            console.error("Error saving reservation:", error);
            throw new Error(error.message || "Failed to save reservation. Please try again.");
        }
    };

    console.log("Current userData:", userData);
    console.log("residentCategory being passed to ReservationFlow:", userData?.residentCategory);

    if (userLoading || configLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">
                        {userLoading ? "Loading user information..." : "Loading pricing information..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ReservationFlow
            config={poolConfig}
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
            customFields={customFields}
        />
    );
}

export default PoolReservationForm;