import React, { useState, useEffect } from "react";
import { BookOpen, Hash, Zap, Sparkles } from "lucide-react";
import { useAuth } from "../../context/mainContext";
import { calculateInterestMatch } from "../../utils/matching";

/**
 * Default "WhatsApp-style" Avatar
 */
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const ProfileCard = ({ user = {}, active }) => {
  // Access current user data to compute mutual interest match
  const { userData } = useAuth();
  const { score, sharedInterests } = calculateInterestMatch(
    userData?.interests,
    user?.interests
  );

  // Use state to manage image source so we can switch to default on error
  const [imgSrc, setImgSrc] = useState(user.photoUrl || DEFAULT_AVATAR);

  // Reset image when user changes
  useEffect(() => {
    setImgSrc(user.photoUrl || DEFAULT_AVATAR);
  }, [user]);

  // Check if we are currently showing the default image
  const isDefault = imgSrc === DEFAULT_AVATAR;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: active
          ? "0px 0px 40px rgba(0, 212, 255, 0.4), inset 0 0 0 1px rgba(255,255,255,0.2)"
          : "0px 10px 20px rgba(0,0,0,0.5)",
        border: active
          ? "1px solid rgba(0, 212, 255, 0.5)"
          : "1px solid rgba(255,255,255,0.1)",
        transition: "all 0.3s ease",
        backgroundColor: "#0a0b1e",
      }}
    >
      {/* ================= IMAGE LAYER ================= */}
      <img
        src={imgSrc}
        onError={() => setImgSrc(DEFAULT_AVATAR)}
        alt="profile"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: isDefault ? "contain" : "cover",
          padding: isDefault ? "50px" : "0px",
          backgroundColor: isDefault ? "#cfd8dc" : "transparent",
          zIndex: 0,
        }}
      />

      {/* ================= DARK OVERLAY ================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(10,11,30,0) 40%, rgba(10,11,30,0.95) 90%)",
          zIndex: 1,
        }}
      />

      {/* ================= TOP BADGES (ONLINE STATUS & MATCH SCORE) ================= */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        {/* Match Score Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(16, 185, 129, 0.2)",
            backdropFilter: "blur(8px)",
            padding: "6px 14px",
            borderRadius: "20px",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "#34d399",
            fontSize: "13px",
            fontWeight: "700",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Zap size={14} fill="#34d399" />
          <span>{score}% Match</span>
        </div>

        {/* Online Status Badge */}
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            padding: "6px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              background: "#00ff88",
              borderRadius: "50%",
              boxShadow: "0 0 10px #00ff88",
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>
            Online
          </span>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "24px",
          boxSizing: "border-box",
          zIndex: 2,
        }}
      >
        {/* Name & Year */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "800",
              color: "#fff",
              textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            {user.name || "Student"}
          </h1>
          <span
            style={{
              fontSize: "20px",
              color: "#00d4ff",
              fontWeight: "600",
            }}
          >
            {user.year || ""}
          </span>
        </div>

        {/* System & Academic Tags */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          {user.regNo && (
            <Badge
              icon={<Hash size={14} />}
              text={user.regNo}
              color="#ff007f"
            />
          )}
          {(user.major || user.department) && (
            <Badge
              icon={<BookOpen size={14} />}
              text={user.major || user.department}
              color="#00d4ff"
            />
          )}
        </div>

        {/* Shared Interests Section */}
        {sharedInterests.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#a7f3d0",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "6px",
              }}
            >
              <Sparkles size={12} />
              Shared Interests
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {sharedInterests.map((interest) => (
                <span
                  key={interest}
                  style={{
                    background: "rgba(99, 102, 241, 0.25)",
                    border: "1px solid rgba(129, 140, 248, 0.4)",
                    color: "#c7d2fe",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "3px 10px",
                    borderRadius: "8px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(6px)",
              padding: "12px",
              borderRadius: "16px",
              borderLeft: "3px solid #ff007f",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "rgba(255,255,255,0.85)",
                lineHeight: "1.5",
                fontStyle: "italic",
              }}
            >
              “{user.bio}”
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= BADGE ================= */

const Badge = ({ icon, text, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background:
        color === "#ff007f"
          ? "rgba(255,0,127,0.15)"
          : "rgba(0,212,255,0.15)",
      padding: "6px 12px",
      borderRadius: "12px",
      border: `1px solid ${color}`,
      color,
      fontSize: "13px",
      fontWeight: "600",
    }}
  >
    {icon}
    {text}
  </div>
);

export default ProfileCard;
