import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function App() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/simulation");
  };

  return (
    <div className="home-container">
      <h1>Welcome</h1>
      <button onClick={handleStart}>Start Simulation</button>
    </div>
  );
}
