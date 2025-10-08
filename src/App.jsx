
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WorkHoursPage from "./pages/WorkHoursPage";

const App = () => {
  return (
      <Routes>
        {/* HOMEPAGE */}
        <Route path="/" element={<HomePage />} />

        {/* WORK HOURS PAGE */}
        <Route path="/work-hours" element={<WorkHoursPage />} />
      </Routes>
  );
};

export default App;
