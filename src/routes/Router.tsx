// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from '../shared/components/ProtectedRoute'; // Adjust the path if needed
import AddNewContract from 'src/features/crm/contracts/pages/AddContract';
import { element } from 'prop-types';
import ViewUsers from '../features/users/pages/UserManagementPage';
import AddNewCollection from 'src/features/crm/collections/pages/AddCollection';
import NewContact from '../features/contacts/pages/AddContact';
import ViewZones from '../features/zones/pages/ViewZones';
import NewZone from 'src/features/zones/pages/NewZone';
import EditZone from 'src/features/zones/pages/EditZone';
import RoleManagementPage from 'src/features/roles/pages/RoleManagementPage';
import EditJob from 'src/features/jobs/pages/EditJob';
import Unauthorized from 'src/shared/pages/Unauthorized';
import ViewJobs from '../features/jobs/pages/ViewJobs';
import AdditionalServiceRequestPage from 'src/features/crm/requests/pages/AdditionalServiceRequestPage';
import AdditionalServiceApprovalsPage from 'src/features/crm/requests/pages/AdditionalServiceApprovalsPage';
import ViewEmployees from '../features/employees/pages/ViewEmployees';
import ViewCustomers from '../features/customers/pages/ViewCustomers';
import NewCustomer from 'src/features/customers/pages/NewCustomer';
import EditCustomer from 'src/features/customers/pages/EditCustomer';
import ViewPrograms from 'src/features/programs/pages/ViewPrograms';
import NewProgram from 'src/features/programs/pages/NewProgram';
import EditProgram from 'src/features/programs/pages/EditProgram';
import ViewPricings from 'src/features/pricings/pages/ViewPricings';
import NewPricing from 'src/features/pricings/pages/NewPricing';
import Announcements from 'src/features/crm/management/pages/Announcements';
import ViewUncollectedTargets from 'src/features/crm/collections/pages/ViewUncollectedTargets';
import OutstandingReport from 'src/features/crm/collections/pages/OutstandingRecivablesReport';

import OperationalReports from 'src/features/crm/reports/pages/OperationalReports';
import ActionHistoryReport from 'src/features/crm/reports/pages/ActionHistoryReport';
import RejectedContractsReport from 'src/features/crm/reports/pages/RejectedContractsReport';
import MasterfileReport from 'src/features/crm/reports/pages/MasterfileReport';
import ContractContactsReport from 'src/features/crm/reports/pages/ContractContactsReport';
import TicketingPage from 'src/features/crm/tickets/pages/TicketingPage';
import AddTargetPlan from 'src/features/crm/targets/pages/AddTargetPlan';
import OutstandingMonthlySubscriptions from 'src/features/crm/collections/pages/OutstandingMonthlySubscriptions';
import ToDoList from 'src/features/crm/tasks/pages/ToDoList';
import TaskDetails from 'src/features/crm/tasks/pages/TaskDetails';
import InstallationAssignment from 'src/features/crm/tasks/pages/AssignInstallation';
import ManagerOfAll from 'src/features/crm/management/pages/ManagerOfAll';
import CollectAdditionalUnits from 'src/features/crm/collections/pages/CollectAdditionalUnits';
import SubscriptionCollectionPage from 'src/features/crm/targets/pages/Targets';
import UserZoneAssignments from 'src/features/administration/user-zones/pages/UserZoneAssignments';
import BankManagementPage from 'src/features/administration/banks/pages/BankManagementPage';
import ContractFollowUp from 'src/features/crm/contracts/pages/ContractFollowUp';
import ContractTypesManagementPage from 'src/features/contract-types/pages/ContractTypesManagementPage';
/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Authentication
const Login = Loadable(lazy(() => import('../features/auth/pages/LoginPage')));
const Register2 = Loadable(lazy(() => import('../views/authentication/auth2/Register')));
const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));

// Dashboards
const Modern = Loadable(lazy(() => import('../views/dashboards/Modern')));

// Pages
const UserProfile = Loadable(lazy(() => import('../views/pages/user-profile/UserProfile')));
const Employees = Loadable(lazy(() => import('../features/employees/pages/ViewEmployees')));

const Jobs = Loadable(lazy(() => import('../features/jobs/pages/ViewJobs')));

const NewEmployee = Loadable(lazy(() => import('../features/employees/pages/NewEmployee')));
const EditEmployee = Loadable(lazy(() => import('../features/employees/pages/EditEmployee')));
const LauncherPage = Loadable(lazy(() => import('../features/launcher/pages/LauncherPage')));
const NewJob = Loadable(lazy(() => import('../features/jobs/pages/NewJob')));
// Apps
const Notes = Loadable(lazy(() => import('../views/apps/notes/Notes')));
const Form = Loadable(lazy(() => import('../views/utilities/form/Form')));
const Table = Loadable(lazy(() => import('../views/utilities/table/Table')));
const Tickets = Loadable(lazy(() => import('../views/apps/tickets/Tickets')));
const CreateTickets = Loadable(lazy(() => import('../views/apps/tickets/CreateTickets')));
const Blog = Loadable(lazy(() => import('../views/apps/blog/Blog')));
const BlogDetail = Loadable(lazy(() => import('../views/apps/blog/BlogDetail')));

// Icons
const SolarIcon = Loadable(lazy(() => import('../views/icons/SolarIcon')));

// Error
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

// pageId is HARDCODED ,, fix later.....
const Router = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Modern /> },

      { path: 'apps/notes', element: <Notes /> },
      { path: 'utilities/form', element: <Form /> },
      { path: 'utilities/table', element: <Table /> },
      { path: 'apps/tickets', element: <Tickets /> },
      { path: 'apps/tickets/create', element: <CreateTickets /> },
      { path: 'apps/blog/post', element: <Blog /> },
      { path: 'apps/blog/detail/:id', element: <BlogDetail /> },
      { path: 'user-profile', element: <UserProfile /> },
      { path: 'icons/iconify', element: <SolarIcon /> },
      {
        path: 'users',
        element: (
          <ProtectedRoute route="/users" action_code="READ">
            <ViewUsers />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users/new-user',
        element: (
          <ProtectedRoute route="/users" action_code="CREATE">
            <ViewUsers />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users/edit',
        element: (
          <ProtectedRoute route="/users" action_code="WRITE">
            <ViewUsers />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contract-types',
        element: (
          <ProtectedRoute route="/contract-types" action_code="READ">
            <ContractTypesManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'zones',
        element: (
          <ProtectedRoute route="/zones" action_code="READ">
            <ViewZones />
          </ProtectedRoute>
        ),
      },
      {
        path: 'zones/new-zone',

        element: (
          <ProtectedRoute route="/zones" action_code="CREATE">
            <NewZone />
          </ProtectedRoute>
        ),
      },
      {
        path: 'zones/edit',
        element: (
          <ProtectedRoute route="/zones" action_code="WRITE">
            <EditZone />
          </ProtectedRoute>
        ),
      },
      {
        path: 'user-zone-assignments',
        element: (
          <ProtectedRoute route="/user-zone-assignments" action_code="READ">
            <UserZoneAssignments />
          </ProtectedRoute>
        ),
      },
      {
        path: 'banks',
        element: (
          <ProtectedRoute route="/banks" action_code="READ">
            <BankManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'roles/edit',
        element: (
          <ProtectedRoute route="/roles" action_code="WRITE">
            <RoleManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'roles',
        element: (
          <ProtectedRoute route="/roles" action_code="READ">
            <RoleManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'roles/new-role',
        element: (
          <ProtectedRoute route="/roles" action_code="CREATE">
            <RoleManagementPage />
          </ProtectedRoute>
        ),
      },
      { path: '/unauthorized', element: <Unauthorized /> },
      { path: '/announcements', element: <Announcements /> },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
      {
         path: 'programs',
        element: (
          <ProtectedRoute route="/programs" action_code="READ">
            <ViewPrograms />
          </ProtectedRoute>
        ),
      },
      {
         path: 'programs/new-program',
        element: (
          <ProtectedRoute route="/programs" action_code="CREATE">
            <NewProgram />
          </ProtectedRoute>
        ),
      },
       {
         path: 'programs/edit',
        element: (
          <ProtectedRoute route="/programs" action_code="WRITE">
            <EditProgram />
          </ProtectedRoute>
        ),
      },
      {
        path:'add-new-collection',
        element: (
          // <ProtectedRoute route="/collections" action_code="CREATE">
            <AddNewCollection />
          // </ProtectedRoute>
        ),
      },
      {
        path: '/add-new-contract',
        element: (
          // <ProtectedRoute route="/contracts" action_code="CREATE">
            <AddNewContract />
          // </ProtectedRoute>
        ),
      },
      {
        path: '/add-new-request',
        element: (
          <ProtectedRoute route="/add-new-request" action_code="CREATE">
            <AdditionalServiceRequestPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/additional-service-requests',
        element: (
          <ProtectedRoute route="/additional-service-requests" action_code="READ">
            <AdditionalServiceApprovalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/contract-follow-up',
        element: <ContractFollowUp />,
      },
      {
        path: '/operational-reports',
        element: <OperationalReports />,
      },
      {
        path: '/action-history-report',
        element: <ActionHistoryReport />,
      },      {
        path: '/rejected-contracts-report',
        element: <RejectedContractsReport />,
      },      {
        path: '/masterfile-report',
        element: <MasterfileReport />,
      },
      {
        path: '/contract-contacts-report',
        element: (
          <ProtectedRoute route="/contract-contacts-report" action_code="READ">
            <ContractContactsReport />
          </ProtectedRoute>
        ),
      },
      {
        path: '/customer-tickets',
        element: <TicketingPage />,
      },
      {
        path:'/collect-additional-units',
        element:(
          <CollectAdditionalUnits />
        )
      },
      {
        path:'/targets',
        element:(
          <SubscriptionCollectionPage />
        )
      }
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'auth/auth2/register', element: <Register2 /> },
      { path: 'auth/maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: 'auth/404', element: <Error /> },

      { path: '*', element: <Navigate to="/auth/404" replace /> },
      {
        path: 'desk',
        element: (
          <ProtectedRoute>
            <LauncherPage />
          </ProtectedRoute>
        ),
      },

    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
