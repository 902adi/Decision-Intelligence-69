import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useI18n } from '../../i18n';
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
  Check
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
    showToast,
    setIsHelplinesOpen
  } = useAppStore();

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [activeCheckin, setActiveCheckin] = useState<'safe' | 'need_help' | 'evacuating' | null>(null);
  const [checkinTimestamp, setCheckinTimestamp] = useState<string | null>(null);

  const ward = rivergateWards.find(w => w.id === selectedWardId) || rivergateWards[0];
  const wardRisk = graph.wardRisks[selectedWardId] || { riskScore: 40, riskCategory: 'mod', waterLevelMeters: 0.3 };
  const route = graph.evacuationRoutes[selectedWardId];
  const nearestCamp = rivergateCamps[0]; // Camp B Greenfield Stadium
  const campSupply = graph.campsStatus[nearestCamp.id];

  const wardName = ward.name;

  // Plain-language decisive verdict based on risk category
  let statusBadge = "Safe & Dry";
  let statusColor = 'text-low border-low/40 bg-low/10';
  let patternClass = colorblindSafe ? 'pattern-low' : '';
  let statusExplanation = `Stay indoors — water is safe. All roads around ${wardName} remain clear and dry.`;

  if (wardRisk.riskCategory === 'crit') {
    statusBadge = "Critical Danger";
    statusColor = 'text-crit border-crit/40 bg-crit/15';
    patternClass = colorblindSafe ? 'pattern-crit' : '';
    statusExplanation = `Move to second floor or evacuate to ${route?.campName || 'Relief Camp'} now. Street water is deep (${wardRisk.waterLevelMeters}m).`;
  } else if (wardRisk.riskCategory === 'high') {
    statusBadge = "Rising Water";
    statusColor = 'text-high border-high/40 bg-high/15';
    patternClass = colorblindSafe ? 'pattern-high' : '';
    statusExplanation = `Prepare emergency kit and stay alert. Water is rising on ground floors near ${wardName}.`;
  } else if (wardRisk.riskCategory === 'mod') {
    statusBadge = "Heavy Rain Alert";
    statusColor = 'text-mod border-mod/40 bg-mod/15';
    patternClass = colorblindSafe ? 'pattern-mod' : '';
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
    <div className="relative">
      {/* Ambient background: rain + orbs */}
      <AnimatedBackground rainfallMmH={rainfallMmH} section="citizen" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-28">
        
        {/* 1. GPS Location Tracker Widget */}
        <GpsTrackerWidget onWardLocated={(id) => setSelectedWardId(id)} />

        {/* 2. Interactive Ward Location Slider & Picker */}
        <div className="p-4 bg-surface border border-line rounded-panel shadow-sm space-y-3 card-3d">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text">
                Select Your Area / Ward
              </span>
            </div>
            <span className="text-[10px] font-mono text-accent font-semibold">
              Ward {ward.number}: {ward.name}
            </span>
          </div>

          {/* Horizontal Ward Slider Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-line select-none">
            {rivergateWards.map((w) => {
              const wr = graph.wardRisks[w.id];
              const isSelected = selectedWardId === w.id;
              const isCrit = wr?.riskCategory === 'crit';
              const isHigh = wr?.riskCategory === 'high';
              const isMod = wr?.riskCategory === 'mod';

              return (
                <button
                  key={w.id}
                  onClick={() => { playClickSound(); setSelectedWardId(w.id); }}
                  className={`shrink-0 px-3 py-2 rounded-control border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-w-[125px] ${
                    isSelected
                      ? 'bg-accent/15 border-accent text-accent shadow-sm'
                      : 'bg-surface-2/70 border-line hover:border-accent/40 text-text'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-xs font-bold font-heading">
                      Ward {w.number}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      isCrit ? 'bg-crit animate-pulse' : isHigh ? 'bg-high' : isMod ? 'bg-mod' : 'bg-low'
                    }`} />
                  </div>
                  <span className="text-[10px] text-text-2 truncate max-w-[110px] block mt-0.5">
                    {w.name}
                  </span>
                  <div className="flex items-center justify-between text-[9px] font-mono text-text-2 mt-1 pt-1 border-t border-line/40">
                    <span>{w.elevation}m elev</span>
                    <span className={`font-bold ${isSelected ? 'text-accent' : 'text-text'}`}>
                      {wr?.riskScore || 0}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Direct Dropdown */}
          <div className="pt-1">
            <select
              value={selectedWardId}
              onChange={(e) => { playClickSound(); setSelectedWardId(e.target.value); }}
              className="w-full bg-surface-2 border border-line rounded-control px-3 py-2 text-xs font-semibold text-text focus:outline-none focus:border-accent cursor-pointer"
              aria-label="Select area"
            >
              {rivergateWards.map((w) => (
                <option key={w.id} value={w.id} className="bg-surface text-text">
                  Ward {w.number}: {w.name} ({w.elevation}m elevation &bull; {graph.wardRisks[w.id]?.riskScore || 0}% risk)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. ONE LARGE STATUS CARD IN PLAIN WORDS */}
        <div className={`p-6 sm:p-8 rounded-panel border shadow-calm relative overflow-hidden transition-all duration-300 card-3d ${statusColor} ${patternClass}`}>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider px-3 py-1 rounded-pill bg-surface/85 border border-current font-bold">
                {statusBadge}
              </span>
              <div className="font-mono text-xs opacity-90">
                Risk score: <strong className="text-base font-bold">{wardRisk.riskScore}</strong> / 100
              </div>
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-black leading-snug tracking-tight text-text">
              {statusExplanation}
            </h1>

            {/* Active SOS Tracker banner if citizen already sent SOS */}
            {activeCitizenSos && (
              <div 
                onClick={() => { playClickSound(); setIsSosOpen(true); }}
                className="cursor-pointer p-3.5 rounded-control bg-surface/95 border border-sos text-text flex items-center justify-between gap-3 text-xs shadow-md hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-center gap-2.5">
                  <LifeBuoy className="w-4 h-4 text-sos animate-spin" />
                  <span>Rescue Request Status: <strong className="font-mono uppercase text-sos">{activeCitizenSos.status}</strong></span>
                </div>
                <span className="text-accent underline text-xs font-semibold">Track Live &rarr;</span>
              </div>
            )}
          </div>
        </div>

        {/* ── AI Phenomenon Forecast ── */}
        <PhenomenonForecastCard />

        {/* 4. THREE ACTIONS: Show safe route, Call for help (SOS), Helplines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Action 1: Show Safe Route */}
          <button
            onClick={() => { playClickSound(); setIsRouteOpen(true); }}
            className="p-4 rounded-panel bg-surface hover:bg-surface-2 border border-line hover:border-accent text-left transition-all group flex flex-col justify-between shadow-sm card-3d cursor-pointer"
          >
            <div className="w-10 h-10 rounded-control bg-accent/15 text-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-text block mb-0.5">
                Dry Walking Path
              </span>
              <span className="text-xs text-text-2 block">
                Avoids flooded roads
              </span>
            </div>
          </button>

          {/* Action 2: Call for help (SOS) */}
          <button
            onClick={() => { playClickSound(); setIsSosOpen(true); }}
            className="p-4 rounded-panel bg-surface hover:bg-sos/10 border border-line hover:border-sos text-left transition-all group flex flex-col justify-between shadow-sm card-3d cursor-pointer"
          >
            <div className="w-10 h-10 rounded-control bg-sos/20 text-sos flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-text block mb-0.5">
                Send Rescue Team
              </span>
              <span className="text-xs text-text-2 block">
                Boats & ambulances
              </span>
            </div>
          </button>

          {/* Action 3: Helplines */}
          <button
            onClick={() => { playClickSound(); setIsHelplinesOpen(true); }}
            className="p-4 rounded-panel bg-surface hover:bg-surface-2 border border-line hover:border-text-2 text-left transition-all group flex flex-col justify-between shadow-sm card-3d cursor-pointer"
          >
            <div className="w-10 h-10 rounded-control bg-surface-2 text-text flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-text block mb-0.5">
                Emergency Numbers
              </span>
              <span className="text-xs text-text-2 block">
                Dial 112, 108 or Police
              </span>
            </div>
          </button>
        </div>

        {/* 5. One-tap Community Check-in with Instant Confirmation Display */}
        <div className="p-5 rounded-panel bg-surface border border-line space-y-4 shadow-sm card-3d">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-text-2 uppercase tracking-wider">
              Are you and your family safe right now?
            </span>
            {checkinTimestamp && (
              <span className="text-[10px] font-mono text-low flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated at {checkinTimestamp}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCheckin('safe')}
              className={`py-3 px-2.5 rounded-control border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                activeCheckin === 'safe'
                  ? 'bg-low text-bg border-low shadow-sm font-black'
                  : 'bg-surface-2 hover:bg-low/15 border-line hover:border-low/40 text-text hover:text-low'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I am safe</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCheckin('need_help')}
              className={`py-3 px-2.5 rounded-control border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                activeCheckin === 'need_help'
                  ? 'bg-sos text-white border-sos shadow-sm font-black'
                  : 'bg-surface-2 hover:bg-sos/15 border-line hover:border-sos/40 text-text hover:text-sos'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>I need help</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCheckin('evacuating')}
              className={`py-3 px-2.5 rounded-control border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                activeCheckin === 'evacuating'
                  ? 'bg-accent text-bg border-accent shadow-sm font-black'
                  : 'bg-surface-2 hover:bg-accent/15 border-line hover:border-accent/40 text-text hover:text-accent'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Leaving now</span>
            </motion.button>
          </div>

          {/* Instant Check-in Result Notification Card */}
          <AnimatePresence>
            {activeCheckin && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`p-3.5 rounded-control border text-xs space-y-1.5 ${
                  activeCheckin === 'safe'
                    ? 'bg-low/10 border-low/30 text-text'
                    : activeCheckin === 'need_help'
                    ? 'bg-sos/10 border-sos/30 text-text'
                    : 'bg-accent/10 border-accent/30 text-text'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {activeCheckin === 'safe' && <Check className="w-4 h-4 text-low" />}
                    {activeCheckin === 'need_help' && <AlertTriangle className="w-4 h-4 text-sos" />}
                    {activeCheckin === 'evacuating' && <Navigation className="w-4 h-4 text-accent" />}
                    {activeCheckin === 'safe' && 'Status Logged: Safe at Home'}
                    {activeCheckin === 'need_help' && 'Priority Rescue Request Initiated'}
                    {activeCheckin === 'evacuating' && 'Evacuation Path Active'}
                  </span>
                  <span className="font-mono text-[10px] text-text-2">{checkinTimestamp}</span>
                </div>

                <p className="text-[11px] text-text-2 leading-relaxed">
                  {activeCheckin === 'safe' &&
                    `Recorded in Rivergate Emergency Command. Keep phone charged and monitor rain updates for ${wardName}.`}
                  {activeCheckin === 'need_help' &&
                    `Command Room notified for Ward ${ward.number}. Rescue boats and swiftwater units are on high alert.`}
                  {activeCheckin === 'evacuating' &&
                    `Follow the dry elevated path to ${route?.campName || 'Greenfield Relief Camp'}. Average walk: ${route?.estimatedWalkMinutes || 12} mins.`}
                </p>

                {activeCheckin === 'need_help' && (
                  <button
                    onClick={() => setIsSosOpen(true)}
                    className="mt-1 px-3 py-1 rounded bg-sos text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Fill Rescue Details (People & Vulnerable)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {activeCheckin === 'evacuating' && (
                  <button
                    onClick={() => setIsRouteOpen(true)}
                    className="mt-1 px-3 py-1 rounded bg-accent text-bg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Safe Evacuation Walking Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. Report a Problem Trigger */}
        <div 
          onClick={() => { playClickSound(); setIsReportOpen(true); }}
          className="cursor-pointer p-4 rounded-panel bg-surface hover:bg-surface-2 border border-line hover:border-accent/50 transition-colors flex items-center justify-between shadow-sm card-3d"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-control bg-accent/10 text-accent flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-text block">
                Report a Flooded Street or Roadblock
              </span>
              <span className="text-xs text-text-2 block">
                Takes 10 seconds &bull; Helps your neighbors & rescue teams
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-2" />
        </div>

        {/* 7. Community Relief Camp Shelter Card */}
        <div className="p-5 rounded-panel bg-surface border border-line shadow-sm space-y-4 card-3d">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent" />
              <div>
                <span className="text-[11px] font-mono text-text-2 block uppercase">
                  Nearest Safe Community Shelter
                </span>
                <span className="font-heading font-bold text-base text-text block">
                  {nearestCamp.name}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-accent">
              12 min walk
            </span>
          </div>

          {/* Shelter Image Preview */}
          <div className="rounded-control overflow-hidden border border-line aspect-[21/9] relative shadow-md">
            <img 
              src="./images/citizen_shelter_center.jpg" 
              alt="Rivergate community relief shelter and medical aid center" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[11px] text-text">
              <span className="font-medium">Indoor dry high-ground arena &bull; Medical desk on site</span>
              <span className="text-low font-semibold font-mono">Open & Fully Stocked</span>
            </div>
          </div>

          {/* Live capacity and supplies */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-control bg-surface-2 border border-line">
              <span className="text-[11px] text-text-2 block mb-0.5 font-medium">Food Packets</span>
              <span className="font-mono font-bold text-sm text-text">{nearestCamp.foodPackets}</span>
              <span className="text-[10px] text-text-2 block">free hot meals</span>
            </div>
            <div className="p-3 rounded-control bg-surface-2 border border-line">
              <span className="text-[11px] text-text-2 block mb-0.5 font-medium">Clean Water</span>
              <span className="font-mono font-bold text-sm text-text">{nearestCamp.drinkingWaterLiters} L</span>
              <span className="text-[10px] text-text-2 block">sealed bottles</span>
            </div>
            <div className="p-3 rounded-control bg-surface-2 border border-line">
              <span className="text-[11px] text-text-2 block mb-0.5 font-medium">Medicines</span>
              <span className="font-mono font-bold text-sm text-text">{nearestCamp.medicalKits}</span>
              <span className="text-[10px] text-text-2 block">first-aid ready</span>
            </div>
          </div>
        </div>

        {/* 8. Emergency Checklist */}
        <div className="p-5 rounded-panel bg-surface border border-line shadow-sm space-y-3 card-3d">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="font-heading font-bold text-xs text-text uppercase tracking-wider">
              Emergency Safety Checklist
            </span>
          </div>
          <div className="space-y-2">
            {checklists.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-text-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modals */}
      <SosRequestModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      <ReportProblemModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <SafeRouteModal isOpen={isRouteOpen} onClose={() => setIsRouteOpen(false)} />
    </div>
  );
};
