import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileNavigationMenu from "../../components/navigation/MobileNavigationMenu";
import ScrollToTopButton from "../../components/navigation/ScrollToTopButton";

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
