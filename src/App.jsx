
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import WorkHoursPage from "./pages/WorkHoursPage";

const App = () => {
  return (
    <AppProvider>
      <Routes>
        {/* HOMEPAGE */}
        <Route path="/" element={<HomePage />} />

        {/* WORK HOURS PAGE */}
        <Route path="/work-hours" element={<WorkHoursPage />} />
      </Routes>
    </AppProvider>
  );
};

export default App;
