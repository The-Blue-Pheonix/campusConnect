import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/mainContext";
import { updateLiveLocation, subscribeToFriendsLocations } from "../services/profileService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Navigation, User } from "lucide-react";

// Fix for default Leaflet marker icons in React
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// A custom icon for friends
const FriendIcon = L.divIcon({
  className: "custom-friend-icon",
  html: `<div style="background-color: #05d9e8; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(5,217,232,0.8);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationTracking = () => {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [friendsLocations, setFriendsLocations] = useState([]);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Subscribe to friends locations
    if (!user) return;
    
    let unsubscribe = () => {};
    const setupSubscription = async () => {
      unsubscribe = await subscribeToFriendsLocations(user.uid, (data) => {
        setFriendsLocations(data);
      });
    };
    setupSubscription();

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user]);

  const toggleLocationSharing = () => {
    if (!isSharing) {
      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setMyLocation({ lat: latitude, lng: longitude });
            updateLiveLocation(user.uid, latitude, longitude, true);
            setError(null);
          },
          (err) => {
            console.error("Error watching location:", err);
            setError("Location access denied or unavailable.");
            setIsSharing(false);
            updateLiveLocation(user.uid, 0, 0, false);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        setIsSharing(true);
      } else {
        setError("Geolocation is not supported by your browser.");
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsSharing(false);
      setMyLocation(null);
      updateLiveLocation(user.uid, 0, 0, false);
    }
  };

  const centerMapOnMe = () => {
    if (mapRef.current && myLocation) {
      mapRef.current.flyTo([myLocation.lat, myLocation.lng], 15);
    }
  };

  // Auto-center map on user's real location on load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mapRef.current) {
            mapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { animate: true, duration: 1.5 });
          }
        },
        () => {
          // Fallback: Kolkata area
          if (mapRef.current) {
            mapRef.current.flyTo([22.5726, 88.3639], 12, { animate: false });
          }
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full p-6 text-white relative">
      <div className="flex items-center justify-between mb-6 z-10">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#05d9e8] to-[#ff2a6d] flex items-center gap-3">
            <MapPin size={32} color="#05d9e8" />
            Kaha Hai Tu?
          </h1>
          <p className="text-slate-400 mt-1">See where your friends are around campus in real-time.</p>
        </div>
        
        <div className="flex flex-col items-end">
          <label className="flex items-center cursor-pointer gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700 backdrop-blur-sm transition-all hover:bg-gray-800">
            <span className="font-semibold text-sm">Live Location Sharing</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={isSharing} onChange={toggleLocationSharing} />
              <div className={`block w-14 h-8 rounded-full transition-colors ${isSharing ? 'bg-[#05d9e8]' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isSharing ? 'transform translate-x-6' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl relative z-0 min-h-[500px]">
        <MapContainer 
          center={[22.5726, 88.3639]}
          zoom={12} 
          style={{ height: "100%", width: "100%", background: "#1a1a2e" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          
          {myLocation && (
            <Marker position={[myLocation.lat, myLocation.lng]}>
              <Popup className="custom-popup">
                <div className="font-bold text-center">You are here</div>
              </Popup>
            </Marker>
          )}

          {friendsLocations.map((friend) => (
            <Marker 
              key={friend.uid} 
              position={[friend.location.lat, friend.location.lng]}
              icon={FriendIcon}
            >
              <Popup>
                <div className="flex flex-col items-center p-1">
                  {friend.photoUrl ? (
                    <img src={friend.photoUrl} alt={friend.name} className="w-10 h-10 rounded-full border border-[#05d9e8] mb-2 object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mb-2 border border-[#05d9e8]">
                      <User size={20} color="white" />
                    </div>
                  )}
                  <span className="font-bold text-sm whitespace-nowrap">{friend.name}</span>
                  <span className="text-xs text-gray-500">
                    {friend.location.updatedAt && friend.location.updatedAt.toDate ? new Date(friend.location.updatedAt.toDate()).toLocaleTimeString() : 'Recently'}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {myLocation && (
          <button 
            onClick={centerMapOnMe}
            className="absolute bottom-6 right-6 z-[1000] bg-[#05d9e8] text-black p-3 rounded-full shadow-[0_0_15px_rgba(5,217,232,0.5)] hover:scale-110 transition-transform"
            title="Center on me"
          >
            <Navigation size={24} />
          </button>
        )}
      </div>

      <style>{`
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(19, 20, 31, 0.95);
          color: white;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(5,217,232,0.3);
          border-radius: 12px;
        }
        .leaflet-popup-tip {
          background: rgba(19, 20, 31, 0.95);
          border: 1px solid rgba(5,217,232,0.3);
        }
        .map-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      `}</style>
    </div>
  );
};

export default LocationTracking;
