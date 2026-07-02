//firebase ready even the pending and the price can be changed for admin side later pagka gawa
// https://www.pexels.com/photo/row-of-shiny-vehicles-on-parking-lot-of-car-market-5864152/
import { useState } from "react";
import {
  Car,
  Bike,
  FileText,
  Upload,
  BadgeCheck,
} from "lucide-react";

import stickerImg from "../../assets/VehicleStickerBg.jpg";
import gcash from "../../assets/gcash.jpg";

export default function VehicleSticker() {
  const [formData, setFormData] = useState({
    vehicleType: "",
    plateNumber: "",
  });

  const [orcrFile, setOrcrFile] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStickerFee = () => {
    switch (formData.vehicleType) {
      case "Car":
        return 150;
      case "Motorcycle":
        return 100;
      case "Tri-Bike":
        return 120;
      default:
        return 0;
    }
  };

  const selectedFee = getStickerFee();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Firebase ditu 

    console.log(formData);
  };

  return (
    <div className="pt-20">

      {/*use this instead if want padding: <section className="bg-white py-20 px-8 lg:px-28">  */}

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

        {/*BG CAR IMAGE*/}

        <section className="pb-24">

          <div className="overflow-hidden shadow-xl">

            <img
              src={stickerImg}
              alt="Vehicle Sticker"
              className="w-full h-[500px] object-cover"
            />

          </div>

        </section>

      {/*FFES*/}

      <section className="bg-white px-8 lg:px-28 pb-24">

        <div className="border-t border-[var(--color-primary)]/20 pt-20">

          <h2 className="text-4xl font-bold text-[var(--color-primary)] text-center">
            Vehicle Sticker Fee
          </h2>

          <div className="w-24 h-1 bg-[var(--color-primary)] rounded-full mx-auto mt-4 mb-14"></div>

          <div className="grid md:grid-cols-3 gap-8">

            {/*Car*/}

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
                ₱150
              </p>

              <p className="text-gray-500 mt-2">
                Valid for one calendar year.
              </p>

            </div>

            {/*Motor*/}

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
                ₱100
              </p>

              <p className="text-gray-500 mt-2">
                Valid for one calendar year.
              </p>

            </div>

            {/*Tri-bike*/}

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
                ₱120
              </p>

              <p className="text-gray-500 mt-2">
                Valid for one calendar year.
              </p>

            </div>

          </div>

        </div>

      </section>
      {/*vehicle info*/}

      <section className="bg-white px-8 lg:px-28 pb-24">

        <div className="border-t border-[var(--color-primary)]/20 pt-20">

          <div className="grid lg:grid-cols-2 gap-14">

            {/* LEFT SIDE */}

            <div>

              <h2 className="text-4xl font-bold text-[var(--color-primary)]">
                Vehicle Information
              </h2>

              <div className="w-20 h-1 bg-[var(--color-primary)] rounded-full mt-4 mb-10"></div>

              <form className="space-y-8">

                {/*vehicle type*/}

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

            {/*right part*/}

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
      {/*required docu to submit*/}

      <section className="bg-white px-8 lg:px-28 pb-24">

        <div className="border-t border-[var(--color-primary)]/20 pt-20">

          <h2 className="text-4xl font-bold text-[var(--color-primary)] text-center">
            Required Documents
          </h2>

          <div className="w-24 h-1 bg-[var(--color-primary)] rounded-full mx-auto mt-4 mb-14"></div>

          <div className="grid lg:grid-cols-2 gap-10">

            {/*OR/CR*/}

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

            </div>

            {/*receipt dropbox*/}

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

            </div>

          </div>

        </div>

      </section>

      {/*application status (pending, approved, rejected - soon backend firebase apply here and fees incase admin want to update)*/}

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
                The status of your application will be displayed here.
              </p>

            </div>

          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-white">

            <p className="text-gray-500 text-lg">

              Your application status will appear here after submission.

            </p>

          </div>

        </div>

      </section>

      <section className="pb-28 text-center">

        <button
          onClick={handleSubmit}
          className="btn-reservation"
        >
          Submit Application
        </button>

      </section>

    </div>
  );
}