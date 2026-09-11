import React, { useState } from "react";
import { supabase } from "../conf/supabase";
import { Send, Loader2, CheckCircle, AlertCircle, User, Hash, MessageSquare, Linkedin, Twitter } from "lucide-react";

// --- TEAM DATA (With Dummy Social Links) ---
const TEAM = [
    { 
        name: "Chirabrata Ghosal", 
        // role: "Frontend Dev", 
        img: "/Chira.png",
        socials: {
            linkedin: "https://www.linkedin.com/in/chirabrata-ghosal-40b942344/",
            twitter: "https://x.com/Chirabrata07"
        }
    },
    { 
        name: "Anirban Sarkar", 
        // role: "Backend Dev", 
        img: "/Anirban.png",
        socials: {
            linkedin: "https://www.linkedin.com/in/anirban-sarkar-259b44309/",
            twitter: "https://twitter.com"
        }
    },
    { 
        name: "Aryan Mishra", 
        // role: "UI/UX Designer", 
        img: "/Aryan.png",
        socials: {
            linkedin: "https://www.linkedin.com/in/aryan-mishra-987b4a321/",
            twitter: "https://x.com/sushimachine11"
        }
    }
];

const Feedback = () => {
    const [formData, setFormData] = useState({ name: "", regId: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.regId || !formData.message) {
            alert("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const { error } = await supabase
                .from('Feedback')
                .insert([{
                    student_name: formData.name,
                    reg_id: formData.regId,
                    message: formData.message
                }]);

            if (error) throw error;

            setStatus("success");
            setFormData({ name: "", regId: "", message: "" });
            setTimeout(() => setStatus(null), 4000);

        } catch (error) {
            console.error("Error:", error);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            background: "#05060f",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "30px 10px",
            fontFamily: "'Inter', sans-serif",
            boxSizing: "border-box"
        }}>
            
            {/* === SECTION 1: FORM === */}
            <div className="dashboard-card" style={{
                width: "100%",
                height : "80%",
                maxWidth: "600px",
                padding: "30px",
                borderRadius: "24px",
                background: "radial-gradient(circle at top right, #1a1b2e 0%, #0b0c15 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                marginBottom: "50px", // Increased space between form and team
                flexShrink: 0 
            }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "20px", color: "white" }}>
                        Support & <span style={{ color: "#05d9e8" }}>Feedback</span>
                    </h1>
                    <p style={{ color: "#888", fontSize: "14px" }}>
                        Facing login issues? Have a suggestion? Let us know below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                    
                    <div style={inputGroupStyle}>
                        <User size={20} color="#05d9e8" style={iconStyle} />
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" style={inputStyle} />
                    </div>

                    <div style={inputGroupStyle}>
                        <Hash size={20} color="#05d9e8" style={iconStyle} />
                        <input name="regId" value={formData.regId} onChange={handleChange} placeholder="Registration ID (e.g., 2024001)" style={inputStyle} />
                    </div>

                    <div style={{ ...inputGroupStyle, alignItems: "flex-start" }}>
                        <MessageSquare size={20} color="#05d9e8" style={{ ...iconStyle, marginTop: "20px" }} />
                        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Describe your issue or feedback..." style={{ ...inputStyle, height: "120px", resize: "none", paddingTop: "12px" }} />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        background: status === "success" ? "#00e074" : "linear-gradient(90deg, #05d9e8, #0056ff)",
                        color: status === "success" ? "black" : "white",
                        border: "none", padding: "16px", borderRadius: "14px",
                        fontWeight: "bold", fontSize: "16px", cursor: loading ? "wait" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "20px",
                        transition: "0.3s", boxShadow: status === "success" ? "0 0 20px rgba(0, 224, 116, 0.4)" : "0 0 20px rgba(5, 217, 232, 0.2)"
                    }}>
                        {loading ? <Loader2 className="animate-spin" /> : status === "success" ? <CheckCircle /> : <Send />}
                        {loading ? "Sending..." : status === "success" ? "Sent Successfully!" : "Submit Report"}
                    </button>

                    {status === "error" && (
                        <p style={{ color: "#ff2a6d", textAlign: "center", fontSize: "13px", marginTop: "5px" }}>
                            Something went wrong. Please check your connection.
                        </p>
                    )}
                </form>
            </div>

            {/* === SECTION 2: TEAM SHOWCASE === */}
            <div style={{ textAlign: "center", width: "100%", maxWidth: "1200px", paddingBottom: "40px" }}>
                <h3 style={{ 
                    fontSize: "14px", fontWeight: "bold", color: "#05d9e8", 
                    textTransform: "uppercase", letterSpacing: "2px", marginBottom: "30px", opacity: 0.8
                }}>
                    Meet The Developers
                </h3>

                <div style={{ 
                    display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "30px" 
                }}>
                    {TEAM.map((member, index) => (
                        <div key={index} style={{
                            background: "#0b0c15",
                            border: "1px solid rgba(255,255,255,0.05)",
                            borderRadius: "24px",
                            padding: "35px 20px", // Increased padding
                            width: "280px", // Increased width (was 250px)
                            textAlign: "center",
                            transition: "transform 0.3s ease, border-color 0.3s ease",
                            cursor: "default",
                            position: "relative",
                            overflow: "hidden"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-10px)";
                            e.currentTarget.style.borderColor = "rgba(5, 217, 232, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                        }}
                        >
                            {/* Profile Image */}
                            <div style={{
                                width: "110px", height: "110px", margin: "0 auto 20px",
                                borderRadius: "50%", overflow: "hidden",
                                border: "3px solid #05d9e8", padding: "3px",
                                background: "rgba(5, 217, 232, 0.1)"
                            }}>
                                <img src={member.img} alt={member.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                            </div>
                            
                            {/* Text Info */}
                            <h4 style={{ fontSize: "20px", fontWeight: "bold", color: "white", marginBottom: "5px" }}>{member.name}</h4>
                            <p style={{ fontSize: "14px", color: "#888", marginBottom: "20px" }}>{member.role}</p>

                            {/* Social Icons */}
                            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                                <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" style={socialBtnStyle}>
                                    <Linkedin size={18} />
                                </a>
                                <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" style={socialBtnStyle}>
                                    <Twitter size={18} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

// --- STYLES ---
const inputGroupStyle = {
    position: "relative",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    transition: "border 0.2s"
};

const iconStyle = {
    marginLeft: "16px",
    opacity: 0.8
};

const inputStyle = {
    width: "100%",
    padding: "16px",
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "15px",
    outline: "none",
    fontWeight: "500"
};

const socialBtnStyle = {
    color: "#fff",
    background: "rgba(255,255,255,0.05)",
    padding: "10px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer"
};

export default Feedback;