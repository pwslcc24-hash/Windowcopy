import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Calendar from './pages/Calendar';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import NewCustomer from './pages/NewCustomer';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Inbox": Inbox,
    "Calendar": Calendar,
    "Jobs": Jobs,
    "JobDetail": JobDetail,
    "Customers": Customers,
    "CustomerDetail": CustomerDetail,
    "NewCustomer": NewCustomer,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};