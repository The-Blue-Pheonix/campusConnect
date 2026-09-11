import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileCard from "./ProfileCard";     
import VolunteerCard from "./VolunteerCard"; 
import { ChevronDown, ChevronUp } from "lucide-react";

const CardStack = ({ users, onSwipeDown, onSwipeUp }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Safety check: if no users, return null
  if (!users || users.length === 0) return null;

  // Calculate the 3 visible cards
  const visibleUsers = [
    users[currentIndex % users.length],
    users[(currentIndex + 1) % users.length],
    users[(currentIndex + 2) % users.length]
  ];

  const topCardIsActivity = visibleUsers[0]?.isActivity;

  const handleDragEnd = (event, info) => {
    const threshold = isMobile ? 40 : 50; 
    
    // IMPORTANT: We use visibleUsers[0] here. 
    // Because we fixed the render bug below, this will now correctly be the TOP card.
    if (info.offset.y > threshold) {
      onSwipeDown(visibleUsers[0]);
      setCurrentIndex((prev) => prev + 1);
    } else if (info.offset.y < -threshold) {
      onSwipeUp(visibleUsers[0]);
      setCurrentIndex((prev) => prev + 1);
    }
    setDragY(0);
  };

  return (
    <div style={{ 
        position: "relative", 
        width: "100%", 
        height: isMobile ? "500px" : "600px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
    }}>
      
      {/* Top Label */}
      <motion.div
        animate={{ y: dragY < -20 ? -15 : 0, opacity: dragY < -20 ? 1 : 0.4 }}
        style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", color: topCardIsActivity ? "#888" : "#00d4ff", pointerEvents: "none" }}
      >
        <ChevronUp size={24} strokeWidth={3} />
        <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>{topCardIsActivity ? "Pass" : "Skip"}</span>
      </motion.div>

      {/* Bottom Label */}
      <motion.div
        animate={{ y: dragY > 20 ? 15 : 0, opacity: dragY > 20 ? 1 : 0.4 }}
        style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", color: "#ff2a6d", pointerEvents: "none" }}
      >
        <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>{topCardIsActivity ? "Volunteer" : "Request"}</span>
        <ChevronDown size={24} strokeWidth={3} />
      </motion.div>

      <AnimatePresence mode="popLayout">
        {/* BUG FIX: used [...visibleUsers].reverse() 
           This creates a COPY before reversing, preventing the original array from being flipped.
        */}
        {[...visibleUsers].reverse().map((user, index) => {
          const isTop = index === 2; // In a reversed array of 3, index 2 is the top
          
          const uniqueKey = `${user.uid}-${currentIndex}-${index}`;

          return (
            <motion.div
              key={uniqueKey}
              drag={isTop ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
              onDrag={(event, info) => setDragY(info.offset.y)}
              
              initial={{ scale: 0.9, y: -50, opacity: 0 }}
              
              animate={{ 
                scale: isTop ? 1 : 0.95 - (2-index)*0.05, 
                y: isTop ? 0 : -30 * (2-index), 
                zIndex: index, 
                opacity: 1 
              }}
              
              exit={{ 
                y: isTop ? (Math.random() > 0.5 ? 200 : -200) : 0, 
                opacity: 0, 
                transition: { duration: 0.15 } 
              }}
              
              style={{
                position: "absolute",
                width: isMobile ? "320px" : "370px",
                height: isMobile ? "480px" : "550px",
                maxWidth: "90vw",
                cursor: isTop ? "grab" : "default",
                willChange: "transform, opacity",
              }}
            >
              {user.isActivity ? (
                  <VolunteerCard data={user} active={isTop} />
              ) : (
                  <ProfileCard user={user} active={isTop} />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default CardStack;