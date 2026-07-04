const $ = id => document.getElementById(id);
const STORE = "mdacExpressV2";
const profileFields = ["profileNick","name","passNo","dob","nationality","placeOfBirth","sex","passportExpiry","email","phoneCountry","mobile"];
const tripFields = ["transportNo","arrivalDate","departureDate","modeOfTravel","lastPort","accommodationStay","address1","address2","state","postcode","city"];
const settingsFields = ["defaultPreset","departureOffset"];
const defaults = {
  profiles: [{id: crypto.randomUUID?.() || String(Date.now()), profileNick:"Traveller", name:"", passNo:"", dob:"", nationality:"USA", placeOfBirth:"USA", sex:"M", passportExpiry:"", email:"", phoneCountry:"SGP", mobile:""}],
  activeProfileId: null,
  preset: "weekend",
  settings: { defaultPreset:"weekend", departureOffset:"1" },
  trip: { transportNo:"", modeOfTravel:"LAND", lastPort:"SGP", accommodationStay:"OTHERS", address1:"106 JALAN WONG AH FOOK", address2:"JOHOR BAHRU CITY SQUARE", state:"JOHOR", postcode:"80000", city:"JOHOR BAHRU" }
};
let state = loadState();
if(!state.activeProfileId) state.activeProfileId = state.profiles[0].id;
function loadState(){ try { return {...defaults, ...JSON.parse(localStorage.getItem(STORE)||"{}")} } catch { return structuredClone(defaults); } }
function saveState(){ localStorage.setItem(STORE, JSON.stringify(state)); }
function toast(msg){ const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }
function pad(n){return String(n).padStart(2,"0")}
function fmt(d){return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`}
function plusDays(n){const d=new Date();d.setDate(d.getDate()+Number(n));return fmt(d)}
function today(){return plusDays(0)}
function activeProfile(){ return state.profiles.find(p=>p.id===state.activeProfileId) || state.profiles[0]; }
function applyPreset(name){
  state.preset = name;
  const trip = state.trip;
  if(name==="day"){trip.arrivalDate=today();trip.departureDate=today();trip.modeOfTravel="LAND";trip.lastPort="SGP";}
  if(name==="weekend"){trip.arrivalDate=today();trip.departureDate=plusDays(state.settings.departureOffset||1);trip.modeOfTravel="LAND";trip.lastPort="SGP";}
  if(name==="flight"){trip.arrivalDate=today();trip.departureDate=plusDays(state.settings.departureOffset||1);trip.modeOfTravel="AIR";trip.lastPort="SGP";}
  if(name==="bus"||name==="train"){trip.arrivalDate=today();trip.departureDate=plusDays(state.settings.departureOffset||1);trip.modeOfTravel="LAND";trip.lastPort="SGP";}
  if(name==="ferry"){trip.arrivalDate=today();trip.departureDate=plusDays(state.settings.departureOffset||1);trip.modeOfTravel="SEA";trip.lastPort="SGP";}
  saveState(); render();
}
function render(){
  const p = activeProfile();
  $("activeProfileName").textContent = p?.profileNick || p?.name || "No profile yet";
  $("profileSelect").innerHTML = state.profiles.map(p=>`<option value="${p.id}">${escapeHtml(p.profileNick || p.name || "Traveller")}</option>`).join("");
  $("profileSelect").value = state.activeProfileId;
  profileFields.forEach(k=>{ if($(k)) $(k).value = p?.[k] || ""; });
  tripFields.forEach(k=>{ if($(k)) $(k).value = state.trip?.[k] || ""; });
  settingsFields.forEach(k=>{ if($(k)) $(k).value = state.settings?.[k] || ""; });
  document.querySelectorAll(".preset").forEach(b=>b.classList.toggle("selected", b.dataset.preset===state.preset));
}
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m])); }
function collectProfile(){ const p={...activeProfile()}; profileFields.forEach(k=>p[k]=$(k).value.trim()); p.profileNick = p.profileNick || p.name || "Traveller"; return p; }
function collectTrip(){ const trip={...state.trip}; tripFields.forEach(k=>trip[k]=$(k).value.trim()); return trip; }
function collectSettings(){ const settings={...state.settings}; settingsFields.forEach(k=>settings[k]=$(k).value); return settings; }
function saveProfile(){ const idx = state.profiles.findIndex(p=>p.id===state.activeProfileId); state.profiles[idx]=collectProfile(); saveState(); render(); toast("Profile saved on this device"); }
function saveTrip(){ state.trip=collectTrip(); saveState(); toast("Trip defaults saved"); }
function saveSettings(){ state.settings=collectSettings(); saveState(); toast("Settings saved"); }
async function copyPayload(){
  saveProfile(); saveTrip();
  const payload = { ...activeProfile(), ...state.trip, preset: state.preset, generatedAt: new Date().toISOString() };
  const encoded = "MDAC_EXPRESS_PAYLOAD:" + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  await navigator.clipboard.writeText(encoded);
  toast("Payload copied. Open MDAC and run the Shortcut.");
}
function newProfile(){ const id=crypto.randomUUID?.() || String(Date.now()); state.profiles.push({...defaults.profiles[0], id, profileNick:"New traveller"}); state.activeProfileId=id; saveState(); render(); }
function duplicateProfile(){ const p={...collectProfile(), id: crypto.randomUUID?.() || String(Date.now()), profileNick:(collectProfile().profileNick||"Traveller")+" copy"}; state.profiles.push(p); state.activeProfileId=p.id; saveState(); render(); }
function deleteProfile(){ if(state.profiles.length===1) return toast("Keep at least one profile"); state.profiles=state.profiles.filter(p=>p.id!==state.activeProfileId); state.activeProfileId=state.profiles[0].id; saveState(); render(); toast("Profile deleted"); }
document.querySelectorAll(".tab").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".tab,.panel").forEach(x=>x.classList.remove("active"));btn.classList.add("active");$(btn.dataset.tab).classList.add("active");});
document.querySelectorAll(".preset").forEach(btn=>btn.onclick=()=>applyPreset(btn.dataset.preset));
$("profileSelect").onchange=e=>{state.activeProfileId=e.target.value; saveState(); render();};
$("saveProfile").onclick=saveProfile; $("saveTrip").onclick=saveTrip; $("saveSettings").onclick=saveSettings; $("copyPayload").onclick=copyPayload;
$("newProfile").onclick=newProfile; $("duplicateProfile").onclick=duplicateProfile; $("deleteProfile").onclick=deleteProfile;
$("copyShortcutCode").onclick=async()=>{ try{ const res=await fetch("autofill-shortcut.js"); await navigator.clipboard.writeText(await res.text()); toast("Shortcut JS copied"); } catch { toast("Open autofill-shortcut.js from GitHub and copy it"); }};
if(!state.trip.arrivalDate) applyPreset(state.settings.defaultPreset || "weekend"); else render();
