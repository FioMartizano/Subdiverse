import { Link } from "react-router-dom";
import {CheckCircle2,Gift} from "lucide-react";

/*PICTURES*/
import reservationImage from "../../../assets/reservationHome.jpg";
import clubhouseImg from "../../../assets/clubhouse.jpg";
import poolImg from "../../../assets/pool.jpg";
import courtImg from "../../../assets/court.jpg";



function ReservationHome() {

  const amenities = [
    {
      title: "Clubhouse",
      image: clubhouseImg,
      description: "A place for gatherings, events, and community activities.",
      link: "/reservation/clubhouse"
    },
    {
      title: "Swimming Pool",
      image: poolImg,
      description: "Enjoy a relaxing swim with your family and friends.",
      link: "/reservation/pool"
    },
    {
      title: "Basketball Court",
      image: courtImg,
      description: "A space for sports, recreation, and community activities.",
      link: "/reservation/court"
    },
  ];


  return (
    <>

      {/* HERO SECTION */}
      <div className="pt-20">
        <section className="h-[60vh] bg-cover bg-center flex items-center relative" style={{ backgroundImage: `url(${reservationImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>

          <div className="ml-20 -translate-y-6 max-w-3xl relative z-10">

            <p className="text-white uppercase tracking-widest font-semibold mb-4">
              Subdivision Facilities
            </p>

            <h1 className="text-white text-5xl md:text-7xl font-bold drop-shadow-lg">
              Amenities
              <br />
              <span className="text-secondary">
                Reservation
              </span>
            </h1>

            <p className="text-white text-xl mt-6 leading-relaxed drop-shadow-md">
              Reserve our subdivision amenities for your events, gatherings, and recreational activities.
            </p>

            <a href="#amenities" className="btn-reservation mt-8 inline-block">
              Explore Amenities
            </a>

          </div>
        </section>
      </div>



      {/* AMENITIES SECTION */}
      <section id="amenities" className="bg-white py-24">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary">
            Available Amenities
          </h2>

          <p className="text-gray-600 mt-3">
            Choose from our subdivision facilities and reserve your preferred space.
          </p>
        </div>



        <div className="flex flex-wrap justify-center gap-16 px-10">

          {amenities.map((amenity, index) => (

            <div key={index} className="w-96 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300">

              <div className="relative">

                <img src={amenity.image} alt={amenity.title} className="w-full h-56 object-cover" />

                <div className="absolute inset-0 bg-black/20"></div>

                <h2 className="absolute bottom-4 left-5 text-white text-2xl font-bold drop-shadow-lg">
                  {amenity.title}
                </h2>

              </div>


              <div className="p-8 text-center">

                <p className="text-gray-600 leading-relaxed mb-7">
                  {amenity.description}
                </p>

                <Link to={amenity.link} className="btn-reservation inline-block">
                  Book Now
                </Link>

              </div>

            </div>

          ))}

        </div>
      </section>

{/* ================= FEATURED EVENT PACKAGE ================= */}

<section className="bg-orange-50 py-24">

  <div className="max-w-7xl mx-auto px-8 lg:px-20">

    <div className="text-center mb-16">

      <div className="inline-flex items-center gap-2 bg-[var(--color-secondary)] text-white px-6 py-2 rounded-full shadow-md">

        <Gift size={18} />

        <span className="font-semibold tracking-wide">
          FEATURED EVENT PACKAGE
        </span>

      </div>

      <h2 className="text-5xl font-bold text-[var(--color-primary)] mt-8">
        Endless Celebrations,
        <br />
        Effortless Booking.
      </h2>

      <p className="text-gray-600 mt-6 text-lg max-w-3xl mx-auto leading-8">
      Hosting a birthday, reunion, or family gathering? Reserve our open-air Clubhouse Function Hall 
      alongside the Swimming Pool for a spacious, breezy, and completely unified event space. Experience
      an effortless outdoor celebration from start to finish.
      </p>

    </div>

    <div className="grid lg:grid-cols-2 gap-20 items-center">

      <div className="relative h-[520px]">

        <div className="absolute top-8 left-8 w-full h-full rounded-3xl bg-[var(--color-secondary)]/20"></div>

        {/*Function Hall*/}
        <img
          src={clubhouseImg}
          alt="Clubhouse"
          className="absolute left-0 top-0 w-[78%] h-[360px] rounded-3xl object-cover shadow-2xl"
        />

        {/*Pool*/}

        <img
          src={poolImg}
          alt="Swimming Pool"
          className="absolute bottom-0 right-0 w-[62%] h-[260px] rounded-3xl border-8 border-white object-cover shadow-2xl"
        />

        {/* Package Badge */}

        <div className="absolute top-6 right-4 bg-[var(--color-secondary)] text-white px-5 py-3 rounded-full shadow-lg">

          <span className="font-semibold">
            Package Offer
          </span>

        </div>

      </div>



      <div>

        <h3 className="text-4xl font-bold text-[var(--color-primary)] leading-tight">

          Clubhouse Function Hall +
          <br />
          Swimming Pool

        </h3>

        <div className="w-20 h-1 bg-[var(--color-secondary)] rounded-full mt-5 mb-10"></div>

        <div className="space-y-6">

          <div className="flex gap-4">

            <CheckCircle2
              size={24}
              className="text-[var(--color-primary)] mt-1"
            />

            <p className="text-lg text-gray-700">
              Reserve the Clubhouse Function Hall and Swimming Pool under one reservation.
            </p>

          </div>

          <div className="flex gap-4">

            <CheckCircle2
              size={24}
              className="text-[var(--color-primary)] mt-1"
            />

            <p className="text-lg text-gray-700">
              Perfect for birthdays, reunions, anniversaries, and family celebrations.
            </p>

          </div>

          <div className="flex gap-4">

            <CheckCircle2
              size={24}
              className="text-[var(--color-primary)] mt-1"
            />

            <p className="text-lg text-gray-700">
              Convenient package reservation with one payment process.
            </p>

          </div>

        </div>

        <Link
          to="/reservation/package"
          className="btn-reservation inline-block mt-12"
        >
          Reserve Event Package
        </Link>

      </div>

    </div>

  </div>

</section>

    </>
  );
}


export default ReservationHome;