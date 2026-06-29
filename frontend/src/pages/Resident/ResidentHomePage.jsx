import { motion } from "framer-motion";
import residentHome from "../../assets/residentHome.jpeg";

function ResidentHomePage(){
    return (
        <>
            {/*Hero Section*/}
            <section
                className="min-h-screen bg-cover bg-center flex items-center"
                style={{ backgroundImage: `url(${residentHome})` }}
            >
                <div className="flex flex-col items-center justify-center h-screen w-full text-center max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="text-white text-5xl md:text-7xl lg:text-7xl font-bold drop-shadow-lg"
                    >
                        Hello, User!
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="text-white text-s mt-6 leading-relaxed drop-shadow-md"
                    >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                        className="mt-8 flex gap-4"
                    >
                    </motion.div>
                </div>
            </section>

            {/*Get Started Section*/}
            <section className="h-[80vh]">
                <div className="px-20 pt-20 flex items-start h-full w-full text-left">
                    <div className="w-2.5 h-13 bg-secondary rounded-full mr-3 mt-2"></div>
                    <div className="flex flex-col">
                        <h2 className="text-secondary text-4xl font-bold">Get Started,</h2>
                        <p className="text-primary font-bold">What would you like to do?</p>
                    </div>
                </div>
            </section>
        </>
    )
}
export default ResidentHomePage;