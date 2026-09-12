import React, { useState, useEffect } from "react";
import CardStack from "../components/Cards/CardStack";
import LightRays from "../components/effects/LightRays";
import { Check, X, Settings2, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/mainContext";
import {
  collection, doc, setDoc, serverTimestamp,
  updateDoc, arrayUnion, onSnapshot,
} from "firebase/firestore";
import { db } from "../conf/firebase";

const Discovery = () => {
  const navigate = useNavigate();
  const { user: authUser, userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [viewMode, setViewMode] = useState("social");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedYearGroup, setSelectedYearGroup] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);

  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const VOLUNTEER_ICON = "https://cdn-icons-png.flaticon.com/512/10699/10699392.png";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setShowFilters(false);
    };
    window.addEventListener("resize", handleResize);

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const blockedList = userData?.blockedUsers || [];
      const userList = snap.docs
        .map((d) => {
          const data = d.data();
          const rawPhoto = data.photoURL || data.photoUrl;
          return {
            uid: d.id,
            name: data.Name || data.name || "Unknown Student",
            branch: data.branch || data.DEPT || data.department || data.major || "",
            batch: data.batch || "",
            bio: data.BIO || data.bio || "",
            role: data.role || "student",
            regNo: data.regNo || "",
            photoUrl:
              rawPhoto && rawPhoto.trim() !== "" ? rawPhoto : DEFAULT_AVATAR,
            interests: data.interests || [],
            skills: data.skills || [],
            blockedUsers: data.blockedUsers || [],
          };
        })
        .filter((u) => u.uid !== authUser?.uid)
        .filter((u) => !blockedList.includes(u.uid))
        .filter((u) => !(u.blockedUsers || []).includes(authUser?.uid));

      setUsers(userList);
      setLoading(false);
      setAvailableBatches(
        [...new Set(userList.map((u) => u.batch).filter(Boolean))].sort()
      );
      setAvailableBranches(
        [...new Set(userList.map((u) => u.branch).filter(Boolean))].sort()
      );
    });

    const unsubActivities = onSnapshot(collection(db, "activities"), (snap) => {
      const activityList = snap.docs.map((d) => {
        const data = d.data();
        let formattedDate = "Flexible";
        if (data.event_date) {
          const dateObj = new Date(data.event_date);
          if (!isNaN(dateObj)) {
            formattedDate = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }
        }
        return {
          uid: d.id,
          isActivity: true,
          name: data.event_title,
          bio: data.description,
          branch: data.community_name,
          date: formattedDate,
          batch: formattedDate,
          photoUrl: data.image_url || VOLUNTEER_ICON,
          ...data,
        };
      });
      setActivities(activityList);
    });

    return () => {
      unsubUsers();
      unsubActivities();
      window.removeEventListener("resize", handleResize);
    };
  }, [authUser, userData]);

  const showNotification = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSwipeAction = async (item) => {
    if (!authUser) return;
    if (item.isActivity) {
      try {
        await updateDoc(doc(db, "activities", item.uid), {
          volunteer_list: arrayUnion(authUser.uid),
        });
        showNotification(`You volunteered for ${item.name}!`, "success");
      } catch (err) {
        console.error(err);
      }
    } else {
      const requestId = `${authUser.uid}_${item.uid}`;
      try {
        await setDoc(doc(db, "friend_requests", requestId), {
          from: authUser.uid,
          to: item.uid,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        showNotification(`Request sent to ${item.name}!`, "success");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSwipeReject = (item) => {
    console.log(`Skipped ${item.name}`);
  };

  const currentYear = new Date().getFullYear();
  const seniorCutoff = currentYear - 2;
  const filteredItems =
    viewMode === "social"
      ? users.filter((u) => {
          if (selectedBranch && u.branch !== selectedBranch) return false;
          if (selectedBatch && u.batch !== selectedBatch) return false;
          if (selectedYearGroup === "senior")
            return parseInt(u.batch) <= seniorCutoff;
          if (selectedYearGroup === "junior")
            return parseInt(u.batch) > seniorCutoff;
          return true;
        })
      : activities;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "16px",
        height: isMobile ? "calc(100dvh - 130px)" : "calc(100vh - 76px)",
        padding: isMobile ? "8px 8px 0" : "16px 20px 0 20px",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? "75px" : "30px",
            right: "16px",
            background: "rgba(8,9,23,0.97)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(5,217,232,0.3)",
            padding: "14px 18px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            zIndex: 10000,
            minWidth: "260px",
            maxWidth: "320px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              background:
                notification.type === "success"
                  ? "linear-gradient(135deg,#05d9e8,#0056ff)"
                  : "#ff2a6d",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {notification.type === "success" ? (
              <Check size={18} color="white" />
            ) : (
              <X size={18} color="white" />
            )}
          </div>
          <p
            style={{
              color: "white",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {notification.msg}
          </p>
        </div>
      )}

      {/* MAIN CARD AREA */}
      <div
        className="dashboard-card"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          height: "100%",
          overflow: "hidden",
          zIndex: 1,
          borderRadius: "20px",
          minHeight: 0,
        }}
      >
        {/* MODE TOGGLE + FILTER BUTTON */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "rgba(0,0,0,0.55)",
              padding: "5px",
              borderRadius: "14px",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              onClick={() => setViewMode("social")}
              style={{
                padding: "7px 18px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background:
                  viewMode === "social"
                    ? "#05d9e8"
                    : "transparent",
                color: viewMode === "social" ? "#000" : "#aaa",
                fontWeight: "700",
                fontSize: "13px",
                transition: "0.25s",
              }}
            >
              Social
            </button>
            <button
              onClick={() => setViewMode("volunteer")}
              style={{
                padding: "7px 18px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background:
                  viewMode === "volunteer" ? "#ff2a6d" : "transparent",
                color: "white",
                fontWeight: "700",
                fontSize: "13px",
                transition: "0.25s",
              }}
            >
              Volunteer
            </button>
          </div>

          {/* Mobile filter toggle */}
          {isMobile && viewMode === "social" && (
            <button
              onClick={() => setShowFilters((v) => !v)}
              style={{
                background: showFilters
                  ? "rgba(5,217,232,0.2)"
                  : "rgba(0,0,0,0.55)",
                border: showFilters
                  ? "1px solid rgba(5,217,232,0.5)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "9px 12px",
                color: showFilters ? "#05d9e8" : "#aaa",
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <SlidersHorizontal size={16} />
            </button>
          )}
        </div>

        {/* MOBILE FILTER DRAWER */}
        {isMobile && showFilters && viewMode === "social" && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "90%",
              background: "rgba(8,9,23,0.97)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "14px",
              zIndex: 50,
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
          >
            <p
              style={{
                color: "#777",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
                marginTop: 0,
              }}
            >
              Year Group
            </p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {[
                { label: "All", value: null },
                { label: "🎓 Senior", value: "senior" },
                { label: "🌱 Junior", value: "junior" },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setSelectedYearGroup(opt.value)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    borderRadius: "9px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "700",
                    background:
                      selectedYearGroup === opt.value
                        ? opt.value === "senior"
                          ? "#5227FF"
                          : opt.value === "junior"
                          ? "#05d9e8"
                          : "#333"
                        : "rgba(255,255,255,0.06)",
                    color:
                      selectedYearGroup === opt.value ? "white" : "#777",
                    transition: "0.2s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p
              style={{
                color: "#777",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
                marginTop: 0,
              }}
            >
              Department
            </p>
            <select
              onChange={(e) => setSelectedBranch(e.target.value || null)}
              className="w-full bg-[#111] text-white p-2 rounded-lg mb-3"
              style={{ fontSize: "13px" }}
            >
              <option value="">All Branches</option>
              {availableBranches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <p
              style={{
                color: "#777",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
                marginTop: 0,
              }}
            >
              Batch
            </p>
            <select
              onChange={(e) => setSelectedBatch(e.target.value || null)}
              className="w-full bg-[#111] text-white p-2 rounded-lg"
              style={{ fontSize: "13px" }}
            >
              <option value="">All Batches</option>
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* CARD STACK */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 5,
            width: "100%",
            height: "100%",
          }}
        >
          {loading ? (
            <p style={{ color: "#666", fontWeight: "600" }}>
              Loading Campus...
            </p>
          ) : filteredItems.length > 0 ? (
            <CardStack
              key={viewMode}
              users={filteredItems}
              onSwipeDown={handleSwipeAction}
              onSwipeUp={handleSwipeReject}
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#555", fontSize: "16px", fontWeight: "600" }}>
                No {viewMode === "social" ? "students" : "activities"} found
              </p>
              {viewMode === "social" && (
                <p style={{ color: "#444", fontSize: "12px" }}>
                  Try adjusting your filters
                </p>
              )}
            </div>
          )}
        </div>

        <LightRays raysColor={viewMode === "social" ? "#05d9e8" : "#ff2a6d"} />
      </div>

      {/* SIDEBAR — Desktop Only */}
      {!isMobile && (
        <div
          style={{ width: "320px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div className="dashboard-card" style={{ padding: "16px" }}>
            <h3
              style={{
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Filters
            </h3>

            <p
              style={{
                color: "#555",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
              }}
            >
              Year Group
            </p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {[
                { label: "All", value: null },
                { label: "🎓 Senior", value: "senior" },
                { label: "🌱 Junior", value: "junior" },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setSelectedYearGroup(opt.value)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    borderRadius: "9px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "700",
                    background:
                      selectedYearGroup === opt.value
                        ? opt.value === "senior"
                          ? "#5227FF"
                          : opt.value === "junior"
                          ? "#05d9e8"
                          : "#2a2a3a"
                        : "rgba(255,255,255,0.05)",
                    color:
                      selectedYearGroup === opt.value ? "white" : "#666",
                    transition: "0.2s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p
              style={{
                color: "#555",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
              }}
            >
              Department
            </p>
            <select
              onChange={(e) => setSelectedBranch(e.target.value || null)}
              className="w-full bg-[#111] text-white p-2 rounded-lg mb-3"
            >
              <option value="">All Branches</option>
              {availableBranches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <p
              style={{
                color: "#555",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
              }}
            >
              Batch
            </p>
            <select
              onChange={(e) => setSelectedBatch(e.target.value || null)}
              className="w-full bg-[#111] text-white p-2 rounded-lg"
            >
              <option value="">All Batches</option>
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div
            className="dashboard-card"
            style={{ padding: "16px", flex: 1 }}
          >
            <h3
              style={{
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {viewMode === "social" ? "Top Peer Matches" : "Recent Club Posts"}
            </h3>
            <p style={{ color: "#444", fontSize: "12px", fontStyle: "italic" }}>
              Swipe cards to connect with peers
            </p>
          </div>
        </div>
      )}

      {/* Leader Dashboard FAB */}
      {userData?.role === "community_leader" && (
        <button
          onClick={() => navigate("/club-leader")}
          style={{
            position: "fixed",
            bottom: isMobile ? "76px" : "24px",
            right: "20px",
            background: "linear-gradient(135deg,#2563eb,#4f46e5)",
            border: "none",
            padding: "14px",
            borderRadius: "50%",
            boxShadow: "0 4px 24px rgba(37,99,235,0.5)",
            cursor: "pointer",
            zIndex: 60,
            animation: "pulse 2s infinite",
          }}
          title="Open Leader Dashboard"
        >
          <Settings2 color="white" size={20} />
        </button>
      )}
    </div>
  );
};

export default Discovery;