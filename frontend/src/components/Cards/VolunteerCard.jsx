import React from "react";
import { ShieldCheck, Clock, Users, Calendar } from "lucide-react";

const VolunteerCard = ({ data, active }) => {
  // Use a generic event placeholder if no image is provided
  const imgSrc = data.photoUrl && data.photoUrl.length > 10 
    ? data.photoUrl 
    : "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop"; 

  // Format Date if it exists
  const dateDisplay = data.date || data.batch; 
  // Note: We use 'batch' as fallback because Discovery.jsx maps the date to 'batch' for tasks.

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "24px",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: active ? "0 0 30px rgba(255, 42, 109, 0.4)" : "0 10px 20px rgba(0,0,0,0.5)",
        backgroundColor: "#0a0b1e",
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
      }}
    >
      {/* --- FULL BACKGROUND IMAGE --- */}
      <img 
        src={imgSrc} 
        alt={data.name}
        draggable="false"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          filter: active ? "brightness(1)" : "brightness(0.7)",
          transition: "filter 0.3s ease"
        }}
      />

      {/* --- DARK GRADIENT OVERLAY --- */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(10,11,30,0.2) 0%, rgba(10,11,30,0.8) 60%, #0a0b1e 95%)",
          zIndex: 1
        }}
      />

      {/* --- CONTENT LAYER --- */}
      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", padding: "24px" }}>
        
        {/* TOP BADGES */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            {/* Community Name */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", padding: "6px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "12px", fontWeight: "700" }}>
                <ShieldCheck size={14} className="text-[#05d9e8]"/> {data.branch || "Community Event"}
            </div>

            {/* DATE BADGE (NEW) */}
            {dateDisplay && dateDisplay !== "Flexible" && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#ff2a6d", padding: "6px 12px", borderRadius: "20px", boxShadow: "0 4px 10px rgba(255, 42, 109, 0.4)", color: "white", fontSize: "12px", fontWeight: "800" }}>
                    <Calendar size={12} /> {dateDisplay}
                </div>
            )}
        </div>

        <div style={{ flex: 1 }}></div>

        {/* BOTTOM TEXT INFO */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "900", color: "white", marginBottom: "12px", lineHeight: "1.1", textTransform: "uppercase", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
                {data.name}
            </h1>
            
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(5px)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", lineHeight: "1.5", fontStyle: "italic", margin: 0 }}>
                    "{data.bio}"
                </p>
            </div>
        </div>

        {/* FOOTER STATS */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
             {/* Credit/Time */}
             <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 42, 109, 0.2)", padding: "8px 14px", borderRadius: "12px", border: "1px solid #ff2a6d", color: "#ff2a6d", fontSize: "12px", fontWeight: "700" }}>
                <Clock size={14}/> 1h Credit
             </div>
             {/* Open Status */}
             <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(5, 217, 232, 0.2)", padding: "8px 14px", borderRadius: "12px", border: "1px solid #05d9e8", color: "#05d9e8", fontSize: "12px", fontWeight: "700" }}>
                <Users size={14}/> Open for All
             </div>
        </div>

      </div>
    </div>
  );
};

export default VolunteerCard;