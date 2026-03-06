"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FiGrid, FiFileText, FiLogOut, FiMenu, FiSearch } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

export default function ReviewRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reviews, setReviews]         = useState([]);
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [sortOrder, setSortOrder]     = useState("newest");
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [feedbackMap, setFeedbackMap] = useState({});
  const pageSize = 5;

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const currentUserId = decoded?.id || decoded?._id;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/reports/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReviews(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const updateStatus = async (reportId, decision) => {
    const feedback = feedbackMap[reportId];
    if (!feedback || feedback.trim().length < 3) { alert("⚠ Feedback must be at least 3 characters."); return; }
    try {
      const res = await fetch(`http://localhost:5000/api/reports/peer-review/${reportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: decision, remarks: feedback, reviewType: "peer" }),
      });
      if (!res.ok) { const data = await res.json(); alert(data.message); return; }
      fetchReviews();
    } catch (err) { console.error(err); }
  };

  const filtered = useMemo(() => {
    return reviews
      .filter((r) => {
        if (filter === "all") return true;
        const myReview = r.reviews?.find(
          (rv) => rv.reviewType === "peer" && rv.reviewedBy?._id?.toString() === currentUserId
        );
        if (filter === "pending") return !myReview;
        if (filter === "approved") return myReview?.status === "approved";
        if (filter === "rejected") return myReview?.status === "rejected";
        return true;
      })
      .filter((r) => r.prompt.toLowerCase().includes(search.toLowerCase()));
  }, [reviews, filter, search, currentUserId]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const at = new Date(a.createdAt || 0).getTime();
      const bt = new Date(b.createdAt || 0).getTime();
      return sortOrder === "newest" ? bt - at : at - bt;
    });
  }, [filtered, sortOrder]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [filter, search, sortOrder]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a12] text-white">
        <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-lg animate-pulse text-purple-300">Fetching review requests…</p>
      </div>
    );
  }

  const selectCls = "w-full p-2.5 rounded-lg bg-gray-900 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition";

  return (
    <div className="flex min-h-screen bg-[#0a0a12]">
      <Sidebar
        menu={[
          { label: "Dashboard",         path: "/reviewer/dashboard",       icon: FiGrid },
          { label: "Reports to Review", path: "/reviewer/review-requests", icon: FiFileText },
          { label: "Logout",            action: "logout",                   icon: FiLogOut },
        ]}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 py-3
                        bg-[#0a0a12]/90 backdrop-blur border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition"
          >
            <FiMenu size={22} />
          </button>
          <div className="flex-1"><Header /></div>
        </div>

        <div className="p-4 sm:p-6 text-white overflow-x-hidden">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Review Requests</h1>

          {/* Search + Filters */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 mb-6">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="text"
                placeholder="Search by prompt…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-gray-900 border border-white/10
                           text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={selectCls}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={selectCls}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Results count */}
          <p className="text-xs text-gray-500 mb-4">
            Showing {paginated.length} of {sorted.length} results
          </p>

          {/* Cards */}
          {paginated.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">No reports found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <AnimatePresence>
                {paginated.map((r) => {
                  const myReview = r.reviews?.find(
                    (rv) => rv.reviewType === "peer" && rv.reviewedBy?._id?.toString() === currentUserId
                  );
                  const statusLabel = myReview ? myReview.status : "pending";

                  return (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="relative bg-[#0F0F17]/80 border border-white/10 p-4 rounded-2xl"
                    >
                      {/* Status badge */}
                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium
                        ${statusLabel === "approved" ? "bg-green-500/20 text-green-400" :
                          statusLabel === "rejected" ? "bg-red-500/20 text-red-400" :
                          "bg-yellow-500/20 text-yellow-400"}`}>
                        {statusLabel}
                      </span>

                      <h3 className="font-semibold text-base mt-2 pr-20 line-clamp-2">{r.prompt}</h3>
                      <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>

                      {/* Video */}
                      <div className="mt-3 rounded-lg overflow-hidden">
                        <video controls className="w-full h-48 sm:h-56 object-cover rounded-lg"
                          src={`http://localhost:5000/uploads/videos/${r.videoUrl}`} />
                      </div>

                      {!myReview ? (
                        <>
                          <div className="mt-4">
                            <label className="block text-xs text-gray-400 mb-1.5">Feedback</label>
                            <textarea
                              className="w-full p-2.5 rounded-lg bg-gray-900/60 border border-white/10
                                         text-sm text-white focus:outline-none focus:border-purple-500
                                         transition resize-none"
                              rows={3}
                              placeholder="Write your feedback (min 3 chars)…"
                              value={feedbackMap[r._id] || ""}
                              onChange={(e) => setFeedbackMap((prev) => ({ ...prev, [r._id.toString()]: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2 sm:gap-3 mt-3">
                            <motion.button whileTap={{ scale: 0.95 }}
                              className="flex-1 py-2.5 rounded-lg bg-green-600/80 hover:bg-green-600 transition text-sm font-medium"
                              onClick={() => updateStatus(r._id.toString(), "approved")}>
                              ✓ Approve
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }}
                              className="flex-1 py-2.5 rounded-lg bg-red-600/80 hover:bg-red-600 transition text-sm font-medium"
                              onClick={() => updateStatus(r._id, "rejected")}>
                              ✗ Reject
                            </motion.button>
                          </div>
                        </>
                      ) : (
                        <div className="mt-4 border-t border-white/10 pt-3 text-sm text-gray-300 space-y-1">
                          <p>
                            <strong>Decision:</strong>{" "}
                            <span className={myReview.status === "approved" ? "text-green-400" : "text-red-400"}>
                              {myReview.status}
                            </span>
                          </p>
                          <p><strong>Feedback:</strong> {myReview.remarks}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm
                           hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition
                    ${n === page ? "bg-purple-600 text-white" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}>
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm
                           hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}