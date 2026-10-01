import { useContext } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { AppProvider } from "./context/AppProvider";
import { AuthProvider } from "./context/AuthProvider";
import { AuthContext } from "./context/AuthContext";
import PageLayout from "./components/PageLayout";
import HomePage from "./pages/HomePage";
import WorkHoursPage from "./pages/WorkHoursPage";
import StatsPage from "./pages/StatsPage";
import HelpPage from "./pages/HelpPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import MonthlyEarningsPrompt from "./components/MonthlyEarningsPrompt";
import { ThemeProvider } from "./context/ThemeProvider";

/** Only same-site paths, so ?next= can't send anyone elsewhere. */
const safeNext = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";

/** Already signed in: /login and /signup forward to where the user was going. */
const AfterSignIn = () => {
  const [params] = useSearchParams();
  return <Navigate to={safeNext(params.get("next"))} replace />;
};

/**
 * Accounts are optional: Money Map always opens. Without an account it uses
 * this device's data as before; signed in, it shows that account's data.
 */
const AppRoutes = () => {
  const { account } = useContext(AuthContext);

  return (
    // A fresh provider per account (or the guest), so it reads the right data.
    <AppProvider key={account?.id ?? "guest"}>
      <MonthlyEarningsPrompt />
      <Routes>
        <Route path="/login" element={account ? <AfterSignIn /> : <AuthPage mode="login" />} />
        <Route path="/signup" element={account ? <AfterSignIn /> : <AuthPage mode="signup" />} />
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
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
