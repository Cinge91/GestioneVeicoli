// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import {
  Car,
  Bike,
  Calendar,
  Wrench,
  Plus,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  Bell,
  FileText,
  Camera,
  Image as ImageIcon,
  Menu,
  X,
  Download,
  Upload,
  Settings,
  Database,
  Trash2,
  ChevronLeft,
  CheckCircle,
  CalendarCheck,
  Pencil,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

const initialVehicles = [];

const defaultPreferences = {
  notificationsEnabled: true,
  deadlines: {
    insurance: { days: 30, color: "orange" },
    tax: { days: 30, color: "blue" },
    inspection: { days: 30, color: "purple" },
    service: { days: 30, color: "emerald" },
  },
  notificationTime: "09:00",
  disabledVehicles: [],
  autoBackup: { enabled: true, frequency: "daily" },
};

const colorOptions = {
  orange: {
    bg: "bg-orange-500",
    text: "text-orange-600",
    lightBg: "bg-orange-50",
  },
  blue: { bg: "bg-blue-500", text: "text-blue-600", lightBg: "bg-blue-50" },
  purple: {
    bg: "bg-purple-500",
    text: "text-purple-600",
    lightBg: "bg-purple-50",
  },
  emerald: {
    bg: "bg-emerald-500",
    text: "text-emerald-600",
    lightBg: "bg-emerald-50",
  },
};

const getDaysUntil = (dateString) => {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateString) => {
  if (!dateString) return "Non impostata";
  return new Date(dateString).toLocaleDateString("it-IT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (isoString) => {
  return new Date(isoString).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const deadlineLabels = {
  insurance: "Assicurazione",
  tax: "Bollo",
  inspection: "Revisione",
  service: "Tagliando",
};

// --- COMPONENTE: RITAGLIO FOTO (Migliorato per gestire fotocamera) ---
const ImageCropper = ({ imageSrc, onCropDone, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef(null);

  const CROP_SIZE = 280;

  const onImgLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const minScale = Math.max(
      CROP_SIZE / naturalWidth,
      CROP_SIZE / naturalHeight
    );
    setImgSize({ w: naturalWidth * minScale, h: naturalHeight * minScale });
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.target.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e) => {
    if (isDragging)
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const handleCrop = () => {
    const canvas = document.createElement("canvas");
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.translate(CROP_SIZE / 2, CROP_SIZE / 2);
    ctx.translate(position.x, position.y);
    ctx.scale(zoom, zoom);
    ctx.drawImage(
      imgRef.current,
      -imgSize.w / 2,
      -imgSize.h / 2,
      imgSize.w,
      imgSize.h
    );
    onCropDone(canvas.toDataURL("image/jpeg", 0.85));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[150] flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="text-white text-center mb-8 px-6">
        <h3 className="font-bold text-2xl mb-2">Adatta la foto</h3>
        <p className="text-base text-slate-300">
          Trascina per centrare e usa la barra in basso.
        </p>
      </div>
      <div
        className="relative bg-slate-800 overflow-hidden rounded-full shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] ring-4 ring-white/30"
        style={{ width: CROP_SIZE, height: CROP_SIZE, touchAction: "none" }}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          draggable={false}
          onLoad={onImgLoad}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          alt="Ritaglio"
          className="max-w-none select-none touch-none"
          style={{
            position: "absolute",
            width: imgSize.w || "auto",
            height: imgSize.h || "auto",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
            transformOrigin: "center",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        />
      </div>
      <div className="w-full max-w-sm px-8 mt-12 flex items-center gap-4 text-white">
        <ImageIcon className="w-6 h-6 text-slate-400 shrink-0" />
        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="flex-1 accent-white h-2 bg-slate-600 rounded-lg appearance-none outline-none shadow-inner"
        />
        <ImageIcon className="w-10 h-10 shrink-0 text-white" />
      </div>
      <div className="flex gap-5 mt-16 w-full max-w-sm px-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.7)] ring-2 ring-white active:scale-105 transition-all"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={handleCrop}
          className="flex-1 py-4 bg-cyan-400 text-slate-900 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[0_0_25px_rgba(34,211,238,0.9)] ring-2 ring-cyan-300 active:scale-105 transition-all"
        >
          Conferma
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE: SELETTORE FOTO (Nuovo: Galleria o Fotocamera) ---
const PhotoSourceSelector = ({ onImageSelected, onCancel }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (e, isCamera = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected(reader.result);
    };
    reader.readAsDataURL(file);
    // Reset file inputs to allow selecting the same file again
    e.target.value = null;
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[140] flex items-end justify-center p-4 animate-in fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-t-3xl rounded-b-xl w-full max-w-md p-6 animate-in slide-in-from-bottom-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Aggiungi Foto
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => cameraInputRef.current.click()}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 active:bg-slate-100 transition-colors"
          >
            <Camera className="w-10 h-10 text-slate-500" />
            <span className="font-bold text-sm text-slate-700">
              Scatta Foto
            </span>
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 active:bg-slate-100 transition-colors"
          >
            <ImageIcon className="w-10 h-10 text-slate-500" />
            <span className="font-bold text-sm text-slate-700">
              Dalla Galleria
            </span>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold active:bg-gray-200"
        >
          Annulla
        </button>

        {/* Hidden inputs */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={(e) => handleFileChange(e, true)}
          className="hidden"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e, false)}
          className="hidden"
        />
      </div>
    </div>
  );
};

const HomeView = ({
  vehicles,
  setCurrentView,
  setSelectedVehicle,
  setIsMenuOpen,
  preferences,
  onDeadlineClick,
}) => {
  const getGroupedDeadlines = () => {
    let grouped = [];
    if (!preferences.notificationsEnabled) return grouped;
    vehicles.forEach((v) => {
      if (preferences.disabledVehicles?.includes(v.id)) return;
      let vDeadlines = [];
      Object.entries(v.deadlines).forEach(([type, date]) => {
        const days = getDaysUntil(date);
        const pref =
          preferences.deadlines[type] || defaultPreferences.deadlines[type];
        if (days !== null && days <= pref.days)
          vDeadlines.push({ type, date, days, color: pref.color });
      });
      if (vDeadlines.length > 0) {
        vDeadlines.sort((a, b) => a.days - b.days);
        grouped.push({ vehicle: v, deadlines: vDeadlines });
      }
    });
    return grouped;
  };

  const upcomingGrouped = getGroupedDeadlines();
  const cars = vehicles.filter((v) => v.type === "car");
  const motos = vehicles.filter((v) => v.type === "motorcycle");

  return (
    <div className="pb-28 animate-in fade-in slide-in-from-bottom-4 duration-300 min-h-screen">
      <header className="pt-12 pb-6 px-6 bg-white sticky top-0 z-10 border-b border-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="w-7 h-7" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Il mio Garage
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {vehicles.length === 0
                ? "Nessun veicolo"
                : `${vehicles.length} mezzi`}
            </p>
          </div>
        </div>
        <div className="relative p-2 -mr-2">
          {preferences.notificationsEnabled ? (
            <Bell className="text-gray-400 w-7 h-7" />
          ) : (
            <Bell className="text-gray-300 w-7 h-7 opacity-50" />
          )}
          {upcomingGrouped.length > 0 && preferences.notificationsEnabled && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </div>
      </header>

      <main className="px-6 space-y-8 mt-8">
        {vehicles.length === 0 && (
          <div className="text-center py-16 animate-in zoom-in-95 duration-500 delay-150">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Car className="w-10 h-10 text-gray-300 absolute -ml-4 -mt-4" />
              <Bike className="w-8 h-8 text-gray-400 absolute ml-6 mt-4" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Garage vuoto
            </h2>
            <p className="text-gray-500 text-base max-w-[250px] mx-auto leading-relaxed">
              Aggiungi i tuoi veicoli per gestire bollo, assicurazione e
              manutenzione.
            </p>
          </div>
        )}

        {upcomingGrouped.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> In Scadenza
            </h2>
            <div className="space-y-4">
              {upcomingGrouped.map((group, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.06)] border border-gray-100"
                >
                  <h3
                    className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-50 flex items-center gap-3 text-lg cursor-pointer"
                    onClick={() => {
                      setSelectedVehicle(group.vehicle);
                      setCurrentView("vehicle");
                    }}
                  >
                    {group.vehicle.image ? (
                      <img
                        src={group.vehicle.image}
                        alt={group.vehicle.model}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100"
                      />
                    ) : group.vehicle.type === "car" ? (
                      <Car className="w-6 h-6 text-gray-400 shrink-0" />
                    ) : (
                      <Bike className="w-6 h-6 text-gray-400 shrink-0" />
                    )}
                    {group.vehicle.make} {group.vehicle.model}
                    <span className="ml-auto text-sm font-mono font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg">
                      {group.vehicle.licensePlate}
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {group.deadlines.map((item, i) => {
                      const themeColors =
                        colorOptions[item.color] || colorOptions.orange;
                      const isExpired = item.days < 0;
                      return (
                        <div
                          key={i}
                          onClick={() =>
                            onDeadlineClick(group.vehicle, item.type)
                          }
                          className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer active:scale-95 transition-all ${themeColors.lightBg}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
                            <Calendar
                              className={`w-5 h-5 ${themeColors.text}`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p
                                className={`font-bold text-base ${themeColors.text}`}
                              >
                                {deadlineLabels[item.type]}
                              </p>
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
                                  isExpired
                                    ? "bg-red-100 text-red-700"
                                    : "bg-red-50 text-red-500"
                                }`}
                              >
                                {isExpired ? "Scaduto" : `-${item.days} gg`}
                              </span>
                            </div>
                            <p
                              className={`text-sm mt-0.5 opacity-80 font-medium ${themeColors.text}`}
                            >
                              {formatDate(item.date)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(cars.length > 0 || motos.length > 0) && (
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">
            I Miei Veicoli
          </h2>
        )}

        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => {
                setSelectedVehicle(vehicle);
                setCurrentView("vehicle");
              }}
              className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-5"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 overflow-hidden shrink-0 border border-gray-100">
                {vehicle.image ? (
                  <img
                    src={vehicle.image}
                    alt={vehicle.model}
                    className="w-full h-full object-cover"
                  />
                ) : vehicle.type === "car" ? (
                  <Car className="w-7 h-7" />
                ) : (
                  <Bike className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-xl leading-tight">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-gray-500 text-sm font-medium mt-1 uppercase font-mono">
                  {vehicle.licensePlate || "Senza Targa"} • {vehicle.year}
                </p>
              </div>
              <ChevronRight className="text-gray-300 w-6 h-6 shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </main>

      <button
        onClick={() => setCurrentView("add-vehicle")}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-gray-900/30 active:scale-95 transition-transform z-20"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

const VehicleDetailView = ({
  selectedVehicle,
  setCurrentView,
  preferences,
  onDeadlineClick,
  setSelectedMaintenance,
}) => {
  const [activeTab, setActiveTab] = useState("deadlines");
  const [docSubTab, setDocSubTab] = useState("bolli");
  const [expandedTagliando, setExpandedTagliando] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const v = selectedVehicle;
  if (!v) return null;

  const docsByYear = (v.documents || []).reduce((acc, doc) => {
    const year = doc.date ? doc.date.substring(0, 4) : "Vari";
    if (!acc[year]) acc[year] = [];
    acc[year].push(doc);
    return acc;
  }, {});
  const sortedYears = Object.keys(docsByYear).sort((a, b) => b - a);
  const maintenanceWithPhotos = (v.maintenance || []).filter((m) =>
    m.parts?.some((p) => p.image)
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 animate-in slide-in-from-right-4 duration-300">
      {fullScreenImage && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[110] flex flex-col items-center justify-center animate-in fade-in duration-200">
          <button
            onClick={() => setFullScreenImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white active:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fullScreenImage}
            alt="Ingrandimento"
            className="max-w-[90%] max-h-[70vh] object-contain rounded-2xl shadow-2xl"
          />
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = fullScreenImage;
              link.download = "foto_garage.jpg";
              link.click();
            }}
            className="mt-8 py-4 px-8 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(59,130,246,0.6)] active:scale-95 transition-all flex items-center gap-3"
          >
            <Download className="w-5 h-5" /> Scarica Foto
          </button>
        </div>
      )}

      <header className="pt-12 pb-6 px-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentView("home")}
            className="flex items-center text-gray-500 active:opacity-50 text-base font-medium"
          >
            <ArrowLeft className="w-6 h-6 mr-2" /> Indietro
          </button>
          <button
            onClick={() => setCurrentView("edit-vehicle")}
            className="p-2.5 bg-gray-100 text-gray-600 rounded-full active:bg-gray-200 transition-colors shadow-sm"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 overflow-hidden shrink-0 border border-gray-200">
            {v.image ? (
              <img
                src={v.image}
                alt={v.model}
                className="w-full h-full object-cover"
              />
            ) : v.type === "car" ? (
              <Car className="w-8 h-8" />
            ) : (
              <Bike className="w-8 h-8" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {v.make} {v.model}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="inline-block px-3 py-1 bg-gray-100 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-mono font-bold uppercase tracking-widest">
                  {v.licensePlate || "Nessuna Targa"}
                </p>
              </div>
              <span className="text-gray-500 text-sm font-medium">
                {v.year}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex px-6 bg-white border-b border-gray-200">
        {["deadlines", "maintenance", "documents"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? "text-gray-900 border-b-4 border-gray-900"
                : "text-gray-400"
            }`}
          >
            {tab === "deadlines"
              ? "Scadenze"
              : tab === "maintenance"
              ? "Manutenzione"
              : "Documenti"}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === "deadlines" && (
          <div className="space-y-5 pb-24">
            {Object.keys(deadlineLabels).map((type) => {
              const date = v.deadlines[type];
              const days = getDaysUntil(date);
              const pref =
                preferences.deadlines[type] ||
                defaultPreferences.deadlines[type];
              const isWarning = days !== null && days <= pref.days;
              const isExpired = days !== null && days < 0;
              const themeColors =
                colorOptions[pref.color] || colorOptions.orange;
              return (
                <div
                  key={type}
                  onClick={
                    isWarning ? () => onDeadlineClick(v, type) : undefined
                  }
                  className={`p-6 rounded-[32px] flex items-center justify-between transition-all ${
                    isWarning
                      ? "cursor-pointer active:scale-95"
                      : "cursor-default opacity-80"
                  } ${themeColors.lightBg} shadow-sm`}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-white ${themeColors.text} shadow-sm`}
                    >
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p
                        className={`font-bold text-xl leading-tight ${
                          isExpired ? "text-red-700" : themeColors.text
                        }`}
                      >
                        {deadlineLabels[type]}
                      </p>
                      <p
                        className={`text-base font-medium mt-1 ${
                          isExpired ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {formatDate(date)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-right ${
                      isExpired
                        ? "text-red-600"
                        : isWarning
                        ? "text-red-500"
                        : themeColors.text
                    } font-bold`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1">
                      {days === null ? "Stato" : "Tra"}
                    </p>
                    <p
                      className={
                        days === null ? "text-base" : "text-3xl leading-none"
                      }
                    >
                      {days === null ? (
                        "Vuoto"
                      ) : (
                        <>
                          {days}{" "}
                          <span className="text-base font-normal">gg</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="space-y-6 pb-24">
            {!v.maintenance || v.maintenance.length === 0 ? (
              <div className="text-center py-16">
                <Wrench className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Nessun intervento registrato.
                </p>
              </div>
            ) : (
              <>
                {(() => {
                  const expensesByYear = v.maintenance.reduce((acc, r) => {
                    if (!r.date) return acc;
                    const y = r.date.substring(0, 4);
                    acc[y] = (acc[y] || 0) + (Number(r.cost) || 0);
                    return acc;
                  }, {});
                  const sortedYears = Object.keys(expensesByYear).sort(
                    (a, b) => b - a
                  );
                  const total = Object.values(expensesByYear).reduce(
                    (a, b) => a + b,
                    0
                  );
                  if (total === 0) return null;
                  return (
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Riepilogo Spese
                      </h3>
                      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x">
                        <div className="bg-gray-900 text-white rounded-3xl p-5 min-w-[140px] flex-shrink-0 snap-start shadow-md">
                          <p className="text-gray-400 text-xs uppercase mb-2 font-bold tracking-wider">
                            Totale
                          </p>
                          <p className="text-3xl font-black">
                            €{total.toLocaleString("it-IT")}
                          </p>
                        </div>
                        {sortedYears.map((y) => (
                          <div
                            key={y}
                            className="bg-white border border-gray-100 rounded-3xl p-5 min-w-[120px] flex-shrink-0 snap-start shadow-sm"
                          >
                            <p className="text-gray-400 text-xs uppercase mb-2 font-bold tracking-wider">
                              {y}
                            </p>
                            <p className="text-2xl font-bold">
                              €{expensesByYear[y].toLocaleString("it-IT")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Cronologia
                  </h3>
                  <div className="space-y-5">
                    {v.maintenance
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((record) => (
                        <div
                          key={record.id}
                          onClick={() => {
                            setSelectedMaintenance(record);
                            setCurrentView("edit-maintenance");
                          }}
                          className="bg-white p-6 rounded-3xl shadow-sm relative active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-md"
                        >
                          <div className="absolute top-5 right-5 text-gray-300">
                            <Pencil className="w-5 h-5" />
                          </div>
                          <div className="flex justify-between items-start mb-4 pr-8">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                              <Calendar className="w-5 h-5" />{" "}
                              {formatDate(record.date)}
                            </div>
                            <div className="font-black text-xl text-gray-900">
                              €{record.cost}
                            </div>
                          </div>
                          <p className="font-bold text-gray-900 text-lg mb-3 leading-tight">
                            {record.description}
                          </p>
                          {record.parts && record.parts.length > 0 && (
                            <div className="bg-slate-50 rounded-2xl p-4 mb-4 space-y-2 border border-slate-100">
                              {record.parts.map((part) => (
                                <div
                                  key={part.id}
                                  className="flex justify-between items-center text-sm gap-4"
                                >
                                  <span className="text-slate-600 font-medium truncate flex-1">
                                    {part.name}
                                  </span>
                                  <span className="font-bold text-slate-900 shrink-0">
                                    €{part.cost}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="inline-block px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                            {record.km.toLocaleString("it-IT")} km
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6 pb-24">
            <div className="flex bg-slate-200 p-1.5 rounded-2xl mb-6 shadow-inner">
              <button
                onClick={() => setDocSubTab("bolli")}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  docSubTab === "bolli"
                    ? "bg-white shadow-md text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Bolli
              </button>
              <button
                onClick={() => setDocSubTab("tagliandi")}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  docSubTab === "tagliandi"
                    ? "bg-white shadow-md text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Ricambi
              </button>
            </div>

            {docSubTab === "bolli" && (
              <div className="space-y-8 animate-in fade-in">
                {!v.documents || v.documents.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Nessun bollo salvato.
                    </p>
                  </div>
                ) : (
                  sortedYears.map((year) => (
                    <div key={year}>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">
                        {year}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {docsByYear[year].map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100"
                          >
                            <div
                              className="h-36 bg-gray-100 relative group cursor-pointer active:opacity-70 transition-opacity"
                              onClick={() => setFullScreenImage(doc.url)}
                            >
                              <img
                                src={doc.url}
                                alt={doc.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <p className="font-bold text-gray-900 text-sm truncate">
                                {doc.title}
                              </p>
                              <p className="text-xs font-medium text-gray-500 mt-1">
                                {formatDate(doc.date)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {docSubTab === "tagliandi" && (
              <div className="space-y-4 animate-in fade-in">
                {maintenanceWithPhotos.length === 0 ? (
                  <div className="text-center py-16">
                    <Wrench className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Nessun ricambio con foto allegata.
                    </p>
                  </div>
                ) : (
                  maintenanceWithPhotos
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((record) => {
                      const isExpanded = expandedTagliando === record.id;
                      return (
                        <div
                          key={record.id}
                          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all"
                        >
                          <div
                            onClick={() =>
                              setExpandedTagliando(
                                isExpanded ? null : record.id
                              )
                            }
                            className="p-5 flex justify-between items-center cursor-pointer active:bg-gray-50"
                          >
                            <div>
                              <p className="font-bold text-gray-900 text-lg leading-tight">
                                {record.description}
                              </p>
                              <p className="text-sm font-medium text-gray-500 mt-1">
                                {formatDate(record.date)} • {record.km} km
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-black text-gray-900 text-lg">
                                €{record.cost}
                              </span>
                              <ChevronDown
                                className={`w-6 h-6 text-gray-400 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="p-5 border-t border-gray-100 bg-slate-50 space-y-4 animate-in slide-in-from-top-2">
                              {record.parts
                                .filter((p) => p.image)
                                .map((part) => (
                                  <div
                                    key={part.id}
                                    className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-200 shadow-sm gap-4"
                                  >
                                    <div className="flex items-center gap-4 min-w-0">
                                      <div
                                        className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 cursor-pointer active:opacity-70 transition-opacity"
                                        onClick={() =>
                                          setFullScreenImage(part.image)
                                        }
                                      >
                                        <img
                                          src={part.image}
                                          className="w-full h-full object-cover"
                                          alt={part.name}
                                        />
                                      </div>
                                      <span className="font-bold text-gray-800 text-base truncate flex-1">
                                        {part.name}
                                      </span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg shrink-0">
                                      €{part.cost}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {activeTab !== "deadlines" && (
        <button
          onClick={() =>
            setCurrentView(
              activeTab === "maintenance" ? "add-maintenance" : "add-document"
            )
          }
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform z-20"
        >
          {activeTab === "maintenance" ? (
            <Plus className="w-8 h-8" />
          ) : (
            <Camera className="w-8 h-8" />
          )}
        </button>
      )}
    </div>
  );
};

// --- FORM: MANUTENZIONE (Migliorato per Fotocamera) ---
const MaintenanceFormView = ({
  setCurrentView,
  vehicles,
  setVehicles,
  selectedVehicle,
  setSelectedVehicle,
  isEditMode,
  selectedMaintenance,
}) => {
  const [desc, setDesc] = useState(
    isEditMode && selectedMaintenance ? selectedMaintenance.description : ""
  );
  const [km, setKm] = useState(
    isEditMode && selectedMaintenance ? selectedMaintenance.km : ""
  );
  const [cost, setCost] = useState(
    isEditMode && selectedMaintenance ? selectedMaintenance.cost : ""
  );
  const [date, setDate] = useState(
    isEditMode && selectedMaintenance
      ? selectedMaintenance.date
      : new Date().toISOString().split("T")[0]
  );
  const [parts, setParts] = useState(
    isEditMode && selectedMaintenance?.parts ? selectedMaintenance.parts : []
  );
  const [partName, setPartName] = useState("");
  const [partCost, setPartCost] = useState("");
  const [partImage, setPartImage] = useState(null);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false); // Nuovo stato
  const [setReminder, setSetReminder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Aggiorna costo totale al variare dei pezzi
  useEffect(() => {
    if (parts.length > 0) {
      const totalPartsCost = parts.reduce(
        (sum, p) => sum + parseFloat(p.cost || 0),
        0
      );
      setCost(totalPartsCost);
    }
  }, [parts]);

  const handleAddPart = () => {
    if (partName.trim() && partCost) {
      setParts([
        ...parts,
        {
          id: Date.now().toString(),
          name: partName,
          cost: parseFloat(partCost),
          image: partImage,
        },
      ]);
      setPartName("");
      setPartCost("");
      setPartImage(null);
    }
  };

  const removePart = (id) => {
    const newParts = parts.filter((p) => p.id !== id);
    setParts(newParts);
    if (newParts.length === 0) setCost("");
  };

  // Compressione immagine ricambio
  const processImage = (base64Str) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 600;
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      setPartImage(canvas.toDataURL("image/jpeg", 0.7));
      setShowPhotoSelector(false); // Chiude il selettore
    };
    img.src = base64Str;
  };

  const handleSave = (e) => {
    e.preventDefault();
    let finalParts = [...parts];
    // Se c'è un pezzo "in sospeso" nell'input, lo aggiunge
    if (partName.trim() && partCost)
      finalParts.push({
        id: Date.now().toString(),
        name: partName,
        cost: parseFloat(partCost),
        image: partImage,
      });

    const recordData = {
      id: isEditMode ? selectedMaintenance.id : Date.now().toString(),
      date,
      km: parseInt(km) || 0,
      description: desc,
      cost: parseFloat(cost) || 0,
      parts: finalParts,
    };

    const updatedVehicles = vehicles.map((v) => {
      if (v.id === selectedVehicle.id) {
        let newM = isEditMode
          ? v.maintenance.map((m) =>
              m.id === selectedMaintenance.id ? recordData : m
            )
          : [...(v.maintenance || []), recordData];
        const updatedV = { ...v, maintenance: newM };
        if (setReminder) {
          const d = new Date(date);
          d.setFullYear(d.getFullYear() + 1);
          updatedV.deadlines = {
            ...updatedV.deadlines,
            service: d.toISOString().split("T")[0],
          };
        }
        setSelectedVehicle(updatedV);
        return updatedV;
      }
      return v;
    });
    setVehicles(updatedVehicles);
    setCurrentView("vehicle");
  };

  return (
    <div className="min-h-screen bg-white animate-in slide-in-from-bottom-full duration-300 relative overflow-y-auto">
      {showPhotoSelector && (
        <PhotoSourceSelector
          onImageSelected={processImage}
          onCancel={() => setShowPhotoSelector(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/60 z-[160] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              Eliminare intervento?
            </h3>
            <p className="text-center text-gray-500 text-sm mb-6">
              Questa azione rimuoverà definitivamente questo lavoro.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl active:bg-gray-200"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = vehicles.map((v) => {
                    if (v.id === selectedVehicle.id) {
                      const uv = {
                        ...v,
                        maintenance: v.maintenance.filter(
                          (mx) => mx.id !== selectedMaintenance.id
                        ),
                      };
                      setSelectedVehicle(uv);
                      return uv;
                    }
                    return v;
                  });
                  setVehicles(updated);
                  setCurrentView("vehicle");
                }}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl active:bg-red-700"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="pt-12 pb-4 px-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-[60] shadow-sm">
        <button
          onClick={() => setCurrentView("vehicle")}
          className="p-2 -ml-2 text-gray-500 active:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg">
          {isEditMode ? "Modifica Lavoro" : "Nuovo Lavoro"}
        </h1>
        <div className="w-10"></div>
      </header>

      <form onSubmit={handleSave} className="p-5 space-y-5 pb-24">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Descrizione
          </label>
          <input
            required
            type="text"
            placeholder="Cambio olio..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all text-sm shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Data
            </label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 shadow-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              KM
            </label>
            <div className="relative">
              <input
                required
                type="number"
                placeholder="50000"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 pr-10 text-sm shadow-sm"
              />
              <span className="absolute right-3.5 top-3.5 text-gray-400 font-bold text-sm">
                km
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Costo Totale
          </label>
          <div className="relative">
            <input
              required
              type="number"
              step="0.01"
              placeholder="150"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              readOnly={parts.length > 0}
              className={`w-full p-3.5 border rounded-xl focus:outline-none pl-10 text-sm shadow-sm ${
                parts.length > 0
                  ? "bg-gray-100 border-gray-200 text-gray-500"
                  : "bg-white border-gray-200 focus:ring-2 focus:ring-gray-900"
              }`}
            />
            <span className="absolute left-3.5 top-3.5 text-gray-400 font-bold">
              €
            </span>
          </div>
          {parts.length > 0 && (
            <p className="text-xs text-amber-600 font-medium mt-1.5 ml-1">
              Calcolato automaticamente dai ricambi
            </p>
          )}
        </div>

        <div className="pt-5 border-t border-gray-200">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Ricambi / Foto (Opzionale)
          </label>
          {parts.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-2 gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {p.image && (
                  <img
                    src={p.image}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                    alt="Ricambio"
                  />
                )}
                <span className="text-sm font-bold text-gray-800 truncate flex-1">
                  {p.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-black text-gray-900 text-sm">
                  €{p.cost}
                </span>
                <button
                  type="button"
                  onClick={() => removePart(p.id)}
                  className="text-red-500 p-2 bg-red-50 rounded-lg active:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-3 items-center bg-gray-100 p-1.5 rounded-xl shadow-inner">
            <input
              type="text"
              placeholder="Pezzo..."
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              className="flex-1 p-2.5 bg-white border border-transparent rounded-lg text-sm font-medium outline-none shadow-sm focus:ring-1 focus:ring-gray-900"
            />
            <input
              type="number"
              step="0.01"
              placeholder="€"
              value={partCost}
              onChange={(e) => setPartCost(e.target.value)}
              className="w-16 p-2.5 bg-white border border-transparent rounded-lg text-sm font-medium outline-none shadow-sm focus:ring-1 focus:ring-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPhotoSelector(true)}
              className="flex items-center justify-center p-2.5 bg-white border border-transparent rounded-lg cursor-pointer active:bg-gray-50 transition-colors shadow-sm"
            >
              {partImage ? (
                <img
                  src={partImage}
                  className="w-5 h-5 rounded-sm object-cover"
                  alt="Anteprima"
                />
              ) : (
                <Camera className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              type="button"
              onClick={handleAddPart}
              disabled={!partName.trim() || !partCost}
              className="bg-gray-900 text-white p-2.5 rounded-lg disabled:opacity-50 shadow-sm active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200">
          <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
            <div>
              <p className="text-sm font-bold text-emerald-900">Promemoria</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                Aggiorna scadenza tagliando tra 1 anno
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={setReminder}
                onChange={(e) => setSetReminder(e.target.checked)}
              />
              <div className="w-12 h-7 bg-emerald-200/50 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-wider text-sm active:scale-[0.98] shadow-xl shadow-gray-900/20 mt-2"
        >
          {isEditMode ? "Salva Modifiche" : "Salva Lavoro"}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-4 mt-3 bg-red-50 text-red-600 rounded-xl font-black uppercase tracking-wider text-sm active:scale-[0.98]"
          >
            Elimina Lavoro
          </button>
        )}
      </form>
    </div>
  );
};

// --- FORM: VEICOLO (Migliorato per Fotocamera) ---
const VehicleFormView = ({
  setCurrentView,
  vehicles,
  setVehicles,
  isEditMode,
  selectedVehicle,
  setSelectedVehicle,
}) => {
  const v = isEditMode ? selectedVehicle : null;
  const [plate, setPlate] = useState(v?.licensePlate || "");
  const [type, setType] = useState(v?.type || "");
  const [make, setMake] = useState(v?.make || "");
  const [model, setModel] = useState(v?.model || "");
  const [year, setYear] = useState(v?.year || "");
  const [insurance, setInsurance] = useState(v?.deadlines?.insurance || "");
  const [tax, setTax] = useState(v?.deadlines?.tax || "");
  const [inspection, setInspection] = useState(v?.deadlines?.inspection || "");
  const [service, setService] = useState(v?.deadlines?.service || "");
  const [image, setImage] = useState(v?.image || null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false); // Nuovo

  const formatTitleCase = (str) =>
    str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : "";
  const showStep2 = isEditMode || type !== "";
  const isFormComplete = type !== "" && make.trim() !== "";

  const handleSave = (e) => {
    e.preventDefault();
    if (!isFormComplete) return;
    const vData = {
      id: isEditMode ? v.id : Date.now().toString(),
      type,
      make,
      model,
      year,
      licensePlate: plate.toUpperCase(),
      image,
      deadlines: { insurance, tax, inspection, service },
      documents: isEditMode ? v.documents : [],
      maintenance: isEditMode ? v.maintenance : [],
    };
    if (isEditMode) {
      const up = vehicles.map((veh) => (veh.id === v.id ? vData : veh));
      setVehicles(up);
      setSelectedVehicle(vData);
      setCurrentView("vehicle");
    } else {
      setVehicles([...vehicles, vData]);
      setCurrentView("home");
    }
  };

  const startPhotoProcess = (base64Str) => {
    setRawImage(base64Str);
    setShowPhotoSelector(false);
  };

  if (rawImage)
    return (
      <ImageCropper
        imageSrc={rawImage}
        onCropDone={(img) => {
          setImage(img);
          setRawImage(null);
        }}
        onCancel={() => setRawImage(null)}
      />
    );

  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-bottom-full duration-300 relative overflow-y-auto pb-20">
      {showPhotoSelector && (
        <PhotoSourceSelector
          onImageSelected={startPhotoProcess}
          onCancel={() => setShowPhotoSelector(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/60 z-[160] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              Eliminare {v?.make}?
            </h3>
            <p className="text-center text-gray-500 text-sm mb-6">
              Questa azione rimuoverà definitivamente il veicolo e tutta la sua
              cronologia.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl active:bg-gray-200"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = vehicles.filter((veh) => veh.id !== v.id);
                  setVehicles(updated);
                  setCurrentView("home");
                }}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl active:bg-red-700"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="pt-12 pb-4 px-6 bg-white sticky top-0 z-[60] flex items-center justify-between shadow-sm">
        <button
          onClick={() => setCurrentView(isEditMode ? "vehicle" : "home")}
          className="p-2 -ml-2 text-gray-500 active:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg">
          {isEditMode ? "Modifica Veicolo" : "Nuovo Veicolo"}
        </h1>
        <div className="w-10"></div>
      </header>
      <form onSubmit={handleSave} className="p-6 space-y-8">
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => setShowPhotoSelector(true)}
            className="relative w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden active:bg-gray-200 transition-colors shadow-inner cursor-pointer"
          >
            {image ? (
              <img
                src={image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Aggiungi Foto
                </span>
              </>
            )}
          </div>
          {image && (
            <button
              type="button"
              onClick={() => setImage(null)}
              className="mt-4 text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl active:bg-red-100 transition-colors"
            >
              Rimuovi Foto
            </button>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            1. Tipo
          </h3>
          <div className="flex bg-gray-200/50 p-1.5 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setType("car")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all ${
                type === "car"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-500"
              }`}
            >
              <Car className="w-5 h-5" /> Auto
            </button>
            <button
              type="button"
              onClick={() => setType("motorcycle")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all ${
                type === "motorcycle"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-500"
              }`}
            >
              <Bike className="w-5 h-5" /> Moto
            </button>
          </div>
        </div>

        {showStep2 && (
          <div className="animate-in fade-in space-y-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                2. Targa (Opzionale)
              </h3>
              <input
                type="text"
                placeholder="es. AB123CD"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 outline-none font-mono uppercase text-2xl shadow-sm text-center tracking-wider"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                3. Dati Base
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 ml-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(formatTitleCase(e.target.value))}
                    className="w-full p-4 mt-1 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-base shadow-sm"
                    placeholder="es. Fiat"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 ml-1">
                    Modello
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(formatTitleCase(e.target.value))}
                    className="w-full p-4 mt-1 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-base shadow-sm"
                    placeholder="es. Panda"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 ml-1">
                  Anno
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-4 mt-1 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-base shadow-sm"
                  placeholder="es. 2021"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                4. Scadenze (Opzionali)
              </h3>
              {[
                {
                  l: "Assicurazione",
                  v: insurance,
                  s: setInsurance,
                  i: <FileText />,
                },
                { l: "Bollo", v: tax, s: setTax, i: <FileText /> },
                {
                  l: "Revisione",
                  v: inspection,
                  s: setInspection,
                  i: <Wrench />,
                },
                { l: "Tagliando", v: service, s: setService, i: <Wrench /> },
              ].map((s) => (
                <div
                  key={s.l}
                  className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    {s.i}
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {s.l}
                    </label>
                    <input
                      type="date"
                      value={s.v}
                      onChange={(e) => s.s(e.target.value)}
                      className="w-full p-1 bg-transparent outline-none text-base font-semibold focus:text-gray-900"
                    />
                  </div>
                  {s.v && (
                    <button
                      type="button"
                      onClick={() => s.s("")}
                      className="p-1.5 text-gray-300 absolute top-2 right-2 active:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormComplete}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-wider text-lg transition-all ${
                  isFormComplete
                    ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20 active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isEditMode ? "Salva Modifiche" : "Salva Veicolo"}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-5 mt-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-wider text-base transition-all active:scale-[0.98]"
                >
                  Elimina Veicolo
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

const AddDocumentView = ({
  setCurrentView,
  vehicles,
  setVehicles,
  selectedVehicle,
  setSelectedVehicle,
  initialTitle,
}) => {
  const [title, setTitle] = useState(initialTitle || "");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false); // Nuovo

  // Compressione immagine documenti
  const processImage = (base64Str) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 1000;
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.8));
      setShowPhotoSelector(false);
    };
    img.src = base64Str;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!previewUrl) return;
    const newDoc = {
      id: Date.now().toString(),
      title: title || "Documento",
      date: new Date().toISOString().split("T")[0],
      url: previewUrl,
    };
    const uv = vehicles.map((v) => {
      if (v.id === selectedVehicle.id) {
        const updated = { ...v, documents: [...(v.documents || []), newDoc] };
        setSelectedVehicle(updated);
        return updated;
      }
      return v;
    });
    setVehicles(uv);
    setCurrentView("vehicle");
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-bottom-full duration-300 relative">
      {showPhotoSelector && (
        <PhotoSourceSelector
          onImageSelected={processImage}
          onCancel={() => setShowPhotoSelector(false)}
        />
      )}

      <header className="pt-12 pb-4 px-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-[60] shadow-sm">
        <button
          onClick={() => setCurrentView("vehicle")}
          className="p-2 -ml-2 text-gray-500 active:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg">Nuovo Documento</h1>
        <div className="w-10"></div>
      </header>
      <form onSubmit={handleSave} className="p-6 space-y-8">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Descrizione
          </label>
          <input
            required
            type="text"
            placeholder="es. Scansione Bollo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-base shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Foto / Scansione
          </label>
          {!previewUrl ? (
            <div
              onClick={() => setShowPhotoSelector(true)}
              className="relative border-4 border-dashed border-gray-200 rounded-3xl bg-white flex flex-col items-center justify-center py-16 text-gray-400 active:bg-gray-50 transition-colors cursor-pointer shadow-inner"
            >
              <ImageIcon className="w-12 h-12 mb-4" />
              <p className="font-bold uppercase tracking-wider text-sm">
                Aggiungi Immagine
              </p>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-white">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-80 object-contain mx-auto bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="absolute top-4 right-4 bg-white/95 text-red-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Rimuovi
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!previewUrl}
          className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-wider text-lg shadow-xl shadow-gray-900/20 active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Salva Documento
        </button>
      </form>
    </div>
  );
};

const PreferencesView = ({ preferences, setPreferences, setCurrentView }) => {
  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right-4 duration-300 pb-10 overflow-y-auto">
      <header className="pt-12 pb-6 px-6 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => setCurrentView("home")}
          className="flex items-center text-gray-500 mb-4 active:opacity-50 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Indietro
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Preferenze</h1>
      </header>
      <main className="p-6 space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-1">
            Notifiche e Avvisi
          </h2>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                    preferences.notificationsEnabled
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {preferences.notificationsEnabled ? (
                    <Bell className="w-7 h-7" />
                  ) : (
                    <Bell className="w-7 h-7 opacity-50" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg leading-tight">
                    Attiva Notifiche
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Mostra avvisi in Home
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences.notificationsEnabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notificationsEnabled: e.target.checked,
                    })
                  }
                />
                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
              </label>
            </div>
            {preferences.notificationsEnabled && (
              <div className="border-t border-gray-100 bg-slate-50/50 p-6 space-y-6 animate-in slide-in-from-top-3">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <span className="font-bold text-gray-900 block text-base">
                        Orario di ricezione
                      </span>
                      <span className="text-xs font-medium text-gray-500 mt-1 block">
                        A che ora ricevere la notifica?
                      </span>
                    </div>
                    <input
                      type="time"
                      value={preferences.notificationTime || "09:00"}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          notificationTime: e.target.value,
                        })
                      }
                      className="bg-slate-50 border border-gray-200 text-gray-900 text-lg rounded-xl p-2.5 font-bold outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>
                {Object.keys(deadlineLabels).map((type) => {
                  const currentPref = preferences.deadlines[type];
                  return (
                    <div
                      key={type}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-4 gap-4">
                        <span className="font-bold text-gray-900 text-base">
                          {deadlineLabels[type]}
                        </span>
                        <select
                          value={currentPref.days}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              deadlines: {
                                ...preferences.deadlines,
                                [type]: {
                                  ...currentPref,
                                  days: parseInt(e.target.value),
                                },
                              },
                            })
                          }
                          className="bg-slate-50 border border-gray-200 text-gray-700 text-sm rounded-xl p-2.5 font-bold outline-none focus:ring-1 focus:ring-gray-900"
                        >
                          <option value={15}>15 gg prima</option>
                          <option value={30}>30 gg prima</option>
                          <option value={45}>45 gg prima</option>
                          <option value={60}>60 gg prima</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Colore:
                        </span>
                        <div className="flex gap-2">
                          {Object.entries(colorOptions).map(
                            ([colorKey, colorVal]) => (
                              <button
                                key={colorKey}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPreferences({
                                    ...preferences,
                                    deadlines: {
                                      ...preferences.deadlines,
                                      [type]: {
                                        ...currentPref,
                                        color: colorKey,
                                      },
                                    },
                                  });
                                }}
                                className={`w-8 h-8 rounded-full ${
                                  colorVal.bg
                                } transition-all border-2 ${
                                  currentPref.color === colorKey
                                    ? "border-gray-800 scale-110 shadow-md"
                                    : "border-transparent opacity-50 hover:opacity-100"
                                }`}
                                title={colorKey}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default function App() {
  const [vehicles, setVehicles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("garage_data")) || initialVehicles;
    } catch (e) {
      return initialVehicles;
    }
  });
  const [rawPreferences, setPreferences] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("garage_prefs")) || defaultPreferences
      );
    } catch (e) {
      return defaultPreferences;
    }
  });
  const [localBackups, setLocalBackups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("garage_auto_backups")) || [];
    } catch (e) {
      return [];
    }
  });

  const [currentView, setCurrentView] = useState("home");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState("main");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [renewPrompt, setRenewPrompt] = useState(null);
  const [initialDocTitle, setInitialDocTitle] = useState("");
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  const safePreferences = {
    ...defaultPreferences,
    ...rawPreferences,
    notificationTime: rawPreferences.notificationTime || "09:00",
    deadlines: {
      insurance: {
        ...defaultPreferences.deadlines.insurance,
        ...(rawPreferences.deadlines?.insurance || {}),
      },
      tax: {
        ...defaultPreferences.deadlines.tax,
        ...(rawPreferences.deadlines?.tax || {}),
      },
      inspection: {
        ...defaultPreferences.deadlines.inspection,
        ...(rawPreferences.deadlines?.inspection || {}),
      },
      service: {
        ...defaultPreferences.deadlines.service,
        ...(rawPreferences.deadlines?.service || {}),
      },
    },
    autoBackup: {
      ...defaultPreferences.autoBackup,
      ...(rawPreferences.autoBackup || {}),
    },
    disabledVehicles: rawPreferences.disabledVehicles || [],
  };

  useEffect(() => {
    try {
      localStorage.setItem("garage_data", JSON.stringify(vehicles));
      localStorage.setItem("garage_prefs", JSON.stringify(rawPreferences));
    } catch (e) {}
  }, [vehicles, rawPreferences]);
  useEffect(() => {
    try {
      localStorage.setItem("garage_auto_backups", JSON.stringify(localBackups));
    } catch (e) {}
  }, [localBackups]);
  useEffect(() => {
    if (safePreferences.autoBackup.enabled && vehicles.length > 0) {
      const now = new Date().getTime();
      setLocalBackups((prev) => {
        const lastBackup = prev[0];
        const interval =
          safePreferences.autoBackup.frequency === "weekly"
            ? 604800000
            : 86400000;
        if (!lastBackup || now - lastBackup.timestamp > interval)
          return [
            {
              id: now.toString(),
              timestamp: now,
              date: new Date().toISOString(),
              data: vehicles,
            },
            ...prev,
          ].slice(0, 3);
        return prev;
      });
    }
  }, [
    vehicles,
    safePreferences.autoBackup.enabled,
    safePreferences.autoBackup.frequency,
  ]);

  const handleDeadlineClick = (vehicle, type) => {
    const currentDate = vehicle.deadlines[type];
    if (!currentDate) return;
    const d = new Date(currentDate);
    d.setFullYear(d.getFullYear() + (type === "inspection" ? 2 : 1));
    setRenewPrompt({
      step: 1,
      vehicle,
      type,
      newDate: d.toISOString().split("T")[0],
    });
  };

  const handleConfirmRenew = () => {
    const uv = vehicles.map((v) =>
      v.id === renewPrompt.vehicle.id
        ? {
            ...v,
            deadlines: {
              ...v.deadlines,
              [renewPrompt.type]: renewPrompt.newDate,
            },
          }
        : v
    );
    setVehicles(uv);
    if (selectedVehicle?.id === renewPrompt.vehicle.id)
      setSelectedVehicle(uv.find((vx) => vx.id === renewPrompt.vehicle.id));
    if (renewPrompt.type === "tax") setRenewPrompt({ ...renewPrompt, step: 2 });
    else setRenewPrompt(null);
  };
  const closeMenu = () => {
    setIsMenuOpen(false);
    setTimeout(() => setMenuView("main"), 300);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl relative overflow-hidden text-slate-900 font-sans">
      {renewPrompt && (
        <div className="absolute inset-0 bg-black/60 z-[120] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            {renewPrompt.step === 1 ? (
              <>
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  {renewPrompt.type === "inspection" ||
                  renewPrompt.type === "service"
                    ? `Hai fatto la/il ${deadlineLabels[renewPrompt.type]}?`
                    : `Hai pagato ${deadlineLabels[renewPrompt.type]}?`}
                </h3>
                <p className="text-center text-gray-500 text-sm mb-6">
                  Nuova scadenza: <b>{formatDate(renewPrompt.newDate)}</b>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRenewPrompt(null)}
                    className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold active:bg-gray-200"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleConfirmRenew}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold active:bg-blue-700"
                  >
                    Aggiorna
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  Scadenza aggiornata!
                </h3>
                <p className="text-center text-gray-500 text-sm mb-6">
                  Vuoi allegare la foto della ricevuta?
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setInitialDocTitle(
                        `${
                          deadlineLabels[renewPrompt.type]
                        } ${renewPrompt.newDate.substring(0, 4)}`
                      );
                      setSelectedVehicle(renewPrompt.vehicle);
                      setRenewPrompt(null);
                      setCurrentView("add-document");
                    }}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg active:bg-emerald-700"
                  >
                    Sì, allega foto
                  </button>
                  <button
                    onClick={() => setRenewPrompt(null)}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold active:bg-gray-200"
                  >
                    Più tardi
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/60 z-[120] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              Cancellare tutto?
            </h3>
            <p className="text-center text-gray-500 text-sm mb-6">
              Questa azione eliminerà definitivamente tutti i veicoli dal tuo
              garage.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 bg-gray-100 font-semibold rounded-xl active:bg-gray-200"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  setVehicles([]);
                  setShowClearConfirm(false);
                  closeMenu();
                }}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 active:bg-red-700"
              >
                Cancella
              </button>
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div
          className="absolute inset-0 bg-black/50 z-[90] transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}
      <div
        className={`absolute inset-y-0 left-0 w-80 bg-slate-50 z-[100] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-12 pb-6 px-6 bg-white border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
          {menuView === "backup" ? (
            <button
              onClick={() => setMenuView("main")}
              className="flex items-center text-gray-900 font-bold text-xl gap-1 -ml-2 p-2 rounded-full active:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" /> Backup
            </button>
          ) : (
            <h2 className="font-bold text-xl text-gray-900">Impostazioni</h2>
          )}
          <button
            onClick={closeMenu}
            className="p-2 -mr-2 text-gray-500 active:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {menuView === "main" ? (
            <div className="p-4 space-y-2 animate-in fade-in">
              <button
                onClick={() => setMenuView("backup")}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl active:bg-gray-50 transition-colors text-left shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">
                      Backup e Dati
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Gestisci la memoria
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
              <button
                onClick={() => {
                  closeMenu();
                  setCurrentView("preferences");
                }}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl active:bg-gray-50 transition-colors text-left shadow-sm border border-gray-100 mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">
                    Preferenze
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Notifiche e colori
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 flex items-center justify-between bg-blue-50/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        safePreferences.autoBackup.enabled
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <RefreshCw
                        className={`w-5 h-5 ${
                          safePreferences.autoBackup.enabled
                            ? "animate-[spin_4s_linear_infinite]"
                            : ""
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base leading-tight">
                        Auto-Backup
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        In memoria locale
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={safePreferences.autoBackup.enabled}
                      onChange={(e) =>
                        setPreferences({
                          ...safePreferences,
                          autoBackup: {
                            ...safePreferences.autoBackup,
                            enabled: e.target.checked,
                          },
                        })
                      }
                    />
                    <div className="w-12 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                  </label>
                </div>
                {safePreferences.autoBackup.enabled && (
                  <div className="px-5 pb-5 bg-blue-50/50 flex justify-between items-center animate-in slide-in-from-top-2">
                    <span className="text-sm font-semibold text-gray-600">
                      Frequenza:
                    </span>
                    <select
                      value={safePreferences.autoBackup.frequency}
                      onChange={(e) =>
                        setPreferences({
                          ...safePreferences,
                          autoBackup: {
                            ...safePreferences.autoBackup,
                            frequency: e.target.value,
                          },
                        })
                      }
                      className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2 font-medium outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="daily">Giornaliero</option>
                      <option value="weekly">Settimanale</option>
                      <option value="monthly">Mensile</option>
                    </select>
                  </div>
                )}
                <div className="p-5 border-t border-gray-100 space-y-4">
                  <button
                    onClick={() => {
                      const nb = {
                        id: Date.now().toString(),
                        timestamp: Date.now(),
                        date: new Date().toISOString(),
                        data: JSON.parse(JSON.stringify(vehicles)),
                      };
                      setLocalBackups((prev) => [nb, ...prev].slice(0, 3));
                      alert("Backup eseguito con successo!");
                    }}
                    className="w-full py-4 mb-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold text-sm transition-colors uppercase tracking-wider active:scale-[0.98]"
                  >
                    Esegui Backup Locale
                  </button>
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Ultime 3 copie
                    </h4>
                    {localBackups.length === 0 ? (
                      <p className="text-sm text-gray-400 italic text-center py-2">
                        Nessun backup.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {localBackups.map((b) => (
                          <div
                            key={b.id}
                            className="p-3.5 rounded-xl border bg-slate-50 gap-2"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-bold text-gray-700">
                                {formatDateTime(b.date)}
                              </span>
                              <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-lg">
                                {b.data.length} Veicoli
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Ripristinare questo backup?"
                                    )
                                  ) {
                                    setVehicles(b.data);
                                    closeMenu();
                                  }
                                }}
                                className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 active:bg-gray-100 active:scale-95 transition-transform"
                              >
                                Ripristina
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(vehicles, null, 2);
                    const dataUri =
                      "data:application/json;charset=utf-8," +
                      encodeURIComponent(dataStr);
                    const linkElement = document.createElement("a");
                    linkElement.setAttribute("href", dataUri);
                    linkElement.setAttribute("download", "garage_backup.json");
                    linkElement.click();
                    closeMenu();
                  }}
                  className="w-full flex items-center gap-4 p-5 active:bg-gray-50 transition-colors text-left border-b border-gray-50"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">
                      Scarica tutto
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Esporta in file .json
                    </p>
                  </div>
                </button>
                <div className="relative border-b border-gray-50">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const importedData = JSON.parse(event.target.result);
                          if (Array.isArray(importedData))
                            setVehicles(importedData);
                        } catch (err) {
                          alert("File non valido");
                        }
                        closeMenu();
                      };
                      reader.readAsText(file);
                      e.target.value = null;
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full flex items-center gap-4 p-5 active:bg-gray-50 transition-colors text-left">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">
                        Carica da file
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Ripristina da un file .json
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full flex items-center gap-4 p-5 active:bg-red-50 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-red-600 text-base">
                      Svuota Garage
                    </p>
                    <p className="text-sm text-red-400 mt-0.5">
                      Cancella tutti i dati
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {currentView === "home" && (
        <HomeView
          vehicles={vehicles}
          setCurrentView={setCurrentView}
          setSelectedVehicle={setSelectedVehicle}
          setIsMenuOpen={setIsMenuOpen}
          preferences={safePreferences}
          onDeadlineClick={handleDeadlineClick}
        />
      )}
      {currentView === "vehicle" && (
        <VehicleDetailView
          selectedVehicle={selectedVehicle}
          setCurrentView={setCurrentView}
          preferences={safePreferences}
          onDeadlineClick={handleDeadlineClick}
          setSelectedMaintenance={setSelectedMaintenance}
        />
      )}
      {currentView === "preferences" && (
        <PreferencesView
          preferences={safePreferences}
          setPreferences={setPreferences}
          setCurrentView={setCurrentView}
        />
      )}
      {currentView === "add-maintenance" && (
        <MaintenanceFormView
          setCurrentView={setCurrentView}
          vehicles={vehicles}
          setVehicles={setVehicles}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
          isEditMode={false}
        />
      )}
      {currentView === "edit-maintenance" && (
        <MaintenanceFormView
          setCurrentView={setCurrentView}
          vehicles={vehicles}
          setVehicles={setVehicles}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
          isEditMode={true}
          selectedMaintenance={selectedMaintenance}
        />
      )}
      {currentView === "add-vehicle" && (
        <VehicleFormView
          setCurrentView={setCurrentView}
          vehicles={vehicles}
          setVehicles={setVehicles}
          isEditMode={false}
        />
      )}
      {currentView === "edit-vehicle" && (
        <VehicleFormView
          setCurrentView={setCurrentView}
          vehicles={vehicles}
          setVehicles={setVehicles}
          isEditMode={true}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
        />
      )}
      {currentView === "add-document" && (
        <AddDocumentView
          setCurrentView={setCurrentView}
          vehicles={vehicles}
          setVehicles={setVehicles}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
          initialTitle={initialDocTitle}
        />
      )}
    </div>
  );
}
