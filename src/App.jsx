
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import WorkHoursPage from "./pages/WorkHoursPage";
import StatsPage from "./pages/StatsPage";
import MonthlyEarningsPrompt from "./components/MonthlyEarningsPrompt";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <MonthlyEarningsPrompt />
        <Routes>
          {/* HOMEPAGE */}
          <Route path="/" element={<HomePage />} />

          <Route path="/stats" element={<StatsPage />} />

          {/* WORK HOURS PAGE */}
          <Route path="/work-hours" element={<WorkHoursPage />} />
        </Routes>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
