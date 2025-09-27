import Signup from "@/components/Signup";
import Login from "@/components/Login";
import MainLayout from "@/components/MainLayout";
import Home from "@/components/Home";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage from "./components/ChatPage";
import useSocket from "./hooks/useSocket";
import { useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { useEffect } from "react";
import useVerified from "./hooks/useVerified";
import Setting from "./components/Setting";
import { setSelectedConversation } from "./redux/chatSlice";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ToastProvider } from "./contexts/ToastContext";
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
            <Setting />
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
  useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== "/direct/inbox/") {
      dispatch(setSelectedConversation(null));
    }
  }, [dispatch]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <RouterProvider router={browserRouter} />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
export default App;
