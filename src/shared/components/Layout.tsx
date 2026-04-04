import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import MobileNavigationMenu from "./navigation/MobileNavigationMenu";
import ScrollToTopButton from "./navigation/ScrollToTopButton";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
        <ScrollToTopButton />
      </main>
      <MobileNavigationMenu />
      <Footer />
    </div>
  );
}
