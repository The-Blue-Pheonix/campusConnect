import React, { useState, useEffect } from "react";
import { BookOpen, Hash, Zap, Sparkles, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/mainContext";
import { calculateInterestMatch } from "../../utils/matching";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const ProfileCard = ({ user = {}, active }) => {
  const { userData } = useAuth();
  const { score, sharedInterests } = calculateInterestMatch(
    userData?.interests,
    user?.interests
  );

  const [imgSrc, setImgSrc] = useState(user.photoUrl || DEFAULT_AVATAR);

  useEffect(() => {
    setImgSrc(user.photoUrl || DEFAULT_AVATAR);
  }, [user]);

  const isDefault = imgSrc === DEFAULT_AVATAR;

  // Only show match badge if score is meaningful (> 0)
  const showMatch = score > 0;

  // Determine badge colour based on score range
  const matchColor =
    score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#a78bfa";
  const matchBg =
    score >= 70
      ? "rgba(16,185,129,0.18)"
      : score >= 40
      ? "rgba(251,191,36,0.18)"
      : "rgba(167,139,250,0.18)";
  const matchBorder =
    score >= 70
      ? "rgba(52,211,153,0.4)"
      : score >= 40
      ? "rgba(251,191,36,0.4)"
      : "rgba(167,139,250,0.4)";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "28px",
        position: "relative",
        overflow: "hidden",
        boxShadow: active
          ? "0px 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(5,217,232,0.2)"
          : "0px 8px 24px rgba(0,0,0,0.6)",
        border: active
          ? "1px solid rgba(5, 217, 232, 0.25)"
          : "1px solid rgba(255,255,255,0.07)",
        transition: "all 0.35s cubic-bezier(0.25,0.8,0.25,1)",
        backgroundColor: "#080917",
      }}
    >
      {/* ========= IMAGE LAYER ========= */}
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
          backgroundColor: isDefault ? "#1a1b2e" : "transparent",
          zIndex: 0,
        }}
      />

      {/* ========= GRADIENT OVERLAY ========= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(8,9,23,0.1) 30%, rgba(8,9,23,0.7) 65%, rgba(8,9,23,0.98) 100%)",
          zIndex: 1,
        }}
      />



      {/* ========= TOP ROW BADGES ========= */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          right: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 3,
        }}
      >
        {/* Match Score Badge — hidden when score is 0 */}
        {showMatch ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: matchBg,
              backdropFilter: "blur(10px)",
              padding: "5px 12px",
              borderRadius: "20px",
              border: `1px solid ${matchBorder}`,
              color: matchColor,
              fontSize: "12px",
              fontWeight: "700",
              boxShadow: `0 4px 16px rgba(0,0,0,0.4)`,
              letterSpacing: "0.02em",
            }}
          >
            <Zap size={13} fill={matchColor} />
            <span>{score}% Match</span>
          </div>
        ) : (
          // Empty spacer so Online badge stays on the right
          <div />
        )}

        {/* Online Status Badge */}
        <div
          style={{
            display: "flex",
            gap: 5,
            alignItems: "center",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            padding: "5px 11px",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              background: "#00ff88",
              borderRadius: "50%",
              boxShadow: "0 0 8px #00ff88",
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#ccc" }}>
            Online
          </span>
        </div>
      </div>

      {/* ========= BOTTOM CONTENT ========= */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "22px",
          boxSizing: "border-box",
          zIndex: 3,
        }}
      >
        {/* Name & Batch */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "10px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 5vw, 30px)",
              fontWeight: "900",
              color: "#fff",
              textShadow: "0 2px 12px rgba(0,0,0,0.7)",
              lineHeight: 1.1,
            }}
          >
            {user.name || "Student"}
          </h1>
          {user.batch && (
            <span
              style={{
                fontSize: "13px",
                color: "#05d9e8",
                fontWeight: "700",
                background: "rgba(5,217,232,0.12)",
                padding: "2px 9px",
                borderRadius: "8px",
                border: "1px solid rgba(5,217,232,0.25)",
              }}
            >
              {user.batch}
            </span>
          )}
        </div>

        {/* Dept / RegNo tags */}
        <div
          style={{
            display: "flex",
            gap: "7px",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          {user.branch && (
            <Badge
              icon={<GraduationCap size={13} />}
              text={user.branch}
              color="#05d9e8"
            />
          )}
          {!user.branch && (user.major || user.department) && (
            <Badge
              icon={<BookOpen size={13} />}
              text={user.major || user.department}
              color="#05d9e8"
            />
          )}
          {user.regNo && (
            <Badge
              icon={<Hash size={13} />}
              text={user.regNo}
              color="#ff2a6d"
            />
          )}
        </div>

        {/* Shared Interests */}
        {sharedInterests.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                fontWeight: "700",
                color: "#a7f3d0",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "6px",
              }}
            >
              <Sparkles size={11} />
              Shared Interests
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {sharedInterests.slice(0, 4).map((interest) => (
                <span
                  key={interest}
                  style={{
                    background: "rgba(99,102,241,0.22)",
                    border: "1px solid rgba(129,140,248,0.35)",
                    color: "#c7d2fe",
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 9px",
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
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(8px)",
              padding: "11px 14px",
              borderRadius: "14px",
              borderLeft: "3px solid #ff2a6d",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "rgba(255,255,255,0.8)",
                lineHeight: "1.5",
                fontStyle: "italic",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              "{user.bio}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========= BADGE ========= */
const Badge = ({ icon, text, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      background:
        color === "#ff2a6d"
          ? "rgba(255,42,109,0.12)"
          : "rgba(5,217,232,0.12)",
      padding: "4px 10px",
      borderRadius: "10px",
      border: `1px solid ${color}50`,
      color,
      fontSize: "12px",
      fontWeight: "600",
    }}
  >
    {icon}
    <span>{text}</span>
  </div>
);

export default ProfileCard;
