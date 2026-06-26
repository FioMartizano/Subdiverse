import aboutus_bg from "../../assets/aboutus_bg.jpg";

function AboutUs() {
    return (
        <>
            {/* White Container - Fixed behind GuestNavbar (only on this page) */}
            <div className="fixed top-0 z-0 bg-white shadow-md h-20 w-full">
                {/* This stays fixed behind GuestNavbar */}
            </div>

            {/* Hero Section */}
            <section
                className="relative min-h-screen bg-cover bg-center flex items-center justify-center text-center px-4 pt-20"
                style={{ backgroundImage: `url(${aboutus_bg})` }}
            >
                {/* Darker Overlay - Only covers the image area */}
                <div className="absolute inset-0 bg-black/40 z-5"></div>

                {/* Text Content Container - Above overlay */}
                <div className="max-w-3xl z-10 -mt-64">
                    <h1 className="text-white text-3xl md:text-5xl font-bold drop-shadow-lg tracking-tight">
                        Discover <br /> 
                        <span className="whitespace-nowrap">Windward Hills Subdivision</span>
                    </h1>

                    <p className="text-white text-sm md:text-base mt-4 max-w-xl mx-auto opacity-90 drop-shadow-md font-medium leading-relaxed">
                        Know our offices, member officials, and the history of your community, your home.
                    </p>
                </div>

                {/* SVG Bottom Wave Divider - NOT affected by overlay (higher z-index) */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
                    <svg 
                        className="relative block w-full h-[25vh] md:h-[30vh]" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 1440 320" 
                        preserveAspectRatio="none"
                    >
                       <path fill="#ffffff" fill-opacity="1" d="M0,192L34.3,176C68.6,160,137,128,206,133.3C274.3,139,343,181,411,186.7C480,192,549,160,617,128C685.7,96,754,64,823,80C891.4,96,960,160,1029,165.3C1097.1,171,1166,117,1234,128C1302.9,139,1371,213,1406,250.7L1440,288L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

{/* ================= ABOUT SECTION ================= */}
{/* Added extra top padding so the green circle doesn't get cut off */}
<section className="relative bg-white pt-28 pb-24 px-4 overflow-visible select-none">

    {/* ================= Decorative Background Circles ================= */}

    {/* Green Circle */}
    {/* Lowered so the top isn't clipped while keeping it outside the page */}
    <div
        className="
            absolute
            top-52
            -left-52
            w-[430px]
            h-[430px]
            rounded-full
            bg-emerald-800
            hidden
            md:block
            z-0
        "
    />

    {/* Orange Circle */}
    {/* Positioned on the bottom-right similar to the reference */}
    <div
        className="
            absolute
            bottom-8
            -right-36
            w-[330px]
            h-[330px]
            rounded-full
            bg-orange-500
            hidden
            md:block
            z-0
        "
    />

    <div className="max-w-6xl mx-auto relative z-10">

        {/* ================= Top Card Section with Map ================= */}
        <div className="grid md:grid-cols-12 items-center gap-6 md:gap-0">

            {/* Orange Card */}
            {/* Slightly overlaps the map */}
            <div
                className="
                    md:col-span-5
                    bg-orange-500
                    rounded-2xl
                    p-8
                    text-white
                    shadow-xl
                    relative
                    z-20
                    md:translate-x-16
                "
            >
                <h2 className="text-3xl font-bold mb-2">
                    Lorem Ipsum
                </h2>

                <div className="w-12 h-1 bg-emerald-800 rounded mb-5"></div>

                <p className="leading-8">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
            </div>

            {/* Map */}
            <div
                className="
                    md:col-span-7
                    h-72
                    bg-gray-100
                    rounded-2xl
                    shadow-lg
                    overflow-hidden
                    relative
                "
            >
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://placehold.co/900x600')",
                    }}
                />
            </div>
        </div>

        {/* ================= History Card ================= */}
        {/* Separated from the top section with proper spacing */}
        <div className="max-w-5xl mx-auto mt-16 relative z-20">
            <div className="bg-emerald-800 rounded-3xl text-center text-white px-10 py-16 md:px-20 md:py-20 shadow-2xl">
                <h2 className="text-5xl font-bold mb-6">
                    Our History
                </h2>

                <p className="max-w-2xl mx-auto text-lg leading-8 opacity-90">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
            </div>
        </div>

    </div>
</section>

        </>
    );
}

export default AboutUs;