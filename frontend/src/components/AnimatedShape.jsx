import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

function AnimatedShape({ className = "", range = [0, -500] }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],  
    });
    const y = useTransform(scrollYProgress, [0, 1], range);

    return (
        <motion.div
            ref={ref}
            style={{ y }}
            className={`absolute rounded-[50%] bg-secondary z-0 ${className}`}
        />
    );
}

export default AnimatedShape;