import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon } from "lucide-react";
import ChhavimityLogo from "./ChhavimityLogo";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-14 md:h-16 flex items-center">
      <div className="container mx-auto px-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="pl-2 md:pl-5">
              <Link to="/" className="flex items-center gap-1.5 md:gap-2.5">
                <ChhavimityLogo size="md" showText={true} />
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle btn-sm md:btn-md">
                <BellIcon className="h-4 w-4 md:h-6 md:w-6 text-base-content opacity-70" />
              </button>
            </Link>
          </div>

          {/* TODO */}
          <div className="hidden md:block">
            <ThemeSelector />
          </div>

          <div className="avatar">
            <div className="w-7 md:w-9 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
            </div>
          </div>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle btn-sm md:btn-md" onClick={logoutMutation}>
            <LogOutIcon className="h-4 w-4 md:h-6 md:w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
