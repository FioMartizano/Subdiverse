import { useState, useEffect, useRef } from "react";
import {Car, Bike,FileText,Upload,BadgeCheck,LoaderCircle,Clock3,CircleCheckBig,CircleX,Plus,CheckCircle2} from "lucide-react";

import { auth, db } from "../../firebase";
import {collection,addDoc,getDocs,getDoc,doc,query,where,serverTimestamp,setDoc} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { uploadImage } from "../../services/cloudinary";

import stickerImg from "../../assets/VehicleStickerBg.jpg";
import gcash from "../../assets/gcash.jpg";

export default function VehicleSticker() {

  const [formData, setFormData] = useState({
    vehicleType: "",
    plateNumber: "",
  });

  const [resident, setResident] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingResident, setLoadingResident] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [orcrFile, setOrcrFile] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);

  const orcrInputRef = useRef(null);
  const receiptInputRef = useRef(null);

  const [pricing, setPricing] = useState({
    homeownerCarPrice: 150,
    homeownerMotorcyclePrice: 100,
    homeownerTribikePrice: 120,

    renterCarPrice: 200,
    renterMotorcyclePrice: 150,
    renterTribikePrice: 170,

    householdCarPrice: 180,
    householdMotorcyclePrice: 130,
    householdTribikePrice: 150,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStickerFee = () => {
    if (!resident) return 0;

    const category = resident.residentCategory?.toLowerCase();
    const vehicle = formData.vehicleType.toLowerCase();

    if (category === "homeowner") {
      if (vehicle === "car") return pricing.homeownerCarPrice;
      if (vehicle === "motorcycle") return pricing.homeownerMotorcyclePrice;
      if (vehicle === "tri-bike") return pricing.homeownerTribikePrice;
    }
    if (category === "renter") {
      if (vehicle === "car") return pricing.renterCarPrice;
      if (vehicle === "motorcycle") return pricing.renterMotorcyclePrice;
      if (vehicle === "tri-bike") return pricing.renterTribikePrice;
    }
    if (category === "household") {
      if (vehicle === "car") return pricing.householdCarPrice;
      if (vehicle === "motorcycle") return pricing.householdMotorcyclePrice;
      if (vehicle === "tri-bike") return pricing.householdTribikePrice;
    }

    return 0;
  };

  const selectedFee = getStickerFee();

  // Load all applied vehicle sticker applications of the current resident
  const loadApplications = async (residentId) => {
    try {

      console.log("Loading applications for Resident ID:", residentId);

      const q = query(
        collection(db, "vehicleStickerApplications"),
        where("residentId", "==", residentId)
      );

      const snapshot = await getDocs(q);

      console.log("Documents Found:", snapshot.size);

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      list.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      console.log("Applications:", list);

      setApplications(list);

    } catch (error) {
      console.error("Load Applications Error:", error);
    }
  };
  useEffect(() => {

  const unsubscribe = onAuthStateChanged(auth, async (user) => {

    if (!user) {
      setLoadingResident(false);
      return;
    }

    try {

      //resident logged in
      const residentQuery = query(
        collection(db, "residents"),
        where("email", "==", user.email)
      );

      const residentSnapshot = await getDocs(residentQuery);

      if (residentSnapshot.empty) {
        console.log("Resident not found.");
        return;
      }

      const residentDoc = residentSnapshot.docs[0];

      const residentInfo = {
        id: residentDoc.id,
        ...residentDoc.data(),
      };

      console.log("Resident Loaded:", residentInfo);

      setResident(residentInfo);

      //price
      const settingsRef = doc(db, "vehicleSticker", "settings");

      const settingsSnap = await getDoc(settingsRef);

      if (!settingsSnap.exists()) {

        const defaultPricing = {
          homeownerCarPrice: 150,
          homeownerMotorcyclePrice: 100,
          homeownerTribikePrice: 120,

          renterCarPrice: 200,
          renterMotorcyclePrice: 150,
          renterTribikePrice: 170,

          householdCarPrice: 180,
          householdMotorcyclePrice: 130,
          householdTribikePrice: 150,
        };

        await setDoc(settingsRef, defaultPricing);

        setPricing(defaultPricing);

      } else {

        setPricing(settingsSnap.data());

      }

      // Load ALL applications of this resident
      await loadApplications(residentInfo.id);

    } catch (error) {

      console.error("Vehicle Sticker Error:", error);
      alert(error.message);

    } finally {

      setLoadingResident(false);

    }

  });

  return () => unsubscribe();

}, []);
const handleSubmit = async (e) => {

  e.preventDefault();

  if (!resident) {
    alert("Resident information not found.");
    return;
  }

  if (!formData.vehicleType) {
    alert("Please select a vehicle type.");
    return;
  }

  if (!formData.plateNumber.trim()) {
    alert("Please enter your plate number.");
    return;
  }

  if (!orcrFile) {
    alert("Please upload your OR/CR.");
    return;
  }

  if (!receiptFile) {
    alert("Please upload your payment receipt.");
    return;
  }

  try {

    setSubmitting(true);

    const uploadedOrcr = await uploadImage(orcrFile, "vehicleSticker");

    const uploadedReceipt = await uploadImage(receiptFile, "vehicleSticker");

    const applicationData = {

      residentId: resident.id,

      residentInfo: {
        firstName: resident.firstName,
        lastName: resident.lastName,
        fullName: `${resident.firstName} ${resident.lastName}`,
        residentCategory: resident.residentCategory,
        contactNumber: resident.contactNumber,
        email: resident.email,
      },

      vehicleInfo: {
        vehicleType: formData.vehicleType,
        plateNumber: formData.plateNumber.trim().toUpperCase(),
      },

      stickerFee: selectedFee,

      orcrInfo: {
        fileName: orcrFile.name,
        fileSize: orcrFile.size,
        fileType: orcrFile.type,
        secureUrl: uploadedOrcr.secureUrl,
        publicId: uploadedOrcr.publicId,
        resourceType: uploadedOrcr.resourceType,
        uploadStatus: "uploaded",
      },

      receiptInfo: {
        fileName: receiptFile.name,
        fileSize: receiptFile.size,
        fileType: receiptFile.type,
        secureUrl: uploadedReceipt.secureUrl,
        publicId: uploadedReceipt.publicId,
        resourceType: uploadedReceipt.resourceType,
        uploadStatus: "uploaded",
      },

      status: "Pending",
      remarks: "",
      createdAt: serverTimestamp(),

    };

    const docRef = await addDoc(
      collection(db, "vehicleStickerApplications"),
      applicationData
    );

    console.log("Application Saved:", docRef.id);

    // Reload all applications for this resident
    await loadApplications(resident.id);

    // Clear form
    setFormData({
      vehicleType: "",
      plateNumber: "",
    });

    setOrcrFile(null);
    setReceiptFile(null);

    setFormData({
      vehicleType: "",
      plateNumber: "",
    });

    setOrcrFile(null);
    setReceiptFile(null);

    if (orcrInputRef.current) {
      orcrInputRef.current.value = "";
    }

    if (receiptInputRef.current) {
      receiptInputRef.current.value = "";
    }

    alert("Vehicle Sticker Application Submitted Successfully!");

  } catch (error) {

    console.error("Submit Error:", error);

    alert(error.message);

  } finally {

    setSubmitting(false);

  }

};

return (
  <div className="pt-20">
    <section className="bg-white pt-10 pb-20 px-8 lg:px-28">

      <div className="text-center max-w-4xl mx-auto">

        <h1 className="text-5xl lg:text-6xl font-bold text-[var(--color-primary)]">
          Vehicle Sticker Application
        </h1>

        <p className="mt-8 text-lg leading-8 text-gray-600">
          Apply for a new vehicle sticker or renew your existing one.
          Vehicle Stickers help identify authorized resident
          vehicles and support subdivision security and access.
        </p>

      </div>

    </section>
{/*TOP IMAGE */}
    <section className="pb-24">

      <div className="overflow-hidden shadow-xl">

        <img
          src={stickerImg}
          alt="Vehicle Sticker"
          className="w-full h-[500px] object-cover"
        />

      </div>

    </section>

    {/*Vehicle Sticker Fees*/}

    <section className="bg-white px-8 lg:px-28 pb-24">

      <div className="border-t border-[var(--color-primary)]/20 pt-20">

        <h2 className="text-4xl font-bold text-[var(--color-primary)] text-center">
          Vehicle Sticker Fee
        </h2>

        <div className="w-24 h-1 bg-[var(--color-primary)] rounded-full mx-auto mt-4 mb-14"></div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Car */}

          <div className="rounded-3xl shadow-lg border border-gray-200 p-10 hover:-translate-y-2 transition">

            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-8">

              <Car
                size={32}
                className="text-[var(--color-primary)]"
              />

            </div>

            <h3 className="text-2xl font-bold">
              Car
            </h3>

            <p className="text-gray-500 mt-2">
              Four-wheeled Vehicle
            </p>

            <p className="mt-8 text-4xl font-bold text-[var(--color-secondary)]">

              ₱{pricing.homeownerCarPrice}

            </p>

            <p className="text-gray-500 mt-2">
              Starting price (depends on Resident Category)
            </p>

          </div>

          {/* Motorcycle */}

          <div className="rounded-3xl shadow-lg border border-gray-200 p-10 hover:-translate-y-2 transition">

            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-8">

              <Bike
                size={32}
                className="text-[var(--color-primary)]"
              />

            </div>

            <h3 className="text-2xl font-bold">
              Motorcycle
            </h3>

            <p className="text-gray-500 mt-2">
              Two-wheeled Vehicle
            </p>

            <p className="mt-8 text-4xl font-bold text-[var(--color-secondary)]">

              ₱{pricing.homeownerMotorcyclePrice}

            </p>

            <p className="text-gray-500 mt-2">
              Starting price (depends on Resident Category)
            </p>

          </div>

          {/* Tri-bike */}

          <div className="rounded-3xl shadow-lg border border-gray-200 p-10 hover:-translate-y-2 transition">

            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-8">

              <Car
                size={32}
                className="text-[var(--color-primary)]"
              />

            </div>

            <h3 className="text-2xl font-bold">
              Tri-Bike
            </h3>

            <p className="text-gray-500 mt-2">
              Three-wheeled Vehicle
            </p>

            <p className="mt-8 text-4xl font-bold text-[var(--color-secondary)]">

              ₱{pricing.homeownerTribikePrice}

            </p>

            <p className="text-gray-500 mt-2">
              Starting price (depends on Resident Category)
            </p>

          </div>

        </div>

      </div>

    </section>

    {/* Vehicle Information */}

    <section className="bg-white px-8 lg:px-28 pb-24">

      <div className="border-t border-[var(--color-primary)]/20 pt-20">

        <div className="grid lg:grid-cols-2 gap-14">

          <div>

            <h2 className="text-4xl font-bold text-[var(--color-primary)]">
              Vehicle Information
            </h2>

            <div className="w-20 h-1 bg-[var(--color-primary)] rounded-full mt-4 mb-10"></div>

            {/* Resident Information */}

            <div className="mb-8 rounded-2xl border border-green-100 bg-green-50 p-6">

              <h3 className="font-bold text-lg text-[var(--color-primary)] mb-4">
                Resident Information
              </h3>

              {loadingResident ? (

                <div className="flex justify-center">

                  <LoaderCircle
                    className="animate-spin text-[var(--color-primary)]"
                  />

                </div>

              ) : resident && (

                <div className="space-y-3 text-gray-700">

                  <div className="flex justify-between">

                    <span>Name</span>

                    <span className="font-semibold">

                      {resident.firstName} {resident.lastName}

                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span>Resident Category</span>

                    <span className="font-semibold">

                      {resident.residentCategory}

                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span>Contact Number</span>

                    <span className="font-semibold">

                      {resident.contactNumber}

                    </span>

                  </div>

                </div>

              )}

            </div>

            <form className="space-y-8">

              {/*Vehicle Type*/}

              <div>

                <label className="block text-gray-700 font-semibold mb-3">
                  Vehicle Type
                </label>

                <select
                  required
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-5 py-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                >

                  <option value="">
                    Select Vehicle Type
                  </option>

                  <option value="Car">
                    Car (Four-wheeled Vehicle)
                  </option>

                  <option value="Motorcycle">
                    Motorcycle (Two-wheeled Vehicle)
                  </option>

                  <option value="Tri-Bike">
                    Tri-Bike (Three-wheeled Vehicle)
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-gray-700 font-semibold mb-3">
                  Plate Number
                </label>

                <input
                  required
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  placeholder="Enter Plate Number"
                  className="w-full border border-gray-300 rounded-xl px-5 py-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />

              </div>

            </form>

          </div>
          {/*payment*/}

          <div>

            <div className="bg-green-50 rounded-3xl shadow-lg p-10">

              <h2 className="text-3xl font-bold text-[var(--color-primary)]">
                Payment
              </h2>

              <div className="w-20 h-1 bg-[var(--color-primary)] rounded-full mt-4 mb-8"></div>

              <p className="text-gray-600 leading-8">

                Scan the QR code below using GCash.
                After payment, upload your payment receipt
                together with your OR/CR in the next section.

              </p>

              <div className="flex justify-center mt-10">

                <img
                  src={gcash}
                  alt="GCash QR"
                  className="w-64 rounded-2xl shadow-md border"
                />

              </div>

              <div className="mt-10 rounded-2xl bg-white border border-gray-200 p-8">

                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Payment Summary
                </h3>

                <div className="flex justify-between py-3 border-b">

                  <span className="text-gray-600">
                    Resident Category
                  </span>

                  <span className="font-semibold">
                    {resident?.residentCategory || "-"}
                  </span>

                </div>

                <div className="flex justify-between py-3 border-b">

                  <span className="text-gray-600">
                    Vehicle Type
                  </span>

                  <span className="font-semibold">
                    {formData.vehicleType || "-"}
                  </span>

                </div>

                <div className="flex justify-between py-3">

                  <span className="text-gray-600">
                    Sticker Fee
                  </span>

                  <span className="text-2xl font-bold text-[var(--color-secondary)]">

                    {selectedFee
                      ? `₱${selectedFee}`
                      : "₱0"}

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

    {/*Required Documents*/}

    <section className="bg-white px-8 lg:px-28 pb-24">

      <div className="border-t border-[var(--color-primary)]/20 pt-20">

        <h2 className="text-4xl font-bold text-[var(--color-primary)] text-center">
          Required Documents
        </h2>

        <div className="w-24 h-1 bg-[var(--color-primary)] rounded-full mx-auto mt-4 mb-14"></div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* OR/CR */}

          <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-10">

            <div className="flex items-center gap-4 mb-6">

              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">

                <FileText
                  size={28}
                  className="text-[var(--color-primary)]"
                />

              </div>

              <h3 className="text-2xl font-bold">
                OR / CR
              </h3>

            </div>

            <p className="text-gray-600 mb-8 leading-7">

              Upload a clear copy of your Official Receipt (OR)
              and Certificate of Registration (CR).

            </p>
          <input
            ref={orcrInputRef}
            required
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => setOrcrFile(e.target.files[0])}
            className="block w-full text-gray-700
            file:mr-4
            file:rounded-lg
            file:border-0
            file:bg-[var(--color-primary)]
            file:px-5
            file:py-3
            file:text-white
            hover:file:bg-green-700"
          />

          {orcrFile && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
              <CheckCircle2
                size={18}
                className="text-green-600"
              />
              <span className="text-sm font-medium text-green-700 truncate">
                {orcrFile.name}
              </span>
            </div>
          )}

          </div>

          {/* Receipt */}

          <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-10">

            <div className="flex items-center gap-4 mb-6">

              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">

                <Upload
                  size={28}
                  className="text-[var(--color-secondary)]"
                />

              </div>

              <h3 className="text-2xl font-bold">
                Payment Receipt
              </h3>

            </div>

            <p className="text-gray-600 mb-8 leading-7">

              Upload your GCash payment receipt after completing
              the required payment.

            </p>

          <input
            ref={receiptInputRef}
            required
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => setReceiptFile(e.target.files[0])}
            className="block w-full text-gray-700
            file:mr-4
            file:rounded-lg
            file:border-0
            file:bg-[var(--color-secondary)]
            file:px-5
            file:py-3
            file:text-white    
            hover:file:bg-orange-600"
          />

          {receiptFile && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
              <CheckCircle2
                size={18}
                className="text-green-600"
              />
              <span className="text-sm font-medium text-green-700 truncate">
                {receiptFile.name}
              </span>
            </div>
          )}
          </div>

        </div>

      </div>

    </section>

{/*Application Status*/}
<section className="px-8 lg:px-28 pb-24">

  <div className="bg-green-50 rounded-3xl shadow-lg p-12">

    <div className="flex items-center gap-5 mb-8">

      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">

        <BadgeCheck
          size={32}
          className="text-[var(--color-primary)]"
        />

      </div>

      <div>

        <h2 className="text-3xl font-bold text-[var(--color-primary)]">
          Application Status
        </h2>

        <p className="text-gray-500 mt-1">
          View the status of all your submitted vehicle sticker applications.
        </p>

      </div>

    </div>

    {loadingResident ? (

      <div className="flex justify-center py-12">

        <LoaderCircle
          size={42}
          className="animate-spin text-[var(--color-primary)]"
        />

      </div>

    ) : applications.length === 0 ? (

      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-white">

        <p className="text-gray-500 text-lg">

          Your vehicle sticker applications will appear here after submission.

        </p>

      </div>

    ) : (

      <div className="space-y-6">

        {applications.map((application) => (

          <div
            key={application.id}
            className="bg-white border border-gray-200 rounded-2xl shadow p-8 hover:shadow-lg transition"
          >

            <div className="flex flex-col lg:flex-row justify-between gap-8">

              <div>

                <h3 className="text-2xl font-bold text-gray-800">

                  {application.vehicleInfo.vehicleType}

                </h3>

                <p className="text-gray-500 mt-2">

                  Plate Number

                </p>

                <p className="font-semibold text-lg">

                  {application.vehicleInfo.plateNumber}

                </p>

                <p className="text-gray-500 mt-4">

                  Sticker Fee

                </p>

                <p className="text-2xl font-bold text-[var(--color-secondary)]">

                  ₱{application.stickerFee}

                </p>

              </div>

              <div className="lg:text-right">

                {application.status === "Pending" && (

                  <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full">

                    <Clock3 size={18} />

                    <span className="font-semibold">
                      Pending
                    </span>

                  </div>

                )}

                {application.status === "Approved" && (

                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">

                    <CircleCheckBig size={18} />

                    <span className="font-semibold">
                      Approved
                    </span>

                  </div>

                )}

                {application.status === "Rejected" && (

                  <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">

                    <CircleX size={18} />

                    <span className="font-semibold">
                      Rejected
                    </span>

                  </div>

                )}

                <div className="mt-6">

                  <p className="text-sm text-gray-500">

                    Admin Remarks

                  </p>

                  <p className="font-medium text-gray-800">

                    {application.remarks || "No remarks yet."}

                  </p>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    )}

  </div>

</section>

{/*Submit*/}

<section className="pb-28 text-center">

  <button
    onClick={handleSubmit}
    disabled={submitting}
    className="btn-reservation disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
  >

    {submitting ? (

      <>
        <LoaderCircle
          size={20}
          className="animate-spin"
        />

        <span>
          Submitting...
        </span>
      </>

    ) : (

      <>
        <Plus size={20} />

        <span>
          Submit Application
        </span>
      </>

    )}

  </button>

</section>

</div>

);
}