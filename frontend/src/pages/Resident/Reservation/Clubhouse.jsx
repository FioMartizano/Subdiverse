import { Link } from "react-router-dom";

import clubhouseHome from "../../../assets/clubhouseHome.jpg";
import clubhouseImg from "../../../assets/clubhouse.jpg";
import poolImg from "../../../assets/pool.jpg";

function Clubhouse() {
  return (
    <>

      <div className="pt-20">

        <section className="relative h-[60vh] bg-cover bg-center flex items-center" style={{ backgroundImage: `url(${clubhouseHome})` }}>

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          <div className="ml-10 lg:ml-24 max-w-3xl relative z-10">

            <p className="uppercase tracking-[0.35em] text-white font-semibold mb-5">Subdivision Amenities</p>

            <div className="flex items-start gap-5">

              <div className="w-[6px] h-24 rounded-full bg-[var(--color-secondary)] mt-2"></div>

              <div>

                <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight">Subdivision</h1>
                <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight">Clubhouse</h1>

              </div>

            </div>

            <p className="text-white text-xl leading-9 mt-8 max-w-2xl">
              Reserve our subdivision clubhouse for birthdays, family gatherings, meetings, and memorable celebrations with your loved ones.
            </p>

            <Link to="/reservation/clubhousePaymentS1" className="btn-reservation inline-block mt-10 shadow-xl">
              Reserve Now
            </Link>

          </div>

        </section>

      </div>

      {/*wave*/}

      <div className="-mt-1">

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 220" preserveAspectRatio="none" className="w-full h-[200px]">

          <path fill="var(--color-primary)" d="M0,128L60,112C120,96,240,64,360,69.3C480,75,600,117,720,133.3C840,149,960,139,1080,117.3C1200,96,1320,64,1380,48L1440,32L1440,0L0,0Z" />

        </svg>

      </div>

      {/*about clubhouse*/}

      <section className="bg-white pb-24">

        <div className="max-w-7xl mx-auto px-8">

          <div className="bg-[var(--color-secondary)] rounded-[40px] shadow-2xl overflow-hidden">

            <div className="grid lg:grid-cols-2 items-center">

              <div className="p-10 lg:p-16 text-white">

                <p className="uppercase tracking-[0.35em] font-semibold mb-4">Perfect Venue</p>

                <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-8">
                  Plan Your<br />Private Event
                </h2>

                <p className="text-lg leading-9 opacity-95">
                  Whether you're celebrating birthdays, anniversaries, meetings, reunions, seminars, or family gatherings, our subdivision clubhouse provides a spacious and comfortable venue for memorable occasions.
                </p>

              </div>

              {/* RIGHT */}

              <div className="p-8 lg:p-10">

                <div className="overflow-hidden rounded-3xl shadow-2xl">

                  <img
                    src={clubhouseImg}
                    alt="Clubhouse"
                    className="w-full h-[470px] object-cover transition duration-700 hover:scale-105"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
    
    {/*pool*/}
      <section className="py-24 bg-white">

        <div className="max-w-7xl mx-auto px-8">

          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/*poolimage used*/}

            <div className="order-2 lg:order-1">

              <div className="overflow-hidden rounded-[40px] shadow-2xl">

                <img
                  src={poolImg}
                  alt="Swimming Pool"
                  className="w-full h-[470px] object-cover transition duration-700 hover:scale-105"
                />

              </div>

            </div>


            <div className="order-1 lg:order-2">

              <p className="uppercase tracking-[0.35em] font-semibold text-[var(--color-secondary)] mb-4">
                Another Amenity
              </p>

              <div className="w-24 h-1 rounded-full bg-[var(--color-secondary)] mb-6"></div>

              <h2 className="text-4xl lg:text-5xl font-bold text-[var(--color-primary)] leading-tight mb-8">
                Relax and Enjoy<br />Our Swimming Pool
              </h2>

              <p className="text-lg leading-9 text-gray-600 mb-10">
                Cool off and unwind in our subdivision swimming pool. Whether you're spending quality time with your family, celebrating a special occasion, or simply enjoying a peaceful afternoon, the pool offers the perfect place to relax without leaving the neighborhood.
              </p>

              {/*details (edit?)*/}

              <div className="grid grid-cols-2 gap-5 mb-10">

                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition duration-300">

                  <h3 className="font-bold text-[var(--color-primary)] mb-2">Family Friendly</h3>

                  <p className="text-gray-600 text-sm leading-7">
                    Spacious swimming area suitable for residents of all ages.
                  </p>

                </div>

                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition duration-300">

                  <h3 className="font-bold text-[var(--color-primary)] mb-2">Perfect Getaway</h3>

                  <p className="text-gray-600 text-sm leading-7">
                    Ideal for birthdays, outings, and relaxing weekends.
                  </p>

                </div>

              </div>

              <Link to="/reservation/pool" className="btn-reservation inline-block shadow-lg">
                Explore Pool
              </Link>

            </div>

          </div>

        </div>

      </section>

    </>
  );
}

export default Clubhouse;