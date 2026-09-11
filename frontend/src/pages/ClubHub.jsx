import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, arrayUnion, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../conf/firebase";
import { useAuth } from "../context/mainContext";
import { Clock, Users, Calendar as CalendarIcon, List, Trophy, ScanLine, X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

const ClubHub = () => {
  const [activities, setActivities] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [leaderboard, setLeaderboard] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Fetch Activities
    const unsubActivities = onSnapshot(collection(db, "activities"), (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Fetch Leaderboard (Completed Assignments)
    const fetchLeaderboard = async () => {
      const q = query(collection(db, "assignments"), where("status", "==", "completed"));
      const snap = await getDocs(q);
      const counts = {};
      
      snap.docs.forEach(d => {
        const studentId = d.data().studentId;
        counts[studentId] = (counts[studentId] || 0) + 1;
      });

      // Sort and fetch names
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5); // Top 5
      
      const board = await Promise.all(sorted.map(async ([uid, count]) => {
        const uDoc = await getDoc(doc(db, "users", uid));
        return {
          uid,
          count,
          name: uDoc.exists() ? (uDoc.data().name || uDoc.data().Name || "Unknown") : "Unknown",
          photo: uDoc.exists() ? (uDoc.data().photoUrl || "") : ""
        };
      }));
      setLeaderboard(board);
    };

    fetchLeaderboard();

    return () => unsubActivities();
  }, []);

  const handleVolunteer = async (activityId) => {
    const ref = doc(db, "activities", activityId);
    await updateDoc(ref, {
      volunteer_list: arrayUnion(user.uid)
    });
    alert("Onboarded as Volunteer! Check the activity chat.");
  };

  // --- QR SCANNER LOGIC ---
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
      scanner.render(async (decodedText) => {
        scanner.clear();
        setShowScanner(false);
        try {
          // Check-in logic: decodedText is campusconnect.app/checkin/{activityId}/{token}
          if (!decodedText.includes('/checkin/')) throw new Error("Invalid QR code format");
          const parts = decodedText.split('/checkin/')[1].split('/');
          const activityId = parts[0];
          const token = parts[1];

          // 1. Verify Token
          const checkinDoc = await getDoc(doc(db, "checkins", activityId));
          if (!checkinDoc.exists() || checkinDoc.data().token !== token) {
            throw new Error("Invalid or expired check-in token.");
          }

          // 2. Check Expiry
          if (checkinDoc.data().expiresAt.toDate() < new Date()) {
            throw new Error("This check-in token has expired.");
          }

          // 3. Check Volunteer List
          const actRef = doc(db, "activities", activityId);
          const actDoc = await getDoc(actRef);
          if (!actDoc.exists()) throw new Error("Activity not found.");
          
          const actData = actDoc.data();
          if (!actData.volunteer_list?.includes(user.uid)) {
            throw new Error("You must volunteer for this operation first before checking in.");
          }
          if (actData.checked_in_users?.includes(user.uid)) {
            throw new Error("You have already checked in.");
          }

          // 4. Update
          await updateDoc(actRef, {
            checked_in_users: arrayUnion(user.uid)
          });
          alert("Secure Check-In Successful! ✅");
        } catch (e) {
          console.error(e);
          alert(e.message || "Invalid QR Code or Event.");
        }
      }, (err) => {
        // ignore errors during scanning
      });
      return () => scanner.clear().catch(e => console.error(e));
    }
  }, [showScanner, user]);

  // --- CALENDAR RENDER HELPER ---
  const renderCalendar = () => {
    const today = new Date();
    const days = [];
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayActs = activities.filter(a => a.event_date === dateStr);
      
      days.push(
        <div key={i} className={`min-h-[100px] p-2 border border-white/5 rounded-xl ${dayActs.length > 0 ? 'bg-blue-500/10' : 'bg-white/5'} flex flex-col`}>
          <span className="text-xs font-bold text-slate-400 mb-1">{i}</span>
          <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
            {dayActs.map(a => (
              <div key={a.id} className="text-[10px] bg-blue-600 text-white p-1 rounded font-medium truncate" title={a.event_title}>
                {a.event_title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase">{d}</div>)}
        {/* Empty slots for offset */}
        {Array.from({length: firstDay.getDay()}).map((_, i) => <div key={`empty-${i}`} className="min-h-[100px]" />)}
        {days}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 text-white min-h-screen bg-[#050511] relative font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row gap-8">
        
        {/* MAIN CONTENT (Events) */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Club Activities</h1>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowScanner(true)} className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                <ScanLine size={18} /> Check-In
              </button>
              <div className="bg-white/10 p-1 rounded-xl flex">
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  <List size={20} />
                </button>
                <button onClick={() => setViewMode("calendar")} className={`p-2 rounded-lg transition-colors ${viewMode === "calendar" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  <CalendarIcon size={20} />
                </button>
              </div>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((act) => (
                <div key={act.id} className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-6 rounded-3xl backdrop-blur-md transition-all hover:border-blue-500/30">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {act.community_name || act.club_name || "Community Op"}
                    </span>
                    {act.event_date && <span className="text-[10px] text-slate-400 font-mono bg-black/50 px-2 py-1 rounded-lg border border-white/5">{act.event_date}</span>}
                  </div>
                  <h2 className="text-xl font-bold mb-2 text-white">{act.event_title}</h2>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">{act.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                        <Users size={14} /> {act.volunteer_list?.length || 0}
                      </div>
                      <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                        <ScanLine size={14} /> {act.checked_in_users?.length || 0}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleVolunteer(act.id)}
                      className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
                    >
                      Volunteer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-6">Activity Schedule</h2>
              {renderCalendar()}
            </div>
          )}
        </div>

        {/* SIDEBAR (Leaderboard) */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-gradient-to-b from-blue-900/40 to-transparent border border-blue-500/30 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Trophy size={20} className="text-yellow-400" /> Leaderboard
            </h3>
            
            <div className="space-y-4">
              {leaderboard.length > 0 ? leaderboard.map((l, index) => (
                <div key={l.uid} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-400'}`}>
                      {index + 1}
                    </div>
                    {l.photo ? (
                      <img src={l.photo} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                        {l.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-200 truncate max-w-[100px]">{l.name}</span>
                  </div>
                  <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg border border-blue-500/30">
                    {l.count} Ops
                  </span>
                </div>
              )) : (
                <div className="text-center text-slate-500 text-sm italic py-4">No data yet. Complete assignments to rank up!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#0b0d21] border border-pink-500/30 w-full max-w-md p-6 rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.2)] relative">
            <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"><X size={24}/></button>
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight flex items-center gap-2 text-pink-400">
              <ScanLine size={20} /> Secure Check-In
            </h3>
            <p className="text-slate-400 text-xs mb-6">Scan the operation QR code provided by your leader to verify attendance.</p>
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