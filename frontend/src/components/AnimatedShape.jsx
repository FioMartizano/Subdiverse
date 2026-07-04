import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const AnimatedShape = ({
    className,
    xRange,
    yRange,
    rotateRange,
    scaleRange,
    animateType = "scroll",
    style = {}
}) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Map scroll progress (0 to 1) to your provided ranges
    const x = useTransform(scrollYProgress, [0, 1], xRange);
    const y = useTransform(scrollYProgress, [0, 1], yRange);
    const rotate = useTransform(scrollYProgress, [0, 1], rotateRange);
    const scale = useTransform(scrollYProgress, [0, 1], scaleRange);

    if (animateType === "loop") {
        return (
            <motion.div
                className={`absolute rounded-full mix-blend-multiply ${className}`}
                style={style}
                animate={{ x: xRange, y: yRange, rotate: rotateRange, scale: scaleRange }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
        );
    }

    return (
        <motion.div
            ref={ref}
            className={`absolute rounded-full mix-blend-multiply blur-3xl opacity-60 ${className}`}
            style={{
                ...style,
                x,
                y,
                rotate,
                scale,
            }}
        />
    );
};

export default AnimatedShape;