import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages";
import Control from "./pages/control";
import Proxy from "./pages/proxy";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/control" element={<Control />} />
        <Route path="/proxy" element={<Proxy />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
