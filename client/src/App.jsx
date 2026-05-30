import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import SignUP from "./pages/SignUP";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Shorts from "./components/Shorts";
import Feed from "./components/Feed";
import GetCurrentUser from "./customHooks/GetCurrentUser";
import CreateChannel from "./components/CreateChannel";
import ViewChannel from "./components/ViewChannel";
import GetChannelData from "./customHooks/GetChannelData";
import UpdateChannel from "./components/UpdateChannel";
import { useSelector } from "react-redux";
import CreatePage from "./pages/CreatePage";
import CreateVideo from "./components/CreateVideo";
import CreateShorts from "./components/CreateShorts";
import CreatePlaylist from "./components/CreatePlaylist";
import CreatePost from "./components/CreatePost";
import WatchPage from "./pages/WatchPage";
import LikedVideos from "./pages/LikedVideos";
import SavedVideos from "./pages/SavedVideos";
import SavedPlaylists from "./pages/SavedPlaylists";
import HistoryPage from "./pages/HistoryPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import SearchResults from "./pages/SearchResults";
import StudioDashboard from "./pages/studio/StudioDashboard";
import StudioAnalytics from "./pages/studio/StudioAnalytics";
import StudioRevenue from "./pages/studio/StudioRevenue";
import StudioContent from "./pages/studio/StudioContent";
import EditVideo from "./pages/studio/EditVideo";

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

export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

function App() {
  return (
    <>
      <GetCurrentUser />
      <GetChannelData />
      <RouterProvider router={browseRouter} />
      <Toaster />
    </>
  );
}

export default App;
