import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("mealcraft_token"));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  useEffect(() => {
    const savedName = localStorage.getItem("mealcraft_name");
    const savedPhoto = localStorage.getItem("mealcraft_photo");
    const savedToken = localStorage.getItem("mealcraft_token");

    if (savedToken) {
      setUser({ name: savedName, photo: savedPhoto });
      setToken(savedToken);
    }

    // Google OAuth redirect handle karo
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get("token");
    const googleName = urlParams.get("name");
    const googlePhoto = urlParams.get("photo");

    if (googleToken) {
      localStorage.setItem("mealcraft_token", googleToken);
      localStorage.setItem("mealcraft_name", decodeURIComponent(googleName || ""));
      localStorage.setItem("mealcraft_photo", decodeURIComponent(googlePhoto || ""));
      setToken(googleToken);
      setUser({ name: decodeURIComponent(googleName), photo: decodeURIComponent(googlePhoto) });
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("mealcraft_token", data.token);
    localStorage.setItem("mealcraft_name", data.fullName);
    if (data.photo) localStorage.setItem("mealcraft_photo", data.photo);
    setToken(data.token);
    setUser({ name: data.fullName, photo: data.photo });
  };

  const logout = () => {
    localStorage.removeItem("mealcraft_token");
    localStorage.removeItem("mealcraft_name");
    localStorage.removeItem("mealcraft_photo");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      authModalOpen,
      setAuthModalOpen,
      authModalTab,
      setAuthModalTab
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);