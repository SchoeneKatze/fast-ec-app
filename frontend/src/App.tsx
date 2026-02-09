import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home.tsx";
import Callback from "./pages/callback/Callback.jsx";
import SettingsPage from "./pages/settings/Settings.tsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
