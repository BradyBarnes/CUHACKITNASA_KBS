import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Satellite, Cloud, Sparkles, Globe } from "lucide-react";

export default function NasaSimulationHome() {
  const [telemetry, setTelemetry] = useState({ altitude: 120, velocity: 7.8, fuel: 100, temperature: 22, status: "Standby" });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => {
        setTelemetry((t) => {
          const newFuel = Math.max(0, t.fuel - 0.5);
          const newAlt = +(t.altitude + 0.15).toFixed(2);
          if (newFuel <= 0) setRunning(false);
          return { ...t, fuel: newFuel, altitude: newAlt, status: newFuel <= 0 ? "Mission Complete" : "Nominal" };
        });
      }, 600);
    }
    return () => clearInterval(timer);
  }, [running]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-black text-white overflow-x-hidden relative flex flex-col">
      {/* Background */}
      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2011/12/14/12/11/stars-11084_1280.jpg')] bg-cover bg-center opacity-60 z-0"
      ></motion.div>
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute top-10 right-0 w-96 h-96 bg-[url('https://cdn.pixabay.com/photo/2017/09/25/13/12/planet-2786863_1280.jpg')] bg-contain bg-no-repeat opacity-60 z-0"
      ></motion.div>

      {/* Header */}
      <header className="relative z-10 p-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Rocket className="text-sky-300" size={32} />
          <h1 className="text-3xl font-bold tracking-wide">NASA Space Simulation</h1>
        </div>
        <nav className="hidden md:flex gap-6 text-sky-200 text-sm">
          <a href="#mission" className="hover:text-white">Mission</a>
          <a href="#telemetry" className="hover:text-white">Telemetry</a>
          <a href="#team" className="hover:text-white">Team</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center py-20 px-6 flex-grow">
        <motion.img
          src="https://cdn.pixabay.com/photo/2017/09/26/13/37/rocket-2789016_1280.png"
          alt="Rocket"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="w-60 md:w-80 drop-shadow-2xl"
        />
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-4xl font-extrabold text-sky-300 mt-6"
        >
          Launch Your Mission
        </motion.h2>
        <p className="max-w-2xl mt-4 text-sky-100 text-lg">
          Experience an interactive simulation of a NASA mission. Launch your rocket, monitor telemetry, and explore space!
        </p>
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          <button
            onClick={() => setRunning(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-semibold hover:scale-105 transition"
          >
            Launch
          </button>
          <button
            onClick={() => setRunning(false)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black font-semibold hover:scale-105 transition"
          >
            Pause
          </button>
          <button
            onClick={() => setTelemetry({ altitude: 120, velocity: 7.8, fuel: 87, temperature: 22, status: "Standby" })}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 rounded-full text-white font-semibold hover:scale-105 transition"
          >
            Reset
          </button>
        </div>
      </main>

      {/* Telemetry */}
      <section id="telemetry" className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl mx-auto mt-10 p-6 max-w-5xl shadow-2xl border border-white/20">
        <h3 className="text-2xl font-bold mb-4 text-sky-300 flex items-center gap-2">
          <Satellite /> Telemetry Dashboard
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Altitude", value: `${telemetry.altitude} km` },
            { label: "Velocity", value: `${telemetry.velocity} km/s` },
            { label: "Fuel", value: `${telemetry.fuel}%` },
            { label: "Temperature", value: `${telemetry.temperature} °C` },
          ].map((item, i) => (
            <div key={i} className="bg-black/30 p-4 rounded-lg">
              <p className="text-sm text-sky-200">{item.label}</p>
              <p className="text-2xl font-mono">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-sky-300">
            Status: <span className="font-semibold text-white">{telemetry.status}</span>
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="relative z-10 text-center py-20">
        <motion.h3 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-3xl font-bold text-sky-300 mb-4">
          Mission Phases
        </motion.h3>
        <div className="flex flex-wrap justify-center gap-6 px-4">
          {["Launch", "Orbit", "Science Ops", "Re-entry"].map((phase, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }} className="w-64 bg-white/10 p-4 rounded-xl border border-sky-500/30 shadow-lg">
              <div className="text-lg font-semibold text-sky-200 mb-2">{phase}</div>
              <p className="text-sm text-sky-100">
                {phase === "Launch"
                  ? "Ignition and lift-off sequence begins."
                  : phase === "Orbit"
                  ? "Adjust trajectory and maintain orbit."
                  : phase === "Science Ops"
                  ? "Begin instruments and data collection."
                  : "Controlled descent and atmospheric re-entry."}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative z-10 bg-white/10 py-16 text-center backdrop-blur-md">
        <h3 className="text-3xl font-bold text-sky-300 mb-6 flex justify-center items-center gap-2">
          <Globe /> Our Crew
        </h3>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { name: "Lokesh Ramanathan", role: "Lead Engineer", img: "https://cdn.pixabay.com/photo/2017/03/31/18/58/astronaut-2197310_1280.png" },
            { name: "Ava Patel", role: "UI/UX Designer", img: "https://cdn.pixabay.com/photo/2017/03/29/11/53/astronaut-2188401_1280.png" },
            { name: "Ethan Chen", role: "Simulation Backend", img: "https://cdn.pixabay.com/photo/2017/03/31/18/58/astronaut-2197313_1280.png" },
          ].map((member, i) => (
            <motion.div key={i} whileHover={{ scale: 1.08 }} className="w-56 bg-black/40 p-4 rounded-2xl border border-sky-600/30 shadow-lg">
              <img src={member.img} alt={member.name} className="w-24 h-24 mx-auto rounded-full mb-3 object-cover" />
              <h4 className="text-lg font-semibold text-white">{member.name}</h4>
              <p className="text-sm text-sky-200">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-sky-300 text-sm bg-gradient-to-t from-black via-blue-900/50 to-transparent">
        © {new Date().getFullYear()} NASA Space Apps Hackathon — Team Simulation. Built for educational use.
      </footer>

      {/* Floating icons */}
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute left-10 bottom-10 text-sky-400 opacity-70">
        <Sparkles size={48} />
      </motion.div>
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 7 }} className="absolute right-10 top-10 text-purple-400 opacity-70">
        <Cloud size={48} />
      </motion.div>
    </div>
  );
}