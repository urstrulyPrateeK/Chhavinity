import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <Navbar />

          <main className="flex-1 overflow-y-auto px-2 md:px-4 pb-16 md:pb-4">
            {children}
          </main>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};
export default Layout;
