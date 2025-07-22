import { Navigate, Route, Routes } from "react-router";
import { useEffect, useRef } from "react";

import HomePage from "./pages/HomePage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import RemoveFriendsPage from "./pages/RemoveFriendsPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import PWAInstallPrompt from "./components/PWAInstallPrompt.jsx";
import StreamChatNotifications from "./components/StreamChatNotifications.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { StreamChatProvider } from "./context/StreamChatContext.jsx";
import OnlineStatusService from "./services/OnlineStatusService.js";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const onlineStatusService = useRef(null);

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  // Initialize online status tracking for authenticated users
  useEffect(() => {
    if (isAuthenticated && isOnboarded) {
      if (!onlineStatusService.current) {
        onlineStatusService.current = new OnlineStatusService();
        onlineStatusService.current.init();
      }
    } else {
      // Cleanup when user logs out
      if (onlineStatusService.current) {
        onlineStatusService.current.destroy();
        onlineStatusService.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (onlineStatusService.current) {
        onlineStatusService.current.destroy();
      }
    };
  }, [isAuthenticated, isOnboarded]);

  if (isLoading) return <PageLoader />;

  return (
    <NotificationProvider>
      <StreamChatProvider>
        <div className="h-screen" data-theme={theme}>
          {/* Global notification listener for authenticated users */}
          {isAuthenticated && isOnboarded && <StreamChatNotifications />}
          
          <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/remove-friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <RemoveFriendsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/call/:id"
          element={<CallPage />}
        />

        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        </Routes>

        <PWAInstallPrompt />
        <Toaster />
      </div>
    </StreamChatProvider>
  </NotificationProvider>
  );
};
export default App;