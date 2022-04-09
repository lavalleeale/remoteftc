import React, { Suspense } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages";
import Control from "./pages/control";
const Proxy = React.lazy(() => import("./pages/proxy"));

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/control" element={<Control />} />
        <Route
          path="/proxy"
          element={
            <Suspense fallback={<p>Loading</p>}>
              <Proxy />
            </Suspense>
          }
        />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
