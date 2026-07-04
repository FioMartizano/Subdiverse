import { motion } from "framer-motion";
import WindwardMap from "../../components/Maps/WindwardMap";

const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Contact() {
    return (
        <>
<section className="relative z-10 py-16">
                    <div className="max-w-7xl mx-auto px-6">

                        {/* Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="lg:pl-24"
                        >
                            <p className="text-base md:text-lg text-primary py-2">
                                Contact Us
                            </p>

                            <h1 className="text-secondary text-2xl md:text-4xl lg:text-5xl font-bold">
                                Get in Touch
                            </h1>
                        </motion.div>

                        {/* Content */}
                        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                            {/* Left */}
                            <motion.div
                                className="lg:pl-48 space-y-6"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                variants={staggerContainer}
                            >
                                <motion.div variants={staggerItem}>
                                    <h2 className="text-primary text-sm md:text-base lg:text-lg font-semibold">
                                        Contact Number
                                    </h2>
                                    <p className="text-secondary text-sm md:text-base">
                                        Phone: (123) 456-7890
                                    </p>
                                </motion.div>

                                <motion.div variants={staggerItem}>
                                    <h2 className="text-primary text-sm md:text-base lg:text-lg font-semibold">
                                        Email Address
                                    </h2>
                                    <p className="text-secondary text-sm md:text-base">
                                        Email: hoa@example.com
                                    </p>
                                </motion.div>

                                <motion.div variants={staggerItem}>
                                    <h2 className="text-primary text-sm md:text-base lg:text-lg font-semibold">
                                        Address
                                    </h2>
                                    <p className="text-secondary text-sm md:text-base">
                                        Windward Hills Subdivision
                                        <br />
                                        Burol I, Dasmariñas City
                                        <br />
                                        Cavite
                                    </p>
                                </motion.div>
                            </motion.div>

                            {/* Right */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="w-full -mt-16 lg:-ml-16"
                            >
                                <WindwardMap />
                            </motion.div>
                        </div>
                    </div>
                </section>
                </>
    );
}

export default Contact;