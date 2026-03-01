import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landingpage";
import Auth from "./pages/Auth";
import ChatBotInterface from "./pages/ChatBotInterface.jsx";
import DashboardUser from "./pages/UserDashboard";
import SubmitReport from "./pages/SubmitReport";
// import ManageReports from "./pages/ManageReports";
import Settings from "./pages/Settings";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import ReviewRequests from "./pages/ReviewToRequests";
import AdminDashboard from "./pages/admin/AdminDashboard";
import "./components/ChartSetup";
import AdminSubmittion from "./pages/admin/SubmitionPage";
import AdminTeamManagement from "./pages/admin/AdminTeamManagement";
// import AdminAssignReviews from "./pages/admin/AdminAssignReviews.jsx";
import AdminReviews from "./pages/admin/AdminReviews.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/user/dashboard" element={<DashboardUser />} />
      <Route path="/user/submit" element={<SubmitReport />} />
      {/* <Route path="/user/manage" element={<ManageReports />} /> */}
      <Route path="/user/settings" element={<Settings />} />
      <Route path="/user/chatbot" element={<ChatBotInterface />} />
      <Route path="/reviewer/dashboard" element={<ReviewerDashboard />} />
      <Route path="/reviewer/review-requests" element={<ReviewRequests />} />
      <Route path = "/admin/dashboard" element ={<AdminDashboard/>}/>
       <Route path = "/admin/submissions" element ={<AdminSubmittion/>}/>
       <Route path = "/admin/manageteam" element ={<AdminTeamManagement/>}/>
      {/* <Route path = "/admin/assign-reviews" element ={<AdminAssignReviews/>}/> */}
      <Route path = "/admin/reviews" element ={<AdminReviews/>}/>
     {/* <Route path = "/admin/reviews" element ={<AdminDashboard/>}/>
      <Route path = "/admin/decisions" element ={<AdminDashboard/>}/>
      
      <Route path = "/admin/ai-governance" element ={<AdminDashboard/>}/>
      <Route path = "/admin/audit-logs" element ={<AdminDashboard/>}/>
      <Route path = "/admin/settings" element ={<AdminDashboard/>}/> */}
    </Routes>
  );
}
