import Signup from "@/components/Signup";
import Login from "@/components/Login";
import MainLayout from "@/components/MainLayout";
import Home from "@/components/Home";
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import useSocket from "./hooks/useSocket";
import { useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { useEffect } from "react";
import { resetPosts } from "./redux/postSlice";
import { resetSocket } from "./redux/socketSlice";
import { resetChat } from "./redux/chatSlice";
import { resetNotification } from "./redux/notificationSlice";
import useVerified from "./hooks/useVerified";
import { setSelectedUser } from "./redux/userSlice";
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/accounts/edit",
        element: (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/direct/inbox/",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

function App() {
  useVerified();
  const socket = useSocket();
  const { user, isVerified } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.pathname !== "/direct/inbox/") {
      dispatch(setSelectedUser(null));
    }
  }, [location.pathname, dispatch]);
  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(resetAuth());
      dispatch(resetPosts());
      dispatch(resetSocket());
      dispatch(resetChat());
      dispatch(resetNotification());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch]);
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}
export default App;
