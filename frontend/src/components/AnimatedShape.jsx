import { useScroll, useTransform, motion } from "framer-motion";

function AnimatedShape({ className = "", range = [0, -80]}) {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], range);

    return (
        <motion.div
        style={{ y }}
        className={`absolute rounded-[50%] bg-secondary z-0 ${className}`}
        />
    );
}

export default AnimatedShape;