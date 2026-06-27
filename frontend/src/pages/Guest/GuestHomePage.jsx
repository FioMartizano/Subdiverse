import homeImage from "../../assets/home.jpg";
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
                className="bg-white py-15">
                    <div className="flex flex-row items-center justify-center gap-35 mt-8">

                        <h1 className="text-6xl font-bold text-gray-800">Logo</h1>

                        <h1 className="text-6xl font-bold text-gray-800">Logo</h1>

                        <h1 className="text-6xl font-bold text-gray-800">Logo</h1>

                        <h1 className="text-6xl font-bold text-gray-800">Logo</h1>

                        <h1 className="text-6xl font-bold text-gray-800">Logo</h1>

                        <h1 className="text-6xl font-bold text-gray-800">Logo</h1>

                        <h1 className="text-6xl font-bold text-gray-800">Logo</h1>


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