import Signup from "@/components/Signup";
import Login from "@/components/Login";
import MainLayout from "@/components/MainLayout";
import Home from "@/components/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import useAuthCheck from "./hooks/useAuthCheck";
import useSocket from "./hooks/useSocket";
import { useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { useEffect } from "react";
import { setSelectedUser } from "./redux/authSlice";
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />,
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
  useAuthCheck();
  const socket = useSocket();
  const { isAuthLoading, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    if (location.pathname !== "/direct/inbox") {
      dispatch(setSelectedUser(null));
    }
  }, [location.pathname, dispatch]);
  if (isAuthLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}
export default App;
