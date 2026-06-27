import reservationImage from "../../../assets/home.jpg";

import clubhouseImg from "../../../assets/clubhouse.jpg";
import poolImg from "../../../assets/pool.jpg";
import courtImg from "../../../assets/court.jpg";


function ReservationHome() {

  const amenities = [
    {
      title: "Clubhouse",
      image: clubhouseImg,
      description: "A place for gatherings, events, and community activities."
    },
    {
      title: "Swimming Pool",
      image: poolImg,
      description: "Enjoy a relaxing swim with your family and friends."
    },
    {
      title: "Basketball Court",
      image: courtImg,
      description: "A space for sports, recreation, and community activities."
    },
  ];


  return (
    <>

      {/* HERO SECTION */}
      <section className="min-h-screen bg-cover bg-center flex items-center" style={{ backgroundImage: `url(${reservationImage})` }}>
        <div className="ml-20 max-w-3xl">

          <h1 className="text-secondary text-5xl md:text-7xl font-bold drop-shadow-lg">
            Amenities
            <br />
            Reservation
          </h1>

          <p className="text-white text-xl mt-6 leading-relaxed drop-shadow-md">
            Reserve our subdivision amenities for your events, gatherings, and recreational activities.
          </p>

        </div>
      </section>


      {/* AMENITIES SECTION */}
      <section className="bg-white py-16">

        <div className="flex flex-wrap justify-center gap-10">

          {amenities.map((amenity, index) => (

            <div key={index} className="w-72 bg-white rounded-xl shadow-lg overflow-hidden">

              <div className="relative">

                <img src={amenity.image} alt={amenity.title} className="w-full h-48 object-cover" />

                <h2 className="absolute bottom-3 left-4 text-white text-xl font-bold drop-shadow-lg">
                  {amenity.title}
                </h2>

              </div>


              <div className="p-5 text-center">

                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  {amenity.description}
                </p>

                <button className="btn-reservation">
                  Book Now
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

    </>
  );
}


export default ReservationHome;