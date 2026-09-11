import React from "react";
import { motion } from "framer-motion";
import BrandLogo from "./BrandLogo";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center overflow-hidden bg-[#05060f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_36%),radial-gradient(circle_at_bottom,rgba(34,211,238,0.12),transparent_28%)]" />

      <motion.div
        className="relative flex flex-col items-center gap-7 px-6 text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <BrandLogo size={170} animated />
          <motion.div
            className="mt-6 space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#8B81AD]">
              Starting up
            </p>
            <h1 className="text-3xl font-black tracking-[0.25em] text-white">
              CAMPUS CONNECT
            </h1>
          </motion.div>
        </div>

        <div className="w-44 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#22D3EE] to-[#FF4FD8]"
            initial={{ x: "-35%" }}
            animate={{ x: "135%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;