import { useState } from 'react';
import {
  Bus,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Flag,
  Home,
  Plane,
  Settings,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Users,
  Waves,
} from 'lucide-react';

const tripTypes = [
  { title: 'Weekend Johor', icon: CarFront, accent: '#0f766e', emoji: '🚗' },
  { title: 'Same-day Johor', icon: CarFront, accent: '#2563eb', emoji: '🚗' },
  { title: 'Flight', icon: Plane, accent: '#7c3aed', emoji: '✈️' },
  { title: 'Bus', icon: Bus, accent: '#ea580c', emoji: '🚌' },
  { title: 'Train', icon: TrainFront, accent: '#0891b2', emoji: '🚆' },
  { title: 'Ferry', icon: Waves, accent: '#0f766e', emoji: '⛴' },
  { title: 'Custom', icon: Sparkles, accent: '#4b5563', emoji: '⚙️' },
];

const flowSteps = [
  'Choose Trip',
  'Review Details',
  'Generate Autofill',
  'Open MDAC',
  'Run Shortcut',
  'Submit',
];

const navItems = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Trips', icon: Sparkles },
  { label: 'Travellers', icon: Users },
  { label: 'Settings', icon: Settings },
];

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTripDefaults = (tripTitle) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const base = {
    arrivalDate: toInputDate(today),
    departureDate: toInputDate(today),
    transportNumber: '',
    lastPort: 'Singapore',
    modeOfTravel: 'Custom',
  };

  if (tripTitle === 'Weekend Johor') {
    return {
      ...base,
      departureDate: toInputDate(tomorrow),
      modeOfTravel: 'Car',
      address1: '106 JALAN WONG AH FOOK',
      address2: 'JOHOR BAHRU CITY SQUARE',
      state: 'JOHOR',
      city: 'JOHOR BAHRU',
      postcode: '80000',
    };
  }

  if (tripTitle === 'Same-day Johor') {
    return {
      ...base,
      modeOfTravel: 'Car',
      address1: '106 JALAN WONG AH FOOK',
      address2: 'JOHOR BAHRU CITY SQUARE',
      state: 'JOHOR',
      city: 'JOHOR BAHRU',
      postcode: '80000',
    };
  }

  if (tripTitle === 'Flight') {
    return { ...base, modeOfTravel: 'Flight' };
  }

  if (tripTitle === 'Bus') {
    return { ...base, modeOfTravel: 'Bus' };
  }

  if (tripTitle === 'Train') {
    return { ...base, modeOfTravel: 'Train' };
  }

  if (tripTitle === 'Ferry') {
    return { ...base, modeOfTravel: 'Ferry' };
  }

  return { ...base, modeOfTravel: 'Custom' };
};

export default function HomePage() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripForm, setTripForm] = useState(() => getTripDefaults('Weekend Johor'));

  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    setTripForm(getTripDefaults(trip.title));
  };

  const handleGenerateAutofill = () => {
    setSelectedTrip(tripTypes[0]);
    setTripForm(getTripDefaults(tripTypes[0].title));
  };

  const passportExpiry = '01/01/2030';
  const expiryDate = new Date('2030-01-01');
  const warningWindow = new Date();
  warningWindow.setMonth(warningWindow.getMonth() + 6);
  const showExpiryWarning = expiryDate <= warningWindow;

  const isJohorTrip = selectedTrip && ['Weekend Johor', 'Same-day Johor'].includes(selectedTrip.title);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fbff 0%, #f2f5f9 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#111827',
        padding: '16px 16px 96px',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'grid', gap: '14px' }}>
        <section
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '16px 16px 18px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e5e7eb',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(220,38,38,0.08) 0%, rgba(37,99,235,0.06) 50%, rgba(250,204,21,0.08) 100%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
                background: '#fff',
                fontSize: '22px',
              }}
            >
              🇲🇾
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#111827' }}>MDAC Express</h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#374151', lineHeight: 1.4 }}>
                Complete your Malaysia Digital Arrival Card in under 60 seconds.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef2f2', color: '#b91c1c', borderRadius: '999px', padding: '6px 10px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(220,38,38,0.14)' }}>
              <Sparkles size={14} />
              ⏱ About 45 seconds
            </div>
          </div>

          <button
            onClick={handleGenerateAutofill}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: '14px',
              padding: '13px 14px',
              background: '#0f6fff',
              color: 'white',
              fontWeight: 700,
              fontSize: '15px',
              boxShadow: '0 8px 20px rgba(15, 111, 255, 0.22)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Generate Autofill
          </button>
        </section>

        <section
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #fcfdff 100%)',
            borderRadius: '20px',
            padding: '14px',
            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
            border: '1px solid #e5e7eb',
          }}
        >
          <button
            style={{
              width: '100%',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#dbeafe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                AP
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>Andrew Patterson</div>
                <div style={{ fontSize: '12px', color: '#374151' }}>US Passport</div>
              </div>
            </div>
            <ChevronRight size={18} color="#6b7280" />
          </button>

          <div style={{ marginTop: '10px', fontSize: '13px', color: '#374151', fontWeight: 600 }}>
            Passport expiry: {passportExpiry}
          </div>

          {showExpiryWarning ? (
            <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '12px', background: '#fff7ed', color: '#9a2c00', fontSize: '12px', lineHeight: 1.4, border: '1px solid rgba(154,44,0,0.12)' }}>
              Passport expires within 6 months. Check entry requirements before travelling.
            </div>
          ) : null}
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Quick trip</h3>
            <span style={{ fontSize: '12px', color: '#374151' }}>Tap to setup</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tripTypes.map(({ title, icon: Icon, accent, emoji }) => {
              const selected = selectedTrip && selectedTrip.title === title;
              return (
                <button
                  key={title}
                  onClick={() => handleSelectTrip({ title, icon: Icon, accent })}
                  style={{
                    border: selected ? '1px solid #2563eb' : '1px solid #d1d5db',
                    borderRadius: '999px',
                    padding: '10px 12px',
                    background: selected ? '#eff6ff' : '#ffffff',
                    boxShadow: '0 6px 14px rgba(15, 23, 42, 0.04)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    color: '#111827',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: accent, display: 'inline-flex', alignItems: 'center' }}>
                    {emoji}
                  </span>
                  <span>{title}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ padding: '2px 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {flowSteps.map((step) => (
              <div key={step} style={{ padding: '6px 10px', borderRadius: '999px', background: '#f3f4f6', color: '#111827', fontSize: '12px', fontWeight: 700, border: '1px solid #e5e7eb' }}>
                {step}
              </div>
            ))}
          </div>
        </section>

        {selectedTrip ? (
          <section
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #fcfdff 100%)',
              borderRadius: '20px',
              padding: '14px',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Trip Setup</div>
                <h3 style={{ margin: '2px 0 0', fontSize: '16px', color: '#111827' }}>{selectedTrip.title}</h3>
              </div>
              <div style={{ color: selectedTrip.accent, fontSize: '16px' }}>{selectedTrip.emoji}</div>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Selected trip type</label>
                <div style={{ padding: '10px 12px', borderRadius: '12px', background: '#f8fafc', fontSize: '14px', fontWeight: 700, color: '#111827', border: '1px solid #e5e7eb' }}>
                  {selectedTrip.title}
                </div>
              </div>

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

              <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>
                Transport number
                <input value={tripForm.transportNumber} onChange={(event) => setTripForm((current) => ({ ...current, transportNumber: event.target.value }))} placeholder="e.g. VJ1234" style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
              </label>

              <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>
                Last port
                <input value={tripForm.lastPort} onChange={(event) => setTripForm((current) => ({ ...current, lastPort: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
              </label>

              <div style={{ display: 'grid', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Mode of travel</label>
                <div style={{ padding: '10px 12px', borderRadius: '12px', background: '#f8fafc', fontSize: '14px', fontWeight: 700, color: '#111827', border: '1px solid #e5e7eb' }}>
                  {tripForm.modeOfTravel}
                </div>
              </div>

              {isJohorTrip ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Address 1
                    <input value={tripForm.address1} onChange={(event) => setTripForm((current) => ({ ...current, address1: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
                  </label>
                  <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Address 2
                    <input value={tripForm.address2} onChange={(event) => setTripForm((current) => ({ ...current, address2: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>State
                      <input value={tripForm.state} onChange={(event) => setTripForm((current) => ({ ...current, state: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
                    </label>
                    <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>City
                      <input value={tripForm.city} onChange={(event) => setTripForm((current) => ({ ...current, city: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
                    </label>
                  </div>
                  <label style={{ fontSize: '12px', color: '#374151', fontWeight: 700 }}>Postcode
                    <input value={tripForm.postcode} onChange={(event) => setTripForm((current) => ({ ...current, postcode: event.target.value }))} style={{ width: '100%', marginTop: '4px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px', fontSize: '13px' }} />
                  </label>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section style={{ padding: '2px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={16} color="#374151" />
            <span style={{ fontSize: '13px', color: '#374151' }}>
              Your profile stays on this device. MDAC Express does not submit anything. You submit only on the official MDAC website.
            </span>
          </div>
        </section>
      </div>

      <nav
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(226, 232, 240, 0.9)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 12px calc(10px + env(safe-area-inset-bottom))',
          boxShadow: '0 -10px 30px rgba(15, 23, 42, 0.06)',
        }}
      >
        {navItems.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            style={{
              border: 'none',
              background: 'transparent',
              color: active ? '#111827' : '#374151',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              minWidth: '64px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}