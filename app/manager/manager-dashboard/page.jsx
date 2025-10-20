import { useSelector } from "react-redux";
import DashboardPageView from "./page-view";
import { getDictionary } from "@/app/dictionaries";
import PageNotFound from '../../../app/not-found';
const Dashboard = async ({ params: { lang } }) => {
  // const user = useSelector((state) => state.user);
  // const isAdmin = user.role === 'ADMIN';
  const trans = await getDictionary(lang);
  return (
    // isAdmin ? <PageNotFound /> :
     <DashboardPageView trans={trans} />);
};

export default Dashboard;
