import React, { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, query, where, getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../conf/firebase";
import { useAuth } from "../context/mainContext";
import { PlusCircle, ClipboardPlus, X, CheckCircle, Users, Radio, Activity, Command, AlertTriangle, Calendar, MapPin, Image as ImageIcon, Clock } from "lucide-react";

const ClubLeadDashboard = () => {
    const { user, userData } = useAuth();
    const [myActivities, setMyActivities] = useState([]);
    const [allAssignments, setAllAssignments] = useState([]); // Stores ALL tasks for history tracking
    const [showPostForm, setShowPostForm] = useState(false);
    
    // --- UPDATED STATE FOR NEW FIELDS ---
    const [newEvent, setNewEvent] = useState({ 
        title: "", 
        desc: "", 
        image: "", 
        date: "", 
        location: "" 
    });
    
    const [studentNames, setStudentNames] = useState({});

    // --- ASSIGNMENT MODAL STATE ---
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedActivityId, setSelectedActivityId] = useState(null);
    const [taskTitle, setTaskTitle] = useState("");

    // 1. Security Gate
    if (userData?.role !== "community_leader") {
        return <div className="min-h-screen bg-[#050511] text-white flex items-center justify-center font-bold text-xl tracking-widest uppercase">Access Restricted: Authorized Personnel Only</div>;
    }

    // 2. Fetch Data (Activities + Names + All Assignments)
    useEffect(() => {
        if (!userData?.community_name) return;
        
        // A. Fetch Activities
        const qActs = query(collection(db, "activities"), where("community_name", "==", userData.community_name));
        const unsubActs = onSnapshot(qActs, async (snap) => {
            const activitiesData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setMyActivities(activitiesData);

            // Collect UIDs to fetch names
            const uidsToFetch = new Set();
            activitiesData.forEach(act => {
                if (act.volunteer_list) {
                    act.volunteer_list.forEach(uid => uidsToFetch.add(uid));
                }
            });

            // Fetch Names
            const names = {};
            await Promise.all([...uidsToFetch].map(async (uid) => {
                if (studentNames[uid]) return; // Skip if cached
                const userDoc = await getDoc(doc(db, "users", uid));
                if (userDoc.exists()) {
                    names[uid] = userDoc.data().name || userDoc.data().Name || "Unknown Recruit";
                } else {
                    names[uid] = "Unknown ID";
                }
            }));
            setStudentNames(prev => ({ ...prev, ...names }));
        });

        // B. Fetch ALL Assignments (For History List & Pending Approvals)
        const qAssigns = query(collection(db, "assignments"), where("communityName", "==", userData.community_name));
        const unsubAssigns = onSnapshot(qAssigns, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllAssignments(data);
        });

        return () => { unsubActs(); unsubAssigns(); };
    }, [userData]);

    // 3. Actions
    const approveTask = async (taskId) => {
        await updateDoc(doc(db, "assignments", taskId), { status: "completed" });
    };

    const rejectTask = async (taskId) => {
        // Sets status to rejected so student sees red badge
        await updateDoc(doc(db, "assignments", taskId), { status: "rejected" });
    };

    const handlePostEvent = async (e) => { 
        e.preventDefault(); 
        await addDoc(collection(db, "activities"), { 
            community_name: userData.community_name, 
            event_title: newEvent.title, 
            description: newEvent.desc,
            image_url: newEvent.image || "", // Save Image
            event_date: newEvent.date || "",   // Save Date
            location: newEvent.location || "Campus", // Save Location
            posted_by_uid: user.uid, 
            createdAt: new Date(), 
            volunteer_list: [] 
        }); 
        setShowPostForm(false); 
        setNewEvent({ title: "", desc: "", image: "", date: "", location: "" }); 
    };

    const submitAssignment = async () => {
        if (!taskTitle.trim()) return;
        try {
            await addDoc(collection(db, "assignments"), {
                activityId: selectedActivityId,
                studentId: selectedStudent,
                taskTitle: taskTitle,
                status: "pending",
                assignedBy: user.uid,
                communityName: userData.community_name,
                assignedAt: new Date()
            });
            setIsAssigning(false);
            setTaskTitle("");
        } catch (error) { console.error(error); }
    };

    // --- CALCULATE STATS ---
    const pendingReviews = allAssignments.filter(t => t.status === "in_review");
    const totalRecruits = Object.keys(studentNames).length;
    const activeOps = myActivities.length;

    return (
        <div className="min-h-screen bg-[#050511] text-white p-4 md:p-8 relative overflow-hidden font-sans pb-32">
            
            {/* BACKGROUND NEON GLOWS */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-green-500 tracking-[0.2em] uppercase">System Online</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter"
                            style={{ textShadow: "0 0 40px rgba(5, 217, 232, 0.2)" }}>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">{userData.community_name}</span>
                            <span className="text-white"> HQ</span>
                        </h1>
                    </div>
                    
                    <button 
                        onClick={() => setShowPostForm(!showPostForm)}
                        className="group relative px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="flex items-center gap-3 relative z-10 font-bold tracking-wide">
                            <PlusCircle size={20} /> INITIATE NEW OP
                        </div>
                    </button>
                </div>

                {/* --- PENDING APPROVALS ALERT (Top Section) --- */}
                {pendingReviews.length > 0 && (
                    <div className="mb-12 bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-3xl animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                            <AlertTriangle size={24} /> Approvals Required ({pendingReviews.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingReviews.map(task => (
                                <div key={task.id} className="bg-black/40 p-4 rounded-xl border border-yellow-500/20 flex justify-between items-center hover:border-yellow-500/50 transition-all">
                                    <div>
                                        <p className="font-bold text-white text-lg">{task.taskTitle}</p>
                                        <p className="text-xs text-slate-400 font-mono mt-1">
                                            Agent: <span className="text-yellow-200">{studentNames[task.studentId] || "Unknown"}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => rejectTask(task.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all" title="Reject"><X size={20}/></button>
                                        <button onClick={() => approveTask(task.id)} className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20 transition-all" title="Approve"><CheckCircle size={20}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- STATS HUD --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <StatCard icon={<Activity size={24}/>} label="Active Operations" value={activeOps} color="blue" />
                    <StatCard icon={<Users size={24}/>} label="Total Recruits" value={totalRecruits} color="purple" />
                    <StatCard icon={<Radio size={24}/>} label="Comms Status" value="Online" color="green" />
                </div>

                {/* --- EXPANDED POST FORM --- */}
                {showPostForm && (
                    <div className="mb-12 p-1 rounded-3xl bg-gradient-to-r from-blue-500/50 to-purple-500/50">
                        <div className="bg-[#0b0d21] p-6 md:p-8 rounded-[22px] backdrop-blur-xl">
                            <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <Command size={18} /> Operation Briefing
                            </h3>
                            <form onSubmit={handlePostEvent} className="space-y-6">
                                
                                {/* Row 1: Title & Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 uppercase font-bold ml-1">Operation Title</label>
                                        <input className="w-full bg-[#15172b] p-4 rounded-xl border border-white/10 text-white focus:border-blue-500 outline-none" placeholder="e.g. PROJECT: CLEAN SWEEP" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 uppercase font-bold ml-1">Execution Date</label>
                                        <input type="date" className="w-full bg-[#15172b] p-4 rounded-xl border border-white/10 text-white focus:border-blue-500 outline-none" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} required />
                                    </div>
                                </div>

                                {/* Row 2: Location & Image */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 uppercase font-bold ml-1">Target Location</label>
                                        <div className="relative">
                                            <input className="w-full bg-[#15172b] p-4 pl-10 rounded-xl border border-white/10 text-white focus:border-blue-500 outline-none" placeholder="e.g. Main Auditorium" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} required />
                                            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 uppercase font-bold ml-1">Mission Banner URL</label>
                                        <div className="relative">
                                            <input className="w-full bg-[#15172b] p-4 pl-10 rounded-xl border border-white/10 text-white focus:border-blue-500 outline-none" placeholder="https://..." value={newEvent.image} onChange={(e) => setNewEvent({...newEvent, image: e.target.value})} />
                                            <ImageIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase font-bold ml-1">Mission Parameters</label>
                                    <textarea className="w-full bg-[#15172b] p-4 rounded-xl border border-white/10 text-white h-32 focus:border-blue-500 outline-none resize-none" placeholder="Detailed instructions..." value={newEvent.desc} onChange={(e) => setNewEvent({...newEvent, desc: e.target.value})} required />
                                </div>
                                
                                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.01] transition-all">Transmit Orders</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- OPERATIONS GRID --- */}
                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <Activity size={18} /> Active Deployments
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myActivities.map(act => (
                        <div key={act.id} className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-6 rounded-3xl backdrop-blur-sm transition-all hover:border-blue-500/30 overflow-hidden relative">
                            
                            {/* NEW: IMAGE BACKGROUND FADE */}
                            {act.image_url && (
                                <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                                    <img src={act.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050511] via-[#050511]/80 to-transparent"></div>
                                </div>
                            )}

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                                        {act.event_title}
                                    </h2>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 animate-pulse">
                                            LIVE
                                        </span>
                                        {act.event_date && <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1"><Calendar size={10}/> {act.event_date}</span>}
                                    </div>
                                </div>
                                
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                                    {act.description}
                                </p>
                                
                                <div className="bg-[#050511]/80 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14}/> Squad Roster ({act.volunteer_list?.length || 0})
                                    </h3>
                                    
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {act.volunteer_list?.length > 0 ? (
                                            act.volunteer_list.map((vUID) => {
                                                // --- FILTER TASKS FOR THIS STUDENT IN THIS ACTIVITY ---
                                                const studentTasks = allAssignments.filter(t => t.studentId === vUID && t.activityId === act.id);

                                                return (
                                                    <div key={vUID} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg">
                                                                    {studentNames[vUID]?.charAt(0) || "R"}
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-200">
                                                                    {studentNames[vUID] || "Loading..."}
                                                                </span>
                                                            </div>
                                                            
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedStudent(vUID);
                                                                    setSelectedActivityId(act.id);
                                                                    setTaskTitle("");
                                                                    setIsAssigning(true);
                                                                }}
                                                                className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-blue-500/20 hover:border-blue-600 flex items-center gap-1"
                                                            >
                                                                <ClipboardPlus size={12} /> Assign
                                                            </button>
                                                        </div>

                                                        {/* --- HISTORY LIST UNDER NAME --- */}
                                                        {studentTasks.length > 0 && (
                                                            <div className="pl-11 space-y-1">
                                                                {studentTasks.map(t => (
                                                                    <div key={t.id} className="flex items-center gap-2 text-[10px]">
                                                                        {/* Status Icons */}
                                                                        {t.status === 'completed' && <CheckCircle size={10} className="text-green-400" />}
                                                                        {t.status === 'pending' && <Clock size={10} className="text-slate-500" />}
                                                                        {t.status === 'in_review' && <Clock size={10} className="text-yellow-400 animate-pulse" />}
                                                                        {t.status === 'rejected' && <X size={10} className="text-red-400" />}
                                                                        
                                                                        <span className={`truncate max-w-[150px] ${
                                                                            t.status === 'completed' ? "text-green-400 line-through opacity-50" : 
                                                                            t.status === 'rejected' ? "text-red-400" : "text-slate-400"
                                                                        }`}>
                                                                            {t.taskTitle}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-4 text-slate-600 text-xs italic border border-dashed border-white/10 rounded-lg">
                                                Awaiting Volunteers...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- ASSIGNMENT MODAL (MISSION BRIEFING) --- */}
                {isAssigning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                        <div className="bg-[#0b0d21] border border-blue-500/30 w-full max-w-md p-0 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.2)] overflow-hidden relative transform scale-100">
                            
                            {/* Decorative Top Bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            
                            <div className="p-8 relative z-10">
                                <button 
                                    onClick={() => setIsAssigning(false)}
                                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1 flex items-center gap-2">
                                    <Command className="text-blue-500" size={20} /> Mission Briefing
                                </h3>
                                <p className="text-slate-400 text-sm mb-8">
                                    Assigning directive to: <span className="text-blue-400 font-bold border-b border-blue-400/30 pb-0.5">{studentNames[selectedStudent]}</span>
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Objective Details</label>
                                        <div className="relative">
                                            <input 
                                                autoFocus
                                                className="w-full bg-[#15172b] p-4 pl-5 rounded-xl border border-white/20 text-white focus:border-blue-500 outline-none transition-all font-medium"
                                                placeholder="e.g. 'Man the Entry Gate'"
                                                value={taskTitle}
                                                onChange={(e) => setTaskTitle(e.target.value)}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={submitAssignment}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl font-bold text-white uppercase tracking-widest hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Confirm Assignment
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Background Grid */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: STAT CARD ---
const StatCard = ({ icon, label, value, color }) => (
    <div className={`bg-[#0f1126]/80 border border-white/5 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group hover:border-${color}-500/30 transition-all`}>
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
            <h4 className="text-2xl font-black text-white">{value}</h4>
        </div>
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-${color}-500/10 rounded-full blur-xl group-hover:bg-${color}-500/20 transition-all`}></div>
    </div>
);

export default ClubLeadDashboard;