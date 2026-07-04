completion((async()=>{
  const raw=await navigator.clipboard.readText();
  if(!raw.startsWith('MDAC_EXPRESS:')){alert('No MDAC Express payload found. Prepare MDAC first.');return 'No payload';}
  const data=JSON.parse(raw.replace('MDAC_EXPRESS:',''));
  const p=data.profile,t=data.trip;
  const set=(id,v)=>{const e=document.getElementById(id);if(!e)return false;e.value=v||'';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true};
  const choose=(id,w)=>{const e=document.getElementById(id);if(!e)return false;const target=String(w||'').trim().toUpperCase();for(const o of e.options){const val=String(o.value).trim().toUpperCase(),txt=String(o.textContent).trim().toUpperCase();if(val===target||txt===target||txt.includes(target)){e.value=o.value;e.dispatchEvent(new Event('change',{bubbles:true}));return true}}return false};
  const done=[]; const mark=(x,ok)=>done.push((ok?'✅ ':'⚠️ ')+x);
  mark('Name',set('name',(p.name||'').toUpperCase()));
  mark('Passport',set('passNo',(p.passportNo||'').toUpperCase()));
  mark('DOB',set('dob',p.dob));
  mark('Nationality',choose('nationality',p.nationality));
  mark('Place of birth',choose('placeOfBirth',p.placeOfBirth)||choose('pob',p.placeOfBirth));
  mark('Sex',choose('sex',p.sex));
  mark('Passport expiry',set('passExpDte',p.passportExpiry));
  mark('Email',set('email',p.email)); mark('Confirm email',set('confirmEmail',p.email));
  mark('Phone code',choose('region',p.phoneCountry)); mark('Mobile',set('mobile',p.mobile));
  mark('Arrival',set('arrDt',t.arrivalDate)); mark('Departure',set('depDt',t.departureDate));
  mark('Transport no',set('vesselNm',(t.transportNo||'').toUpperCase()));
  mark('Mode',choose('trvlMode',t.modeOfTravel)); mark('Embark',choose('embark',t.lastPort));
  const accom=document.getElementById('formAccommodation'); if(accom) accom.style.display='block';
  mark('Accommodation',choose('accommodationStay',t.accommodationStay));
  mark('Address 1',set('accommodationAddress1',t.address1)); mark('Address 2',set('accommodationAddress2',t.address2));
  mark('State',choose('accommodationState',t.state)); await new Promise(r=>setTimeout(r,900));
  mark('City',choose('accommodationCity',t.city)); mark('Postcode',set('accommodationPostcode',t.postcode));
  document.getElementById('captcha')?.scrollIntoView({behavior:'smooth',block:'center'});
  alert('MDAC autofill attempted. Review everything, solve CAPTCHA, then submit.\n\n'+done.join('\n'));
  return done.join('\n');
})());
