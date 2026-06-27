import { Link } from "react-router-dom";

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
        <section className="h-[85vh] bg-cover bg-center flex items-center relative" style={{ backgroundImage: `url(${reservationImage})` }}>
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

    </>
  );
}


export default ReservationHome;