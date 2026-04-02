import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/main/Home";
import Layout from "./components/layout/Layout";
import ProfileDetail from "./features/profile/detail/pages/ProfileDetail";
import Login from "./features/auth/pages/Login";
import Search from "./features/search/pages/Search";
import SignUp from "./features/auth/pages/SignUp";
import { ProfilesProvider } from "./contexts/ProfilesContext";
import Verify from "./features/auth/pages/Verify";
import Settings from "./features/profile/settings/pages/Settings";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import GuestRoute from "./features/auth/components/GuestRoute";

function App() {
  return (
    <ProfilesProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/:username" element={<ProfileDetail />} />
            <Route path="/search" element={<Search />} />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <SignUp />
                </GuestRoute>
              }
            />
            <Route path="/verify" element={<Verify />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProfilesProvider>
  );
}

export default App;
