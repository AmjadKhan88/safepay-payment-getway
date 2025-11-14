import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// ✅ GLOBAL AXIOS CONFIG
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true; // ✅ NECESSARY FOR COOKIES

export const GlobalContext = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ✅ Fetch logged-in user (cookie-based)
  const getUser = async () => {
    try {
      const { data } = await axios.get("/api/users/get");
      data.user ? setUser(data.user) : setUser(null);
    } catch (error) {
      setUser(null);
      console.log(error);
    }
  };

  // ✅ Logout (clears cookie from backend)
  const logout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      await axios.post("/api/users/logout"); // ✅ server clears cookie
      setUser(null);
      navigate("/login");
      toast.success("Logout successful");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };



  useEffect(() => {
    getUser(); // ✅ Check auth on load
  }, []);

  const value = {
    axios,
    user,
    setUser,
    getUser,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAuth = () => useContext(AppContext);
