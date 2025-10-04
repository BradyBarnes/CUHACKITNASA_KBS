import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Simulation from "./Simulation";
import AsteroidInfo from "./AsteroidInfo";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/asteroid-info" element={<AsteroidInfo />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
