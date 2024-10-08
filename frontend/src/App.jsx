import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/login/LoginPage.jsx";
import SignUpPage from "./pages/auth/signup/SignUpPage.jsx";
import HomePage from "./pages/home/HomePage.jsx";
import Sidebar from "./components/common/Sidebar.jsx";
import RightPanel from "./components/common/RightPanel.jsx";
import NotificationPage from "./pages/notification/NotificationPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";

function App() {
  const{data: authUser, isLoading} = useQuery({
    queryKey: ["authUser"], //we use queryKey to identify the query for future use. Also, keep in mind to use camel case for queryKey IT IS NOT querykey.
    queryFn: async() => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if(data.error) return null;
        if(!res.ok || data.error){throw new Error(data.error || "Failed to get user")};
        console.log("authUser is here: ", data);
        return data;
        
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if(isLoading){
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size = "lg"/>
      </div>
    )
  }
  return (
    <>
      <div className='flex max-w-6xl mx-auto'>
        {/* common component as it is not wrapped by routes */}
        {authUser && <Sidebar />}
        <Routes>
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to = "/login" />} />
          <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to = "/" />} />
          <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to = "/" />} />
          <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to = "/login" />} />
          <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to = "/login" />} />
        </Routes>
        {authUser && <RightPanel />}
        <Toaster />
      </div>
    </>
  );
}

export default App
