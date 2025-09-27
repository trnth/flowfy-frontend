import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster />
    </Provider>
  </StrictMode>
);
