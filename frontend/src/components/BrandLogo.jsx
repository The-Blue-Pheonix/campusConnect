import { motion } from "framer-motion";
import logoSrc from "../assets/blue-ph.png";

const BrandLogo = ({
  size = 56,
  animated = true,
  className = "",
  alt = "Campus Connect logo",
}) => {
  const logo = (
    <img
      src={logoSrc}
      alt={alt}
      draggable="false"
      style={{ width: size, height: size }}
      className="select-none object-contain"
    />
  );

  if (!animated) {
    return <div className={`relative inline-flex ${className}`}>{logo}</div>;
  }

  return (
    <motion.div
      className={`relative inline-flex ${className}`}
      initial={{ opacity: 0, scale: 0.78, rotate: -6 }}
      animate={{
        opacity: 1,
        scale: [0.98, 1.04, 1],
        rotate: [0, -2, 0, 2, 0],
        y: [0, -8, 0],
      }}
      transition={{
        opacity: { duration: 0.45 },
        scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 5.2, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-1 -z-10 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.35)_0%,rgba(139,92,246,0.18)_35%,transparent_72%)] blur-2xl"
      />
      {logo}
    </motion.div>
  );
};

export default BrandLogo;