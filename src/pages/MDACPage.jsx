import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Bus,
  CarFront,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Download,
  Home,
  Plane,
  Save,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Trash2,
  Upload,
  Users,
  Waves,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const tripTypes = [
  { title: 'Weekend Trip', icon: CarFront, accent: '#0f766e', emoji: '🚗' },
  { title: 'Same-day Trip', icon: CarFront, accent: '#2563eb', emoji: '🚗' },
  { title: 'Flight', icon: Plane, accent: '#7c3aed', emoji: '✈️' },
  { title: 'Bus', icon: Bus, accent: '#ea580c', emoji: '🚌' },
  { title: 'Train', icon: TrainFront, accent: '#0891b2', emoji: '🚆' },
  { title: 'Ferry', icon: Waves, accent: '#0f766e', emoji: '⛴' },
  { title: 'Custom', icon: Sparkles, accent: '#4b5563', emoji: '⚙️' },
];

const wizardSteps = [
  'Choose Trip',
  'Review Details',
  'Prepare MDAC',
  'Open MDAC',
  'Run Shortcut',
  'Submit',
];

const navItems = [
  { label: 'Home', icon: Home },
  { label: 'Trips', icon: Briefcase },
  { label: 'Travellers', icon: Users },
  { label: 'Settings', icon: Settings },
];

const APP_URL = 'https://andrewpatterson-cloud.github.io/mdac-express/';

const initialTraveller = {
  id: 'traveller-1',
  name: 'Andrew Patterson',
  passportNumber: '',
  dateOfBirth: '',
  nationality: 'United States',
  placeOfBirth: '',
  sex: '',
  passportExpiry: '',
  email: '',
  phoneCountryCode: '+1',
  mobile: '',
};

const loadStored = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPassportLabel = (traveller) => {
  if (!traveller?.nationality) return 'Passport';
  const flags = {
    'United States': '🇺🇸',
    Singapore: '🇸🇬',
    Malaysia: '🇲🇾',
  };
  const flag = flags[traveller.nationality] || '🛂';
  return `${flag} ${traveller.nationality} Passport`;
};

const getTripDefaults = (tripTitle, previousTrip = null) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const base = {
    arrivalDate: previousTrip?.arrivalDate || toInputDate(today),
    departureDate: previousTrip?.departureDate || toInputDate(today),
    transportNumber: previousTrip?.transportNumber || '',
    tripLength: previousTrip?.tripLength || 'Overnight',
    lastPort: previousTrip?.lastPort || 'Singapore',
    modeOfTravel: 'Custom',
    address1: previousTrip?.address1 || '',
    address2: previousTrip?.address2 || '',
    state: previousTrip?.state || '',
    city: previousTrip?.city || '',
    postcode: previousTrip?.postcode || '',
  };

  if (tripTitle === 'Weekend Trip') {
    return {
      ...base,
      departureDate: previousTrip?.departureDate || toInputDate(tomorrow),
      tripLength: previousTrip?.tripLength || 'Overnight',
      modeOfTravel: 'Land',
    };
  }

  if (tripTitle === 'Same-day Trip') {
    return {
      ...base,
      tripLength: previousTrip?.tripLength || 'Same day',
      modeOfTravel: 'Land',
    };
  }

  if (tripTitle === 'Flight') return { ...base, modeOfTravel: 'Air', departureDate: previousTrip?.departureDate || toInputDate(tomorrow) };
  if (tripTitle === 'Bus') return { ...base, modeOfTravel: 'Bus' };
  if (tripTitle === 'Train') return { ...base, modeOfTravel: 'Rail' };
  if (tripTitle === 'Ferry') return { ...base, modeOfTravel: 'Sea' };
  return { ...base, modeOfTravel: 'Custom' };
};

const getTransportLabel = (tripTitle) => {
  switch (tripTitle) {
    case 'Flight':
      return 'Flight number';
    case 'Bus':
      return 'Bus or transport number';
    case 'Train':
      return 'Train or transport number';
    case 'Ferry':
      return 'Ferry or vessel number';
    default:
      return 'Transport number';
  }
};

export default function MDACPage() {
  const [view, setView] = useState('home');
  const [travellers, setTravellers] = useState(() => loadStored('mdac-travellers', [initialTraveller]));
  const [defaultTravellerId, setDefaultTravellerId] = useState(() => loadStored('mdac-default-traveller', initialTraveller.id));
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripForm, setTripForm] = useState(() => {
    const savedTrip = loadStored('mdac-last-trip-details', null);
    return getTripDefaults('Weekend Trip', savedTrip);
  });
  const [wizardStep, setWizardStep] = useState(0);
  const [travellerForm, setTravellerForm] = useState({ ...initialTraveller, id: crypto.randomUUID ? crypto.randomUUID() : `traveller-${Date.now()}` });
  const [showTravellerForm, setShowTravellerForm] = useState(false);
  const [editingTravellerId, setEditingTravellerId] = useState(null);
  const [preparedPayloads, setPreparedPayloads] = useState(() => loadStored('mdac-payloads', []));
  const [autofillMessage, setAutofillMessage] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 900 : false));
  const [detailsPrepared, setDetailsPrepared] = useState(false);
  const [mdacOpened, setMdacOpened] = useState(false);
  const [shortcutRun, setShortcutRun] = useState(false);
  const [submitComplete, setSubmitComplete] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mdac-travellers', JSON.stringify(travellers));
    }
  }, [travellers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mdac-default-traveller', JSON.stringify(defaultTravellerId));
    }
  }, [defaultTravellerId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mdac-payloads', JSON.stringify(preparedPayloads));
    }
  }, [preparedPayloads]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mdac-last-trip-details', JSON.stringify(tripForm));
    }
  }, [tripForm]);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const defaultTraveller = useMemo(() => {
    return travellers.find((traveller) => traveller.id === defaultTravellerId) || travellers[0] || null;
  }, [travellers, defaultTravellerId]);

  const isDestinationTrip = selectedTrip && ['Weekend Trip', 'Same-day Trip'].includes(selectedTrip.title);

  const validationIssues = useMemo(() => {
    const issues = [];

    if (!defaultTraveller) {
      issues.push('Add a traveller profile');
    } else {
      if (!defaultTraveller.passportNumber?.trim()) issues.push('Passport number is required');
      if (!defaultTraveller.passportExpiry?.trim()) issues.push('Passport expiry is required');
      if (!defaultTraveller.email?.trim()) issues.push('Email is required');
      if (!defaultTraveller.mobile?.trim()) issues.push('Mobile number is required');
    }

    if (!tripForm.arrivalDate) issues.push('Arrival date is required');
    if (!tripForm.departureDate) issues.push('Departure date is required');

    const arrivalDate = tripForm.arrivalDate ? new Date(`${tripForm.arrivalDate}T00:00:00`) : null;
    const departureDate = tripForm.departureDate ? new Date(`${tripForm.departureDate}T00:00:00`) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (arrivalDate && arrivalDate < today) issues.push('Arrival date cannot be in the past');
    if (arrivalDate && departureDate && departureDate < arrivalDate) issues.push('Departure date cannot be before arrival');
    if (!['Weekend Trip', 'Same-day Trip', 'Custom'].includes(selectedTrip?.title || '') && !tripForm.transportNumber?.trim()) {
      issues.push('Transport number is required');
    }

    if (isDestinationTrip) {
      if (!tripForm.address1?.trim()) issues.push('Destination address line 1 is required');
      if (!tripForm.address2?.trim()) issues.push('Destination address line 2 is required');
      if (!tripForm.state?.trim()) issues.push('Destination state is required');
      if (!tripForm.city?.trim()) issues.push('Destination city is required');
      if (!tripForm.postcode?.trim()) issues.push('Destination postcode is required');
    }

    return issues;
  }, [defaultTraveller, tripForm, isDestinationTrip]);

  const passportWarning = useMemo(() => {
    if (!defaultTraveller?.passportExpiry) return false;
    const expiryDate = new Date(`${defaultTraveller.passportExpiry}T00:00:00`);
    const warningWindow = new Date();
    warningWindow.setMonth(warningWindow.getMonth() + 6);
    return expiryDate <= warningWindow;
  }, [defaultTraveller]);

  const travellerReady = useMemo(() => {
    if (!defaultTraveller) return false;
    return Boolean(defaultTraveller.passportNumber?.trim() && defaultTraveller.passportExpiry?.trim() && defaultTraveller.email?.trim() && defaultTraveller.mobile?.trim());
  }, [defaultTraveller]);

  const tripReady = Boolean(selectedTrip);
  const validationReady = validationIssues.length === 0;

  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    setTripForm(getTripDefaults(trip.title, tripForm));
    setWizardStep(0);
    setAutofillMessage('');
    setDetailsPrepared(false);
    setMdacOpened(false);
    setShortcutRun(false);
    setSubmitComplete(false);
  };

  const handleGeneratePayload = () => {
    if (!defaultTraveller) {
      setAutofillMessage('Add a traveller before preparing your details.');
      return;
    }

    const payload = {
      traveller: defaultTraveller,
      trip: {
        type: selectedTrip?.title || 'Custom',
        ...tripForm,
      },
    };

    const preparedPayload = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      traveller: defaultTraveller,
      trip: payload.trip,
    };

    setPreparedPayloads((current) => [preparedPayload, ...current].slice(0, 8));
    setDetailsPrepared(true);
    setAutofillMessage('Your MDAC details are ready.');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    }
    setWizardStep(3);
  };

  const handleOpenMdac = () => {
    window.open('https://mdac.imi.gov.my/', '_blank', 'noopener,noreferrer');
    setMdacOpened(true);
    setShortcutRun(false);
    setWizardStep(4);
  };

  const handleNextStep = () => {
    if (wizardStep < wizardSteps.length - 1) {
      setWizardStep((current) => current + 1);
      if (wizardStep === 4) {
        setShortcutRun(true);
      }
      if (wizardStep === 6) {
        setSubmitComplete(true);
      }
    }
  };

  const handleRestart = () => {
    setSelectedTrip(null);
    setTripForm(getTripDefaults('Weekend Trip'));
    setWizardStep(0);
    setAutofillMessage('');
    setDetailsPrepared(false);
    setMdacOpened(false);
    setShortcutRun(false);
    setSubmitComplete(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: APP_URL });
        setShareMessage('Shared the app link.');
      } catch {
        setShareMessage('Share cancelled.');
      }
    } else {
      setShareMessage('Sharing is not available on this device.');
    }
  };

  const handleExportBackup = () => {
    const backup = {
      travellers,
      defaultTravellerId,
      preparedPayloads,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mdac-express-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    setImportMessage('Backup exported.');
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.travellers) setTravellers(parsed.travellers);
      if (parsed.defaultTravellerId) setDefaultTravellerId(parsed.defaultTravellerId);
      if (parsed.preparedPayloads) setPreparedPayloads(parsed.preparedPayloads);
      setImportMessage('Backup imported.');
    } catch {
      setImportMessage('That file could not be imported.');
    }
    event.target.value = '';
  };

  const handleClearLocalData = () => {
    if (window.confirm('Clear all local MDAC data?')) {
      window.localStorage.removeItem('mdac-travellers');
      window.localStorage.removeItem('mdac-default-traveller');
      window.localStorage.removeItem('mdac-payloads');
      setTravellers([initialTraveller]);
      setDefaultTravellerId(initialTraveller.id);
      setPreparedPayloads([]);
      setImportMessage('Local data cleared.');
    }
  };

  const resetTravellerForm = () => {
    setTravellerForm({
      ...initialTraveller,
      id: crypto.randomUUID ? crypto.randomUUID() : `traveller-${Date.now()}`,
    });
    setEditingTravellerId(null);
    setShowTravellerForm(true);
  };

  const handleSaveTraveller = () => {
    if (!travellerForm.name?.trim() || !travellerForm.passportNumber?.trim()) return;

    if (editingTravellerId) {
      setTravellers((current) => current.map((traveller) => (traveller.id === editingTravellerId ? { ...traveller, ...travellerForm } : traveller)));
    } else {
      const newTraveller = {
        ...travellerForm,
        id: crypto.randomUUID ? crypto.randomUUID() : `traveller-${Date.now()}`,
      };
      setTravellers((current) => [newTraveller, ...current]);
      setDefaultTravellerId(newTraveller.id);
    }

    setShowTravellerForm(false);
    setEditingTravellerId(null);
  };

  const handleEditTraveller = (traveller) => {
    setTravellerForm({ ...traveller });
    setEditingTravellerId(traveller.id);
    setShowTravellerForm(true);
  };

  const handleDeleteTraveller = (travellerId) => {
    setTravellers((current) => current.filter((traveller) => traveller.id !== travellerId));
    if (defaultTravellerId === travellerId) {
      setDefaultTravellerId(travellers[0]?.id || initialTraveller.id);
    }
  };

  const handleSetDefaultTraveller = (travellerId) => {
    setDefaultTravellerId(travellerId);
  };

  const renderHome = () => {
    const checklistItems = [
      { label: 'Traveller', done: travellerReady },
      { label: 'Trip', done: tripReady },
      { label: 'Validation', done: validationReady },
      { label: 'MDAC prepared', done: detailsPrepared },
      { label: 'Install Shortcut', done: shortcutRun },
      { label: 'Open MDAC', done: mdacOpened },
      { label: 'Run Shortcut', done: shortcutRun },
      { label: 'Complete CAPTCHA', done: submitComplete },
      { label: 'Submit', done: submitComplete },
    ];

    return (
      <>
        <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '24px', padding: '10px 12px 12px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(220,38,38,0.08) 0%, rgba(37,99,235,0.06) 50%, rgba(250,204,21,0.08) 100%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)', background: '#fff', fontSize: '22px' }}>🇲🇾</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#111827' }}>MDAC Express</h1>
                <button onClick={() => setView('help')} style={{ border: 'none', background: '#f3f4f6', color: '#374151', borderRadius: '999px', padding: '2px 7px', fontSize: '12px', fontWeight: 700 }} aria-label="How MDAC Express works"><CircleHelp size={14} /></button>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>Prepare your Malaysia Digital Arrival Card in under a minute.</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4b5563', lineHeight: 1.4 }}>Store your traveller details once and reuse them every trip.</p>
            </div>
            <button type="button" onClick={handleShare} style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: '999px', padding: '7px 10px', fontSize: '12px', fontWeight: 700 }} aria-label="Share MDAC Express">
              <Share2 size={14} />
            </button>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f3f4f6', color: '#374151', borderRadius: '999px', padding: '6px 10px', fontSize: '12px', fontWeight: 700, border: '1px solid #e5e7eb', marginTop: '4px', position: 'relative', zIndex: 1 }}>
            <Sparkles size={14} />Average setup time: under 1 minute
          </div>

          {shareMessage ? <div style={{ marginTop: '8px', color: '#374151', fontSize: '12px', position: 'relative', zIndex: 1 }}>{shareMessage}</div> : null}
        </section>

        <section style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '20px', padding: '14px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Current traveller</h3>
            <button onClick={() => setView('travellers')} style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 700, padding: 0 }}>Edit</button>
          </div>

          <button type="button" onClick={() => setView('travellers')} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '16px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {defaultTraveller?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'AP'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{defaultTraveller?.name || 'No traveller selected'}</div>
                <div style={{ fontSize: '12px', color: '#374151' }}>{defaultTraveller ? getPassportLabel(defaultTraveller) : 'Add passport details'}</div>
              </div>
            </div>
            <ChevronRight size={18} color="#6b7280" />
          </button>

          <div style={{ marginTop: '10px', fontSize: '13px', color: '#374151', fontWeight: 600 }}>Passport expiry: {defaultTraveller?.passportExpiry || 'Add expiry'}</div>
          {passportWarning ? (
            <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '12px', background: '#fff7ed', color: '#9a2c00', fontSize: '12px', lineHeight: 1.4, border: '1px solid rgba(154,44,0,0.12)' }}>
              Passport expires within 6 months. Check entry requirements before travelling.
            </div>
          ) : null}
        </section>

        <section style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '20px', padding: '14px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Trip</h3>
            <span style={{ fontSize: '12px', color: '#374151' }}>Pick one to begin</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tripTypes.map(({ title, accent, emoji }) => {
              const selected = selectedTrip && selectedTrip.title === title;
              return (
                <button key={title} onClick={() => handleSelectTrip({ title, accent, emoji })} style={{ border: selected ? '1px solid #2563eb' : '1px solid #d1d5db', borderRadius: '999px', padding: '10px 12px', background: selected ? '#eff6ff' : '#ffffff', boxShadow: '0 6px 14px rgba(15, 23, 42, 0.04)', display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#111827', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ color: accent, display: 'inline-flex', alignItems: 'center' }}>{emoji}</span>
                  <span>{title}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ padding: '2px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', color: '#374151', fontWeight: 700 }}>Progress</div>
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {wizardSteps.map((step, index) => {
              const isComplete = index < wizardStep;
              const isActive = index === wizardStep;
              const isFuture = index > wizardStep;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '12px', background: isComplete ? '#f0fdf4' : isActive ? '#eff6ff' : '#f3f4f6', border: isActive ? '1px solid #bfdbfe' : isComplete ? '1px solid #bbf7d0' : '1px solid #e5e7eb' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isComplete ? '#166534' : isActive ? '#2563eb' : '#e5e7eb', color: isComplete || isActive ? '#fff' : '#9ca3af' }}>
                    {isComplete ? <CheckCircle2 size={14} /> : <span style={{ fontSize: '11px', fontWeight: 800 }}>{index + 1}</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: isComplete ? '#166534' : isActive ? '#2563eb' : isFuture ? '#9ca3af' : '#6b7280', fontWeight: 700 }}>{step}</div>
                </div>
              );
            })}
          </div>
        </section>

        {selectedTrip ? (
          <section style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '20px', padding: '14px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Trip setup</div>
                <h3 style={{ margin: '2px 0 0', fontSize: '16px', color: '#111827' }}>{selectedTrip.title}</h3>
              </div>
              <div style={{ color: selectedTrip.accent, fontSize: '16px' }}>{selectedTrip.emoji}</div>
            </div>

            {wizardStep === 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ padding: '10px 12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Template ready</div>
                  <div style={{ marginTop: '4px', fontWeight: 700, color: '#111827' }}>{selectedTrip.title}</div>
                </div>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Review the details and continue when you're ready.</div>
              </div>
            ) : null}

            {wizardStep === 1 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>
                    Arrival date
                    <input type="date" value={tripForm.arrivalDate} onChange={(event) => setTripForm((current) => ({ ...current, arrivalDate: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
                  </label>
                  <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>
                    Departure date
                    <input type="date" value={tripForm.departureDate} onChange={(event) => setTripForm((current) => ({ ...current, departureDate: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
                  </label>
                </div>
                {['Weekend Trip', 'Same-day Trip'].includes(selectedTrip.title) ? (
                  <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>
                    Trip length
                    <select value={tripForm.tripLength} onChange={(event) => setTripForm((current) => ({ ...current, tripLength: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }}>
                      <option value="Overnight">Overnight</option>
                      <option value="Same day">Same day</option>
                    </select>
                  </label>
                ) : null}
                <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>
                  {getTransportLabel(selectedTrip.title)}
                  <input value={tripForm.transportNumber} onChange={(event) => setTripForm((current) => ({ ...current, transportNumber: event.target.value }))} placeholder={selectedTrip.title === 'Flight' ? 'e.g. SQ123' : selectedTrip.title === 'Bus' ? 'e.g. 1234' : selectedTrip.title === 'Train' ? 'e.g. ETS' : selectedTrip.title === 'Ferry' ? 'e.g. MV Express' : 'e.g. VJ1234'} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
                </label>
                <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>
                  Last port
                  <input value={tripForm.lastPort} onChange={(event) => setTripForm((current) => ({ ...current, lastPort: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
                </label>
                <div style={{ padding: '10px 12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Mode of travel</div>
                  <div style={{ marginTop: '4px', fontWeight: 700, color: '#111827' }}>{tripForm.modeOfTravel}</div>
                </div>
              </div>
            ) : null}

            {wizardStep === 2 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {validationIssues.length === 0 ? (
                  <div style={{ padding: '12px', borderRadius: '12px', background: '#f0fdf4', color: '#166534', border: '1px solid rgba(22,101,52,0.16)' }}>
                    <div style={{ fontWeight: 700 }}>Everything looks ready</div>
                    <div style={{ marginTop: '4px', fontSize: '13px' }}>Your traveller and trip details are in good shape.</div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', borderRadius: '12px', background: '#fff7ed', color: '#9a2c00', border: '1px solid rgba(154,44,0,0.12)' }}>
                    <div style={{ fontWeight: 700 }}>{validationIssues.length} things need attention</div>
                    <ul style={{ margin: '8px 0 0 16px', padding: 0, fontSize: '13px', lineHeight: 1.5 }}>
                      {validationIssues.map((issue) => <li key={issue}>{issue}</li>)}
                    </ul>
                  </div>
                )}
                {isDestinationTrip ? (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Destination address line 1<input value={tripForm.address1} onChange={(event) => setTripForm((current) => ({ ...current, address1: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} /></label>
                    <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Destination address line 2<input value={tripForm.address2} onChange={(event) => setTripForm((current) => ({ ...current, address2: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} /></label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>State<input value={tripForm.state} onChange={(event) => setTripForm((current) => ({ ...current, state: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} /></label>
                      <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>City<input value={tripForm.city} onChange={(event) => setTripForm((current) => ({ ...current, city: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} /></label>
                    </div>
                    <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Postcode<input value={tripForm.postcode} onChange={(event) => setTripForm((current) => ({ ...current, postcode: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} /></label>
                  </div>
                ) : null}
              </div>
            ) : null}

            {wizardStep === 3 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: '#f0fdf4', color: '#166534', border: '1px solid rgba(22,101,52,0.16)' }}>
                  <div style={{ fontWeight: 700 }}>✅ Your MDAC details are ready.</div>
                  <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>Next:</div>
                    <ol style={{ margin: '0 0 0 16px', padding: 0, display: 'grid', gap: '4px' }}>
                      <li>Open the official MDAC website.</li>
                      <li>Tap Safari's Share button.</li>
                      <li>Choose Fill MDAC.</li>
                      <li>Review the completed form.</li>
                      <li>Complete the CAPTCHA.</li>
                      <li>Submit.</li>
                    </ol>
                  </div>
                </div>
                <button type="button" onClick={handleOpenMdac} style={{ border: 'none', borderRadius: '14px', padding: '12px 14px', background: '#0f6fff', color: 'white', fontWeight: 700, fontSize: '15px' }}>
                  Open Official MDAC
                </button>
                <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>Opens the official Malaysia Digital Arrival Card website in Safari, where the Fill MDAC Shortcut completes the form.</div>
              </div>
            ) : null}

            {wizardStep === 4 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#111827' }}><Share2 size={16} />Next step</div>
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Tap the Safari Share button, then choose Fill MDAC.</div>
                </div>
              </div>
            ) : null}

            {wizardStep === 5 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 700, color: '#111827' }}>Run Safari Shortcut</div>
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Use the Share Sheet and choose Fill MDAC to populate the official website.</div>
                </div>
              </div>
            ) : null}

            {wizardStep === 6 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 700, color: '#111827' }}>Submit</div>
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Review the completed form, finish the CAPTCHA, and submit on the official website.</div>
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '14px' }}>
              <button type="button" onClick={() => setWizardStep((current) => Math.max(0, current - 1))} style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '10px 12px', fontWeight: 700 }}>Back</button>
              {wizardStep === 3 ? null : (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 2 && validationIssues.length > 0) {
                      return;
                    }
                    if (wizardStep === 2) {
                      handleGeneratePayload();
                      return;
                    }
                    if (wizardStep === 4) {
                      setShortcutRun(true);
                      setWizardStep(5);
                      return;
                    }
                    if (wizardStep === 5) {
                      setWizardStep(6);
                      return;
                    }
                    if (wizardStep === 6) {
                      setSubmitComplete(true);
                      return;
                    }
                    handleNextStep();
                  }}
                  style={{ flex: 1, border: 'none', borderRadius: '999px', background: '#0f6fff', color: '#fff', padding: '10px 12px', fontWeight: 700 }}
                >
                  {wizardStep === 0 ? 'Continue' : wizardStep === 1 ? 'Continue' : wizardStep === 2 ? (validationIssues.length === 0 ? 'Prepare MDAC' : 'Review details') : wizardStep === 4 ? 'Continue' : wizardStep === 5 ? 'Continue' : 'Submit'}
                </button>
              )}
            </div>
          </section>
        ) : null}

        <section style={{ padding: '2px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={16} color="#374151" />
            <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>🔒 Your data never leaves this device. MDAC Express stores your information locally in your browser.</span>
          </div>
          <div style={{ display: 'grid', gap: '8px', padding: '12px', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb' }}>
            {checklistItems.map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: item.done ? '#166534' : '#374151', fontWeight: 700 }}>
                {item.done ? <CheckCircle2 size={15} /> : <span style={{ width: '15px', height: '15px', borderRadius: '999px', border: '1px solid #d1d5db' }} />} {item.label}
              </div>
            ))}
          </div>
        </section>

        {submitComplete ? (
          <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '24px', padding: '18px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb', display: 'grid', gap: '12px' }}>
            <div style={{ fontSize: '28px' }}>🎉</div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>MDAC Ready</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>Have a great trip to Malaysia!</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handleRestart} style={{ border: 'none', borderRadius: '999px', background: '#0f6fff', color: '#fff', padding: '10px 14px', fontWeight: 700 }}>Prepare another trip</button>
              <button onClick={() => setSubmitComplete(false)} style={{ border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '10px 14px', fontWeight: 700 }}>Done</button>
            </div>
          </section>
        ) : null}

        {showHowItWorks ? (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
            <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)', border: '1px solid #e5e7eb', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>How MDAC Express works</h3>
                <button onClick={() => setShowHowItWorks(false)} style={{ border: 'none', background: 'transparent', color: '#374151', fontWeight: 700 }}>Close</button>
              </div>
              <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {`MDAC Express saves your traveller details and trip preferences securely on this device using your browser's local storage.

Nothing is uploaded to any server and nothing is stored in the cloud unless you choose to export your data yourself.

When you're ready, MDAC Express prepares your information for the Safari "Fill MDAC" Shortcut.

The Shortcut opens the official Malaysia Digital Arrival Card website and fills in as many supported fields as possible.

Always review the completed form, complete the CAPTCHA and submit it yourself.

Your information remains on this device until you clear your browser data, use the app's Clear Data option or switch browsers or devices.`}
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const renderTravellers = () => (
    <div style={{ display: 'grid', gap: '14px' }}>
      <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '24px', padding: '16px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Travellers</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#374151' }}>Save and manage the travellers you use for MDAC.</p>
          </div>
          <button onClick={resetTravellerForm} style={{ border: 'none', borderRadius: '999px', background: '#0f6fff', color: '#fff', padding: '8px 12px', fontWeight: 700 }}>Add</button>
        </div>

        {showTravellerForm ? (
          <div style={{ display: 'grid', gap: '8px', padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <input value={travellerForm.name || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
            <input value={travellerForm.passportNumber || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, passportNumber: event.target.value }))} placeholder="Passport number" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
            <input type="date" value={travellerForm.dateOfBirth || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, dateOfBirth: event.target.value }))} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
            <input value={travellerForm.nationality || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, nationality: event.target.value }))} placeholder="Nationality" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
            <input value={travellerForm.placeOfBirth || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, placeOfBirth: event.target.value }))} placeholder="Place of birth" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
            <input value={travellerForm.sex || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, sex: event.target.value }))} placeholder="Sex" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
            <input type="date" value={travellerForm.passportExpiry || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, passportExpiry: event.target.value }))} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
            <input value={travellerForm.email || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '8px' }}>
              <input value={travellerForm.phoneCountryCode || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, phoneCountryCode: event.target.value }))} placeholder="Code" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
              <input value={travellerForm.mobile || ''} onChange={(event) => setTravellerForm((current) => ({ ...current, mobile: event.target.value }))} placeholder="Mobile" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSaveTraveller} style={{ border: 'none', borderRadius: '999px', background: '#0f6fff', color: '#fff', padding: '8px 12px', fontWeight: 700 }}><Save size={14} style={{ marginRight: '6px' }} />Save</button>
              <button onClick={() => { setShowTravellerForm(false); setEditingTravellerId(null); }} style={{ border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '8px 12px', fontWeight: 700 }}>Cancel</button>
            </div>
          </div>
        ) : null}

        <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
          {travellers.map((traveller) => (
            <div key={traveller.id} style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '12px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{traveller.name?.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{traveller.name}</div>
                    <div style={{ fontSize: '12px', color: '#374151' }}>{traveller.passportNumber}</div>
                  </div>
                </div>
                {defaultTravellerId === traveller.id ? <span style={{ borderRadius: '999px', background: '#f0fdf4', color: '#166534', padding: '4px 8px', fontSize: '11px', fontWeight: 700 }}>Default</span> : null}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button onClick={() => handleSetDefaultTraveller(traveller.id)} style={{ border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '6px 10px', fontSize: '12px', fontWeight: 700 }}>Set default</button>
                <button onClick={() => handleEditTraveller(traveller)} style={{ border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '6px 10px', fontSize: '12px', fontWeight: 700 }}>Edit</button>
                <button onClick={() => handleDeleteTraveller(traveller.id)} style={{ border: '1px solid #ef4444', borderRadius: '999px', background: '#fff', padding: '6px 10px', fontSize: '12px', fontWeight: 700, color: '#ef4444' }}><Trash2 size={12} style={{ marginRight: '4px' }} />Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderTrips = () => (
    <div style={{ display: 'grid', gap: '14px' }}>
      <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '24px', padding: '16px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: '#111827' }}>Trips</h2>
        <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#374151' }}>Recent trip preparations on this device.</p>
        {preparedPayloads.length === 0 ? <div style={{ padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e5e7eb', color: '#374151' }}>No trips prepared yet.</div> : null}
        <div style={{ display: 'grid', gap: '10px' }}>
          {preparedPayloads.map((payload) => (
            <div key={payload.id} style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '12px', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>{payload.trip.type}</div>
                <div style={{ fontSize: '12px', color: '#374151' }}>{new Date(payload.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ fontSize: '13px', color: '#374151' }}>{payload.traveller.name} • {payload.trip.transportNumber || 'No transport number'}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderSettings = () => (
    <div style={{ display: 'grid', gap: '14px' }}>
      <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '24px', padding: '16px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#111827' }}>Settings</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Trip defaults</div>
            <div style={{ fontSize: '13px', color: '#374151' }}>Weekend Trip uses a next-day departure, land travel, and your destination address details.</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Supported devices and browsers</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>MDAC Express works on iPhone using Safari (recommended), iPad using Safari, and Mac or Windows PCs using Safari, Chrome, Edge or Firefox for managing travellers and trip templates. The full autofill experience currently requires Safari on iPhone.</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Privacy</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Your traveller information is stored locally on this device. MDAC Express does not upload your traveller information to external servers.</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '6px' }}>About</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Created by <a href="https://www.linkedin.com/in/andrewpatterson1/" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700 }}>Andrew Patterson</a></div>
            <div style={{ marginTop: '6px', fontSize: '13px', color: '#374151' }}>Version number: 1.0</div>
            <div style={{ fontSize: '13px', color: '#374151' }}>Last updated: 2026-07-05</div>
            <div style={{ fontSize: '13px', color: '#374151' }}>Privacy</div>
            <div style={{ fontSize: '13px', color: '#374151' }}>Feedback</div>
            <button onClick={handleShare} style={{ marginTop: '8px', border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '8px 12px', fontWeight: 700 }}>Share MDAC Express</button>
          </div>
          <button onClick={handleExportBackup} style={{ border: '1px solid #d1d5db', borderRadius: '14px', padding: '10px 12px', background: '#fff', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start', fontWeight: 700 }}><Download size={16} />Export backup</button>
          <label style={{ border: '1px solid #d1d5db', borderRadius: '14px', padding: '10px 12px', background: '#fff', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start', fontWeight: 700, cursor: 'pointer' }}><Upload size={16} />Import backup<input type="file" accept="application/json" onChange={handleImportBackup} style={{ display: 'none' }} /></label>
          <button onClick={handleClearLocalData} style={{ border: '1px solid #ef4444', borderRadius: '14px', padding: '10px 12px', background: '#fff', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start', fontWeight: 700, color: '#ef4444' }}><Trash2 size={16} />Clear local data</button>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '6px' }}>FAQ</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Why do I need the Safari Shortcut? MDAC Express uses Apple Shortcuts together with the Safari Share Sheet to transfer your saved information into the official Malaysia Digital Arrival Card website.</div>
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Can I use MDAC Express on my computer? Yes. Windows PCs and Macs are ideal for creating traveller profiles and editing information. When you are ready to submit your MDAC, continue on your iPhone using Safari.</div>
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '24px', padding: '16px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Statistics</h3>
          <span style={{ fontSize: '12px', color: '#374151' }}>Global usage statistics coming soon.</span>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Trips prepared on this device</div>
            <div style={{ marginTop: '6px', fontSize: '22px', color: '#111827', fontWeight: 800 }}>{preparedPayloads.length}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Estimated time saved</div>
            <div style={{ marginTop: '6px', fontSize: '22px', color: '#111827', fontWeight: 800 }}>{preparedPayloads.length * 4} min</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>🌍 Global usage</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {['🇸🇬 Singapore', '🇲🇾 Malaysia', '🇺🇸 USA', '🇦🇺 Australia', '🇬🇧 United Kingdom'].map((flag) => <span key={flag} style={{ borderRadius: '999px', padding: '6px 10px', background: '#fff', border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 700 }}>{flag}</span>)}
            </div>
          </div>
        </div>
      </section>

      {isDesktop ? (
        <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '24px', padding: '16px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontWeight: 700, color: '#111827' }}>Continue on your phone</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>Scan to open MDAC Express.</div>
          <QRCodeSVG value={APP_URL} size={180} level="H" includeMargin />
        </section>
      ) : null}

      <div style={{ fontSize: '13px', color: '#374151' }}>{importMessage}</div>
    </div>
  );

  const renderHelp = () => (
    <div style={{ display: 'grid', gap: '14px' }}>
      <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '24px', padding: '16px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Help</h2>
          <button type="button" onClick={() => setView('home')} style={{ border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '8px 12px', fontWeight: 700 }}>Back</button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#111827' }}>What does MDAC Express do?</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Malaysia requires many travellers to complete an online Malaysia Digital Arrival Card before entering the country.</p>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>MDAC Express stores your traveller details safely on your own device and prepares them so Safari can fill the official form automatically.</p>
          </div>

          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#111827' }}>How it works</h3>
            <ol style={{ margin: '0 0 0 16px', padding: 0, fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
              <li>Enter your traveller details once.</li>
              <li>Choose your trip type.</li>
              <li>Tap Prepare MDAC.</li>
              <li>Open the official MDAC website.</li>
              <li>Tap Share in Safari.</li>
              <li>Choose Fill MDAC.</li>
              <li>Safari fills the official form.</li>
              <li>Review the information.</li>
              <li>Complete the CAPTCHA.</li>
              <li>Submit the form on the official government website.</li>
            </ol>
          </div>

          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#111827' }}>Supported devices and browsers</h3>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
              <div>✅ iPhone using Safari</div>
              <div>✅ iPad using Safari</div>
              <div>✅ Mac using Safari, Chrome, Edge or Firefox for managing travellers and trip templates</div>
              <div>✅ Windows PC using Chrome, Edge or Firefox for managing travellers and trip templates</div>
              <div>✅ Linux using Chrome, Edge or Firefox for managing travellers and trip templates</div>
              <p style={{ margin: '8px 0 0' }}>The full autofill experience currently requires Safari on iPhone because it uses Apple’s Shortcuts app together with Safari’s Share Sheet.</p>
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#111827' }}>FAQ</h3>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
              <div><strong>Why only Safari?</strong> The automatic filling process depends on Apple Shortcuts and Safari’s Share Sheet. Other iPhone browsers do not currently support the same webpage automation workflow.</div>
              <div><strong>Can I use Chrome?</strong> Yes, you can use Chrome to manage travellers and trip templates. For automatic form filling on iPhone, use Safari.</div>
              <div><strong>Can I use Windows?</strong> Yes, Windows is useful for editing profiles and trip templates. Final autofill requires iPhone Safari.</div>
              <div><strong>Can I use a Mac?</strong> Yes, Mac is useful for editing profiles and trip templates. Final autofill requires iPhone Safari.</div>
              <div><strong>Where is my information stored?</strong> Your information is stored locally in your browser on this device.</div>
              <div><strong>Does MDAC Express send anything to a server?</strong> No traveller information is transmitted to external servers by MDAC Express.</div>
              <div><strong>Can I edit travellers later?</strong> Yes.</div>
              <div><strong>Can I save multiple travellers?</strong> Yes.</div>
              <div><strong>Will MDAC Express submit my MDAC?</strong> No. It prepares your information and helps fill the official form. You review, complete CAPTCHA and submit on the official MDAC website.</div>
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#111827' }}>Privacy</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Everything is stored locally inside your browser on your own device. No traveller information is transmitted to any server by MDAC Express. The only website that receives your information is the official Malaysian Government MDAC website when you choose to submit the completed form.</p>
            <div style={{ marginTop: '8px', fontWeight: 700, color: '#111827' }}>🔒 Your data never leaves this device.</div>
          </div>

          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#111827' }}>About</h3>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Version 1.0</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Created by <a href="https://www.linkedin.com/in/andrewpatterson1/" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700 }}>Andrew Patterson</a></div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Privacy</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Feedback</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Share MDAC Express</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Open Source Licences</div>
            <button type="button" onClick={handleShare} style={{ marginTop: '8px', border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '8px 12px', fontWeight: 700 }}>Share MDAC Express</button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => setView('shortcut')} style={{ flex: 1, border: 'none', borderRadius: '999px', background: '#0f6fff', color: '#fff', padding: '10px 12px', fontWeight: 700 }}>Safari Shortcut</button>
            <button type="button" onClick={() => setView('home')} style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '10px 12px', fontWeight: 700 }}>Back to Home</button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderShortcut = () => (
    <div style={{ display: 'grid', gap: '14px' }}>
      <section style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)', borderRadius: '24px', padding: '16px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Safari Shortcut</h2>
          <button type="button" onClick={() => setView('home')} style={{ border: '1px solid #d1d5db', borderRadius: '999px', background: '#fff', padding: '8px 12px', fontWeight: 700 }}>Back</button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>The autofill process uses Apple’s Shortcuts app together with Safari’s Share Sheet.</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Apple only allows Safari to pass webpage information into a Shortcut in the way this app requires.</p>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>Chrome, Edge and Firefox do not currently support this workflow on iPhone. Desktop browsers can still be used to edit traveller information and trip templates.</p>
          </div>

          <button type="button" disabled style={{ border: '1px solid #d1d5db', borderRadius: '14px', padding: '12px 14px', background: '#f3f4f6', color: '#6b7280', fontWeight: 700 }}>Shortcut download coming soon</button>
          <button type="button" onClick={() => setShowShortcutGuide((value) => !value)} style={{ border: '1px solid #d1d5db', borderRadius: '14px', padding: '12px 14px', background: '#fff', color: '#111827', fontWeight: 700 }}>Step-by-step installation guide</button>

          {showShortcutGuide ? (
            <div style={{ display: 'grid', gap: '10px', padding: '12px', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 700, color: '#111827' }}>Installation guide</div>
              <ol style={{ margin: '0 0 0 16px', padding: 0, fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
                <li>Download the Shortcut.</li>
                <li>Tap Add Shortcut.</li>
                <li>Open Safari.</li>
                <li>Visit the official MDAC website.</li>
                <li>Tap the Share button.</li>
                <li>Select Fill MDAC.</li>
                <li>Wait while the fields are filled.</li>
                <li>Review the completed form.</li>
                <li>Complete the CAPTCHA.</li>
                <li>Submit.</li>
              </ol>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                {['Screenshot 1', 'Screenshot 2', 'Screenshot 3', 'Screenshot 4'].map((label) => (
                  <div key={label} style={{ minHeight: '86px', borderRadius: '12px', border: '1px dashed #d1d5db', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '12px', fontWeight: 700 }}>{label}</div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );

  const renderView = () => {
    if (view === 'travellers') return renderTravellers();
    if (view === 'trips') return renderTrips();
    if (view === 'settings') return renderSettings();
    if (view === 'help') return renderHelp();
    if (view === 'shortcut') return renderShortcut();
    return renderHome();
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fbff 0%, #f2f5f9 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#111827', padding: '16px 16px 96px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'grid', gap: '14px' }}>
        {renderView()}
      </div>

      <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(226, 232, 240, 0.9)', display: 'flex', justifyContent: 'space-around', padding: '10px 12px calc(10px + env(safe-area-inset-bottom))', boxShadow: '0 -10px 30px rgba(15, 23, 42, 0.06)' }}>
        {navItems.map(({ label, icon: Icon }) => {
          const isActive = (view === 'home' && label === 'Home') || (view === 'trips' && label === 'Trips') || (view === 'travellers' && label === 'Travellers') || (view === 'settings' && label === 'Settings');
          return (
            <button key={label} onClick={() => setView(label.toLowerCase())} style={{ border: 'none', background: 'transparent', color: isActive ? '#111827' : '#374151', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '6px 10px', minWidth: '64px', fontSize: '12px', fontWeight: 600 }}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </main>
  );
}
