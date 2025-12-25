import React, { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";

/* 🌍 SINGLE EARTH TEXTURE */
import earthTexture from "@/assets/earth-blue.jpg";
import earthDots from "@/assets/earth-dots.png";

export function World({ data, globeConfig }) {
  const globeRef = useRef(null);
  const containerRef = useRef(null);

  const initialCameraZ = useRef(null); // 🔒 VERY IMPORTANT

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight * 0.75,
  });

  /* ================= THEME DETECTION ================= */

  useEffect(() => {
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /* ================= FIXED SIZE ================= */

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  /* ================= CONTROLS (RUN ONCE) ================= */

  useEffect(() => {
    if (!globeRef.current) return;

    const globe = globeRef.current;
    const controls = globe.controls();
    const camera = globe.camera();

    // 🔒 SET CAMERA DISTANCE ONCE
    if (initialCameraZ.current === null) {
      initialCameraZ.current = camera.position.z * 0.87; // slight zoom-in ONCE
      camera.position.z = initialCameraZ.current;
    }

    // ❌ DISABLE ZOOM COMPLETELY
    controls.enableZoom = false;
    controls.zoomSpeed = 0;
    controls.minDistance = initialCameraZ.current;
    controls.maxDistance = initialCameraZ.current;

    // ✅ ALLOW ROTATION
    controls.enableRotate = true;
    controls.enablePan = false;

    // 🔄 AUTO ROTATE
    controls.autoRotate = globeConfig.autoRotate;
    controls.autoRotateSpeed = globeConfig.autoRotateSpeed;
  }, [globeConfig]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[75vh]"
    >
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"

        /* 🌍 EARTH */
        globeImageUrl={earthTexture}
        bumpImageUrl={earthDots}

        /* 🌫 ATMOSPHERE */
        showAtmosphere
        atmosphereColor={isDarkMode ? "#ffffff" : "#60a5fa"}
        atmosphereAltitude={globeConfig.atmosphereAltitude}

        /* 🌈 ARCS */
        arcsData={data}
        arcStartLat={(d) => d.startLat}
        arcStartLng={(d) => d.startLng}
        arcEndLat={(d) => d.endLat}
        arcEndLng={(d) => d.endLng}
        arcAltitude={(d) => d.arcAlt}
        arcColor={(d) => d.color}
        arcStroke={0.9}
        arcDashLength={0.7}
        arcDashGap={1.2}
        arcDashAnimateTime={1200}

        /* 🔘 RINGS */
        ringsData={data}
        ringColor={(d) => d.color}
        ringMaxRadius={2.5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={2200}

        /* 📍 POINTS */
        pointsData={data}
        pointLat={(d) => d.startLat}
        pointLng={(d) => d.startLng}
        pointRadius={globeConfig.pointSize}
        pointColor={() => (isDarkMode ? "#38bdf8" : "#0284c7")}
        pointAltitude={0.01}
        pointResolution={12}
      />
    </div>
  );
}
