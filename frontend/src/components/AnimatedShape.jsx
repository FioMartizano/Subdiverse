import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

function AnimatedShape({
  className = "",
  xRange = [0, 80],
  yRange = [0, -500],
  rotateRange = [0, 0],
  scaleRange = [1, 1],
}) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], xRange);
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  const rotate = useTransform(scrollYProgress, [0, 1], rotateRange);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);

  return (
    <motion.div
      ref={ref}
      style={{ x, y, rotate, scale }}
      className={`absolute rounded-[50%] bg-secondary z-0 ${className}`}
    />
  );
}

export default AnimatedShape;