import { Link } from "react-router-dom";
import courtImg from "../../../assets/court.jpg";

function BasketballCourt() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      <div className="flex flex-col lg:flex-row min-h-screen">

        {/*image position adjust here na lang*/}
        <div className="relative lg:w-[35%] h-[350px] lg:h-screen overflow-hidden flex-shrink-0">

          <img
            src={courtImg}
            alt="Basketball Court"
            className="w-full h-full object-cover scale-105 transition duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

          <div className="absolute top-28 left-10">

            <div className="flex items-start gap-4">

              <div className="w-[5px] h-20 rounded-full bg-[var(--color-primary)]"></div>

              <div>

                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">Basketball</h1>

                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">Court</h1>

              </div>

            </div>

          </div>

        </div>

        {/*details part*/}
        <div className="lg:w-[65%] flex items-center justify-center py-16 lg:py-0">

          <div className="w-full max-w-5xl px-8 lg:px-20">

            <div className="w-24 h-1 rounded-full bg-[var(--color-secondary)] mb-6"></div>

            <h2 className="text-5xl font-bold text-[var(--color-primary)] mb-6">
              Reserve the Court
            </h2>

            <p className="text-lg lg:text-xl leading-9 text-[var(--color-black)] mb-12 max-w-4xl">
              Enjoy our basketball court for friendly games, tournaments,
              training sessions, and community activities. Residents may
              reserve the facility in advance to ensure their preferred
              schedule. Evening lighting is available during designated
              hours for night games.
            </p>

            {/*TIME (adjust AFTER interview)*/}

            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm">

              <div className="grid md:grid-cols-2">

                <div className="p-8 border-b md:border-b-0 md:border-r border-gray-200">

                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-primary)] font-semibold mb-2">Opening Hours</p>

                  <p className="text-3xl font-bold text-[var(--color-black)]">6:00 AM</p>

                </div>

                <div className="p-8">

                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-primary)] font-semibold mb-2">Closing Hours</p>

                  <p className="text-3xl font-bold text-[var(--color-black)]">11:59 PM</p>

                </div>

              </div>

              <div className="border-t border-gray-200 p-8">

                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-secondary)] font-semibold mb-2">Lighting Hours</p>

                <p className="text-3xl font-bold text-[var(--color-black)]">6:00 PM – 11:59 PM</p>

              </div>

            </div>

            <div className="mt-12 flex justify-center">

              <Link to="../reservation/court/reserve" className="btn-reservation px-12 py-4 text-lg shadow-lg hover:shadow-xl">Reserve</Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default BasketballCourt;