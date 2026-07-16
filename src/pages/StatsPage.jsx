import { Link } from "react-router-dom";
import PageActions from "../components/PageActions";
import Stats from "../components/Stats";

const StatsPage = () => {
  return (
    <>
      <div className="container page-content my-4 my-md-5">
        <PageActions />
        <Stats />

        <div className="text-center mt-4 mb-3">
          <Link to="/" className="btn btn-outline-primary fw-bold px-4 py-2 rounded-3">
            <i className="fa-solid fa-arrow-left me-2" aria-hidden></i>
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default StatsPage;
