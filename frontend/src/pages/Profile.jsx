import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Edit3,
  Calendar,
  Book,
  Award,
  Activity,
  Heart,
  CheckCircle,
  Eye,
  Check,
  ShieldCheck,
  Medal,
  Users,
  Clock,
  X,
} from "lucide-react";
import { useAuth } from "../context/mainContext";
import {
  getUserProfile,
  recordProfileView,
  subscribeToProfileViews,
} from "../services/profileService";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "../conf/firebase";

const Profile = () => {
  const { user, userData } = useAuth(); // Current logged-in user
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams(); // Optional route param for viewing other profiles

  // Target user ID is either the route parameter or the logged-in user's UID
  const targetUserId = paramUserId || user?.uid;
  const isOwnProfile = !paramUserId || paramUserId === user?.uid;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [viewers, setViewers] = useState([]);
  const [showViewersModal, setShowViewersModal] = useState(false);

  // 1. Fetch Profile and Task Count
  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUserId) return;

      try {
        setLoading(true);
        const userProfile = await getUserProfile(targetUserId);
        setProfile(userProfile);

        // Fetch verified task count for merit badge
        const q = query(
          collection(db, "assignments"),
          where("studentId", "==", targetUserId),
          where("status", "==", "completed")
        );
        const snapshot = await getCountFromServer(q);
        setTasksCompleted(snapshot.data().count);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId]);

  // 2. Record Profile View when visiting someone else's profile
  useEffect(() => {
    if (targetUserId && user?.uid && !isOwnProfile && userData) {
      recordProfileView(targetUserId, {
        uid: user.uid,
        name: userData.name || user.displayName || "Anonymous Student",
        photoURL: userData.photoUrl || userData.photoURL || user.photoURL || "",
        department: userData.branch || userData.department || "",
      });
    }
  }, [targetUserId, user, isOwnProfile, userData]);

  // 3. Real-time Subscription to Profile Viewers (for own profile)
  useEffect(() => {
    if (!targetUserId || !isOwnProfile) return;

    const unsubscribe = subscribeToProfileViews(targetUserId, (viewersList) => {
      setViewers(viewersList);
    });

    return () => unsubscribe();
  }, [targetUserId, isOwnProfile]);

  // Merit Badge Logic
  let badge = null;
  if (tasksCompleted >= 10)
    badge = { label: "Community Hero", color: "purple", icon: <Medal size={16} /> };
  else if (tasksCompleted >= 5)
    badge = { label: "Top Contributor", color: "pink", icon: <Award size={16} /> };
  else if (tasksCompleted >= 1)
    badge = { label: "Active Volunteer", color: "blue", icon: <ShieldCheck size={16} /> };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayProfile = profile || {};

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-white min-h-screen pb-20">
      {/* Header Profile Section */}
      <div className="relative mb-20 md:mb-24">
        <div className="h-40 md:h-64 bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        <div className="absolute -bottom-12 md:-bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 w-full">
          <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-slate-950 overflow-hidden bg-slate-800 shadow-2xl">
            <img
              src={
                displayProfile.photoUrl ||
                displayProfile.photoURL ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-3 md:mt-4 text-center">
            {/* Name + Verified Tick */}
            <div className="flex items-center justify-center gap-2 px-4">
              <h1 className="text-2xl md:text-4xl font-black tracking-tight drop-shadow-lg truncate max-w-[250px] md:max-w-md">
                {displayProfile.name || "Unnamed Student"}
              </h1>
              {displayProfile.regNo && (
                <div
                  className="bg-blue-500 rounded-full p-1 shadow-lg shrink-0"
                  title="Verified Campus Student"
                >
                  <Check size={16} className="text-white" strokeWidth={4} />
                </div>
              )}
            </div>

            {/* Dynamic Merit Badge */}
            {badge && (
              <div
                className={`mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-full border shadow-lg bg-${badge.color}-500/20 border-${badge.color}-500/50 text-${badge.color}-300`}
              >
                {badge.icon}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {badge.label}
                </span>
              </div>
            )}

            {/* Club Leader Badge */}
            {(displayProfile.role === "community_leader" ||
              userData?.role === "community_leader") && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 px-4 py-1 rounded-full border border-yellow-400/30 shadow-xl shadow-orange-900/20">
                <ShieldCheck size={14} className="text-white" />
                <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-wider">
                  {displayProfile.community_name || userData?.community_name || "LEADER"}
                </span>
              </div>
            )}

            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs md:text-sm drop-shadow-sm mt-1">
              {displayProfile.regNo || "ID: N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-10 md:mt-12">
        {/* Left Column - Info */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">
              Academic Info
            </h3>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-center gap-3">
                <Book size={18} className="text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">
                    {displayProfile.branch || displayProfile.department || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">Branch</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Calendar size={18} className="text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">
                    {displayProfile.batch || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">Batch</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Award size={18} className="text-yellow-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">
                    {displayProfile.year || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">Current Year</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Community Stats */}
          <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">
              Community Impact
            </h3>
            <div className="flex justify-between text-center gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1 text-pink-500 mb-1">
                  <Heart size={16} />
                </div>
                <div className="font-black text-lg md:text-xl">
                  {displayProfile.stats?.likes || 0}
                </div>
                <div className="text-[9px] md:text-[10px] text-slate-500 uppercase">
                  Likes
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                  <CheckCircle size={16} />
                </div>
                <div className="font-black text-lg md:text-xl text-blue-400">
                  {tasksCompleted}
                </div>
                <div className="text-[9px] md:text-[10px] text-slate-500 uppercase">
                  Missions
                </div>
              </div>

              {/* Views Counter (Clickable on own profile to open Viewers Modal) */}
              <button
                onClick={() => isOwnProfile && setShowViewersModal(true)}
                disabled={!isOwnProfile}
                className={`flex-1 rounded-xl p-1 transition-colors ${
                  isOwnProfile
                    ? "hover:bg-white/10 cursor-pointer"
                    : "cursor-default"
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                  <Eye size={16} />
                </div>
                <div className="font-black text-lg md:text-xl text-emerald-400">
                  {isOwnProfile ? viewers.length : displayProfile.stats?.views || 0}
                </div>
                <div className="text-[9px] md:text-[10px] text-slate-500 uppercase flex items-center justify-center gap-0.5">
                  Views {isOwnProfile && <Users size={10} />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Middle & Right Column - Bio & Details */}
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white/5 p-4 md:p-8 rounded-2xl border border-white/10 relative">
            {isOwnProfile && (
              <button
                onClick={() => navigate("/edit-profile")}
                className="absolute top-4 md:top-6 right-4 md:right-6 bg-blue-600 hover:bg-blue-500 text-white p-2 md:p-3 rounded-full shadow-lg transition-transform hover:scale-110"
                title="Edit Profile"
              >
                <Edit3 size={18} />
              </button>
            )}

            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2 pr-12">
              <Activity className="text-blue-500 flex-shrink-0" /> About Me
            </h2>
            <p className="text-slate-300 leading-relaxed text-base md:text-lg italic">
              "{displayProfile.bio || "No bio added yet."}"
            </p>

            <div className="mt-6 md:mt-8">
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-3">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayProfile.interests && Array.isArray(displayProfile.interests) ? (
                  displayProfile.interests.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 md:px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs md:text-sm font-medium border border-blue-500/30 break-words"
                    >
                      {tag.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-xs md:text-sm">
                    No interests listed.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT PROFILE VIEWERS MODAL ================= */}
      {showViewersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-emerald-400" />
                <h3 className="font-bold text-lg text-white">Who Viewed Your Profile</h3>
              </div>
              <button
                onClick={() => setShowViewersModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-4 space-y-3">
              {viewers.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Eye size={32} className="mx-auto mb-2 opacity-50 text-slate-500" />
                  <p className="text-sm">No profile views recorded yet.</p>
                </div>
              ) : (
                viewers.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors"
                  >
                    <img
                      src={
                        v.viewerPhoto ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={v.viewerName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {v.viewerName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {v.viewerBranch || "Student"}
                      </p>
                    </div>
                    {v.viewedAt && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock size={10} />
                        {new Date(v.viewedAt.seconds * 1000).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;