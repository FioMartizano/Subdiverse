import homeImage from "../../assets/home.jpg";
import wwhsLogo from "../../assets/wwhs-logo.png";
import filinvestLogo from "../../assets/filinvest-logo.png";
import abHome from "../../assets/aboutUsHome.jpg";
import hoaGuest from "../../assets/hoaGuest.jpg";
import seniorGuest from "../../assets/seniorGuest.jpg";
import healthGuest from "../../assets/healthCareGuest.jpg";
import churchGuest from "../../assets/churchGuest.jpg";
import AnimatedShape from "../../components/AnimatedShape";


const logos = [wwhsLogo, filinvestLogo];
const repeated = Array(5).fill(logos).flat();

function GuestHomePage() {
    return (
        <>
            {/*Hero Section*/}
            <section
                className="min-h-screen bg-cover bg-center flex items-center"
                style={{ backgroundImage: `url(${homeImage})`, }}
            >
                <div className="ml-20 max-w-4xl">
                    <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-bold drop-shadow-lg">
                        Windward Hills Subdivision
                    </h1>

                    <p className="text-white text-xl mt-6 leading-relaxed drop-shadow-md">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>

                    <div className="mt-8 flex gap-4">
                        <button className="btn-primary">
                            Sign Up
                        </button>
                    </div>
                </div>
            </section>

            {/*Logo Carousel Section*/}
            <section 
                className="bg-white py-10 md:py-15 overflow-hidden">
                    <style>{`
                        @keyframes logo-scroll {
                        from {transform: translateX(0);}
                        to {transform: translateX(-50%);}
                        }
                        .logo-track {
                            animation: logo-scroll 20s linear infinite;
                        }
                        .logo-track:hover {
                            animation-play-state: paused;
                        }
                        @media (prefers-reduced-motion: reduce) {
                        .logo-track{animation: none;}
                        }
                        `}</style>


                    <div className="logo-track flex items-center gap-8 md:gap-12 lg:gap-16">
                        {[...repeated, ...repeated].map((logo, i) => (
                            <img key={i} src={logo} alt={`Logo ${i}`} className="h-10 md:h-16 lg:h-45 w-auto flex-none" />
                        ))}
                    </div>

            </section>

            {/*About Section*/}
            <section
                className="min-h-screen flex items-center bg-primary">

                <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    <div className="w-full lg:w-3/5">
                        <img src={abHome} alt="About Us" className="w-full h-64 md:h-80 lg:h-[680px] object-cover rounded-2xl shadow-lg" />
                    </div>

                    
                    <div className="w-full lg:w-1/2 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="rounded-full bg-secondary px-6 py-2 shadow-lg">

                            </div>
                        <p className="text-white text-lg md:text-xl lg:text-2xl font-semibold mb-2 ">
                            Windward Hills Subdivision
                        </p>
                        </div>

                        <h2 className="text-secondary text-4xl md:text-5xl lg:text-8xl font-bold drop-shadow-lg">
                                About Us
                            </h2>

                        <p className="mt-6 text-2xl leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                    </div>
                </div>
            
            </section>

            {/*Offices Section*/}

            <div className="relative bg-white overflow-hidden">
                <AnimatedShape
                    className="w-[160px] h-[280px] md:w-[220px] md:h-[380px] lg:w-[296px] lg:h-[513px] -right-[104px] md:-right-[143px] lg:-right-[192px] top-150"
                    range={[0, -400]}
                />
                <AnimatedShape
                    className="w-[160px] h-[280px] md:w-[220px] md:h-[380px] lg:w-[296px] lg:h-[513px] -left-[104px] md:-left-[143px] lg:-left-[192px] top-280 !bg-primary"
                    range={[0, -400]}
                />

               <section className="relative z-10 min-h-screen py-20">
                    {/* Office Section */}
                    <div className="mx-auto max-w-4xl px-6 text-center mt-20">
                        <h1 className="text-primary text-4xl md:text-6xl lg:text-7xl font-bold">
                            Windward Hills Offices
                        </h1>

                        <p className="text-secondary mt-6 text-lg md:text-xl lg:text-2xl leading-relaxed">
                            - Windward Hills Subdivision, Burol 1 -
                        </p>
                    </div>

                    {/* Office Cards */}
                    <div className="mx-auto mt-16 max-w-7xl px-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="overflow-hidden rounded-2xl shadow-lg">
                                <img
                                    src={hoaGuest}
                                    alt="HOA Office"
                                    className="aspect-[2/3] w-full object-cover"
                                />
                            </div>

                            <div className="overflow-hidden rounded-2xl shadow-lg">
                                <img
                                    src={seniorGuest}
                                    alt="Senior Office"
                                    className="aspect-[2/3] w-full object-cover"
                                />
                            </div>

                            <div className="overflow-hidden rounded-2xl shadow-lg">
                                <img
                                    src={healthGuest}
                                    alt="Health Office"
                                    className="aspect-[2/3] w-full object-cover"
                                />
                            </div>

                            <div className="overflow-hidden rounded-2xl shadow-lg">
                                <img
                                    src={churchGuest}
                                    alt="Church Office"
                                    className="aspect-[2/3] w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 py-20">
                    {/* contact content */}
                    <div className="max-w-4xl pl-30">
                        <p className="text-2xl text-primary py-3">Contact Us</p>
                        <h1 className="text-secondary text-2xl md:text-4xl lg:text-7xl font-bold">
                            Get in Touch
                        </h1>
                    </div>

                    <div className="max-w-4xl pl-60 py-15 mt-6 space-y-2">
                        <h2 className="text-primary text-base md:text-lg lg:text-xl font-semibold">
                            Contact Number
                        </h2>
                        <p className="text-secondary">Email: hoa@example.com</p>
                        <h2 className="text-primary text-base md:text-lg lg:text-xl font-semibold">
                            Email Address
                        </h2>
                        <p className="text-secondary">Phone: (123) 456-7890</p>

                        <h2 className="text-primary text-base md:text-lg lg:text-xl font-semibold">
                            Address
                        </h2>
                        <p className="text-secondary">Address: 123 Windward Hills, Burol 1, City, Country</p>
                    </div>

                    
                </section>
            </div>


        </>
    );
}

export default GuestHomePage;