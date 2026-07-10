import { Link } from "react-router-dom";
import {CircleCheckBig, Shirt, ShowerHead, UtensilsCrossed, PersonStanding, VolumeX, Trash2,} from "lucide-react";

import poolHome from "../../../assets/poolHome.jpg";
import poolImg from "../../../assets/pool.jpg";

export default function SwimmingPool() {
  return (
    <div className="pt-20">

      {/*HERO SECTION*/}
      <section
        className="relative h-[60vh] bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${poolHome})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent"></div>

        <div className="relative z-10 ml-10 lg:ml-24 max-w-3xl">

          <div className="border-l-[8px] border-[var(--color-primary)] pl-6">

            <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
              Plan Now,
              <br />
              Swim Later
            </h1>

            <p className="mt-6 text-xl text-gray-200 max-w-xl">
              Reserve our subdivision swimming pool for birthdays,
              family gatherings, recreational activities, and relaxing
              weekends.
            </p>

            <div className="mt-10">
              <Link
                to="/reservation/pool/reserve"
                className="btn-reservation inline-block"
              >
                Reserve Now
              </Link>
            </div>

          </div>

        </div>

      </section>

      {/*FEATURES - TO EDIT PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA*/}
      <section className="bg-white py-24 px-8 lg:px-28">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <img
              src={poolImg}
              alt="Swimming Pool"
              className="rounded-3xl shadow-xl w-full h-[430px] object-cover"
            />

          </div>

          <div>

            <h3 className="text-[var(--color-primary)] text-3xl font-bold">
              Features
            </h3>

            <div className="w-20 h-1 bg-[var(--color-primary)] rounded-full mt-3 mb-8"></div>

            <div className="space-y-5 text-lg">

              <div className="flex items-start gap-4">

                <CircleCheckBig
                  size={22}
                  className="text-[var(--color-primary)] mt-1 flex-shrink-0"
                />

                <p>
                  <strong>Pool Type:</strong> Outdoor
                </p>

              </div>

              <div className="flex items-start gap-4">

                <CircleCheckBig
                  size={22}
                  className="text-[var(--color-primary)] mt-1 flex-shrink-0"
                />

                <p>
                  <strong>Pool Size:</strong> 25m (Length) × 12m (Width)
                </p>

              </div>

              <div className="flex items-start gap-4">

                <CircleCheckBig
                  size={22}
                  className="text-[var(--color-primary)] mt-1 flex-shrink-0"
                />

                <div>

                  <strong>Depth Levels:</strong>

                  <ul className="list-disc ml-6 mt-2 text-gray-700">
                    <li>Shallow End: 3.5 feet</li>
                    <li>Deep End: 6.0 feet</li>
                  </ul>

                </div>

              </div>

              <div className="flex items-start gap-4">

                <CircleCheckBig
                  size={22}
                  className="text-[var(--color-primary)] mt-1 flex-shrink-0"
                />

                <p>
                  <strong>Operating Hours:</strong> 8:00 AM – 8:00 PM
                </p>

              </div>

              <div className="flex items-start gap-4">

                <CircleCheckBig
                  size={22}
                  className="text-[var(--color-primary)] mt-1 flex-shrink-0"
                />

                <p><strong>Maximum Capacity:</strong> 50 Persons</p>

              </div>

              <div className="flex items-start gap-4">

                <CircleCheckBig
                  size={22}
                  className="text-[var(--color-primary)] mt-1 flex-shrink-0"
                />

                <p>
                  <strong>Amenities:</strong> Shower Area, Lounge Chairs
                </p>

              </div>

            </div>

            <p className="mt-10 text-gray-600 text-lg leading-8">
              The first blahblah hours are included in every reservation.
              Additional charges may apply for extended one hours eme eme reservations.
            </p>
          </div>
        </div>
      </section>

    {/*TO EDIT mga wording*/}
      <section className="bg-white px-8 lg:px-28 pb-24">

        <div className="border-t border-[var(--color-primary)]/30 pt-20">

          <div className="grid lg:grid-cols-2 gap-20 items-center">

            <div>

              <h3 className="text-[var(--color-primary)] text-2xl font-bold">
                Events
              </h3>

              <div className="w-16 h-1 bg-[var(--color-primary)] rounded-full mt-3 mb-8"></div>

              <h2 className="text-5xl font-bold leading-tight text-gray-900">
                Plan Your Private
                <br />
                Event at the Pool
              </h2>

              <p className="mt-8 text-lg leading-8 text-gray-600 max-w-md">
                Celebrate birthdays, family gatherings, small get-togethers,
                or simply enjoy a relaxing day with friends and loved ones
                in a safe and refreshing environment.
              </p>

              <div className="mt-12">

                <Link to="/reservation/pool" className="btn-reservation inline-block">Book Now</Link>

              </div>

            </div>

            <div>

              <img
                src={poolImg}
                alt="Pool Event"
                className="w-full h-[420px] object-cover rounded-3xl shadow-xl"
              />

            </div>

          </div>

        </div>

      </section>

      {/*POOL GUIDELINES -- pending after interview*/}
      <section className="px-8 lg:px-28 pb-24">

        <div className="bg-green-50 rounded-3xl shadow-lg py-16 px-10">

          <div className="text-center">

            <h2 className="text-4xl font-bold text-[var(--color-primary)]">
              Pool Guidelines
            </h2>

            <div className="w-20 h-1 bg-[var(--color-primary)] rounded-full mx-auto mt-4 mb-12"></div>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:-translate-y-1 transition">

              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto mb-6">
                <Shirt size={30} />
              </div>

              <p className="text-lg font-medium">Proper swimwear<br />is required.</p>

            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:-translate-y-1 transition">

              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto mb-6">
                <ShowerHead size={30} />
              </div>

              <p className="text-lg font-medium">Shower before<br />entering the pool.</p>

            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:-translate-y-1 transition">

              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto mb-6">
                <UtensilsCrossed size={30} />
              </div>

              <p className="text-lg font-medium">No food or drinks<br />inside the pool area.</p>

            </div>
                <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:-translate-y-1 transition">

              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto mb-6">
                <PersonStanding size={30} />
              </div>

              <p className="text-lg font-medium">No running or<br />rough play.</p>

            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:-translate-y-1 transition">

              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto mb-6">
                <VolumeX size={30} />
              </div>

              <p className="text-lg font-medium">Keep the noise<br />level down.</p>

            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:-translate-y-1 transition">

              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto mb-6">
                <Trash2 size={30} />
              </div>

              <p className="text-lg font-medium">Please keep the area<br />clean and tidy.</p>

            </div>

          </div>

          <p className="text-center text-xl text-gray-700 mt-14">
            Thank you for helping us keep the pool safe and enjoyable for everyone!
          </p>

        </div>

      </section>

    </div>
  );
}