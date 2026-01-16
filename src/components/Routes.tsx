import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./Layout";
import TicketList from "./Ticket/List";
import Auth from "./Auth/Auth"
import Users from "./User/Users"
import CreateUser from "./User/CreateUser"
import Ticket from "./Ticket/Ticket"
import Organization from "./Organization/Organization";
import OrganizationList from "./Organization/List";
import Contact from "./Contact/Contact";
import ContactList from "./Contact/List";
import MasterTask from "./MasterTask/MasterTask";
import MasterTaskList from "./MasterTask/List";
import Product from "./Product/Product";
import ProductList from "./Product/List";
import TaskList from "./Task/List";
import DealList from "./Deal/List";
import DealPage from "./Deal/Deal";
import TicketView from "./Ticket/TicketView";
import OrganizationView from "./Organization/OrganizationView";
import ContactView from "./Contact/ContactView";
import DealView from "./Deal/DealView";
import NotFound from "../NotFound";
import ESign from "./Other/ESign";
import DealReport from "./Report/DealReport";
import VisitReport from "./Report/VisitReport";
import Dashboard from "./Dashboard";
import TaskListView from  "./Task/TaskList"

interface PropType {
  setIsDark: () => void;
  isDark: boolean;
}

const Routes = (props: PropType) =>
  createBrowserRouter(
    [
      {
        path: "/login",
        element: <Auth />,
      },
      {
        path: "/esign",
        element: <ESign />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/",
        element: <Layout setIsDark={props.setIsDark} isDark={props.isDark} />,
        children: [
          {
            path: "",
            element: <Dashboard />
          },
          {
            path: "/tickets",
            element: <TicketList />
          },
          {
            path: "/task",
            element: <TaskListView/>
          },
          {
            path: "/ticket/:uid",
            element: <TicketView />
          },
          {
            path: "/ticket/form",
            element: <Ticket />
          },
          {
            path: "/ticket/form/:uid",
            element: <Ticket />
          },
          {
            path: "/ticket/task/:tkid",
            element: <TaskList />
          },
          {
            path: "/users",
            element: <Users />
          },
          {
            path: "/user/form",
            element: <CreateUser />
          },
          {
            path: "/user/form/:userId",
            element: <CreateUser />
          },
          {
            path: "/organizations",
            element: <OrganizationList />
          },
          {
            path: "/organization/:orgId",
            element: <OrganizationView />
          },
          {
            path: "/organization/form",
            element: <Organization />
          },
          {
            path: "/organization/form/:orgId",
            element: <Organization />
          },
          {
            path: "/contacts",
            element: <ContactList />
          },
          {
            path: "/contact/:cid",
            element: <ContactView />
          },
          {
            path: "/contact/form",
            element: <Contact />
          },
          {
            path: "/contact/form/:cid",
            element: <Contact />
          },
          {
            path: "/mastertask",
            element: <MasterTaskList />
          },
          {
            path: "/mastertask/form",
            element: <MasterTask />
          },
          {
            path: "/mastertask/form/:mid",
            element: <MasterTask />
          },
          {
            path: "/product",
            element: <ProductList />
          },
          {
            path: "/product/form",
            element: <Product />
          },
          {
            path: "/product/form/:pid",
            element: <Product />
          },
          {
            path: "/deals",
            element: <DealList />
          },
          {
            path: "/deal/:did",
            element: <DealView />
          },
          {
            path: "/deal/form",
            element: <DealPage />
          },
          {
            path: "/deal/form/:did",
            element: <DealPage />
          },
          {
            path: "/report/deal",
            element: <DealReport />
          },
          {
            path: "/report/visit",
            element: <VisitReport />
          },
        ],
      },
    ],
    {
      future: {
        v7_fetcherPersist: true,
        v7_relativeSplatPath: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
      }
    }
  );

export default Routes;
