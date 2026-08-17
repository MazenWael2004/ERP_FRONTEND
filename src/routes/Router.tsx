// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from '../shared/components/ProtectedRoute'; // Adjust the path if needed
import { element } from 'prop-types';
import ViewUsers from '../features/users/pages/ViewUsers';
import EditUser from 'src/features/users/pages/EditUser';
import ViewZones from '../features/zones/pages/ViewZones';
import NewZone from 'src/features/zones/pages/NewZone';
import EditZone from 'src/features/zones/pages/EditZone';
import EditRole from 'src/features/roles/pages/EditRole';
import ViewRoles from 'src/features/roles/pages/ViewRoles';
import NewRole from 'src/features/roles/pages/NewRole';
import EditJob from 'src/features/jobs/pages/EditJob';
import Unauthorized from 'src/shared/pages/Unauthorized';
import ViewJobs from '../features/jobs/pages/ViewJobs';
import ViewEmployees from '../features/employees/pages/ViewEmployees';
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
const NewUser = Loadable(lazy(() => import('../features/users/pages/NewUser')));
const NewJob =  Loadable(lazy(() => import('../features/jobs/pages/NewJob')));
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
        path: 'employees',
        element: (
          <ProtectedRoute route = '/employees' action_code = 'READ'>
            <ViewEmployees />
          </ProtectedRoute>
        ),
      },
      { path: 'employees/new-employee', element: <NewEmployee /> },
       {
        path: 'employees/edit',
        element: (
          <ProtectedRoute route = '/employees' action_code = 'WRITE'>
            <EditEmployee />
          </ProtectedRoute>
        ),
      },
       {
        path: 'users',
        element: (
          <ProtectedRoute route = '/users' action_code = 'READ'>
            <ViewUsers />
          </ProtectedRoute>
        ),
      },
      { path: 'users/new-user', element: <NewUser /> },
      {
        path: 'users/edit',
        element: (
          <ProtectedRoute route = '/users' action_code = 'WRITE'>
            <EditUser />
          </ProtectedRoute>
        ),
      },
      {
        path: 'jobs',
        element: (
          <ProtectedRoute  route = '/jobs' action_code = 'READ'>
            <ViewJobs />
          </ProtectedRoute>
        ),
      },
      {path: 'jobs/new-job', element: <NewJob /> },
      {
        path: 'zones',
        element: (
          <ProtectedRoute  route = '/zones' action_code = 'READ'>
            <ViewZones />
          </ProtectedRoute>
        ),
      },
      {path:"zones/new-zone", element: <NewZone />},
      {
        path: 'zones/edit',
        element: (
          <ProtectedRoute route = '/zones' action_code = 'WRITE'>
            <EditZone />
          </ProtectedRoute>
        ),
      },
       {
        path: 'roles/edit',
        element: (
          <ProtectedRoute route = '/roles' action_code = 'WRITE'>
            <EditRole />
          </ProtectedRoute>
        ),
      },
      {
        path: 'jobs/edit',
        element: (
          <ProtectedRoute route = '/jobs' action_code = 'WRITE'>
            <EditJob />
          </ProtectedRoute>
        ),
      },
      {
        path: 'roles',
        element: (
          <ProtectedRoute  route = '/roles' action_code = 'READ'>
            <ViewRoles />
          </ProtectedRoute>
        ),
      },
      {path:"roles/new-role", element: <NewRole />},
      {path:"/unauthorized",element: <Unauthorized />},
      { path: '*', element: <Navigate to="/auth/404" replace /> },
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
