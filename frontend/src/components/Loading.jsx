import React from "react";

const LoadingScreen = () => {
  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      background: "#05060f", // Dark background
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 99999,
    }}>
      {/* Animation Styles */}
      <style>
        {`
          @keyframes pulse-glow {
            0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(5, 217, 232, 0)); opacity: 1; }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(5, 217, 232, 0.4)); opacity: 0.9; }
            100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(5, 217, 232, 0)); opacity: 1; }
          }
          @keyframes loading-slide {
            0% { left: -50%; }
            100% { left: 100%; }
          }
          .logo-animate {
            animation: pulse-glow 2s infinite ease-in-out;
          }
        `}
      </style>

      {/* Logo Container */}
      <div className="logo-animate" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "25px" }}>
        
        <img 
          src="/blue-ph.png" 
          alt="Campus Connect" 
          style={{
            width: "150px",  
            height: "150px", 
            objectFit: "contain"
          }} 
        />

        {/* <div style={{ textAlign: "center" }}>
          <h1 style={{ 
            color: "white", 
            fontSize: "24px", 
            fontWeight: "800", 
            letterSpacing: "4px",
            margin: 0,
            textTransform: "uppercase" 
          }}>
            Campus
          </h1>
          <h2 style={{ 
            color: "#05d9e8", 
            fontSize: "14px", 
            fontWeight: "600", 
            letterSpacing: "6px",
            marginTop: "5px",
            textTransform: "uppercase" 
          }}>
            Connect
          </h2>
        </div> */}

      </div>

      {/* Loading Bar at bottom */}
      <div style={{
        marginTop: "50px",
        width: "150px",
        height: "4px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "10px",
        overflow: "hidden",
        position: "relative"
      }}>
        <div style={{
          width: "50%",
          height: "100%",
          background: "linear-gradient(90deg, #05d9e8, #ff2a6d)",
          position: "absolute",
          borderRadius: "10px",
          animation: "loading-slide 1.5s infinite"
        }} />
      </div>

    </div>
  );
};

export default LoadingScreen;