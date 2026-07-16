import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const PageLayout = () => {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-shell__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
