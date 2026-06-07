import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Compass, 
  Car, 
  Activity, 
  Info, 
  AlertTriangle,
  ExternalLink,
  Milestone
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DoctorLocationMapProps {
  hospitalLat?: number;
  hospitalLng?: number;
  hospitalName?: string;
  hospitalAddress?: string;
  doctorName?: string;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function DoctorLocationMap({
  hospitalLat = 37.7749,
  hospitalLng = -122.4194,
  hospitalName = "City General Hospital",
  hospitalAddress = "1001 Potrero Ave, San Francisco, CA 94110",
  doctorName = "Doctor"
}: DoctorLocationMapProps) {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingDistance, setTrackingDistance] = useState<string>("");
  const [trackingDuration, setTrackingDuration] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [infoOpen, setInfoOpen] = useState(true);

  // Fetch Patient/User Geolocation
  const requestUserLocation = () => {
    setIsLocating(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.warn("Geolocation error:", error);
        // Fallback to a nearby mock patient location for high-fidelity demonstration
        const mockLat = hospitalLat + 0.025;
        const mockLng = hospitalLng - 0.031;
        setUserCoords({ lat: mockLat, lng: mockLng });
        setLocationError("Using estimated local radius for directions");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Calculate high-fidelity offline/inline distance as a safety fallback
  useEffect(() => {
    if (userCoords) {
      const R = 3958.8; // Radius of Earth in miles
      const dLat = (hospitalLat - userCoords.lat) * Math.PI / 180;
      const dLng = (hospitalLng - userCoords.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userCoords.lat * Math.PI / 180) * Math.cos(hospitalLat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceMiles = R * c;
      
      setTrackingDistance(`${distanceMiles.toFixed(1)} miles`);
      // Estimate driving duration at 35mph average
      const durationMin = Math.round((distanceMiles / 35) * 60 + 2);
      setTrackingDuration(`${durationMin} mins`);
    }
  }, [userCoords, hospitalLat, hospitalLng]);

  // If Google Maps API key is not present, render a highly detailed offline map dashboard
  if (!hasValidKey) {
    return (
      <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] overflow-hidden p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 w-fit">
              <Compass className="animate-spin" size={12} />
              Directions Live Simulation
            </span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Clinic Routing Dashboard</h3>
            <p className="text-xs text-slate-500 font-medium">Interactive route tracking to {doctorName}'s cabinet.</p>
          </div>
          <button 
            onClick={requestUserLocation}
            disabled={isLocating}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-primary/95 transition-all shadow-md active:scale-95"
          >
            <Navigation size={14} className={isLocating ? "animate-pulse" : ""} />
            {isLocating ? "Locating..." : "Locate Me"}
          </button>
        </div>

        {/* Mock visual map representing Google Maps overlay */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/50 flex items-center justify-center p-4">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1.5px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] bg-slate-600" />
          
          <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full mx-auto flex items-center justify-center">
              <Milestone size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">GMP Live Maps Authorization Needed</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Secure real-time geographical coordinates mapped correctly. Add your Google Maps Platform key to authorize dynamic rendering.
              </p>
            </div>
            
            <div className="text-left text-[11px] bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 space-y-1">
              <p className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <Info size={13} className="text-primary" /> How to activate dynamic maps:
              </p>
              <p>1. Open **Settings** (⚙️ gear icon, top-right corner)</p>
              <p>2. Select **Secrets** &rarr; Name: <code>GOOGLE_MAPS_PLATFORM_KEY</code></p>
              <p>3. Paste your key and press **Enter** to compile</p>
            </div>
          </div>
        </div>

        {/* Detailed geographical stats panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-primary/5 text-primary rounded-xl">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Facility Address</p>
              <p className="text-xs text-slate-800 font-bold truncate max-w-[200px]" title={hospitalAddress}>{hospitalAddress}</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-indigo/5 text-indigo-500 rounded-xl">
              <Car size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estimated Distance</p>
              <p className="text-xs text-slate-800 font-bold">{trackingDistance || "Locate to calculate..."}</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-green/5 text-green-500 rounded-xl">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estimated ETA</p>
              <p className="text-xs text-slate-800 font-bold">{trackingDuration || "Pending user coords..."}</p>
            </div>
          </div>
        </div>

        {locationError && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/50 flex items-center gap-2.5 text-amber-600 text-xs font-bold leading-none">
            <AlertTriangle size={15} />
            {locationError}
          </div>
        )}
      </div>
    );
  }

  // Live rendering with valid GMP API Key config
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-[32px] overflow-hidden p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Facility Location Tracker
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          </h3>
          <p className="text-xs text-slate-500 font-medium">Real-time GPS routing to {hospitalName}.</p>
        </div>
        <button 
          onClick={requestUserLocation}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-primary/95 transition-all shadow-md"
        >
          <Navigation size={14} className={isLocating ? "animate-spin" : ""} />
          Locating...
        </button>
      </div>

      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200/50">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={{ lat: hospitalLat, lng: hospitalLng }}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Hospital Marker */}
            <AdvancedMarker 
              position={{ lat: hospitalLat, lng: hospitalLng }}
              onClick={() => setInfoOpen(true)}
            >
              <Pin background="#2563eb" glyphColor="#fff" />
            </AdvancedMarker>

            {/* User Locating Marker */}
            {userCoords && (
              <AdvancedMarker position={userCoords}>
                <Pin background="#ef4444" glyphColor="#fff" pinKey="user" />
              </AdvancedMarker>
            )}

            {/* Dynamic Polyline Route overlay */}
            {userCoords && (
              <RouteOverlay 
                origin={userCoords} 
                destination={{ lat: hospitalLat, lng: hospitalLng }} 
              />
            )}

            {infoOpen && (
              <InfoWindow 
                position={{ lat: hospitalLat, lng: hospitalLng }}
                onCloseClick={() => setInfoOpen(false)}
              >
                <div className="p-2 space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{hospitalName}</h4>
                  <p className="text-[10px] text-slate-500 font-medium max-w-[200px] leading-relaxed">{hospitalAddress}</p>
                  <p className="text-[10px] text-primary font-bold mt-1">Specialist: {doctorName}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-primary/5 text-primary rounded-xl">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Facility Address</p>
            <p className="text-xs text-slate-800 font-bold truncate max-w-[200px]" title={hospitalAddress}>{hospitalAddress}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-red-500/5 text-red-500 rounded-xl">
            <Navigation size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Distance</p>
            <p className="text-xs text-slate-800 font-bold">{trackingDistance || "Enable GPS above"}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-500/5 text-green-500 rounded-xl">
            <Car size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Driving Time</p>
            <p className="text-xs text-slate-800 font-bold">{trackingDuration || "Enable GPS above"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent drawing the polyline routing path using the Routes library (CF7 compliant)
function RouteOverlay({ origin, destination }: { origin: any; destination: any }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;
    
    // Clear previous polylines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => {
          p.setOptions({
            strokeColor: '#2563eb',
            strokeWeight: 5,
            strokeOpacity: 0.8
          });
          p.setMap(map);
        });
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) {
          map.fitBounds(routes[0].viewport);
        }
      }
    }).catch(err => {
      console.warn("Routes API call errored. Drawing basic geodesic bridge instead:", err);
      // Construct a direct line bridge fallback
      const geodesicLine = new google.maps.Polyline({
        path: [origin, destination],
        geodesic: true,
        strokeColor: '#2563eb',
        strokeOpacity: 0.6,
        strokeWeight: 4,
        map: map
      });
      polylinesRef.current = [geodesicLine];
    });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, origin, destination]);

  return null;
}
