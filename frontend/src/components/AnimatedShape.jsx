import { motion } from "framer-motion";

const AnimatedShape = ({ 
    className, 
    xRange, 
    yRange, 
    rotateRange, 
    scaleRange, 
    duration = 20,
    animateType = "scroll", // "scroll" or "loop"
    style = {}              // Accepts your CSS variables
}) => {
    
    // LOOP MODE: Endless floating animation
    if (animateType === "loop") {
        return (
            <motion.div
                className={`absolute rounded-full mix-blend-multiply ${className}`}
                style={style}
                animate={{
                    x: xRange,
                    y: yRange,
                    rotate: rotateRange,
                    scale: scaleRange,
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
            />
        );
    }

    // SCROLL MODE (Default): Parallax scroll setup
    return (
        <motion.div
            className={`absolute rounded-full mix-blend-multiply ${className}`}
            style={{
                ...style,
                x: xRange,
                y: yRange,
                rotate: rotateRange,
                scale: scaleRange,
            }}
        />
    );
};

export default AnimatedShape;