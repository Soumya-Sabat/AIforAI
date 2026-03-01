import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function ManageReports(){
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 text-white">
          <h1 className="text-2xl font-bold mb-4">Manage Reports</h1>

          <div className="bg-[#0D0D14] p-4 rounded-lg border border-white/5">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-400">
                <tr><th>ID</th><th>Title</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody className="text-gray-200">
                <tr className="border-t border-white/5"><td>#127</td><td>Hate prompt</td><td>Pending</td><td>2025-11-30</td></tr>
                <tr className="border-t border-white/5"><td>#120</td><td>Misinformation</td><td>Verified</td><td>2025-11-25</td></tr>
                <tr className="border-t border-white/5"><td>#115</td><td>Toxic answer</td><td>Rejected</td><td>2025-11-20</td></tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
