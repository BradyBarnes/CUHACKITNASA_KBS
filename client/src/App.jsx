import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function App() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/simulation");
  };

  const handleAsteroidInfo = () => {
    navigate("/asteroid-info");
  };

  return (
    <div className="home-container">
      <h1>Welcome</h1>
      <div className="button-group" style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <button onClick={handleStart}>Start Simulation</button>
        <button onClick={handleAsteroidInfo}>Asteroid Info</button>
      </div>
    </div>
  );
}
