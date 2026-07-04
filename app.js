const $ = id => document.getElementById(id);
const keys = ["name","passNo","dob","nationality","placeOfBirth","sex","passportExpiry","email","phoneCountry","mobile","tripType","modeOfTravel","transportNo","lastPort","accommodationStay","address1","address2","state","city","postcode","arrivalDate","departureDate"];
function pad(n){return String(n).padStart(2,"0")}
function fmt(d){return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`}
function today(){return fmt(new Date())}
function plusDays(n){const d=new Date();d.setDate(d.getDate()+n);return fmt(d)}
function load(){const saved=JSON.parse(localStorage.getItem("mdacExpress")||"{}"); keys.forEach(k=>{ if(saved[k] && $(k)) $(k).value=saved[k]; }); toggleDates();}
function collect(){const data={}; keys.forEach(k=>{ if($(k)) data[k]=$(k).value.trim(); }); if(data.tripType==="day"){data.arrivalDate=today();data.departureDate=today()} if(data.tripType==="overnight"){data.arrivalDate=today();data.departureDate=plusDays(1)} return data;}
function save(){localStorage.setItem("mdacExpress", JSON.stringify(collect())); alert("Saved on this phone.");}
function toggleDates(){ $("customDates").hidden = $("tripType").value !== "custom"; }
async function copyPayload(){const payload = "MDAC_EXPRESS_PAYLOAD:" + btoa(unescape(encodeURIComponent(JSON.stringify(collect())))); await navigator.clipboard.writeText(payload); alert("Copied. Now open MDAC, then run the iPhone Shortcut from Safari Share.");}
$("saveProfile").onclick=save; $("saveTrip").onclick=save; $("copyPayload").onclick=copyPayload; $("tripType").onchange=toggleDates; load();
