import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, arrayUnion, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../conf/firebase";
import { useAuth } from "../context/mainContext";
import { Users, Calendar as CalendarIcon, List, Trophy, ScanLine, X, Crown, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

const ClubHub = () => {
  const [activities, setActivities] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list', 'calendar', 'community'
  const [leaderboard, setLeaderboard] = useState([]);
  const [communityData, setCommunityData] = useState({}); // { communityName: { leader, members } }
  const [showScanner, setShowScanner] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date()); // which month to display
  const { user } = useAuth();

  // ---------- DATA FETCHING ----------
  useEffect(() => {
    const unsubActivities = onSnapshot(collection(db, "activities"), (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const fetchLeaderboardAndCommunity = async () => {
      // Leaderboard
      const q = query(collection(db, "assignments"), where("status", "==", "completed"));
      const snap = await getDocs(q);
      const counts = {};
      const communityCount = {}; // { [communityName]: { [uid]: count } }
      snap.docs.forEach(d => {
        const { studentId, communityName } = d.data();
        if (!studentId) return;
        counts[studentId] = (counts[studentId] || 0) + 1;
        if (communityName) {
          if (!communityCount[communityName]) communityCount[communityName] = {};
          communityCount[communityName][studentId] = (communityCount[communityName][studentId] || 0) + 1;
        }
      });

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const board = await Promise.all(sorted.map(async ([uid, count]) => {
        const uDoc = await getDoc(doc(db, "users", uid));
        return {
          uid, count,
          name: uDoc.exists() ? (uDoc.data().name || uDoc.data().Name || "Unknown") : "Unknown",
          photo: uDoc.exists() ? (uDoc.data().photoUrl || "") : "",
          community: uDoc.exists() ? (uDoc.data().community_name || "") : ""
        };
      }));
      setLeaderboard(board);

      // Community Data: fetch leader info from users
      const usersSnap = await getDocs(collection(db, "users"));
      const communities = {};
      usersSnap.docs.forEach(d => {
        const data = d.data();
        if (data.community_name && data.role === "community_leader") {
          if (!communities[data.community_name]) communities[data.community_name] = { leader: null, members: [] };
          communities[data.community_name].leader = {
            uid: d.id,
            name: data.name || data.Name || "Leader",
            photo: data.photoUrl || ""
          };
        }
      });
      // Add members from activity volunteer lists
      const actSnap = await getDocs(collection(db, "activities"));
      for (const aDoc of actSnap.docs) {
        const { community_name, volunteer_list } = aDoc.data();
        if (!community_name || !volunteer_list?.length) continue;
        if (!communities[community_name]) communities[community_name] = { leader: null, members: [] };
        for (const uid of volunteer_list) {
          if (!communities[community_name].members.find(m => m.uid === uid)) {
            const uDoc = await getDoc(doc(db, "users", uid));
            if (uDoc.exists()) {
              const d = uDoc.data();
              communities[community_name].members.push({
                uid,
                name: d.name || d.Name || "Member",
                photo: d.photoUrl || "",
                completedOps: communityCount[community_name]?.[uid] || 0
              });
            }
          }
        }
        // Sort members by completedOps
        communities[community_name].members.sort((a, b) => b.completedOps - a.completedOps);
      }
      setCommunityData(communities);
    };

    fetchLeaderboardAndCommunity();
    return () => unsubActivities();
  }, []);

  const handleVolunteer = async (activityId) => {
    const ref = doc(db, "activities", activityId);
    await updateDoc(ref, { volunteer_list: arrayUnion(user.uid) });
    alert("Onboarded as Volunteer!");
  };

  // ---------- QR CHECK-IN ----------
  const handleCheckIn = async (decodedText) => {
    try {
      if (!decodedText.includes('/checkin/')) throw new Error("Invalid QR code format");
      const parts = decodedText.split('/checkin/')[1].split('/');
      const activityId = parts[0];
      const token = parts[1];

      const checkinDoc = await getDoc(doc(db, "checkins", activityId));
      if (!checkinDoc.exists() || checkinDoc.data().token !== token) throw new Error("Invalid or expired check-in token.");
      if (checkinDoc.data().expiresAt.toDate() < new Date()) throw new Error("This check-in token has expired.");

      const actRef = doc(db, "activities", activityId);
      const actDoc = await getDoc(actRef);
      if (!actDoc.exists()) throw new Error("Activity not found.");
      const actData = actDoc.data();
      if (!actData.volunteer_list?.includes(user.uid)) throw new Error("You must volunteer first before checking in.");
      if (actData.checked_in_users?.includes(user.uid)) throw new Error("You have already checked in.");

      await updateDoc(actRef, { checked_in_users: arrayUnion(user.uid) });
      alert("Secure Check-In Successful! ✅");
      setShowScanner(false);
    } catch (e) {
      console.error(e);
      alert(e.message || "Invalid QR Code.");
    }
  };

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(async (decodedText) => { scanner.clear(); await handleCheckIn(decodedText); }, () => {});
    }
    return () => { if (scanner) scanner.clear().catch(console.error); };
  }, [showScanner, user]);

  // ---------- CALENDAR ----------
  const renderCalendar = () => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDayOffset = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    const monthLabel = calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const cells = [];
    for (let i = 0; i < firstDayOffset; i++) cells.push(<div key={`empty-${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayActs = activities.filter(a => a.event_date === dateStr);
      const isToday = dateStr === todayStr;
      cells.push(
        <div key={d} className={`min-h-[80px] p-1.5 rounded-xl border flex flex-col transition-all
          ${isToday ? 'border-blue-500/60 bg-blue-500/10' : dayActs.length > 0 ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02]'}`}>
          <span className={`text-xs font-bold mb-1 ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>{d}</span>
          <div className="space-y-0.5 overflow-hidden">
            {dayActs.slice(0, 2).map(a => (
              <div key={a.id} className="text-[9px] bg-blue-600 text-white px-1 py-0.5 rounded font-medium truncate" title={a.event_title}>
                {a.event_title}
              </div>
            ))}
            {dayActs.length > 2 && <div className="text-[9px] text-slate-400">+{dayActs.length - 2} more</div>}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"><ChevronLeft size={18} /></button>
          <span className="text-white font-bold text-lg">{monthLabel}</span>
          <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-600 uppercase pb-2">{d}</div>
          ))}
          {cells}
        </div>
      </div>
    );
  };

  // ---------- COMMUNITY VIEW ----------
  const renderCommunity = () => {
    const communities = Object.entries(communityData);
    if (communities.length === 0) return (
      <div className="text-center text-slate-500 py-20 italic">No community data found yet.</div>
    );

    return (
      <div className="space-y-10">
        {communities.map(([name, { leader, members }]) => {
          const communityBoard = leaderboard.filter(l => l.community === name);
          return (
            <div key={name} className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
              {/* Community Header */}
              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">{name}</h2>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full font-bold uppercase">{members.length} Members</span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Leader + Members */}
                <div>
                  {leader && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Club Leader</p>
                      <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl">
                        <div className="relative">
                          {leader.photo ? (
                            <img src={leader.photo} className="w-10 h-10 rounded-xl object-cover border border-yellow-500/30" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-black text-sm">{leader.name.charAt(0)}</div>
                          )}
                          <Crown size={12} className="absolute -top-2 -right-2 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{leader.name}</p>
                          <p className="text-yellow-400 text-[10px] font-bold uppercase">Community Leader</p>
                        </div>
                        <ShieldCheck size={18} className="text-yellow-400 ml-auto" />
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Members</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {members.length > 0 ? members.map((m, i) => (
                      <div key={m.uid} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold w-4">{i + 1}</span>
                        {m.photo ? (
                          <img src={m.photo} className="w-7 h-7 rounded-lg object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">{m.name.charAt(0)}</div>
                        )}
                        <span className="text-sm text-slate-300 flex-1 truncate">{m.name}</span>
                        {m.completedOps > 0 && <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">{m.completedOps} Ops</span>}
                      </div>
                    )) : (
                      <p className="text-slate-600 text-xs italic">No volunteers yet.</p>
                    )}
                  </div>
                </div>

                {/* Right: Community Leaderboard */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Trophy size={10} className="text-yellow-400" /> Leaderboard</p>
                  {communityBoard.length > 0 ? (
                    <div className="space-y-2">
                      {communityBoard.map((l, index) => (
                        <div key={l.uid} className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black
                            ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-400'}`}>
                            {index + 1}
                          </div>
                          {l.photo ? <img src={l.photo} className="w-7 h-7 rounded-full object-cover" /> : (
                            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">{l.name.charAt(0)}</div>
                          )}
                          <span className="text-sm text-slate-200 flex-1 truncate">{l.name}</span>
                          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/20">{l.count} Ops</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-xs italic">Complete assignments to appear here.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ---------- RENDER ----------
  return (
    <div className="p-4 md:p-8 text-white min-h-screen bg-[#050511] relative font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Club Hub</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowScanner(true)} className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <ScanLine size={16} /> Check-In
            </button>
            <div className="bg-white/10 p-1 rounded-xl flex gap-0.5">
              {[
                { id: "list", icon: <List size={18} /> },
                { id: "calendar", icon: <CalendarIcon size={18} /> },
                { id: "community", icon: <Users size={18} /> },
              ].map(tab => (
                <button key={tab.id} onClick={() => setViewMode(tab.id)}
                  className={`p-2 rounded-lg transition-colors ${viewMode === tab.id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                  title={tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}>
                  {tab.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {viewMode === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((act) => (
                  <div key={act.id} className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-6 rounded-3xl backdrop-blur-md transition-all hover:border-blue-500/30 group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {act.community_name || act.club_name || "Community Op"}
                      </span>
                      {act.event_date && <span className="text-[10px] text-slate-400 font-mono bg-black/50 px-2 py-1 rounded-lg border border-white/5">{act.event_date}</span>}
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors">{act.event_title}</h2>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{act.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs font-medium">
                        <span className="flex items-center gap-1 text-slate-500"><Users size={13} /> {act.volunteer_list?.length || 0}</span>
                        <span className="flex items-center gap-1 text-green-500"><ScanLine size={13} /> {act.checked_in_users?.length || 0}</span>
                      </div>
                      <button onClick={() => handleVolunteer(act.id)}
                        className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all">
                        Volunteer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "calendar" && (
              <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                {renderCalendar()}
              </div>
            )}

            {viewMode === "community" && renderCommunity()}
          </div>

          {/* SIDEBAR: Global Leaderboard — only in list/calendar views */}
          {viewMode !== "community" && (
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-gradient-to-b from-blue-900/40 to-transparent border border-blue-500/30 p-5 rounded-3xl backdrop-blur-md">
                <h3 className="text-sm font-bold text-blue-400 mb-5 flex items-center gap-2 uppercase tracking-widest">
                  <Trophy size={16} className="text-yellow-400" /> Global Leaders
                </h3>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).length > 0 ? leaderboard.slice(0, 5).map((l, index) => (
                    <div key={l.uid} className="flex items-center gap-2.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0
                        ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-400'}`}>
                        {index + 1}
                      </div>
                      {l.photo ? <img src={l.photo} className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0" /> : (
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{l.name.charAt(0)}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">{l.name}</p>
                        {l.community && <p className="text-[10px] text-slate-500 truncate">{l.community}</p>}
                      </div>
                      <span className="text-[10px] font-bold text-blue-300 flex-shrink-0">{l.count}</span>
                    </div>
                  )) : (
                    <p className="text-center text-slate-500 text-xs italic py-4">No data yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#0b0d21] border border-pink-500/30 w-full max-w-md p-6 rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.2)] relative">
            <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"><X size={24} /></button>
            <h3 className="text-xl font-black text-pink-400 mb-2 uppercase tracking-tight flex items-center gap-2"><ScanLine size={20} /> Secure Check-In</h3>
            <p className="text-slate-400 text-xs mb-6">Scan the operation QR code provided by your leader.</p>
            <div className="bg-white rounded-2xl overflow-hidden p-2">
              <div id="reader" className="w-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubHub;