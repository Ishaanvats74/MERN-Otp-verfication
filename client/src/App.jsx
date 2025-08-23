import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import OtpVerification from "./pages/OtpVerification";
import { useContext, useEffect } from "react";
import { Context } from "./main";


const routes = [
  { path: "/", element: <Home /> },
  { path: "/auth", element: <Auth /> },
  { path: "/otp-verification/:email/:phone", element: <OtpVerification /> },
  { path: "/password/forgot", element: <ForgotPassword /> },
  { path: "/password/reset/:token", element: <ResetPassword /> },
];
const App = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);

  useEffect(() => {
    const getUser = async () => {
      await axios
        .get("http://localhost:4000/api/v1/user/me", { withCredentials: true })
        .then((res) => {
          setUser(res.data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setUser(null);
          setIsAuthenticated(false);
        });
    };
    getUser();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          {routes.map((item, index) => (
          <Route key={index} path={item.path} element={item.element} />
          
        ))}
        </Routes>
        <ToastContainer theme="colored" />
      </Router>
    </>
  );
};

export default App;