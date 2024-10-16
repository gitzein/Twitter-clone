import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Layout from "./components/common/Layout";
import FollowingPage from "./pages/profile/FollowingPage";
import SinglePost from "./pages/single-post/SinglePost";
import BookmarksPage from "./pages/bookmarks/BookmarksPage";
import ConnectPage from "./pages/connect/ConnectPage";

function App() {
  const { data: authUser, isLoading } = useQuery({
    // we use queryKey to give a unique name to our query and refer to it later
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.message === "Unauthorized") return null;
        if (!res.ok) {
          throw new Error("Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      <Routes>
        <Route
          path="login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route element={authUser ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<HomePage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="post/:id" element={<SinglePost />} />
          <Route
            path="following/:username"
            element={<FollowingPage followType={"following"} />}
          />
          <Route
            path="followers/:username"
            element={<FollowingPage followType={"followers"} />}
          />
          <Route path="connect" element={<ConnectPage />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
