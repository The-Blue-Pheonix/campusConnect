import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import {
  Search, MessageSquare, Users, Settings, LogOut, User,
  Menu, MapPin, CalendarDays, Hexagon, Home, UserSearch,
} from "lucide-react";
import { useAuth } from "../context/mainContext";
import NotificationPopup from "./NotificationsPopup";
import BrandLogo from "./BrandLogo";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../conf/firebase";

/* ─── BOTTOM NAV ITEMS (Mobile) ─── */
const MOBILE_NAV = [
  { to: "/discover",   icon: <Home size={22} />,        label: "Discover" },
  { to: "/find",       icon: <UserSearch size={22} />,  label: "Find" },
  { to: "/chat",       icon: <MessageSquare size={22} />, label: "Chat" },
  { to: "/community",  icon: <Users size={22} />,       label: "Community" },
  { to: "/profile",    icon: <User size={22} />,        label: "Profile" },
];

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [activities, setActivities] = useState([]);

  /* Fetch activities for mini calendar */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "activities"), (snap) => {
      setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* Responsive listener */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  return (
    <div
      style={{
        height: "100dvh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── TOP NAVBAR ── */}
      <header
        style={{
          height: "60px",
          width: "100%",
          background: "rgba(11,12,21,0.97)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          boxSizing: "border-box",
          zIndex: 60,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Hamburger — desktop only */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              onMouseEnter={() => setIsMenuHovered(true)}
              onMouseLeave={() => setIsMenuHovered(false)}
              style={{
                background: isMenuHovered
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
                border: "none",
                outline: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                padding: "8px",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
            >
              <Menu size={22} />
            </button>
          )}

          <Link
            to="/discover"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              textDecoration: "none",
            }}
          >
            <BrandLogo size={36} animated={false} />
            <div style={{ lineHeight: "1" }}>
              <div
                style={{
                  fontWeight: "800",
                  fontSize: "17px",
                  letterSpacing: "1px",
                  color: "white",
                }}
              >
                CAMPUS
              </div>
              <div
                style={{
                  fontWeight: "400",
                  fontSize: "17px",
                  color: "#05d9e8",
                  letterSpacing: "2px",
                }}
              >
                CONNECT
              </div>
            </div>
          </Link>
        </div>

        <Link
          to="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          {!isMobile && (
            <div style={{ textAlign: "right" }}>
              <div
                style={{ color: "white", fontWeight: "600", fontSize: "13px" }}
              >
                My Profile
              </div>
              <div style={{ color: "#00ff88", fontSize: "11px" }}>● Online</div>
            </div>
          )}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "#1a1b30",
              border: "2px solid #05d9e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 0 12px rgba(5,217,232,0.3)",
            }}
          >
            <User size={20} color="white" />
          </div>
        </Link>
      </header>

      {/* ── BODY ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          /* Leave space at bottom for mobile nav bar */
          paddingBottom: isMobile ? "60px" : "0",
        }}
      >
        <NotificationPopup />

        {/* ── SIDEBAR (Desktop) ── */}
        {!isMobile && (
          <aside
            style={{
              position: "relative",
              zIndex: 50,
              height: "100%",
              width: isSidebarOpen ? "250px" : "0px",
              padding: isSidebarOpen ? "24px 16px" : "24px 0px",
              opacity: isSidebarOpen ? 1 : 0,
              background: "#080917",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "all 0.35s cubic-bezier(0.25,0.8,0.25,1)",
              whiteSpace: "nowrap",
            }}
          >
            <nav
              style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}
            >
              <NavItem to="/discover"   icon={<Search size={19} />}       label="Discover"        isOpen={isSidebarOpen} />
              <NavItem to="/community"  icon={<Users size={19} />}        label="Community"       isOpen={isSidebarOpen} />
              <NavItem to="/club-hub"   icon={<Hexagon size={19} />}      label="Club Hub"        isOpen={isSidebarOpen} />
              <NavItem to="/chat"       icon={<MessageSquare size={19} />} label="Chat"           isOpen={isSidebarOpen} />
              <NavItem to="/find"       icon={<UserSearch size={19} />}   label="Find People"     isOpen={isSidebarOpen} />
              <NavItem to="/location"   icon={<MapPin size={19} />}       label="Live Map"        isOpen={isSidebarOpen} />
              <NavItem to="/requests"   icon={<Users size={19} />}        label="Friend Requests" isOpen={isSidebarOpen} />
              <NavItem to="/settings"   icon={<Settings size={19} />}     label="Settings"        isOpen={isSidebarOpen} />
            </nav>

            {/* Mini Event Calendar */}
            {isSidebarOpen && <MiniCalendar activities={activities} />}

            <button
              onClick={handleLogout}
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 12px",
                background: "rgba(255,42,109,0.08)",
                color: "#ff2a6d",
                border: "1px solid rgba(255,42,109,0.3)",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s",
                opacity: isSidebarOpen ? 1 : 0,
              }}
            >
              <LogOut size={17} />
              {isSidebarOpen && "Logout"}
            </button>
          </aside>
        )}

        {/* Backdrop for mobile sidebar (not used now but kept for drawer in future) */}
        {isMobile && isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: "absolute",
              top: 0, left: 0, width: "100%", height: "100%",
              background: "rgba(0,0,0,0.6)",
              zIndex: 40,
              backdropFilter: "blur(3px)",
            }}
          />
        )}

        {/* ── MAIN CONTENT ── */}
        <main
          style={{
            flex: 1,
            position: "relative",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "0",
            transition: "all 0.35s ease",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV BAR ── */}
      {isMobile && (
        <MobileBottomNav onLogout={handleLogout} />
      )}
    </div>
  );
};

/* ─── MOBILE BOTTOM NAV ─── */
const MobileBottomNav = ({ onLogout }) => {
  const location = useLocation();
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "rgba(8,9,23,0.97)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 70,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {MOBILE_NAV.map(({ to, icon, label }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              textDecoration: "none",
              color: isActive ? "#05d9e8" : "#555",
              padding: "6px 10px",
              borderRadius: "12px",
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            {/* Active glow dot */}
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "#05d9e8",
                  boxShadow: "0 0 8px #05d9e8",
                }}
              />
            )}
            <div style={{ filter: isActive ? "drop-shadow(0 0 6px #05d9e8)" : "none", transition: "filter 0.2s" }}>
              {icon}
            </div>
            <span
              style={{
                fontSize: "9px",
                fontWeight: isActive ? "700" : "500",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

/* ─── DESKTOP SIDEBAR NAV ITEM ─── */
const NavItem = ({ to, icon, label, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "9px 12px",
        borderRadius: "12px",
        color: isActive ? "#fff" : "#55606e",
        background: isActive
          ? "linear-gradient(90deg, rgba(5,217,232,0.12) 0%, transparent 100%)"
          : "transparent",
        borderLeft: isActive ? "3px solid #05d9e8" : "3px solid transparent",
        textDecoration: "none",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        fontSize: "14px",
        fontWeight: isActive ? "600" : "400",
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.25s ease",
          transitionDelay: isOpen ? "0.15s" : "0s",
        }}
      >
        {label}
      </span>
    </Link>
  );
};

/* ─── MINI CALENDAR ─── */
const MiniCalendar = ({ activities }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay();
  const monthLabel = today.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const eventDays = new Set(
    activities
      .filter((a) =>
        a.event_date?.startsWith(
          `${year}-${String(month + 1).padStart(2, "0")}`
        )
      )
      .map((a) => parseInt(a.event_date.split("-")[2]))
  );
  const cells = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push(<div key={`e${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate();
    const hasEvent = eventDays.has(d);
    const dayActs = activities.filter(
      (a) =>
        a.event_date ===
        `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
    const tooltip = dayActs.map((a) => a.event_title).join(", ");
    cells.push(
      <div
        key={d}
        title={tooltip || undefined}
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: isToday ? "900" : hasEvent ? "700" : "400",
          background: isToday
            ? "#05d9e8"
            : hasEvent
            ? "rgba(5,217,232,0.15)"
            : "transparent",
          color: isToday ? "#000" : hasEvent ? "#05d9e8" : "#444",
          border:
            hasEvent && !isToday ? "1px solid rgba(5,217,232,0.3)" : "1px solid transparent",
          cursor: hasEvent ? "pointer" : "default",
        }}
      >
        {d}
      </div>
    );
  }
  return (
    <div
      style={{
        marginTop: "12px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px",
        padding: "12px",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}
      >
        <CalendarDays size={12} color="#05d9e8" />
        <span
          style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "#05d9e8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {monthLabel}
        </span>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: "9px",
              color: "#333",
              fontWeight: "700",
              paddingBottom: "4px",
            }}
          >
            {d}
          </div>
        ))}
        {cells}
      </div>
      {eventDays.size > 0 && (
        <div
          style={{ marginTop: "8px", fontSize: "9px", color: "#05d9e8", fontWeight: "600" }}
        >
          ● {eventDays.size} event{eventDays.size > 1 ? "s" : ""} this month
        </div>
      )}
    </div>
  );
};

export default Layout;
