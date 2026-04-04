import DesktopNavigationMenu from "../../components/navigation/DesktopNavigationMenu";
import HomeNavigation from "../../components/navigation/HomeNavigation";

export default function Header() {
  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <HomeNavigation />
            {/* Desktop Navigation */}
            <DesktopNavigationMenu />
          </div>
        </div>
      </nav>
    </header>
  );
}
