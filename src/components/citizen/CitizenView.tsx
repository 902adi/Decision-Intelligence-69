import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { rivergateWards, rivergateCamps } from '../../data/rivergate';
import { 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  LifeBuoy, 
  AlertTriangle, 
  CheckCircle2, 
  Droplet, 
  Building2, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  Camera,
  Compass,
  ArrowRight,
  Clock,
  Check,
  Radio,
  Zap,
  Layers,
  Utensils,
  HeartPulse,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SosRequestModal } from './SosRequestModal';
import { ReportProblemModal } from './ReportProblemModal';
import { SafeRouteModal } from './SafeRouteModal';
import { GpsTrackerWidget } from '../common/GpsTrackerWidget';
import { AnimatedBackground } from '../common/AnimatedBackground';
import { PhenomenonForecastCard } from './PhenomenonForecastCard';
import { playClickSound, playAlertChime } from '../../utils/soundEffects';

export const CitizenView: React.FC = () => {
  const { 
    selectedWardId, 
    setSelectedWardId, 
    graph, 
    submitCheckin, 
    activeCitizenSos,
    rainfallMmH,
    colorblindSafe,
    setIsHelplinesOpen
  } = useAppStore();

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [activeCheckin, setActiveCheckin] = useState<'safe' | 'need_help' | 'evacuating' | null>(null);
  const [checkinTimestamp, setCheckinTimestamp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forecast' | 'shelter' | 'checklist'>('forecast');

  const ward = rivergateWards.find(w => w.id === selectedWardId) || rivergateWards[0];
  const wardRisk = graph.wardRisks[selectedWardId] || { riskScore: 40, riskCategory: 'mod', waterLevelMeters: 0.3 };
  const route = graph.evacuationRoutes[selectedWardId];
  const nearestCamp = rivergateCamps[0]; // Camp B Greenfield Stadium

  const wardName = ward.name;

  // Plain-language decisive verdict based on risk category
  let statusBadge = "Safe & Dry";
  let statusTheme = {
    bg: "bg-low/10 border-low/30 text-low",
    glow: "shadow-[0_0_25px_-5px_rgba(46,204,113,0.25)]",
    pulse: "bg-low",
    textColor: "text-low"
  };
  let statusExplanation = `Stay indoors — water is safe. All roads around ${wardName} remain clear and dry.`;

  if (wardRisk.riskCategory === 'crit') {
    statusBadge = "Critical Danger";
    statusTheme = {
      bg: "bg-crit/15 border-crit/40 text-crit",
      glow: "shadow-[0_0_25px_-5px_rgba(231,76,60,0.3)]",
      pulse: "bg-crit",
      textColor: "text-crit"
    };
    statusExplanation = `Move to second floor or evacuate to ${route?.campName || 'Relief Camp'} now. Street water is deep (${wardRisk.waterLevelMeters}m).`;
  } else if (wardRisk.riskCategory === 'high') {
    statusBadge = "Rising Water";
    statusTheme = {
      bg: "bg-high/15 border-high/40 text-high",
      glow: "shadow-[0_0_25px_-5px_rgba(230,126,34,0.3)]",
      pulse: "bg-high",
      textColor: "text-high"
    };
    statusExplanation = `Prepare emergency kit and stay alert. Water is rising on ground floors near ${wardName}.`;
  } else if (wardRisk.riskCategory === 'mod') {
    statusBadge = "Heavy Rain Alert";
    statusTheme = {
      bg: "bg-mod/15 border-mod/40 text-mod",
      glow: "shadow-[0_0_25px_-5px_rgba(243,156,18,0.25)]",
      pulse: "bg-mod",
      textColor: "text-mod"
    };
    statusExplanation = `Stay indoors and avoid basement areas. Heavy rain is active across ${wardName}.`;
  }

  // Checklist items in plain simple English
  const checklists = wardRisk.riskCategory === 'crit' || wardRisk.riskCategory === 'high' ? [
    'Turn off main electricity switch and cooking gas cylinder.',
    'Pack identity cards, phone charger, medicines, and drinking water in a plastic bag.',
    'Move to the second floor, or follow the dry walking path to the shelter.',
    'Never walk or drive into moving water above your ankles.'
  ] : [
    'Charge your mobile phone and battery powerbanks to 100%.',
    'Fill clean water bottles and keep emergency snacks ready.',
    'Keep emergency number 112 on speed dial.',
    'Stay away from broken electric wires and open street drains.'
  ];

  const handleCheckin = async (type: 'safe' | 'need_help' | 'evacuating') => {
    playClickSound();
    setActiveCheckin(type);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCheckinTimestamp(timeStr);
    await submitCheckin(type);

    if (type === 'need_help') {
      playAlertChime();
      setIsSosOpen(true);
    } else if (type === 'evacuating') {
      setIsRouteOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Ambient background: rain + orbs */}
      <AnimatedBackground rainfallMmH={rainfallMmH} section="citizen" />

      <div className="relative z-10 max-w-xl mx-auto px-3.5 sm:px-4 py-4 sm:py-6 space-y-4 pb-24">
        
        {/* ── 1. UNIFIED HERO CARD: Ward Picker + GPS + Live Status ── */}
        <div className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${statusTheme.bg} ${statusTheme.glow}`}>
          
          {/* Top Bar: Location Selector & GPS in one sleek row */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-line/40">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-surface/80 border border-line flex items-center justify-center shrink-0 text-accent">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <select
                  value={selectedWardId}
                  onChange={(e) => { playClickSound(); setSelectedWardId(e.target.value); }}
                  className="w-full bg-surface/80 hover:bg-surface border border-line/60 rounded-lg px-2 py-1 text-xs font-bold text-text focus:outline-none focus:border-accent cursor-pointer truncate"
                  aria-label="Select your ward"
                >
                  {rivergateWards.map((w) => (
                    <option key={w.id} value={w.id} className="bg-surface text-text">
                      Ward {w.number}: {w.name} ({w.elevation}m)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick GPS auto-detect widget */}
            <div className="shrink-0">
              <GpsTrackerWidget onWardLocated={(id) => setSelectedWardId(id)} />
            </div>
          </div>

          {/* Core Verdict Headline & Risk Score */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${statusTheme.pulse} animate-pulse`} />
                <span className="font-mono text-xs uppercase tracking-wider font-bold">
                  {statusBadge}
                </span>
              </div>
              <div className="font-mono text-xs text-text-2 bg-surface/60 px-2.5 py-0.5 rounded-full border border-line/40">
                Risk: <strong className={`text-xs font-bold ${statusTheme.textColor}`}>{wardRisk.riskScore}%</strong>
              </div>
            </div>

            <h1 className="font-heading text-lg sm:text-xl font-black leading-snug tracking-tight text-text">
              {statusExplanation}
            </h1>

            {/* Active SOS Tracker banner if citizen already sent SOS */}
            {activeCitizenSos && (
              <div 
                onClick={() => { playClickSound(); setIsSosOpen(true); }}
                className="cursor-pointer mt-2 p-2.5 rounded-xl bg-surface/90 border border-sos text-text flex items-center justify-between gap-2 text-xs shadow-sm hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-sos animate-spin" />
                  <span className="text-[11px]">Rescue Status: <strong className="font-mono uppercase text-sos">{activeCitizenSos.status}</strong></span>
                </div>
                <span className="text-accent text-[11px] font-semibold flex items-center gap-1">
                  Track Live <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. STREAMLINED 2x2 ACTION GRID ── */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Action 1: Safe Route */}
          <button
            onClick={() => { playClickSound(); setIsRouteOpen(true); }}
            className="p-3.5 rounded-xl bg-surface/80 hover:bg-surface border border-line hover:border-accent/60 text-left transition-all group flex flex-col justify-between shadow-xs cursor-pointer backdrop-blur-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs sm:text-sm text-text block leading-tight">
                Dry Walking Path
              </span>
              <span className="text-[10px] sm:text-[11px] text-text-2 block mt-0.5">
                Avoid flooded roads
              </span>
            </div>
          </button>

          {/* Action 2: Call SOS */}
          <button
            onClick={() => { playClickSound(); setIsSosOpen(true); }}
            className="p-3.5 rounded-xl bg-surface/80 hover:bg-sos/10 border border-line hover:border-sos/60 text-left transition-all group flex flex-col justify-between shadow-xs cursor-pointer backdrop-blur-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-sos/20 text-sos flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs sm:text-sm text-text block leading-tight">
                Rescue Request
              </span>
              <span className="text-[10px] sm:text-[11px] text-text-2 block mt-0.5">
                Boats & ambulances
              </span>
            </div>
          </button>

          {/* Action 3: Emergency Numbers */}
          <button
            onClick={() => { playClickSound(); setIsHelplinesOpen(true); }}
            className="p-3.5 rounded-xl bg-surface/80 hover:bg-surface border border-line hover:border-text-2 text-left transition-all group flex flex-col justify-between shadow-xs cursor-pointer backdrop-blur-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-2 text-text flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs sm:text-sm text-text block leading-tight">
                Emergency 112
              </span>
              <span className="text-[10px] sm:text-[11px] text-text-2 block mt-0.5">
                Helpline & Police
              </span>
            </div>
          </button>

          {/* Action 4: Report Hazard */}
          <button
            onClick={() => { playClickSound(); setIsReportOpen(true); }}
            className="p-3.5 rounded-xl bg-surface/80 hover:bg-surface border border-line hover:border-accent/60 text-left transition-all group flex flex-col justify-between shadow-xs cursor-pointer backdrop-blur-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-mod/15 text-mod flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs sm:text-sm text-text block leading-tight">
                Report Road Hazard
              </span>
              <span className="text-[10px] sm:text-[11px] text-text-2 block mt-0.5">
                Photo in 10s
              </span>
            </div>
          </button>
        </div>

        {/* ── 3. COMPACT SAFETY CHECK-IN BAR ── */}
        <div className="p-3.5 rounded-xl bg-surface/70 border border-line/80 backdrop-blur-sm space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono font-bold text-text-2 uppercase tracking-wide">
              Are you and your family safe?
            </span>
            {checkinTimestamp && (
              <span className="text-[10px] font-mono text-low flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {checkinTimestamp}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCheckin('safe')}
              className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeCheckin === 'safe'
                  ? 'bg-low text-bg border-low shadow-xs font-black'
                  : 'bg-surface-2/80 hover:bg-low/15 border-line text-text hover:text-low'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px]">I am safe</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCheckin('need_help')}
              className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeCheckin === 'need_help'
                  ? 'bg-sos text-white border-sos shadow-xs font-black'
                  : 'bg-surface-2/80 hover:bg-sos/15 border-line text-text hover:text-sos'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px]">Need help</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCheckin('evacuating')}
              className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeCheckin === 'evacuating'
                  ? 'bg-accent text-bg border-accent shadow-xs font-black'
                  : 'bg-surface-2/80 hover:bg-accent/15 border-line text-text hover:text-accent'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px]">Leaving</span>
            </motion.button>
          </div>

          {/* Feedback snack if checkin was made */}
          <AnimatePresence>
            {activeCheckin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-1"
              >
                <div className={`p-2.5 rounded-lg border text-[11px] leading-snug ${
                  activeCheckin === 'safe'
                    ? 'bg-low/10 border-low/30 text-text'
                    : activeCheckin === 'need_help'
                    ? 'bg-sos/10 border-sos/30 text-text'
                    : 'bg-accent/10 border-accent/30 text-text'
                }`}>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>
                      {activeCheckin === 'safe' && '✓ Logged: Safe at Home'}
                      {activeCheckin === 'need_help' && '⚠️ Priority SOS Initiated'}
                      {activeCheckin === 'evacuating' && '🧭 Safe Route Active'}
                    </span>
                    <span className="text-[9px] font-mono text-text-2">{checkinTimestamp}</span>
                  </div>
                  <p className="text-text-2">
                    {activeCheckin === 'safe' && `Command center updated for ${wardName}. Keep powerbanks charged.`}
                    {activeCheckin === 'need_help' && `Emergency dispatch alerted for Ward ${ward.number}. Rescue teams notified.`}
                    {activeCheckin === 'evacuating' && `Heading to ${route?.campName || 'Greenfield Relief Camp'} (~${route?.estimatedWalkMinutes || 12} min walk).`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 4. SMART SEGMENTED TAB HUB (Forecast | Shelter | Checklist) ── */}
        <div className="space-y-3 pt-1">
          {/* Tab Selector Buttons */}
          <div className="flex items-center bg-surface-2/80 p-1 rounded-xl border border-line backdrop-blur-sm">
            <button
              onClick={() => { playClickSound(); setActiveTab('forecast'); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'forecast'
                  ? 'bg-accent text-bg shadow-xs'
                  : 'text-text-2 hover:text-text'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>AI Weather</span>
            </button>

            <button
              onClick={() => { playClickSound(); setActiveTab('shelter'); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'shelter'
                  ? 'bg-accent text-bg shadow-xs'
                  : 'text-text-2 hover:text-text'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Safe Shelter</span>
            </button>

            <button
              onClick={() => { playClickSound(); setActiveTab('checklist'); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-accent text-bg shadow-xs'
                  : 'text-text-2 hover:text-text'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Checklist</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <AnimatePresence mode="wait">
            {activeTab === 'forecast' && (
              <motion.div
                key="tab-forecast"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PhenomenonForecastCard />
              </motion.div>
            )}

            {activeTab === 'shelter' && (
              <motion.div
                key="tab-shelter"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-surface/85 border border-line backdrop-blur-md space-y-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-accent" />
                    <div>
                      <span className="text-[10px] font-mono text-text-2 block uppercase">
                        Nearest Verified Camp
                      </span>
                      <span className="font-heading font-bold text-sm text-text block">
                        {nearestCamp.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
                    12 min walk
                  </span>
                </div>

                {/* Shelter Image Preview */}
                <div className="rounded-xl overflow-hidden border border-line aspect-[21/9] relative shadow-xs">
                  <img 
                    src="./images/citizen_shelter_center.jpg" 
                    alt="Rivergate relief shelter" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex justify-between text-[10px] text-text">
                    <span className="font-medium">Dry High-Ground Arena</span>
                    <span className="text-low font-semibold font-mono">Open & Stocked</span>
                  </div>
                </div>

                {/* Live capacity and supplies */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-surface-2/80 border border-line text-center">
                    <Utensils className="w-3.5 h-3.5 text-accent mx-auto mb-1" />
                    <span className="font-mono font-bold text-xs text-text block">{nearestCamp.foodPackets}</span>
                    <span className="text-[9px] text-text-2 block">Hot meals</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-2/80 border border-line text-center">
                    <Droplet className="w-3.5 h-3.5 text-water mx-auto mb-1" />
                    <span className="font-mono font-bold text-xs text-text block">{nearestCamp.drinkingWaterLiters} L</span>
                    <span className="text-[9px] text-text-2 block">Clean water</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-2/80 border border-line text-center">
                    <HeartPulse className="w-3.5 h-3.5 text-crit mx-auto mb-1" />
                    <span className="font-mono font-bold text-xs text-text block">{nearestCamp.medicalKits}</span>
                    <span className="text-[9px] text-text-2 block">First-aid kits</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsRouteOpen(true)}
                  className="w-full py-2 px-3 rounded-lg bg-accent/15 hover:bg-accent/25 border border-accent/30 text-accent font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate to this Shelter</span>
                </button>
              </motion.div>
            )}

            {activeTab === 'checklist' && (
              <motion.div
                key="tab-checklist"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-surface/85 border border-line backdrop-blur-md space-y-3 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span className="font-heading font-bold text-xs text-text uppercase tracking-wider">
                    Emergency Safety Checklist
                  </span>
                </div>
                <div className="space-y-2">
                  {checklists.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-text-2 bg-surface-2/50 p-2 rounded-lg border border-line/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Modals */}
      <SosRequestModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      <ReportProblemModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <SafeRouteModal isOpen={isRouteOpen} onClose={() => setIsRouteOpen(false)} />
    </div>
  );
};

export default CitizenView;
