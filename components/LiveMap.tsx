import React, { useEffect, useState, useRef } from 'react';
import { RouteStop, City } from '../types';
import { getDriverAdvisory, generateSpeech } from '../services/geminiService';
import L from 'leaflet';
import { 
  Radio, 
  Activity, 
  Locate,
  User, Truck,
  CloudRain, CloudLightning, Sun, QrCode, X, Mic,
  Camera, Video, Satellite,
  Smartphone, ChevronDown, ChevronUp,
  Volume2, RefreshCcw, Layers, MousePointer2, Eraser, CircleDot, AlertTriangle, RotateCcw,
  CheckCircle2, MapPin, Navigation, Info, AlertOctagon, Maximize2
} from 'lucide-react';

interface LiveMapProps {
  routePlan: RouteStop[];
  cities: City[];
}

interface TelemetryEvent {
  id: number;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  message: string;
  timestamp: string;
}

// PCM Audio Decoding Utilities
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const MAP_LAYERS = {
  STREETS: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
  SATELLITE: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};

const LiveMap: React.FC<LiveMapProps> = ({ routePlan: initialRoute, cities }) => {
  const isDriverApp = new URLSearchParams(window.location.search).get('mode') === 'driver';

  // Mission State
  const [missionRoute, setMissionRoute] = useState<RouteStop[]>(initialRoute);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isMissionStarted, setIsMissionStarted] = useState(false);

  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [realLocation, setRealLocation] = useState<{lat: number, lng: number, heading: number | null, speed: number | null} | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  // Map customization state
  const [activeLayer, setActiveLayer] = useState<keyof typeof MAP_LAYERS>(isDriverApp ? 'DARK' : 'STREETS');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [customPath, setCustomPath] = useState<L.LatLng[]>([]);

  // AI States
  const [isTalkingToAi, setIsTalkingToAi] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  const [mobileViewMode, setMobileViewMode] = useState<'map' | 'cam'>('map');
  const [isDriverInfoExpanded, setIsDriverInfoExpanded] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<'Clear' | 'Rain' | 'Storm' | 'Snow' | 'Fog'>('Clear');

  const prevLocationRef = useRef<{lat: number, lng: number} | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const customMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  const driverDetails = {
    name: "Vikram Singh",
    id: "DRV-8821",
    license: "KA-01-2022-009841",
    rating: 4.9,
    trips: 1243,
    vehicleModel: "Tata Prima 5530.S",
    vehiclePlate: "KA 01 AH 9988"
  };

  // Sync with localStorage or provide Demo fallback for mobile
  useEffect(() => {
    if (missionRoute.length === 0) {
      const savedJob = localStorage.getItem('neuroload_active_job');
      if (savedJob) {
        setMissionRoute(JSON.parse(savedJob).routePlan);
      } else {
        // Fallback demo mission for mobile testing
        setMissionRoute([
          { city: "Bangalore Hub", eta: "08:00", activity: "Load Cargo" },
          { city: "Chennai Port", eta: "13:30", activity: "Unload Express P102" },
          { city: "Hyderabad DC", eta: "21:00", activity: "Final Delivery" }
        ]);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playAiAudio = async (base64Data: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const audioBytes = decode(base64Data);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      setIsAiSpeaking(true);
      source.onended = () => setIsAiSpeaking(false);
      source.start(0);
    } catch (err) {
      console.error("Audio error:", err);
      setIsAiSpeaking(false);
    }
  };

  const handleBriefing = async () => {
    if (missionRoute.length === 0) return;
    setIsTalkingToAi(true);
    const stopNames = missionRoute.map(s => s.city).join(', then ');
    const advice = await getDriverAdvisory(realLocation?.lat || 0, realLocation?.lng || 0, 0, 0, `Brief me on the route: ${stopNames}`);
    const audio = await generateSpeech(advice);
    if (audio) await playAiAudio(audio);
    setIsTalkingToAi(false);
    setIsMissionStarted(true);
  };

  const handleAskCopilot = async () => {
    if (!realLocation) return;
    setIsTalkingToAi(true);
    try {
      const nextStop = missionRoute[currentStopIndex];
      const context = `Driver is at ${realLocation.lat}, ${realLocation.lng}. Heading to ${nextStop?.city}. Speed ${realLocation.speed} KPH.`;
      const advice = await getDriverAdvisory(realLocation.lat, realLocation.lng, realLocation.speed || 0, realLocation.heading || 0, context);
      const audioData = await generateSpeech(advice);
      if (audioData) await playAiAudio(audioData);
    } finally {
      setIsTalkingToAi(false);
    }
  };

  const handleArrival = async () => {
    const currentStop = missionRoute[currentStopIndex];
    setEvents(prev => [{ id: Date.now(), type: 'SUCCESS', message: `ARRIVED: ${currentStop.city}`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
    const speech = await generateSpeech(`Arrived at ${currentStop.city}. Proceed with ${currentStop.activity}. Systems scanning for dock availability.`);
    if (speech) await playAiAudio(speech);
    if (currentStopIndex < missionRoute.length - 1) setCurrentStopIndex(prev => prev + 1);
  };

  const clearCustomPath = () => {
    setCustomPath([]);
    if (customMarkersLayerRef.current) customMarkersLayerRef.current.clearLayers();
  };

  // Mobile Hardware: Back Camera (Dashcam)
  useEffect(() => {
    if (isDriverApp && mobileViewMode === 'cam') {
      const initCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
          });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          setGpsError("Camera access required for Dashcam mode.");
        }
      };
      initCamera();
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [mobileViewMode, isDriverApp]);

  // Mobile Hardware: GPS Tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed, heading } = pos.coords;
        const kph = speed ? Math.round(speed * 3.6) : 0;
        setRealLocation({ lat, lng, heading: heading || 0, speed: kph });
        setGpsError(null);
        if (mapInstanceRef.current && truckMarkerRef.current) {
          const newPos = new L.LatLng(lat, lng);
          truckMarkerRef.current.setLatLng(newPos);
          if (isDriverApp && mobileViewMode === 'map') mapInstanceRef.current.setView(newPos, 16);
        }
      },
      (err) => setGpsError(`GPS Error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isDriverApp, mobileViewMode]);

  // Map Setup
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([12.9716, 77.5946], 13);
    tileLayerRef.current = L.tileLayer(MAP_LAYERS[activeLayer]).addTo(map);
    
    const truckIcon = L.divIcon({
      className: 'custom-truck-icon',
      html: `<div id="truck-arrow"><svg width="40" height="40" viewBox="0 0 24 24" fill="#4f46e5" stroke="white" stroke-width="2"><path d="M12 2L2 22L12 18L22 22L12 2Z"/></svg></div>`,
      iconSize: [40, 40], iconAnchor: [20, 20]
    });
    truckMarkerRef.current = L.marker([12.9716, 77.5946], { icon: truckIcon }).addTo(map);
    mapInstanceRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);
    customMarkersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e) => {
      if (isDrawingMode) {
        setCustomPath(prev => [...prev, e.latlng]);
        L.circleMarker(e.latlng, { radius: 6, color: '#4f46e5', fillOpacity: 0.8 }).addTo(customMarkersLayerRef.current!);
      }
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [isDrawingMode]);

  // Heading arrow rotation
  useEffect(() => {
    const arrow = document.getElementById('truck-arrow');
    if (arrow && realLocation?.heading !== null) {
      arrow.style.transform = `rotate(${realLocation?.heading}deg)`;
    }
  }, [realLocation]);

  if (isDriverApp) {
    const nextStop = missionRoute[currentStopIndex];
    return (
      <div className="fixed inset-0 bg-slate-950 text-white font-sans overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-lg border-b border-white/10 flex justify-between items-center z-50">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">NeuroLoad Link</h1>
                <p className="text-sm font-black text-white">{driverDetails.vehiclePlate}</p>
              </div>
           </div>
           <button 
             onClick={() => setMobileViewMode(prev => prev === 'map' ? 'cam' : 'map')}
             className={`p-3 rounded-2xl transition-all ${mobileViewMode === 'cam' ? 'bg-red-600' : 'bg-slate-800'}`}
           >
             {mobileViewMode === 'cam' ? <Video className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative">
           {/* Map View */}
           <div className={`absolute inset-0 transition-all duration-500 ${mobileViewMode === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div ref={mapContainerRef} className="w-full h-full grayscale-[0.3] invert-[0.1]" />
           </div>

           {/* Dashcam View */}
           <div className={`absolute inset-0 bg-black transition-all duration-500 ${mobileViewMode === 'cam' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 <div className="bg-red-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-2 animate-pulse">
                   <CircleDot className="w-3 h-3" /> REC ACTIVE
                 </div>
                 <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono">
                    SENSORS: {realLocation?.speed || 0} KPH | ALT: 24m
                 </div>
              </div>
           </div>

           {/* Next Stop HUD */}
           {missionRoute.length > 0 && (
              <div className="absolute top-6 left-4 right-4 z-[60]">
                 {!isMissionStarted ? (
                    <button 
                      onClick={handleBriefing}
                      className="w-full bg-indigo-600 p-5 rounded-3xl shadow-2xl flex items-center justify-between animate-in slide-in-from-top duration-500"
                    >
                      <div className="text-left">
                         <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-tighter">Mission Ready</p>
                         <h2 className="text-lg font-bold">Launch Tactical Briefing</h2>
                      </div>
                      <Navigation className="w-8 h-8" />
                    </button>
                 ) : (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top">
                       <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                          <MapPin className="w-6 h-6" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">Target Stop</p>
                          <h2 className="text-lg font-bold truncate">{nextStop?.city}</h2>
                          <p className="text-xs text-slate-400 truncate">{nextStop?.activity}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xl font-black text-indigo-300 font-mono">{nextStop?.eta}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">ETA</p>
                       </div>
                    </div>
                 )}
              </div>
           )}

           {/* Telemetry Footer */}
           <div className="absolute bottom-6 left-4 right-4 flex justify-between items-end z-[60]">
              <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-5 rounded-[40px] shadow-2xl flex flex-col items-center min-w-[120px]">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Velocity</p>
                 <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black font-mono tracking-tighter">{realLocation?.speed || 0}</span>
                    <span className="text-xs text-slate-500 font-bold">KPH</span>
                 </div>
              </div>

              <div className="flex flex-col gap-4">
                 {isMissionStarted && (
                    <button 
                      onClick={handleArrival}
                      className="bg-emerald-600 active:scale-95 text-white py-4 px-6 rounded-3xl shadow-2xl font-bold flex items-center gap-3 border-b-4 border-emerald-800 transition-all"
                    >
                      <CheckCircle2 className="w-6 h-6" /> LOG ARRIVAL
                    </button>
                 )}
                 <button 
                   onClick={handleAskCopilot}
                   className={`p-8 rounded-full shadow-2xl transition-all ${isTalkingToAi ? 'bg-indigo-700 animate-pulse' : 'bg-indigo-600 active:scale-90 shadow-indigo-500/50'}`}
                 >
                   {isAiSpeaking ? <Volume2 className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
                 </button>
              </div>
           </div>

           {/* Hardware Error Overlay */}
           {gpsError && (
             <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-red-600 p-6 rounded-3xl shadow-2xl z-[100] border border-red-500 flex flex-col items-center text-center gap-4">
                <AlertTriangle className="w-12 h-12" />
                <div>
                   <h3 className="text-xl font-black">HARDWARE FAULT</h3>
                   <p className="text-sm opacity-80 mt-1">{gpsError}</p>
                   <p className="text-xs mt-4 font-bold bg-black/20 p-2 rounded">Ensure Location and Camera permissions are enabled in Browser Settings.</p>
                </div>
                <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold">RESET LINK</button>
             </div>
           )}
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-50">
      <div className="absolute inset-0 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl text-xs shadow-2xl pointer-events-auto w-72">
           <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold border-b border-slate-100 pb-2">
             <Radio className={`w-4 h-4 ${realLocation ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
             REAL-TIME TELEMETRY <span className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full text-indigo-600 ml-auto uppercase font-bold">Active</span>
           </div>
           <div className="space-y-2 text-slate-500 font-mono text-[10px]">
             <div className="flex justify-between"><span>LATITUDE:</span> <span className="text-slate-800 font-bold">{realLocation?.lat.toFixed(6) || '---'}</span></div>
             <div className="flex justify-between"><span>LONGITUDE:</span> <span className="text-slate-800 font-bold">{realLocation?.lng.toFixed(6) || '---'}</span></div>
             <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2 font-sans font-bold">
               <span className="text-slate-400">ATMOSPHERE:</span> 
               <span className="uppercase text-indigo-600 flex items-center gap-2 bg-indigo-50 px-2 py-1 rounded-md">
                 <Sun className="w-3 h-3 text-amber-500"/> CLEAR
               </span>
             </div>
           </div>
        </div>

        <div className="flex flex-col gap-2 pointer-events-auto">
          <button onClick={() => setShowShareModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold transition-all transform hover:scale-105 active:scale-95">
             <QrCode className="w-5 h-5" /> CONNECT MOBILE DEVICE
          </button>
          
          <div className="flex flex-col gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-xl">
            <button 
              onClick={() => setIsDrawingMode(!isDrawingMode)} 
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${isDrawingMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}
              title="Draw Custom Path"
            >
              <MousePointer2 className="w-5 h-5" />
            </button>
            {customPath.length > 0 && (
              <button 
                onClick={clearCustomPath} 
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Clear Path"
              >
                <Eraser className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="absolute inset-0 z-[1000] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] p-10 max-w-sm w-full relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowShareModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              <div className="text-center">
                 <div className="w-20 h-20 bg-indigo-100 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-indigo-600">
                    <Smartphone className="w-10 h-10" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Tactical Vehicle Link</h3>
                 <p className="text-sm text-slate-500 mb-8 leading-relaxed">Scan to turn your mobile device into a real-time vehicle HUD with GPS tracking and AI Dashcam.</p>
                 <div className="bg-slate-100 p-6 rounded-[40px] inline-block mb-8 border border-slate-200 ring-4 ring-indigo-50">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href + '?mode=driver')}`} alt="QR" className="w-48 h-48 mix-blend-multiply" />
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left overflow-hidden">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Target URL</p>
                    <code className="text-[10px] text-indigo-600 font-bold break-all block truncate">{window.location.href}?mode=driver</code>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;