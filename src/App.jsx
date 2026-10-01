
import { Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppProvider";
import PageLayout from "./components/PageLayout";
import HomePage from "./pages/HomePage";
import WorkHoursPage from "./pages/WorkHoursPage";
import StatsPage from "./pages/StatsPage";
import HelpPage from "./pages/HelpPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import MonthlyEarningsPrompt from "./components/MonthlyEarningsPrompt";
import { ThemeProvider } from "./context/ThemeProvider";

const App = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <MonthlyEarningsPrompt />
        <Routes>
          <Route element={<PageLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/work-hours" element={<WorkHoursPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
