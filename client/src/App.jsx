import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

// Always loaded — part of the initial shell or loaded immediately on app boot
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUP from "./pages/SignUP";
import Loader from "./components/Loader";
import GetCurrentUser from "./customHooks/GetCurrentUser";
import GetChannelData from "./customHooks/GetChannelData";

// Lazy-loaded — only downloaded when the user navigates to that route
const Feed = lazy(() => import("./components/Feed"));
const Shorts = lazy(() => import("./components/Shorts"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const CreateChannel = lazy(() => import("./components/CreateChannel"));
const ViewChannel = lazy(() => import("./components/ViewChannel"));
const UpdateChannel = lazy(() => import("./components/UpdateChannel"));
const CreatePage = lazy(() => import("./pages/CreatePage"));
const CreateVideo = lazy(() => import("./components/CreateVideo"));
const CreateShorts = lazy(() => import("./components/CreateShorts"));
const CreatePlaylist = lazy(() => import("./components/CreatePlaylist"));
const CreatePost = lazy(() => import("./components/CreatePost"));
const WatchPage = lazy(() => import("./pages/WatchPage"));
const LikedVideos = lazy(() => import("./pages/LikedVideos"));
const SavedVideos = lazy(() => import("./pages/SavedVideos"));
const SavedPlaylists = lazy(() => import("./pages/SavedPlaylists"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));
const StudioDashboard = lazy(() => import("./pages/studio/StudioDashboard"));
const StudioAnalytics = lazy(() => import("./pages/studio/StudioAnalytics"));
const StudioRevenue = lazy(() => import("./pages/studio/StudioRevenue"));
const StudioContent = lazy(() => import("./pages/studio/StudioContent"));
const EditVideo = lazy(() => import("./pages/studio/EditVideo"));

// Wraps any route that requires login
function ProtectedRoute({ children }) {
  const { userData, authLoading } = useSelector((store) => store.user);
  if (authLoading) return null;
  if (!userData) {
    toast.error("Please login first to use this feature!");
    return <Navigate to="/login" replace />;
  }
  return children;
}

const browseRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      { index: true, element: <Feed /> },
      { path: "shorts", element: <Shorts /> },
      { path: "search", element: <SearchResults /> },
      {
        path: "viewChannel",
        element: (
          <ProtectedRoute>
            <ViewChannel />
          </ProtectedRoute>
        ),
      },
      {
        path: "updatechannel",
        element: (
          <ProtectedRoute>
            <UpdateChannel />
          </ProtectedRoute>
        ),
      },
      {
        path: "create",
        element: (
          <ProtectedRoute>
            <CreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "createvideo",
        element: (
          <ProtectedRoute>
            <CreateVideo />
          </ProtectedRoute>
        ),
      },
      {
        path: "createshort",
        element: (
          <ProtectedRoute>
            <CreateShorts />
          </ProtectedRoute>
        ),
      },
      {
        path: "createplaylist",
        element: (
          <ProtectedRoute>
            <CreatePlaylist />
          </ProtectedRoute>
        ),
      },
      {
        path: "createpost",
        element: (
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        ),
      },
      {
        path: "watch/:id",
        element: <WatchPage />,
      },
      // ── User library routes ──────────────────────────────────
      {
        path: "liked-videos",
        element: (
          <ProtectedRoute>
            <LikedVideos />
          </ProtectedRoute>
        ),
      },
      {
        path: "saved-videos",
        element: (
          <ProtectedRoute>
            <SavedVideos />
          </ProtectedRoute>
        ),
      },
      {
        path: "saved-playlists",
        element: (
          <ProtectedRoute>
            <SavedPlaylists />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "subscriptions",
        element: (
          <ProtectedRoute>
            <SubscriptionsPage />
          </ProtectedRoute>
        ),
      },
      // ── PT Studio routes ─────────────────────────────────────
      {
        path: "studio",
        element: (
          <ProtectedRoute>
            <StudioDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "studio/analytics",
        element: (
          <ProtectedRoute>
            <StudioAnalytics />
          </ProtectedRoute>
        ),
      },
      {
        path: "studio/revenue",
        element: (
          <ProtectedRoute>
            <StudioRevenue />
          </ProtectedRoute>
        ),
      },
      {
        path: "studio/content",
        element: (
          <ProtectedRoute>
            <StudioContent />
          </ProtectedRoute>
        ),
      },
      {
        path: "studio/content/edit/:id",
        element: (
          <ProtectedRoute>
            <EditVideo />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signUp", element: <SignUP /> },
  {
    path: "/createChannel",
    element: (
      <ProtectedRoute>
        <CreateChannel />
      </ProtectedRoute>
    ),
  },
]);

export const serverUrl = import.meta.env.VITE_SERVER_URL;

function App() {
  return (
    <>
    <Suspense fallback={<Loader/>} >
      <GetCurrentUser />
      <GetChannelData />
      <RouterProvider router={browseRouter} />
      <Toaster />
      </Suspense>
    </>
  );
}

export default App;
