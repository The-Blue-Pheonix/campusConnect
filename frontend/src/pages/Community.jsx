import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../conf/firebase";
import { useAuth } from "../context/mainContext";
import { ShieldCheck, Zap, CheckCircle, Clock, Trophy, Target, AlertCircle, Loader, XCircle, RotateCcw, Check } from "lucide-react";

const Community = () => {
    const { user } = useAuth();
    const [enrolledEvents, setEnrolledEvents] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Enrollments
                const eventQuery = query(collection(db, "activities"), where("volunteer_list", "array-contains", user.uid));
                const eventSnap = await getDocs(eventQuery);
                const events = eventSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setEnrolledEvents(events);

                // Fetch Tasks
                const taskQuery = query(collection(db, "assignments"), where("studentId", "==", user.uid));
                const taskSnap = await getDocs(taskQuery);
                const tasks = taskSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setMyTasks(tasks);

            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [user]);

    // --- REQUEST REVIEW (Also used for Resubmit) ---
    const requestReview = async (taskId) => {
        try {
            await updateDoc(doc(db, "assignments", taskId), { status: "in_review" });
            // Optimistic UI update so it feels instant
            setMyTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "in_review" } : t));
        } catch (err) { console.error(err); }
    };

    // --- CALCULATE GAMIFIED STATS ---
    const totalCredits = enrolledEvents.length;
    const tasksPending = myTasks.filter(t => t.status !== "completed").length;
    const tasksDone = myTasks.filter(t => t.status === "completed").length;

    // --- CALCULATE RANK ---
    let rank = "Novice";
    if (tasksDone >= 1) rank = "Volunteer";
    if (tasksDone >= 5) rank = "Contributor";
    if (tasksDone >= 10) rank = "Community Hero";

    if (loading) return <div className="min-h-screen bg-[#050511] text-white flex items-center justify-center">Loading Mission Control...</div>;

    return (
        <div className="min-h-screen bg-[#050511] text-white p-4 md:p-8 relative overflow-hidden font-sans">
            
            {/* BACKGROUND EFFECTS */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* --- HEADER SECTION --- */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2" 
                        style={{ textShadow: "0 0 40px rgba(5, 217, 232, 0.3)" }}>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#05d9e8] to-[#007aff]">Command</span> 
                        <span className="text-white"> Center</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-lg">Current Rank: <span className="text-[#05d9e8] font-bold">{rank}</span></p>
                </div>

                {/* --- STATS HUD --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <StatCard 
                        icon={<Trophy size={28} className="text-yellow-400" />} 
                        label="Verified Completes" 
                        value={tasksDone} 
                        sub={`Rank: ${rank}`}
                        color="yellow"
                    />
                    <StatCard 
                        icon={<Target size={28} className="text-[#ff2a6d]" />} 
                        label="Active Missions" 
                        value={tasksPending} 
                        sub="Awaiting Action"
                        color="pink"
                    />
                    <StatCard 
                        icon={<CheckCircle size={28} className="text-[#05d9e8]" />} 
                        label="Total Enrollments" 
                        value={totalCredits} 
                        sub="Events Joined"
                        color="cyan"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- LEFT COLUMN: MISSIONS (DUTIES) --- */}
                    <div className="lg:col-span-7 space-y-6">
                        <SectionHeader title="Priority Missions" icon={<Zap className="text-[#ff2a6d]" />} />
                        
                        {myTasks.length === 0 ? (
                            <EmptyState text="No active missions. Wait for a leader to assign you a task!" />
                        ) : (
                            <div className="space-y-4">
                                {myTasks.map(task => (
                                    <div key={task.id} 
                                        className={`relative group overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                                            task.status === "completed" 
                                            ? "bg-white/5 border-white/5 opacity-60" 
                                            : "bg-[#0f1126] border-[#ff2a6d]/30 shadow-[0_0_30px_rgba(255,42,109,0.1)] hover:border-[#ff2a6d] hover:shadow-[0_0_40px_rgba(255,42,109,0.2)]"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start flex-wrap gap-4">
                                            <div className="flex-1 min-w-[200px]">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                                                        task.status === "completed" 
                                                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                                        : "bg-[#ff2a6d]/10 text-[#ff2a6d] border-[#ff2a6d]/20"
                                                    }`}>
                                                        {task.communityName || "Community Task"}
                                                    </span>
                                                    
                                                    {/* --- STATUS BADGES --- */}
                                                    {task.status === "pending" && (
                                                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold animate-pulse">
                                                            <AlertCircle size={10} /> PENDING
                                                        </span>
                                                    )}
                                                    {task.status === "in_review" && (
                                                        <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold animate-pulse">
                                                            <Loader size={10} className="animate-spin" /> UNDER REVIEW
                                                        </span>
                                                    )}
                                                    {/* NEW: REJECTED BADGE */}
                                                    {task.status === "rejected" && (
                                                        <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold animate-pulse">
                                                            <XCircle size={10} /> REJECTED
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#ff2a6d] transition-colors">
                                                    {task.taskTitle}
                                                </h3>
                                                <p className="text-slate-500 text-xs">Assigned by Leader</p>
                                            </div>

                                            {/* --- ACTION BUTTONS (UPDATED) --- */}
                                            {/* Show button if Pending OR Rejected (Retry Logic) */}
                                            {(task.status === "pending" || task.status === "rejected") && (
                                                <button 
                                                    onClick={() => requestReview(task.id)}
                                                    className="bg-[#ff2a6d] hover:bg-[#ff0055] text-white p-3 rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm whitespace-nowrap"
                                                >
                                                    {task.status === "rejected" ? <RotateCcw size={16} /> : <Zap size={16} />} 
                                                    <span className="hidden sm:inline">{task.status === "rejected" ? "Resubmit Mission" : "Submit Review"}</span>
                                                </button>
                                            )}
                                            
                                            {task.status === "in_review" && (
                                                <div className="bg-yellow-500/10 text-yellow-400 px-3 py-2 rounded-xl text-xs font-bold border border-yellow-500/20 whitespace-nowrap">
                                                    Awaiting Approval
                                                </div>
                                            )}
                                            
                                            {task.status === "completed" && (
                                                <div className="text-green-500 flex items-center gap-2 font-bold text-sm bg-green-500/10 px-3 py-2 rounded-lg whitespace-nowrap">
                                                    <Check/> Accepted
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: ENROLLMENTS (BADGES) --- */}
                    <div className="lg:col-span-5 space-y-6">
                        <SectionHeader title="Event Enrollments" icon={<ShieldCheck className="text-[#05d9e8]" />} />
                        
                        {enrolledEvents.length === 0 ? (
                            <EmptyState text="You haven't volunteered for any events yet. Check the Discovery feed!" />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {enrolledEvents.map(event => (
                                    <div key={event.id} className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] cursor-default">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#05d9e8] to-blue-600 flex items-center justify-center shadow-lg text-black">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white truncate">{event.event_title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                <span className="bg-white/10 px-1.5 py-0.5 rounded text-slate-300">{event.community_name}</span>
                                                <span className="flex items-center gap-1 text-[#05d9e8]"><Clock size={10} /> 1h Credit</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const StatCard = ({ icon, label, value, sub, color }) => (
    <div className={`bg-[#0f1126] border border-white/5 p-6 rounded-2xl relative overflow-hidden group`}>
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-${color}-500/20`}></div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-4xl font-black text-white mb-1">{value}</h3>
                <p className={`text-xs font-medium text-${color === 'yellow' ? 'yellow-400' : 'cyan-400'}`}>{sub}</p>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/5 text-${color === 'yellow' ? 'yellow-400' : 'cyan-400'}`}>
                {icon}
            </div>
        </div>
    </div>
);

const SectionHeader = ({ title, icon }) => (
    <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-white uppercase tracking-wide">{title}</h2>
        <div className="h-[1px] bg-white/10 flex-1 ml-4"></div>
    </div>
);

const EmptyState = ({ text }) => (
    <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/[0.02]">
        <p className="text-slate-500 italic">{text}</p>
    </div>
);

export default Community;