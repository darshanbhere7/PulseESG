import React from "react";
import { motion } from "framer-motion";
import { World } from "@/components/ui/globe";

export default function GlobeDemo() {
  const globeConfig = {
    pointSize: 3.8,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.12,
    autoRotate: true,
    autoRotateSpeed: 0.45,
  };

  const colors = ["#06b6d4", "#3b82f6", "#6366f1"];

  const arcs = [
    { startLat: 28.6, startLng: 77.2, endLat: 51.5, endLng: -0.1, arcAlt: 0.3 },
    { startLat: 28.6, startLng: 77.2, endLat: 40.7, endLng: -74, arcAlt: 0.4 },
    { startLat: 28.6, startLng: 77.2, endLat: 35.6, endLng: 139.6, arcAlt: 0.5 },

    { startLat: 40.7, startLng: -74, endLat: 51.5, endLng: -0.1, arcAlt: 0.25 },
    { startLat: 40.7, startLng: -74, endLat: 48.8, endLng: 2.3, arcAlt: 0.3 },

    { startLat: 51.5, startLng: -0.1, endLat: 22.3, endLng: 114.1, arcAlt: 0.45 },
    { startLat: 51.5, startLng: -0.1, endLat: -33.8, endLng: 151.2, arcAlt: 0.6 },

    { startLat: 35.6, startLng: 139.6, endLat: 22.3, endLng: 114.1, arcAlt: 0.35 },
    { startLat: 35.6, startLng: 139.6, endLat: 1.35, endLng: 103.8, arcAlt: 0.25 },

    { startLat: -33.8, startLng: 151.2, endLat: 28.6, endLng: 77.2, arcAlt: 0.65 },
    { startLat: 48.8, startLng: 2.3, endLat: 52.5, endLng: 13.4, arcAlt: 0.2 },
    { startLat: 52.5, startLng: 13.4, endLat: 40.7, endLng: -74, arcAlt: 0.4 },

    { startLat: -22.9, startLng: -43.1, endLat: 28.6, endLng: 77.2, arcAlt: 0.7 },
    { startLat: -22.9, startLng: -43.1, endLat: -34.6, endLng: -58.3, arcAlt: 0.25 },

    { startLat: 34.0, startLng: -118.2, endLat: 48.8, endLng: 2.3, arcAlt: 0.45 },
    { startLat: 34.0, startLng: -118.2, endLat: 37.7, endLng: -122.4, arcAlt: 0.15 },
  ].map((arc, i) => ({
    ...arc,
    color: colors[i % colors.length],
  }));

  return (
    <section className="relative bg-white dark:bg-black overflow-hidden">
      {/* HERO TEXT */}
      <div className="relative z-20 pt-20 pb-10 text-center px-4">
          <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-bold text-black dark:text-white"
        >
          PulseESG — Global Risk Intelligence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-4 max-w-2xl mx-auto text-neutral-700 dark:text-neutral-300"
        >
          Visualizing ESG risk signals across global markets in real time using
          AI-driven analytics.
        </motion.p>
      </div>

      {/* 🌍 GLOBE */}
      <div className="relative flex justify-center items-center h-[80vh]">
        <World data={arcs} globeConfig={globeConfig} />
      </div>

      {/* FADE */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-black pointer-events-none" />
    </section>
  );
}
