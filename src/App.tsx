import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import GuestRoute from "./features/auth/components/GuestRoute";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import Login from "./features/auth/pages/Login";
import SignUp from "./features/auth/pages/SignUp";
import Verify from "./features/auth/pages/Verify";
import ProfileDetail from "./features/profile/detail/pages/ProfileDetail";
import Settings from "./features/profile/settings/pages/Settings";
import Search from "./features/search/pages/Search";
import Home from "./pages/main/Home";
import Layout from "./shared/components/Layout";
import { ProfilesProvider } from "./shared/contexts/ProfilesContext";

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
