import PageActions from "../components/PageActions";
import Stats from "../components/Stats";
import Filter from "../components/Filter";
import Items from "../components/Items";
import WorkCalendar from "../components/WorkCalendar";

const HomePage = () => (
  <div className="container page-content my-4">
    <PageActions />
    <WorkCalendar />
    <Stats />
    <Filter />
    <Items />
  </div>
);

export default HomePage;
