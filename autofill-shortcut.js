completion((async () => {
  function decodePayload() {
    const txt = prompt("Paste MDAC Express payload here");
    if (!txt || !txt.startsWith("MDAC_EXPRESS_PAYLOAD:")) throw new Error("Missing MDAC Express payload");
    return JSON.parse(decodeURIComponent(escape(atob(txt.replace("MDAC_EXPRESS_PAYLOAD:", "")))));
  }
  const d = decodePayload();
  function setVal(id, value){const el=document.getElementById(id); if(!el) return false; el.value=value || ""; el.dispatchEvent(new Event("input",{bubbles:true})); el.dispatchEvent(new Event("change",{bubbles:true})); return true;}
  function choose(id, wanted){const el=document.getElementById(id); if(!el) return false; const t=String(wanted||"").trim().toUpperCase(); for(const opt of el.options){const v=String(opt.value).trim().toUpperCase(); const x=String(opt.textContent).trim().toUpperCase(); if(v===t || x===t || x.includes(t)){el.value=opt.value; el.dispatchEvent(new Event("change",{bubbles:true})); return true;}} return false;}
  const r=[]; const mark=(n,ok)=>r.push(`${ok?"✅":"⚠️"} ${n}`);
  mark("Name", setVal("name", d.name.toUpperCase()));
  mark("Passport", setVal("passNo", d.passNo.toUpperCase()));
  mark("DOB", setVal("dob", d.dob));
  mark("Nationality", choose("nationality", d.nationality));
  mark("Sex", choose("sex", d.sex));
  mark("Passport Expiry", setVal("passExpDte", d.passportExpiry));
  mark("Email", setVal("email", d.email));
  mark("Confirm Email", setVal("confirmEmail", d.email));
  mark("Phone Code", choose("region", d.phoneCountry));
  mark("Mobile", setVal("mobile", d.mobile));
  mark("Arrival", setVal("arrDt", d.arrivalDate));
  mark("Departure", setVal("depDt", d.departureDate));
  mark("Mode", choose("trvlMode", d.modeOfTravel));
  mark("Last Port", choose("embark", d.lastPort));
  mark("Transport", setVal("vesselNm", d.transportNo.toUpperCase()));
  const accom=document.getElementById("formAccommodation"); if(accom) accom.style.display="block";
  mark("Stay", choose("accommodationStay", d.accommodationStay));
  mark("Address 1", setVal("accommodationAddress1", d.address1));
  mark("Address 2", setVal("accommodationAddress2", d.address2));
  mark("State", choose("accommodationState", d.state));
  await new Promise(x=>setTimeout(x,1200));
  mark("City", choose("accommodationCity", d.city));
  mark("Postcode", setVal("accommodationPostcode", d.postcode));
  const captcha=document.getElementById("captcha"); if(captcha) captcha.scrollIntoView({behavior:"smooth",block:"center"});
  alert("MDAC Express filled what it could. Review everything, solve CAPTCHA, then submit manually.\n\n"+r.join("\n"));
  return r.join("\n");
})());
