
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WorkHoursPage from "./pages/WorkHoursPage";

const App = () => {
  return (
      <Routes>
        {/* Αρχική σελίδα */}
        <Route path="/" element={<HomePage />} />

        {/* Σελίδα με τις ώρες εργασίας */}
        <Route path="/work-hours" element={<WorkHoursPage />} />
      </Routes>
  );
};

export default App;
