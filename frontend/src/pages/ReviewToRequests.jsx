"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header.jsx";
import { FiGrid, FiFileText, FiLogOut } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

export default function ReviewRequests() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedbackMap, setFeedbackMap] = useState({});
  const pageSize = 5;

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const currentUserId = decoded?.id || decoded?._id;

  /* FETCH REPORTS */
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/reports/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  /* SUBMIT REVIEW */
  const updateStatus = async (reportId, decision) => {
    const feedback = feedbackMap[reportId];
  if (!feedback || feedback.trim().length < 3) {
    alert("⚠ Feedback must be at least 3 characters.");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/reports/peer-review/${reportId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: decision,
          remarks: feedback,
          reviewType: "peer",
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
      return;
    }

    fetchReviews();
  } catch (err) {
    console.error("Error updating review:", err);
  }
};

  /* FILTER */
  const filtered = useMemo(() => {
  return reviews
    .filter((r) => {
      if (filter === "all") return true;

      const myReview = r.reviews?.find(
        (review) =>
          review.reviewType === "peer" &&
          review.reviewedBy?._id?.toString() === currentUserId
      );

      if (filter === "pending") return !myReview;
      if (filter === "approved") return myReview?.status === "approved";
      if (filter === "rejected") return myReview?.status === "rejected";

      return true;
    })
    .filter((r) =>
      r.prompt.toLowerCase().includes(search.toLowerCase())
    );
}, [reviews, filter, search, currentUserId]);

  /* SORT */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();

      return sortOrder === "newest"
        ? bTime - aTime
        : aTime - bTime;
    });
  }, [filtered, sortOrder]);

  /* PAGINATION */
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [filter, search, sortOrder]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg animate-pulse text-purple-300">
          Fetching review requests…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        menu={[
          { label: "Dashboard", path: "/reviewer/dashboard", icon: FiGrid },
          {
            label: "Reports to Review",
            path: "/reviewer/review-requests",
            icon: FiFileText,
          },
          { label: "Logout", action: "logout", icon: FiLogOut },
        ]}
      />

      <div className="flex-1">
        <Header />

        <div className="p-6 text-white">
          <h1 className="text-2xl font-bold mb-4">Review Requests</h1>

          {/* SEARCH + FILTER */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by prompt…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 rounded bg-gray-900 border border-white/10"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 rounded bg-gray-900 border border-white/10"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="p-2 rounded bg-gray-900 border border-white/10"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {paginated.map((r) => {
                const myReview = r.reviews?.find(
  (review) =>
    review.reviewType === "peer" &&
    review.reviewedBy?._id?.toString() === currentUserId
);

                const statusLabel = myReview
                  ? myReview.status
                  : "pending";

                return (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative bg-[#0F0F17]/80 border border-white/10 p-4 rounded-2xl"
                  >
                    {/* STATUS BADGE */}
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs
                        ${
                          statusLabel === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : statusLabel === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                    >
                      {statusLabel}
                    </span>

                    <h3 className="font-semibold text-lg mt-2">
                      {r.prompt}
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-3 rounded overflow-hidden">
                      <video
                        controls
                        className="w-full h-60 object-cover rounded"
                        src={`http://localhost:5000/uploads/videos/${r.videoUrl}`}
                      />
                    </div>

                    {!myReview ? (
                      <>
                        <div className="mt-4">
                          <label className="block text-sm text-gray-400 mb-1">
                            Feedback
                          </label>
                          <textarea
                            className="w-full p-2 rounded bg-gray-900/60 border border-white/10 text-sm"
                            value={feedbackMap[r._id] || ""}
                            onChange={(e) =>
  setFeedbackMap((prev) => ({
    ...prev,
    [r._id.toString()]: e.target.value,
  }))
}
                          />
                        </div>

                        <div className="flex gap-3 mt-4">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-4 py-2 rounded-lg bg-green-600/80"
                            onClick={() =>
                              updateStatus(
                                r._id.toString(),
                                "approved",
                                feedbackMap[r._id.toString()]
                              )
                            }
                          >
                            Approve
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-600/80"
                            onClick={() =>
                              updateStatus(
                                r._id,
                                "rejected",
                                feedbackMap[r._id]
                              )
                            }
                          >
                            Reject
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 border-t border-white/10 pt-3 text-sm text-gray-300">
                        <p>
                          <strong>Decision:</strong>{" "}
                          <span
                            className={
                              myReview.status === "approved"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {myReview.status}
                          </span>
                        </p>
                        <p className="mt-1">
                          <strong>Feedback:</strong>{" "}
                          {myReview.remarks}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}