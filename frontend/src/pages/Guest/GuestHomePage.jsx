import homeImage from "../../assets/home.jpg";
import wwhsLogo from "../../assets/wwhs-logo.png";
import filinvestLogo from "../../assets/filinvest-logo.png";

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
                className="bg-primary min-h-screen flex flex-items-center"
                style={{
                    backgroundColor: "var(--color-primary)"
                }}>

            </section>
        </>
    );
}

export default GuestHomePage;