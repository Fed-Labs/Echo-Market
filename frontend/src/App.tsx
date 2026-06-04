import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { CreateMarket } from "./pages/CreateMarket";
import { Market } from "./pages/Market";
import { Oracle } from "./pages/Oracle";
import { Submit } from "./pages/Submit";
import { Leaderboard } from "./pages/Leaderboard";
import { Guardian } from "./pages/Guardian";
import { Docs } from "./pages/Docs";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/create" element={<CreateMarket />} />
        <Route path="/market/:address" element={<Market />} />
        <Route path="/oracle" element={<Oracle />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/guardian" element={<Guardian />} />
        <Route path="/docs" element={<Docs />} />
      </Route>
    </Routes>
  );
}
