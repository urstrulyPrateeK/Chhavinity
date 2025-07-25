import { Link, useLocation } from 'react-router';
import { Home, Users, MessageCircle, Bell, User } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import useAuthUser from '../hooks/useAuthUser';

const MobileBottomNav = () => {
  const location = useLocation();
  const { authUser } = useAuthUser();
  const { getTotalUnreadCount } = useNotifications();

  if (!authUser) return null;

  const totalUnread = getTotalUnreadCount();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
    },
    {
      path: '/friends',
      icon: Users,
      label: 'Friends',
    },
    {
      path: '/notifications',
      icon: Bell,
      label: 'Requests',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-base-200 border-t border-base-300 px-2 py-1 safe-area-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1 relative ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-base-content/60 hover:text-base-content hover:bg-base-300/50'
                }`}
              >
                <div className="relative">
                  <Icon className="size-5" />
                  {/* Show unread badge on Home icon when there are unread messages */}
                  {item.path === '/' && totalUnread > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-error rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {totalUnread > 99 ? '99+' : totalUnread}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
