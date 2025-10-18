
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import WorkHoursPage from "./pages/WorkHoursPage";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <Routes>
          {/* HOMEPAGE */}
          <Route path="/" element={<HomePage />} />

          {/* WORK HOURS PAGE */}
          <Route path="/work-hours" element={<WorkHoursPage />} />
        </Routes>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
