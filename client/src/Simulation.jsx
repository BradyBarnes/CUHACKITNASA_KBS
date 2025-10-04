import React, { useEffect, useMemo, useRef, useState } from "react";

/* ===== Assets ===== */
import HOUSE_BG from "./assets/House.png";
import PLAYER_FRAME0 from "./assets/player0.png";
import PLAYER_FRAME1 from "./assets/player1.png";
import CAT_IMG from "./assets/Cat.png"; // kept (not used visually now)
import WIFE_FRAME0 from "./assets/Wife0.png";
import WIFE_FRAME1 from "./assets/Wife1.png";
import BABY_FRAME0 from "./assets/behbeh0.png";
import BABY_FRAME1 from "./assets/behbeh1.png";
import CAT_FRAME0 from "./assets/cat0.png";
import CAT_FRAME1 from "./assets/cat1.png";

import FOOD_IMG from "./assets/Food.png";
import WATER_IMG from "./assets/WaterBottle.png";
import BUNKER_BG from "./assets/Bunker.png";

import CAR_PARKED from "./assets/Carparked.png";
import CAR_DRIVE0 from "./assets/Cardriving0.png";
import CAR_DRIVE1 from "./assets/Cardriving1.png";
import OBST0 from "./assets/Obsticle0.png";
import OBST1 from "./assets/Obsticle1.png";

/* ===== Grid / Sizing ===== */
const ROWS = 11;
const COLS = 12;
const TILE = 48;
const SPRITE_SCALE = 1.5;

/* ===== Walls (easy to edit) ===== */
// Flip any 0 → 1 to add a wall. Shape is 11 rows × 12 cols.
const HOUSE_LAYOUT = [
//  0,1,2,3,4,5,6,7,8,9,10,11
  [1,1,1,1,1,1,1,1,1,1,0,0], // 0
  [1,0,0,0,0,0,0,1,0,0,1,0], // 1
  [1,0,0,0,0,0,0,0,0,0,1,0], // 2
  [1,0,0,0,0,0,0,0,0,0,1,0], // 3
  [1,0,0,0,0,0,0,1,1,1,1,0], // 4
  [1,1,1,1,1,1,0,1,0,0,1,0], // 5
  [1,1,0,0,0,0,0,1,0,0,1,0], // 6
  [1,1,1,1,1,1,0,1,0,0,1,0], // 7
  [1,1,0,0,0,0,0,0,0,0,1,0], // 8
  [1,1,1,1,1,1,1,1,1,1,1,0], // 9
  [0,0,0,0,0,0,0,0,0,0,0,0], // 10
];

const OUTSIDE_LAYOUT = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => 0)
);

/* ===== Bunker (with exit door) ===== */
const BUNKER_LAYOUT = [
  [1,1,1,1,1,1,1],
  [1,0,0,0,0,2,1], // "2" = exit door
  [1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1],
  [1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1],
];
const BUNKER_SPAWN = { x: 2, y: 2 };
const BUNKER_EXIT_POS = { x: 3, y: 1 };

/* ===== Driving mini-game config ===== */
const DRIVE_DURATION = 20;    // seconds to survive
const DRIVE_LANES = 3;
const DRIVE_ROWS = 14;
const DRIVE_TICK_MS = 100;
const DRIVE_SPAWN_MS = 800;

/* ===== Simple SVGs (doors/phone only) ===== */
const svg = (s) => `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;

const DOOR_SPRITE = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="18" y="8" width="28" height="48" rx="2" fill="#5d4037" stroke="#3e2723" stroke-width="2"/>
  <circle cx="40" cy="32" r="2" fill="#ffeb3b"/>
</svg>`);

const PHONE_SPRITE = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="16" y="6" width="32" height="52" rx="6" fill="#222" stroke="#555" stroke-width="2"/>
  <rect x="20" y="12" width="24" height="38" rx="2" fill="#0a0a0a"/>
  <circle cx="32" cy="54" r="3" fill="#444"/>
</svg>`);

/* ===== Game data ===== */
const ASTEROIDS = [
  { name: "Eros", diameter: 16.8, velocity: 2 },
  { name: "Bennu", diameter: 0.49, velocity: 3 },
  { name: "Apophis", diameter: 0.34, velocity: 2.5 },
  { name: "Didymos", diameter: 0.78, velocity: 2.8 },
];
const STRATEGIES = [
  { name: "Kinetic Force", successRate: 0.5 },
  { name: "Gravity Pull", successRate: 0.7 },
  { name: "Nuclear Bomb", successRate: 0.9 },
];
const isAdj = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

/* ===== Positions (easy to tweak) ===== */
const POS = {
  // HOUSE
  houseSpawn:      { x: 2, y: 8 },
  phone:           { x: 6, y: 3 },

  // family & pet
  wife:            { x: 3, y: 8 },
  baby:            { x: 1, y: 6 },
  cat:             { x: 8, y: 6 },

  // consumables (3 food, 3 water)
  foods:           [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 3, y: 2 }],
  waters:          [{ x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }],

  // doors
  frontDoorInside: { x: 6, y: 9 },
  bunkerHole:      { x: 9, y: 2 },

  // OUTSIDE
  outsideSpawn:       { x: 6, y: 10 },
  outsideHouseDoor:   { x: 6, y: 10 },
  car:                { x: 10, y: 3 },

  // Re-enter point from bunker
  bunkerReenter:   { x: 8, y: 3 },
};

/* ===== Fancy full-screen menu styles (unchanged look/feel) ===== */
const screenWrap = {
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(1200px 600px at 15% 20%, rgba(79,70,229,0.18), transparent 60%)," +
    "radial-gradient(900px 500px at 85% 30%, rgba(16,185,129,0.18), transparent 60%)," +
    "linear-gradient(180deg, #0b1020, #0a0e19)",
  color: "#e8eef7",
};
const glassCard = {
  width: "min(920px, 92vw)",
  padding: "28px 28px 24px",
  borderRadius: 16,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(148,163,184,0.22)",
  boxShadow: "0 20px 120px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  textAlign: "center",
};
const bigTitle = {
  margin: 0,
  fontWeight: 800,
  letterSpacing: 0.3,
  background:
    "linear-gradient(180deg, #f8fafc, #c7d2fe 35%, #9ec7ff 70%, #c7f9cc 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  textShadow: "0 6px 40px rgba(82,108,255,0.15)",
};
const subtitle = {
  marginTop: 10,
  color: "rgba(226,232,240,0.85)",
  fontSize: 16,
};
const row = { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" };
const primaryBtn = {
  padding: "14px 18px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "linear-gradient(180deg, rgba(148,163,184,0.18), rgba(100,116,139,0.16))",
  color: "#e6edf6",
  cursor: "pointer",
  fontWeight: 700,
  letterSpacing: 0.25,
  transition: "transform .08s ease, box-shadow .08s ease, background .2s ease",
};
const faintText = { color: "rgba(203,213,225,0.75)", fontSize: 14 };

/* ===== Component ===== */
export default function Game() {
  const [gameState, setGameState] = useState("MENU"); // MENU, ASTEROID, FIGHT, HOUSE, BUNKER, OUTSIDE, DRIVE, END
  const [asteroid, setAsteroid] = useState(null);
  const [fightDistKm, setFightDistKm] = useState(null); // distance used for fight recommendation

  // Player & phone
  const [player, setPlayer] = useState(POS.houseSpawn);
  const [hasPhone, setHasPhone] = useState(false);

  // Family/pet (bulky items)
  const [wife, setWife] = useState(POS.wife);
  const [baby, setBaby] = useState(POS.baby);
  const [cat, setCat] = useState(POS.cat);

  // Consumables (arrays in house)
  const [foods, setFoods] = useState(POS.foods.map((p, i) => ({ id: `f${i}`, ...p })));
  const [waters, setWaters] = useState(POS.waters.map((p, i) => ({ id: `w${i}`, ...p })));

  // Carrying (one item max): 'wife' | 'baby' | 'cat' | { kind:'food'|'water', id:string }
  const [carrying, setCarrying] = useState(null);

  // Bunker & car storage
  const [bunker, setBunker] = useState({ wife: false, baby: false, cat: false, food: 0, water: 0 });
  const [carLoad, setCarLoad] = useState({ wife: false, baby: false, cat: false, food: 0, water: 0 });

  // Timer & mission
  const [timerRunning, setTimerRunning] = useState(false);
  const [t, setT] = useState(60);
  const [mission, setMission] = useState(null); // 'shelter' | 'evacuate'
  const [impactKm, setImpactKm] = useState(null);

  // Fight & end
  const [fightResult, setFightResult] = useState(null);
  const [result, setResult] = useState(null); // 'WIN'|'LOSE'

  // Driving mini-game
  const [driveLane, setDriveLane] = useState(1);
  const driveLaneRef = useRef(1);
  useEffect(() => { driveLaneRef.current = driveLane; }, [driveLane]);
  const [driveObstacles, setDriveObstacles] = useState([]);
  const [driveTimeLeft, setDriveTimeLeft] = useState(DRIVE_DURATION);
  const [driveBlink, setDriveBlink] = useState(0); // for car/obstacle animation

  // UI toast (outside)
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1400); };

  // Walk animation
  const [walk, setWalk] = useState(0);
  useEffect(() => {
    if (!["HOUSE", "BUNKER", "OUTSIDE"].includes(gameState)) return;
    const id = setInterval(() => setWalk((f) => (f ? 0 : 1)), 160);
    return () => clearInterval(id);
  }, [gameState]);
  const playerSprite = walk ? PLAYER_FRAME1 : PLAYER_FRAME0;
  const wifeSprite = walk ? WIFE_FRAME1 : WIFE_FRAME0;
  const babySprite = walk ? BABY_FRAME1 : BABY_FRAME0;
  const catSprite  = walk ? CAT_FRAME1  : CAT_FRAME0;

  // Driving animation blink
  useEffect(() => {
    if (gameState !== "DRIVE") return;
    const id = setInterval(() => setDriveBlink((b) => (b ? 0 : 1)), 140);
    return () => clearInterval(id);
  }, [gameState]);

  /* ===== Helpers to choose recommended strategy by distance ===== */
  function distanceRecommendation(km) {
    if (km >= 2400) return { rec: "KINETIC", note: "Far away — Kinetic Impactor favored." };
    if (km >= 600)  return { rec: "GRAVITY", note: "Mid-range — Gravity Tractor recommended." };
    return { rec: "NUCLEAR", note: "Very close — Nuclear (last resort)." };
  }
  function isRecommendedButtonByDistance(recCode, buttonName) {
    if (recCode === "KINETIC")  return buttonName === "Kinetic Force";
    if (recCode === "GRAVITY")  return buttonName === "Gravity Pull";
    if (recCode === "NUCLEAR")  return buttonName === "Nuclear Bomb";
    return false;
  }

  /* ===== Movement & Interact (E) ===== */
  useEffect(() => {
    const handle = (e) => {
      // Interact with E next to you
      if (e.key === "e" || e.key === "E") {
        if (gameState === "HOUSE") interactHouse();
        else if (gameState === "OUTSIDE") interactOutside();
        else if (gameState === "BUNKER") interactBunker();
        return;
      }

      if (!["HOUSE", "BUNKER", "OUTSIDE"].includes(gameState)) return;

      // Move / run into door behavior
      setPlayer((prev) => {
        let nx = prev.x, ny = prev.y;
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") ny--;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") ny++;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") nx--;
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") nx++;

        const layout =
          gameState === "HOUSE" ? HOUSE_LAYOUT
          : gameState === "OUTSIDE" ? OUTSIDE_LAYOUT
          : BUNKER_LAYOUT;

        const rows = layout.length, cols = layout[0].length;

        // HOUSE cell must be 0 to walk; BUNKER allows 0 or 2; OUTSIDE: any defined tile (all 0s anyway)
        const passable = (x, y) => {
          if (!(y >= 0 && y < rows && x >= 0 && x < cols)) return false;
          const cell = layout[y][x];
          if (gameState === "BUNKER") return cell === 0 || cell === 2;
          if (gameState === "HOUSE") return cell === 0;
          return cell !== undefined;
        };

        // --- Run-into-door shortcuts ---
        // HOUSE: pushing into front door / bunker entrance triggers transition
        if (gameState === "HOUSE") {
          if (nx === POS.frontDoorInside.x && ny === POS.frontDoorInside.y) {
            setGameState("OUTSIDE");
            setPlayer(POS.outsideSpawn);
            return prev;
          }
          if (nx === POS.bunkerHole.x && ny === POS.bunkerHole.y) {
            setGameState("BUNKER");
            setPlayer(BUNKER_SPAWN);
            return prev;
          }
        }

        // OUTSIDE: stepping onto house door returns inside
        if (gameState === "OUTSIDE") {
          if (nx === POS.outsideHouseDoor.x && ny === POS.outsideHouseDoor.y) {
            setGameState("HOUSE");
            setPlayer(POS.frontDoorInside);
            return prev;
          }
        }

        // BUNKER: stepping onto exit door pops you out
        if (gameState === "BUNKER") {
          if (nx === BUNKER_EXIT_POS.x && ny === BUNKER_EXIT_POS.y) {
            setGameState("HOUSE");
            setPlayer(POS.bunkerReenter);
            return prev;
          }
        }
        // --- end run-into-door shortcuts ---

        if (passable(nx, ny)) return { x: nx, y: ny };
        return prev;
      });
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [gameState, player, hasPhone, foods, waters, wife, baby, cat, carrying]);

  // Asteroid timer (paused during DRIVE)
  useEffect(() => {
    if (!timerRunning || gameState === "END" || gameState === "DRIVE") return;
    const id = setInterval(() => setT((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [timerRunning, gameState]);

  // End at T=0 (only if not driving)
  useEffect(() => {
    if (t > 0 || gameState === "END" || gameState === "DRIVE") return;
    if (mission === "shelter") {
      const people = 1 + (bunker.wife ? 1 : 0) + (bunker.baby ? 1 : 0);
      const win = gameState === "BUNKER" && bunker.food >= people && bunker.water >= people;
      setResult(win ? "WIN" : "LOSE");
    } else if (mission === "evacuate") {
      setResult("LOSE");
    } else {
      setResult("LOSE");
    }
    setTimerRunning(false);
    setGameState("END");
  }, [t, gameState, mission, bunker]);

  // Auto-store when entering bunker (for bulky items + food/water)
  useEffect(() => {
    if (gameState !== "BUNKER" || !carrying) return;
    setBunker((b) => {
      if (carrying === "wife") return { ...b, wife: true };
      if (carrying === "baby") return { ...b, baby: true };
      if (carrying === "cat")  return { ...b, cat: true };
      if (carrying.kind === "food") return { ...b, food: b.food + 1 };
      if (carrying.kind === "water") return { ...b, water: b.water + 1 };
      return b;
    });
    setCarrying(null);
  }, [gameState, carrying]);

  const formattedT = useMemo(
    () => `${Math.floor(t / 60)}:${String(t % 60).padStart(2,"0")}`,
    [t]
  );

  /* ===== Flow helpers ===== */
  const resetWorld = () => {
    setPlayer(POS.houseSpawn);
    setHasPhone(false);
    setWife(POS.wife);
    setBaby(POS.baby);
    setCat(POS.cat);
    setFoods(POS.foods.map((p, i) => ({ id: `f${i}`, ...p })));
    setWaters(POS.waters.map((p, i) => ({ id: `w${i}`, ...p })));
    setCarrying(null);

    setBunker({ wife: false, baby: false, cat: false, food: 0, water: 0 });
    setCarLoad({ wife: false, baby: false, cat: false, food: 0, water: 0 });

    setMission(null);
    setImpactKm(null);
    setT(60);
    setTimerRunning(false);

    setFightResult(null);
    setResult(null);
    setToast(null);
  };

  const startEncounter = () => {
    setAsteroid(ASTEROIDS[Math.floor(Math.random() * ASTEROIDS.length)]);
    resetWorld();
    // Pick a distance bucket for the fight screen (far / mid / near)
    const r = Math.random();
    const km =
      r < 0.33 ? Math.floor(2400 + Math.random() * 4000) :   // FAR 2400–6400
      r < 0.66 ? Math.floor(600 + Math.random() * 1600)  :   // MID 600–2200
                 Math.floor(200 + Math.random() * 350);      // NEAR 200–550
    setFightDistKm(km);
    setGameState("ASTEROID");
  };

  const goHouse = () => { setTimerRunning(true); setGameState("HOUSE"); };
  const toBunker = () => { setGameState("BUNKER"); setPlayer(BUNKER_SPAWN); };
  const backFromBunker = () => { setGameState("HOUSE"); setPlayer(POS.bunkerReenter); };

  /* ===== Fight ===== */
  const doStrategy = (s) => {
    const rec = distanceRecommendation(fightDistKm ?? 1000);
    // Success probabilities: high for recommended, low otherwise
    let p = 0.15;
    if (rec.rec === "KINETIC")  p = s.name === "Kinetic Force" ? 0.85 : 0.18;
    if (rec.rec === "GRAVITY")  p = s.name === "Gravity Pull" ? 0.80 : 0.20;
    if (rec.rec === "NUCLEAR")  p = s.name === "Nuclear Bomb" ? 0.90 : 0.12;

    const ok = Math.random() < p;

    setFightResult(
      ok ? "Success! Asteroid deflected."
         : "Deflection failed. Prepare to shelter/evacuate."
    );

    if (ok) {
      setTimeout(() => startEncounter(), 1100);
    } else {
      setTimeout(() => goHouse(), 350);
    }
  };

  /* ===== Interact routines for E key ===== */
  const neighborsOf = (p) => ([
    { x: p.x,     y: p.y-1 }, // up
    { x: p.x,     y: p.y+1 }, // down
    { x: p.x-1,   y: p.y   }, // left
    { x: p.x+1,   y: p.y   }, // right
  ]);

  function interactHouse() {
    const nbs = neighborsOf(player);

    // 1) Phone
    if (!hasPhone) {
      const nb = nbs.find((q) => q.x === POS.phone.x && q.y === POS.phone.y);
      if (nb) { clickHouse(nb.x, nb.y); return; }
    }
    // 2) Wife/Baby/Cat
    if (wife) {
      const nb = nbs.find((q) => wife && q.x === wife.x && q.y === wife.y);
      if (nb) { clickHouse(nb.x, nb.y); return; }
    }
    if (baby) {
      const nb = nbs.find((q) => baby && q.x === baby.x && q.y === baby.y);
      if (nb) { clickHouse(nb.x, nb.y); return; }
    }
    if (cat) {
      const nb = nbs.find((q) => cat && q.x === cat.x && q.y === cat.y);
      if (nb) { clickHouse(nb.x, nb.y); return; }
    }
    // 3) Food/Water
    if (!carrying) {
      const f = nbs.find((q) => foods.some((it) => it.x === q.x && it.y === q.y));
      if (f) { clickHouse(f.x, f.y); return; }
      const w = nbs.find((q) => waters.some((it) => it.x === q.x && it.y === q.y));
      if (w) { clickHouse(w.x, w.y); return; }
    }
    // 4) Doors
    const door = nbs.find((q) =>
      (q.x === POS.frontDoorInside.x && q.y === POS.frontDoorInside.y) ||
      (q.x === POS.bunkerHole.x && q.y === POS.bunkerHole.y)
    );
    if (door) { clickHouse(door.x, door.y); }
  }

  function interactOutside() {
    const nbs = neighborsOf(player);
    // House door first
    const door = nbs.find((q) => q.x === POS.outsideHouseDoor.x && q.y === POS.outsideHouseDoor.y);
    if (door) { clickOutside(door.x, door.y); return; }
    // Car
    const car = nbs.find((q) => q.x === POS.car.x && q.y === POS.car.y);
    if (car) { clickOutside(car.x, car.y); return; }
  }

  function interactBunker() {
    const nbs = neighborsOf(player);
    const door = nbs.find((q) => q.x === BUNKER_EXIT_POS.x && q.y === BUNKER_EXIT_POS.y);
    if (door) { clickBunker(door.x, door.y); }
  }

  /* ===== House interactions (click path retained) ===== */
  const pickUpIf = (pos, setFn, label) => {
    if (pos && isAdj(player, pos) && !carrying) { setFn(null); setCarrying(label); return true; }
    return false;
  };
  const clickHouse = (x, y) => {
    // Phone → reveals panel & sets mission (≤50km = shelter, >50km = evacuate)
    if (!hasPhone && x === POS.phone.x && y === POS.phone.y && isAdj(player, POS.phone)) {
      setHasPhone(true);
      const dist = Math.floor(Math.random() * 111) + 15;
      setImpactKm(dist);
      setMission(dist <= 50 ? "shelter" : "evacuate");
      return;
    }
    // Family/pet
    if (wife && x === wife.x && y === wife.y) if (pickUpIf(wife, setWife, "wife")) return;
    if (baby && x === baby.x && y === baby.y) if (pickUpIf(baby, setBaby, "baby")) return;
    if (cat  && x === cat.x  && y === cat.y ) if (pickUpIf(cat,  setCat,  "cat"))  return;

    // Food / Water
    if (!carrying) {
      const f = foods.find((it) => it.x === x && it.y === y && isAdj(player, it));
      if (f) { setFoods((arr) => arr.filter((i) => i.id !== f.id)); setCarrying({ kind: "food", id: f.id }); return; }
      const w = waters.find((it) => it.x === x && it.y === y && isAdj(player, it));
      if (w) { setWaters((arr) => arr.filter((i) => i.id !== w.id)); setCarrying({ kind: "water", id: w.id }); return; }
    }

    // Bunker entrance
    if (x === POS.bunkerHole.x && y === POS.bunkerHole.y && isAdj(player, POS.bunkerHole)) { toBunker(); return; }

    // Front door → outside
    if (x === POS.frontDoorInside.x && y === POS.frontDoorInside.y && isAdj(player, POS.frontDoorInside)) {
      setGameState("OUTSIDE");
      setPlayer(POS.outsideSpawn);
      return;
    }
  };

  /* ===== Bunker interactions ===== */
  const clickBunker = (x, y) => {
    if (x === BUNKER_EXIT_POS.x && y === BUNKER_EXIT_POS.y && isAdj(player, BUNKER_EXIT_POS)) backFromBunker();
  };

  /* ===== Outside interactions ===== */
  const tryStartDrive = () => {
    // People in car = you + (wife?1) + (baby?1)
    const people = 1 + (carLoad.wife ? 1 : 0) + (carLoad.baby ? 1 : 0);
    const needFood = people;
    const needWater = people;
    if (carLoad.food < needFood || carLoad.water < needWater) {
      showToast(`Need ${needFood} food & ${needWater} water loaded (have ${carLoad.food}/${carLoad.water}).`);
      return;
    }
    // Pause asteroid timer (do not reset) and start mini-game
    setTimerRunning(false);
    setDriveLane(1);
    driveLaneRef.current = 1;
    setDriveObstacles([]);
    setDriveTimeLeft(DRIVE_DURATION);
    setGameState("DRIVE");
  };

  const clickOutside = (x, y) => {
    // Back into house
    if (x === POS.outsideHouseDoor.x && y === POS.outsideHouseDoor.y && isAdj(player, POS.outsideHouseDoor)) {
      setGameState("HOUSE");
      setPlayer(POS.frontDoorInside);
      return;
    }
    // At car tile
    if (x === POS.car.x && y === POS.car.y && isAdj(player, POS.car)) {
      if (carrying) {
        // Load item
        setCarLoad((c) => {
          if (carrying === "wife") return { ...c, wife: true };
          if (carrying === "baby") return { ...c, baby: true };
          if (carrying === "cat")  return { ...c, cat: true };
          if (carrying.kind === "food")  return { ...c, food: c.food + 1 };
          if (carrying.kind === "water") return { ...c, water: c.water + 1 };
          return c;
        });
        setCarrying(null);
        return;
      }
      // Try to start evacuation drive (mission can be anything; resources determine gating)
      tryStartDrive();
    }
  };

  /* ===== Driving mini-game ===== */
  useEffect(() => {
    if (gameState !== "DRIVE") return;
    let running = true;
    let lastTick = Date.now();
    let spawnAcc = 0;
    const start = Date.now();
    let obstacles = [];

    const keyHandler = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setDriveLane((l) => { const n = Math.max(0, l-1); driveLaneRef.current = n; return n; });
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setDriveLane((l) => { const n = Math.min(DRIVE_LANES-1, l+1); driveLaneRef.current = n; return n; });
      }
    };
    window.addEventListener("keydown", keyHandler);

    const id = setInterval(() => {
      if (!running) return;
      const now = Date.now();
      const dt = now - lastTick; lastTick = now; spawnAcc += dt;

      // Move obstacles
      obstacles = obstacles.map((o) => ({ ...o, row: o.row + 1 })).filter((o) => o.row < DRIVE_ROWS);

      // Spawn
      if (spawnAcc >= DRIVE_SPAWN_MS) {
        spawnAcc = 0;
        const lane = Math.floor(Math.random() * DRIVE_LANES);
        obstacles.push({ lane, row: -1, frame: Math.random() < 0.5 ? 0 : 1 });
      }

      // Time left
      const elapsed = Math.floor((now - start) / 1000);
      const left = Math.max(0, DRIVE_DURATION - elapsed);
      setDriveTimeLeft(left);

      // Collision
      const playerRow = DRIVE_ROWS - 1;
      const crash = obstacles.some((o) => o.row === playerRow && o.lane === driveLaneRef.current);
      if (crash) {
        running = false;
        clearInterval(id);
        window.removeEventListener("keydown", keyHandler);
        setDriveObstacles(obstacles);
        setResult("LOSE");
        setGameState("END");
        return;
      }

      setDriveObstacles(obstacles);

      if (left <= 0) {
        running = false;
        clearInterval(id);
        window.removeEventListener("keydown", keyHandler);
        setResult("WIN");
        setGameState("END");
      }
    }, DRIVE_TICK_MS);

    return () => { running = false; clearInterval(id); window.removeEventListener("keydown", keyHandler); };
  }, [gameState]);

  /* ===== UI bits ===== */
  const widthPx = COLS * TILE, heightPx = ROWS * TILE;
  const SIZE_PLAYER = TILE * 0.9 * SPRITE_SCALE;
  const SIZE_ITEM = TILE * 0.85 * SPRITE_SCALE;
  const SIZE_DOOR = TILE * 0.85 * SPRITE_SCALE;
  const SIZE_CAR  = TILE * 1.2  * SPRITE_SCALE;

  const InfoPanel = () =>
    hasPhone ? (
      <div style={{ width: 380, minHeight: 480, padding: 18, border: "2px solid #3a3a3a", borderRadius: 12, background: "#121212", color: "#eee" }}>
        <h3 style={{ marginTop: 0 }}>Asteroid Briefing</h3>
        {asteroid && (
          <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 8 }}>
            {asteroid.name} — {asteroid.diameter} km — {asteroid.velocity} km/s
          </div>
        )}
        <div style={{ fontSize: 13, opacity: 0.85 }}>Time to Impact</div>
        <div style={{ fontSize: 40, fontVariantNumeric: "tabular-nums" }}>{formattedT}</div>
        <div style={{ marginTop: 8 }}>Impact Distance: <b>{impactKm} km</b> → <b>{mission === "shelter" ? "Shelter" : "Evacuate"}</b></div>

        {mission === "shelter" ? (
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5 }}>
            <div>People in bunker: <b>{1 + (bunker.wife?1:0) + (bunker.baby?1:0)}</b> (you{bunker.wife?"+wife":""}{bunker.baby?"+baby":""})</div>
            <div>Food in bunker: <b>{bunker.food}</b> • Water in bunker: <b>{bunker.water}</b></div>
            <div style={{ opacity: 0.8 }}>Win at 0s only if you’re in the bunker and food & water ≥ people count.</div>
          </div>
        ) : (
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5 }}>
            <div>People in car: <b>{1 + (carLoad.wife?1:0) + (carLoad.baby?1:0)}</b> (you{carLoad.wife?"+wife":""}{carLoad.baby?"+baby":""})</div>
            <div>Food loaded: <b>{carLoad.food}</b> • Water loaded: <b>{carLoad.water}</b></div>
            <div style={{ opacity: 0.8 }}>Need food & water per person to start the drive. Survive 20s to win.</div>
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 14 }}>Carrying: <b>{
          !carrying ? "Nothing"
          : typeof carrying === "string" ? carrying
          : carrying.kind
        }</b></div>

        <div style={{ marginTop: 12 }}>
          <button onClick={startEncounter}>New Encounter</button>
        </div>
      </div>
    ) : null;

  /* ===== Screens ===== */
  if (gameState === "MENU") {
    return (
      <div style={screenWrap}>
        <div style={glassCard}>
          <h1 style={{ ...bigTitle, fontSize: 48 }}>Asteroid Defense Simulator</h1>
          <p style={subtitle}>Plan fast. Rescue family. Shelter or evacuate before impact.</p>
          <div style={{ ...row, marginTop: 18 }}>
            <button
              onClick={startEncounter}
              style={primaryBtn}
              onMouseDown={(e)=>e.currentTarget.style.transform="translateY(1px)"}
              onMouseUp={(e)=>e.currentTarget.style.transform="translateY(0)"}
            >
              Start Simulation
            </button>
          </div>
          <div style={{ marginTop: 18, ...faintText }}>Use WASD / Arrow keys to move • Press <b>E</b> to interact</div>
        </div>
      </div>
    );
  }

  if (gameState === "ASTEROID") {
    return (
      <div style={screenWrap}>
        <div style={glassCard}>
          <h2 style={{ ...bigTitle, fontSize: 44 }}>Asteroid Approaching!</h2>
          {asteroid && (
            <div style={{ marginTop: 12, lineHeight: 1.6, opacity: 0.9 }}>
              <div><b>Name:</b> {asteroid.name}</div>
              <div><b>Diameter:</b> {asteroid.diameter} km • <b>Velocity:</b> {asteroid.velocity} km/s</div>
              {fightDistKm != null && <div><b>Distance to Target:</b> {fightDistKm.toLocaleString()} km</div>}
              <div style={{ marginTop: 6, fontStyle: "italic", color: "rgba(226,232,240,0.9)" }}>
                Choose: Try to deflect now, or run for the house.
              </div>
            </div>
          )}
          <div style={{ ...row, marginTop: 18 }}>
            <button
              onClick={() => setGameState("FIGHT")}
              style={primaryBtn}
              onMouseDown={(e)=>e.currentTarget.style.transform="translateY(1px)"}
              onMouseUp={(e)=>e.currentTarget.style.transform="translateY(0)"}
            >
              Fight (Attempt Deflection)
            </button>
            <button
              onClick={goHouse}
              style={primaryBtn}
              onMouseDown={(e)=>e.currentTarget.style.transform="translateY(1px)"}
              onMouseUp={(e)=>e.currentTarget.style.transform="translateY(0)"}
            >
              Flight (Go Home)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "FIGHT") {
    const rec = fightDistKm != null ? distanceRecommendation(fightDistKm) : null;

    return (
      <div style={screenWrap}>
        <div style={glassCard}>
          <h2 style={{ ...bigTitle, fontSize: 40 }}>Choose Strategy</h2>
          {asteroid && (
            <div style={{ marginTop: 10, lineHeight: 1.6, opacity: 0.9 }}>
              <div><b>Target:</b> {asteroid.name}</div>
              <div><b>Diameter:</b> {asteroid.diameter} km • <b>Velocity:</b> {asteroid.velocity} km/s</div>
              {fightDistKm != null && <div><b>Distance:</b> {fightDistKm.toLocaleString()} km</div>}
              {rec && <div style={{ marginTop: 6, fontStyle: "italic" }}>{rec.note}</div>}
            </div>
          )}
          <div style={{ ...row, marginTop: 18 }}>
            {STRATEGIES.map((s) => {
              const recommended = rec && isRecommendedButtonByDistance(rec.rec, s.name);
              return (
                <button
                  key={s.name}
                  onClick={() => doStrategy(s)}
                  style={{
                    ...primaryBtn,
                    padding: "14px 18px",
                    background: recommended
                      ? "linear-gradient(180deg, rgba(88,216,163,0.35), rgba(22,204,143,0.32))"
                      : primaryBtn.background,
                    borderColor: recommended ? "rgba(120,255,200,0.6)" : primaryBtn.borderColor,
                  }}
                >
                  {s.name}
                  {recommended && (
                    <span
                      style={{
                        marginLeft: 10,
                        padding: "2px 10px",
                        fontSize: 12,
                        borderRadius: 999,
                        background: "#22c55e",
                        color: "#04150e",
                        fontWeight: 800,
                      }}
                    >
                      Recommended
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {fightResult && <p style={{ marginTop: 12, fontSize: 16, opacity: 0.9 }}>{fightResult}</p>}
        </div>
      </div>
    );
  }

  if (gameState === "HOUSE") {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
        <div
          style={{
            width: COLS * TILE, height: ROWS * TILE,
            backgroundImage: `url(${HOUSE_BG})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%",
            position: "relative", display: "grid", gridTemplateColumns: `repeat(${COLS}, ${TILE}px)`, gap: 0, userSelect: "none"
          }}
        >
          {HOUSE_LAYOUT.flatMap((row, y) =>
            row.map((_, x) => {
              const at = (p) => p && p.x === x && p.y === y;
              const isPlayer = at(player);
              const isPhone = at(POS.phone);
              const isWife = at(wife);
              const isBaby = at(baby);
              const isCat  = at(cat);
              const isFront = x === POS.frontDoorInside.x && y === POS.frontDoorInside.y;
              const isBunker = x === POS.bunkerHole.x && y === POS.bunkerHole.y;
              const f = foods.find((i) => i.x === x && i.y === y);
              const w = waters.find((i) => i.x === x && i.y === y);

              const clickable =
                (isPhone && !hasPhone && isAdj(player, POS.phone)) ||
                (isWife && isAdj(player, wife) && !carrying) ||
                (isBaby && isAdj(player, baby) && !carrying) ||
                (isCat  && isAdj(player, cat)  && !carrying) ||
                (f && isAdj(player, f) && !carrying) ||
                (w && isAdj(player, w) && !carrying) ||
                (isFront && isAdj(player, POS.frontDoorInside)) ||
                (isBunker && isAdj(player, POS.bunkerHole));

              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => clickHouse(x, y)}
                  title={
                    isPhone ? "Phone"
                    : isWife ? "Wife"
                    : isBaby ? "Baby"
                    : isCat  ? "Cat"
                    : f ? "Food"
                    : w ? "Water"
                    : isFront ? "Front Door"
                    : isBunker ? "Bunker Entrance"
                    : undefined
                  }
                  style={{ width: TILE, height: TILE, cursor: clickable ? "pointer" : "default", position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {isPlayer && <img src={playerSprite} alt="player" style={{ width: SIZE_PLAYER, height: SIZE_PLAYER, imageRendering: "pixelated", pointerEvents: "none" }} />}
                  {!hasPhone && isPhone && <img src={PHONE_SPRITE} alt="phone" style={{ width: SIZE_ITEM, height: SIZE_ITEM, pointerEvents: "none" }} />}
                  {isWife && <img src={wifeSprite} alt="wife" style={{ width: SIZE_ITEM, height: SIZE_ITEM, pointerEvents: "none" }} />}
                  {isBaby && <img src={babySprite} alt="baby" style={{ width: SIZE_ITEM, height: SIZE_ITEM, pointerEvents: "none" }} />}
                  {isCat  && <img src={catSprite}  alt="cat"  style={{ width: SIZE_ITEM, height: SIZE_ITEM, imageRendering: "pixelated", pointerEvents: "none" }} />}
                  {f && <img src={FOOD_IMG} alt="food" style={{ width: SIZE_ITEM, height: SIZE_ITEM, imageRendering: "pixelated", pointerEvents: "none" }} />}
                  {w && <img src={WATER_IMG} alt="water" style={{ width: SIZE_ITEM, height: SIZE_ITEM, imageRendering: "pixelated", pointerEvents: "none" }} />}
                  {isFront && <img src={DOOR_SPRITE} alt="front door" style={{ width: SIZE_DOOR, height: SIZE_DOOR, pointerEvents: "none" }} />}
                  {isBunker && <img src={DOOR_SPRITE} alt="bunker entrance" style={{ width: SIZE_DOOR, height: SIZE_DOOR, pointerEvents: "none" }} />}
                </div>
              );
            })
          )}
        </div>
        <InfoPanel />
      </div>
    );
  }

  if (gameState === "BUNKER") {
    const bw = BUNKER_LAYOUT[0].length * TILE;
    const bh = BUNKER_LAYOUT.length * TILE;
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
        <div
          style={{
            width: bw, height: bh,
            backgroundImage: `url(${BUNKER_BG})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            position: "relative",
            display: "grid",
            gridTemplateColumns: `repeat(${BUNKER_LAYOUT[0].length}, ${TILE}px)`,
            gap: 0,
            userSelect: "none",
            border: "1px solid #555",
          }}
        >
          {BUNKER_LAYOUT.flatMap((row, y) =>
            row.map((cell, x) => {
              const isPlayer = player.x === x && player.y === y;
              const isDoor = x === BUNKER_EXIT_POS.x && y === BUNKER_EXIT_POS.y;
              const passable = cell === 0 || cell === 2;
              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => passable && clickBunker(x, y)}
                  title={isDoor ? "Exit to House" : undefined}
                  style={{
                    width: TILE, height: TILE,
                    position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: isDoor && isAdj(player, BUNKER_EXIT_POS) ? "pointer" : "default",
                  }}
                >
                  {isPlayer && <img src={playerSprite} alt="player" style={{ width: SIZE_PLAYER, height: SIZE_PLAYER, imageRendering: "pixelated", pointerEvents: "none" }} />}
                  {isDoor && <img src={DOOR_SPRITE} alt="bunker exit" style={{ width: SIZE_DOOR, height: SIZE_DOOR, pointerEvents: "none" }} />}
                </div>
              );
            })
          )}
        </div>
        <InfoPanel />
      </div>
    );
  }

  if (gameState === "OUTSIDE") {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
        <div
          style={{
            width: COLS * TILE, height: ROWS * TILE, background: "linear-gradient(180deg,#6fbf73,#4caf50)",
            position: "relative", display: "grid", gridTemplateColumns: `repeat(${COLS}, ${TILE}px)`, gap: 0, userSelect: "none"
          }}
        >
          {OUTSIDE_LAYOUT.flatMap((row, y) =>
            row.map((_, x) => {
              const isPlayer = player.x === x && player.y === y;
              const isHouseDoor = x === POS.outsideHouseDoor.x && y === POS.outsideHouseDoor.y;
              const isCar = x === POS.car.x && y === POS.car.y;
              const clickable = (isHouseDoor && isAdj(player, POS.outsideHouseDoor)) || (isCar && isAdj(player, POS.car));
              return (
                <div
                  key={`${x}-${y}`} onClick={() => clickOutside(x, y)}
                  title={isHouseDoor ? "Enter House" : isCar ? "Car" : undefined}
                  style={{ width: TILE, height: TILE, cursor: clickable ? "pointer" : "default", position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {isPlayer && <img src={playerSprite} alt="player" style={{ width: SIZE_PLAYER, height: SIZE_PLAYER, imageRendering: "pixelated", pointerEvents: "none" }} />}
                  {isHouseDoor && <img src={DOOR_SPRITE} alt="house door" style={{ width: SIZE_DOOR, height: SIZE_DOOR, pointerEvents: "none" }} />}
                  {isCar && <img src={CAR_PARKED} alt="car" style={{ width: SIZE_CAR, height: SIZE_CAR, imageRendering: "pixelated", pointerEvents: "none" }} />}
                </div>
              );
            })
          )}
          {toast && (
            <div style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(0,0,0,0.7)", color: "white",
              padding: "8px 12px", borderRadius: 8, fontSize: 14 }}>
              {toast}
            </div>
          )}
        </div>
        <InfoPanel />
      </div>
    );
  }

  if (gameState === "DRIVE") {
    const LANE_W = 100, ROW_H = 28, ROAD_W = LANE_W * DRIVE_LANES, ROAD_H = ROW_H * DRIVE_ROWS;
    const carFrame = driveBlink ? CAR_DRIVE1 : CAR_DRIVE0;
    const obsFrame = driveBlink ? OBST1 : OBST0;
    return (
      <div className="full-screen center flex-col" style={{ gap: 10, minHeight: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#0b1020,#0a0e19)" }}>
        <h2 style={{ ...bigTitle, fontSize: 36, textAlign: "center" }}>Evacuation: Dodge Obstacles!</h2>
        <div style={{ fontSize: 14, opacity: 0.8, color: "#e6edf6" }}>Survive {DRIVE_DURATION}s. Use ← → (A/D) to move.</div>
        <div style={{ position: "relative", width: ROAD_W, height: ROAD_H, background: "linear-gradient(180deg,#444,#222)",
          border: "4px solid #111", borderRadius: 8, overflow: "hidden", boxShadow: "0 8px 22px rgba(0,0,0,0.4)"}}>
          {[...Array(DRIVE_LANES - 1)].map((_, i) => (
            <div key={i} style={{ position: "absolute", left: (i + 1) * LANE_W - 2, top: 0, width: 4, height: "100%",
              background: "repeating-linear-gradient(#bbb 0 10px, transparent 10px 20px)", opacity: 0.6 }} />
          ))}
          {driveObstacles.map((o, idx) => (
            <img
              key={idx}
              src={obsFrame}
              alt="obstacle"
              style={{
                position: "absolute",
                left: o.lane * LANE_W + 14,
                top: o.row * ROW_H,
                width: LANE_W - 28,
                height: ROW_H - 4,
                imageRendering: "pixelated",
                pointerEvents: "none",
              }}
            />
          ))}
          <img
            src={carFrame}
            alt="car"
            style={{
              position: "absolute",
              left: driveLane * LANE_W + 12,
              bottom: 4,
              width: LANE_W - 24,
              height: ROW_H + 8,
              imageRendering: "pixelated",
              pointerEvents: "none",
            }}
          />
        </div>
        <div style={{ fontSize: 18, fontVariantNumeric: "tabular-nums", color: "#e6edf6" }}>
          Time left: <b>{driveTimeLeft}s</b>
        </div>
      </div>
    );
  }

  if (gameState === "END") {
    return (
      <div className="full-screen center flex-col" style={{ gap: 12, minHeight: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#0b1020,#0a0e19)" }}>
        <div style={glassCard}>
          <h2 style={{ ...bigTitle, fontSize: 40 }}>Impact</h2>
          <p style={{ fontSize: 18 }}>
            {result === "WIN"
              ? (mission === "shelter" ? "You survived in the bunker. ✅" : "You evacuated safely! ✅")
              : (mission === "shelter" ? "Not enough supplies or not in bunker. ❌" : "You crashed or ran out of time. ❌")}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "center" }}>
            <button
              onClick={startEncounter}
              style={primaryBtn}
              onMouseDown={(e)=>e.currentTarget.style.transform="translateY(1px)"}
              onMouseUp={(e)=>e.currentTarget.style.transform="translateY(0)"}
            >
              Play Again
            </button>
            <button
              onClick={() => { window.location.assign("/"); }}
              style={primaryBtn}
              onMouseDown={(e)=>e.currentTarget.style.transform="translateY(1px)"}
              onMouseUp={(e)=>e.currentTarget.style.transform="translateY(0)"}
            >
              Main Menu
            </button>
          </div>
          <div style={{ marginTop: 10, ...faintText }}>Tip: Use <b>E</b> to interact. Push against doors to use them.</div>
        </div>
      </div>
    );
  }

  return null;
}
