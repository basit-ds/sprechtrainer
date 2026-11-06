/* Sprechtrainer – Videoanruf mit Lena
   A video-call mode on top of the normal conversation engine: an animated, lip-synced face,
   your own camera as picture-in-picture (shown locally only, never sent), hands-free turn-taking,
   a call timer, and a small memory of earlier calls so Lena can pick up where you left off. */

/* ---------------- Persona & memory ---------------- */
const CALL_FEMALE = /katja|amala|seraphina|hedda|anna|marlene|vicki|petra|helena|elke|louisa|ingrid|tanja|gisela|maja|klarissa|google deutsch|female/i;
const CALL_MALE = /conrad|killian|florian|stefan|markus|yannick|ralf|bernd|christoph|kasper|\bkai\b|georg|jonas|\bmale/i;
let callNotes = loadJSON('callnotes', []);   // [{at, min, about:[], open:[], lena:[]}]
function saveCallNotes(){ saveJSON('callnotes', callNotes.slice(-12)); }

const call = { min: S.callMin || 10, start:0, end:0, tick:null, warned:false, timeUp:false, farewell:false, ended:false,
  muted:false, cam:null, wake:null, info:null, toastT:null, idleSince:0, silenceSent:false, ringing:false };

function callWhen(d){
  const h = d.getHours();
  const part = h < 5 ? 'mitten in der Nacht' : h < 10 ? 'morgens' : h < 12 ? 'vormittags' : h < 14 ? 'mittags' : h < 18 ? 'nachmittags' : h < 22 ? 'abends' : 'spät abends';
  return `${d.toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long' })}, ${String(h).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} Uhr (${part})`;
}
function callMemory(){
  const recent = callNotes.slice(-5);
  if (!recent.length) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  return recent.map(n => {
    const d = Math.round((today - new Date(n.at).setHours(0,0,0,0)) / 864e5);
    const when = d <= 0 ? 'heute' : d === 1 ? 'gestern' : d < 7 ? `vor ${d} Tagen` : `am ${new Date(n.at).toLocaleDateString('de-DE')}`;
    const parts = [];
    if (n.about && n.about.length) parts.push('Über ihn: ' + n.about.join('; '));
    if (n.open && n.open.length) parts.push('Nachfragen: ' + n.open.join('; '));
    if (n.lena && n.lena.length) parts.push('Das hast du von dir erzählt: ' + n.lena.join('; '));
    return `- Anruf ${when}: ${parts.join(' | ')}`;
  }).join('\n');
}
// called by systemPrompt() while a call is running; everything in here stays fixed during one call (prompt cache)
function callPromptBlock(){
  const i = call.info || {};
  return `MODUS: VIDEOANRUF – dieser Abschnitt gilt vorrangig vor den allgemeinen Regeln oben zu Länge und Fragen.
Du bist Lena, und ihr telefoniert per Video – ihr seht euch. In diesem Anruf bist du nicht seine Lehrerin, sondern eine Sprachpartnerin, die ihn mag und sich ehrlich für sein Leben interessiert, wie eine gute Bekannte.

ÜBER DICH (bleib dabei; erfinde nur kleine, dazu passende Details): Lena Hoffmann, 31, aus Münster, wohnt seit fünf Jahren in Bochum-Ehrenfeld. Redakteurin bei einem populärwissenschaftlichen Magazin – sie findet Forschung spannend, ist aber keine Expertin. Geht bouldern, fährt Rennrad an der Ruhr, kocht gern, hält aber schlecht Ordnung. Hat eine Katze namens Krümel und trinkt zu viel Kaffee.
JETZT IST ES: ${i.when || ''}.

SO KLINGT DAS GESPRÄCH
- Wie ein echtes Telefonat unter Bekannten: locker, warm, spontan. Kurze echte Reaktionen („Ach echt?“, „Oh nein!“, „Na ja …“, „Stimmt.“), dazu eigene kleine Erlebnisse und Meinungen.
- Meist ein bis drei kurze Sätze. Nicht jede Antwort braucht eine Frage – manchmal erzählst du etwas und lässt ihm Raum. Nie mehr als eine Frage auf einmal.
- Folge seinen Themen, hak bei Interessantem nach und nimm Dinge aus früheren Anrufen wieder auf.
- Wenn er ein Wort sucht oder stockt, hilf ihm wie eine Freundin mit dem Wort und mach weiter. Spricht er Englisch, antworte auf Deutsch und gib ihm beiläufig den deutschen Ausdruck.
- Korrigiere im Gespräch nie ausdrücklich und erkläre keine Grammatik. Die Korrekturen schreibst du wie immer nur in den Korrekturteil; er sieht sie nach dem Anruf.
- Ihr duzt euch.

GESICHTSAUSDRUCK: Beginne jede Antwort mit genau einem dieser Wörter in runden Klammern, je nachdem, wie du gerade schaust: (lächelt) (lacht) (begeistert) (überrascht) (nachdenklich) (mitfühlend) (neutral). Danach nur gesprochener Text, keine weiteren Regieanweisungen.

ABLAUF
[ANRUF START]: Er ruft dich an, du nimmst ab. Begrüß ihn natürlich (mit Namen, falls du ihn kennst)${callNotes.length ? ' und knüpf an etwas aus einem früheren Anruf an' : ' und frag, wie es ihm geht'}${i.topic ? `; er möchte heute über „${i.topic}“ sprechen` : ''}. Ein bis zwei Sätze.
[STILLE]: Er sagt seit etwa zwanzig Sekunden nichts. Reagiere wie am Telefon: frag kurz, ob er noch da ist, oder gib ihm einen leichteren Anstoß. Ein Satz.
[ANRUF ENDE]: Die Zeit ist um. Verabschiede dich herzlich in ein bis zwei Sätzen und nimm Bezug auf etwas aus dem Gespräch. Keine Frage.
Wenn eine Nachricht mit „[Hinweis der App: …]“ endet, befolge den Hinweis, ohne ihn zu erwähnen.${i.memory ? '\n\nAUS FRÜHEREN ANRUFEN\n' + i.memory : ''}`;
}

/* ---------------- Avatar: drawing ---------------- */
function avShelf(){
  // a blurred bookshelf in the background, generated once
  const cols = ['#b5523c','#3f6a87','#d6a33f','#5b7d57','#7a4a68','#e2d6c2','#2e4656','#b58357','#8c9aa3','#c9785f'];
  let s = '', seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (const y of [150, 270, 390]) {
    let x = 575;
    while (x < 770) {
      const w = 9 + Math.floor(rnd() * 12), h = 62 + Math.floor(rnd() * 40);
      if (rnd() < .12) { x += 14; continue; }
      s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="1.5" fill="${cols[Math.floor(rnd() * cols.length)]}"/>`;
      x += w + 1.5;
    }
    s += `<rect x="560" y="${y}" width="240" height="10" fill="#6d5340"/>`;
  }
  return s;
}
const AV_SVG = `<svg class="av" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lena">
<defs>
  <linearGradient id="avWall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e4d6c3"/><stop offset="1" stop-color="#bba893"/></linearGradient>
  <radialGradient id="avWin" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#fffbf2"/><stop offset=".7" stop-color="#f1eee6"/><stop offset="1" stop-color="#d9e2e4"/></radialGradient>
  <radialGradient id="avLamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd59a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>
  <radialGradient id="avSkin" cx=".4" cy=".36" r=".78"><stop offset="0" stop-color="#f7dac6"/><stop offset=".6" stop-color="#ebbea2"/><stop offset="1" stop-color="#d29c7e"/></radialGradient>
  <linearGradient id="avNeckG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98f72"/><stop offset=".45" stop-color="#e1ae92"/><stop offset="1" stop-color="#e6b498"/></linearGradient>
  <linearGradient id="avHairG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e4631"/><stop offset="1" stop-color="#452a1c"/></linearGradient>
  <linearGradient id="avTopG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a7c72"/><stop offset="1" stop-color="#2c5049"/></linearGradient>
  <radialGradient id="avIris" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#9bb07a"/><stop offset=".55" stop-color="#6d8a52"/><stop offset="1" stop-color="#3f5530"/></radialGradient>
  <radialGradient id="avVig" cx=".5" cy=".45" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
  <linearGradient id="avKey" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff3e2" stop-opacity=".22"/><stop offset=".5" stop-color="#fff3e2" stop-opacity="0"/><stop offset="1" stop-color="#5a3020" stop-opacity=".16"/></linearGradient>
  <filter id="avBlur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5.5"/></filter>
  <filter id="avSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  <clipPath id="avClipL"><path id="avEyeClipL"/></clipPath>
  <clipPath id="avClipR"><path id="avEyeClipR"/></clipPath>
  <clipPath id="avClipM"><path id="avMouthClip"/></clipPath>
  <clipPath id="avFaceClip"><path d="M400 150C448 150 478 186 478 238C478 291 455 331 425 349C412 357 388 357 375 349C345 331 322 291 322 238C322 186 352 150 400 150Z"/></clipPath>
</defs>
<g filter="url(#avBlur)">
  <rect x="-20" y="-20" width="840" height="640" fill="url(#avWall)"/>
  <rect x="0" y="20" width="44" height="560" fill="#eee5d6"/>
  <rect x="44" y="50" width="220" height="320" rx="4" fill="url(#avWin)"/>
  <ellipse cx="110" cy="345" rx="80" ry="40" fill="#a7bd9e" opacity=".55"/><ellipse cx="215" cy="335" rx="60" ry="45" fill="#93ad8f" opacity=".5"/>
  <rect x="44" y="50" width="220" height="320" rx="4" fill="none" stroke="#f6f1e8" stroke-width="12"/>
  <path d="M154 50V370M44 205H264" stroke="#f6f1e8" stroke-width="8"/>
  <path d="M264 120L520 600H150Z" fill="#fff8ec" opacity=".12"/>
  <rect x="490" y="98" width="62" height="78" fill="#efe8dc" stroke="#3a3632" stroke-width="5"/>
  <circle cx="515" cy="130" r="14" fill="#d98b5f" opacity=".85"/><rect x="520" y="138" width="22" height="26" fill="#47707a" opacity=".8"/>
  <rect x="560" y="40" width="240" height="420" fill="#7f634c"/><rect x="572" y="52" width="228" height="400" fill="#5d4535"/>
  ${avShelf()}
  <circle cx="690" cy="40" r="120" fill="url(#avLamp)"/>
  <rect x="88" y="452" width="86" height="100" rx="10" fill="#c46c47"/>
  <g fill="#4f7d49"><ellipse cx="108" cy="420" rx="16" ry="44" transform="rotate(-28 108 420)"/><ellipse cx="150" cy="405" rx="15" ry="50" transform="rotate(14 150 405)"/><ellipse cx="128" cy="395" rx="13" ry="52"/></g>
  <g fill="#6f9c5d"><ellipse cx="88" cy="440" rx="12" ry="34" transform="rotate(-55 88 440)"/><ellipse cx="172" cy="436" rx="12" ry="36" transform="rotate(48 172 436)"/></g>
  <ellipse cx="410" cy="420" rx="210" ry="240" fill="#2a1a10" opacity=".1"/>
</g>
<g id="avBody">
  <path d="M150 640C158 486 246 430 334 410Q400 436 466 410C554 430 642 486 650 640Z" fill="url(#avTopG)"/>
  <path d="M260 470C250 520 246 570 248 610M540 470C550 520 554 570 552 610" stroke="#24433d" stroke-width="3" opacity=".35" fill="none"/>
  <path d="M190 600Q205 520 270 470" stroke="#5f9187" stroke-width="5" opacity=".25" fill="none"/>
</g>
<g id="avHeadBack">
  <path d="M318 232C308 160 350 126 402 126C454 126 494 160 485 236C489 302 500 362 516 414C492 430 458 424 444 402L432 330H368L356 402C342 424 308 430 284 414C300 362 312 302 318 232Z" fill="url(#avHairG)"/>
</g>
<g id="avNeck">
  <path d="M370 318L367 406Q400 428 433 406L430 318Z" fill="url(#avNeckG)"/>
  <path d="M343 404Q400 446 457 404" stroke="#3b6860" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M372 414Q400 436 428 414" stroke="#e9c58c" stroke-width="1.4" fill="none" opacity=".9"/>
  <circle cx="400" cy="429" r="3" fill="#e9c58c"/>
</g>
<g id="avHead">
  <path d="M400 150C448 150 478 186 478 238C478 291 455 331 425 349C412 357 388 357 375 349C345 331 322 291 322 238C322 186 352 150 400 150Z" fill="url(#avSkin)"/>
  <g clip-path="url(#avFaceClip)"><rect x="300" y="140" width="200" height="230" fill="url(#avKey)"/><ellipse cx="400" cy="372" rx="70" ry="22" fill="#8c4f36" opacity=".18" filter="url(#avSoft)"/></g>
  <g id="avFeat">
    <ellipse id="avBlushL" cx="352" cy="292" rx="19" ry="10" fill="#e48a80" opacity=".22" filter="url(#avSoft)"/>
    <ellipse id="avBlushR" cx="448" cy="292" rx="19" ry="10" fill="#e48a80" opacity=".22" filter="url(#avSoft)"/>
    <path id="avCreaseL" fill="none" stroke="#a46a54" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round"/>
    <path id="avCreaseR" fill="none" stroke="#a46a54" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round"/>
    <g clip-path="url(#avClipL)"><rect x="340" y="222" width="56" height="44" fill="#fbf6f0"/>
      <g id="avIrisL"><circle cx="368" cy="246" r="8.6" fill="url(#avIris)" stroke="#33452a" stroke-width="1"/><circle cx="368" cy="246" r="3.8" fill="#1a120d"/><circle cx="370.7" cy="243.3" r="1.8" fill="#fff" opacity=".92"/></g>
      <rect x="340" y="222" width="56" height="9" fill="#5a3426" opacity=".16"/></g>
    <g clip-path="url(#avClipR)"><rect x="404" y="222" width="56" height="44" fill="#fbf6f0"/>
      <g id="avIrisR"><circle cx="432" cy="246" r="8.6" fill="url(#avIris)" stroke="#33452a" stroke-width="1"/><circle cx="432" cy="246" r="3.8" fill="#1a120d"/><circle cx="434.7" cy="243.3" r="1.8" fill="#fff" opacity=".92"/></g>
      <rect x="404" y="222" width="56" height="9" fill="#5a3426" opacity=".16"/></g>
    <path id="avLashL" fill="none" stroke="#24150f" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="avLashR" fill="none" stroke="#24150f" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="avLowL" fill="none" stroke="#9a5d48" stroke-opacity=".3" stroke-width="1.1"/>
    <path id="avLowR" fill="none" stroke="#9a5d48" stroke-opacity=".3" stroke-width="1.1"/>
    <path id="avBrowL" fill="none" stroke="#4a2c1e" stroke-width="5" stroke-linecap="round"/>
    <path id="avBrowR" fill="none" stroke="#4a2c1e" stroke-width="5" stroke-linecap="round"/>
    <path d="M405 252C407 268 411 279 413 286" fill="none" stroke="#b07258" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M388 290C393 295 407 295 412 290" fill="none" stroke="#a5654d" stroke-opacity=".6" stroke-width="1.7" stroke-linecap="round"/>
    <ellipse cx="404" cy="282" rx="7" ry="4" fill="#fff" opacity=".18"/>
    <path id="avMouthIn" fill="#4a1b22"/>
    <g clip-path="url(#avClipM)"><rect id="avTeeth" fill="#f6f1ea"/><ellipse id="avTongue" fill="#b4505c"/></g>
    <path id="avLipU" fill="#bc6566"/>
    <path id="avLipD" fill="#cf7a77"/>
    <path id="avLipLine" fill="none" stroke="#7d3437" stroke-width="1.6" stroke-linecap="round"/>
    <path id="avLipHi" fill="none" stroke="#f3b2ab" stroke-width="2" stroke-linecap="round" opacity=".45"/>
    <path id="avDimL" fill="none" stroke="#a5654d" stroke-width="1.4" stroke-linecap="round"/>
    <path id="avDimR" fill="none" stroke="#a5654d" stroke-width="1.4" stroke-linecap="round"/>
  </g>
  <path d="M318 252C310 176 352 132 404 132C458 132 492 172 484 252C477 222 468 200 452 186C430 200 394 198 370 182C356 202 338 224 318 252Z" fill="url(#avHairG)"/>
  <path d="M370 182C392 172 432 168 452 186C432 158 398 150 370 182Z" fill="#7a5038" opacity=".55"/>
  <path d="M362 146C392 136 434 140 458 160" fill="none" stroke="#94664a" stroke-width="3" opacity=".45" stroke-linecap="round"/>
  <g fill="none" stroke="#3a2216" stroke-width="1.3" opacity=".45" stroke-linecap="round"><path d="M372 146C352 170 336 200 326 238"/><path d="M386 140C366 168 350 196 340 222"/><path d="M430 144C452 166 470 198 476 236"/><path d="M418 140C444 160 458 182 464 206"/><path d="M404 152C420 168 436 178 452 186"/></g>
  <g fill="none" stroke="#8a5d42" stroke-width="1.2" opacity=".35" stroke-linecap="round"><path d="M314 260C310 300 306 340 298 376"/><path d="M488 262C492 302 494 340 502 376"/></g>
  <path d="M322 226C310 280 314 334 296 386C318 376 332 344 337 300C338 272 334 248 322 226Z" fill="url(#avHairG)"/>
  <path d="M478 226C490 280 486 334 504 386C482 376 468 344 463 300C462 272 466 248 478 226Z" fill="url(#avHairG)"/>
</g>
<rect x="-20" y="-20" width="840" height="640" fill="url(#avVig)" pointer-events="none"/>
</svg>`;

/* ---------------- Avatar: animation ---------------- */
const MOODS = {
  neutral:{ smile:.3 }, 'lächelt':{ smile:.75, squint:.2 }, lacht:{ smile:1, squint:.6, tilt:-2 },
  begeistert:{ smile:.9, raise:.55, squint:.15 }, 'überrascht':{ smile:.2, raise:1, open:.12 },
  nachdenklich:{ smile:.08, furrow:.45, tilt:3 }, 'mitfühlend':{ smile:.18, inner:.85, tilt:-3.5 },
  listen:{ smile:.42, raise:.06 }, thinking:{ smile:.25, furrow:.18, tilt:1.5 }
};
const MOOD_RE = /\((lächelt|lacht|begeistert|überrascht|nachdenklich|mitfühlend|neutral)\)/gi;
const AV = { el:null, running:false, raf:0, t0:0, last:0,
  m:{ open:0, wide:.5, round:0 }, utt:null, speaking:false, qAt:0,
  blink:{ next:0, start:-1 }, gaze:{ x:0, y:0, tx:0, ty:0, next:0 }, nod:{ start:-1, amp:0 }, nextNod:0,
  mood:'neutral', moodSrc:null, laughAt:-1, e:{ smile:.35, raise:0, inner:0, furrow:0, squint:0, tilt:0, open:0 },
  prevState:'', stateAt:0, draftLen:0, userTalkAt:-1e9 };

function viseme(ch){
  ch = (ch || ' ').toLowerCase();
  if ('aä'.includes(ch)) return [.9,.55,0];
  if (ch === 'e') return [.5,.8,0];
  if ('iy'.includes(ch)) return [.32,1,0];
  if ('oö'.includes(ch)) return [.62,.1,.9];
  if ('uü'.includes(ch)) return [.32,0,1];
  if ('mbp'.includes(ch)) return [0,.45,0];
  if ('fvw'.includes(ch)) return [.12,.65,0];
  if ('sztdnlcß'.includes(ch)) return [.2,.6,0];
  if ('rgkhjqx'.includes(ch)) return [.3,.45,.15];
  if (/\d/.test(ch)) return [.5,.6,0];
  if (ch === ' ') return [.1,.5,0];
  return [0,.5,0];
}
function charDur(ch){
  if (/[aeiouäöüy]/i.test(ch)) return 88;
  if (ch === ' ') return 45;
  if (/[,;:–—]/.test(ch)) return 230;
  if (/[.!?…]/.test(ch)) return 360;
  if (/[\p{L}\d]/u.test(ch)) return 58;
  return 20;
}
// called from speakNext() for every utterance (also the voice test in the lobby)
avatarUtt = {
  start(text, rate){
    const times = new Array(text.length + 1); let t = 0;
    for (let i = 0; i < text.length; i++) { times[i] = t; t += charDur(text[i]) / (rate || 1); }
    times[text.length] = t;
    const now = performance.now();
    AV.utt = { text, times, anchorNow:now, anchorEst:0, k:1, gotB:false, prevB:null, idx:0 };
    AV.speaking = true;
    AV.qAt = /\?\s*$/.test(text) ? now + Math.max(0, t - 1000) : 0;
    capHer(text);
  },
  boundary(ci){
    const u = AV.utt; if (!u || ci == null || ci < 0 || ci > u.text.length) return;
    const now = performance.now();
    if (u.prevB && ci > u.prevB.ci) {
      const ratio = (now - u.prevB.now) / Math.max(1, u.times[ci] - u.times[u.prevB.ci]);
      if (ratio > .3 && ratio < 3) u.k = u.k * .6 + ratio * .4;
    }
    u.prevB = { ci, now }; u.gotB = true; u.anchorNow = now; u.anchorEst = u.times[ci];
  },
  end(){ AV.speaking = false; AV.utt = null; }
};

function avInit(root){
  root.innerHTML = AV_SVG;
  const q = id => root.querySelector('#' + id);
  AV.el = {};
  for (const id of ['avBody','avHeadBack','avNeck','avHead','avFeat','avEyeClipL','avEyeClipR','avIrisL','avIrisR','avLashL','avLashR','avLowL','avLowR','avCreaseL','avCreaseR','avBrowL','avBrowR','avMouthIn','avMouthClip','avTeeth','avTongue','avLipU','avLipD','avLipLine','avLipHi','avDimL','avDimR','avBlushL','avBlushR'])
    AV.el[id] = q(id);
  AV.t0 = performance.now();
}
function avStart(){ if (AV.running) return; AV.running = true; AV.last = 0; AV.raf = requestAnimationFrame(avFrame); }
function avStop(){ AV.running = false; cancelAnimationFrame(AV.raf); }

const f1 = x => Math.round(x * 10) / 10;
function eyeD(cx, cy, up, low, side){
  const l = cx - 17, r = cx + 17, ly = cy + (side < 0 ? 0 : -1.5), ry = cy + (side < 0 ? -1.5 : 0);
  return {
    clip:`M${l} ${ly}C${cx-9} ${f1(cy-up*1.45)} ${cx+9} ${f1(cy-up*1.45)} ${r} ${ry}C${cx+9} ${f1(cy+low*1.35)} ${cx-9} ${f1(cy+low*1.35)} ${l} ${ly}Z`,
    lash: side < 0
      ? `M${l-3} ${ly-1.5}L${l} ${ly}C${cx-9} ${f1(cy-up*1.45)} ${cx+9} ${f1(cy-up*1.45)} ${r} ${ry}`
      : `M${l} ${ly}C${cx-9} ${f1(cy-up*1.45)} ${cx+9} ${f1(cy-up*1.45)} ${r} ${ry}L${r+3} ${ry-1.5}`,
    low:`M${l+3} ${ly+1}C${cx-8} ${f1(cy+low*1.35+1)} ${cx+8} ${f1(cy+low*1.35+1)} ${r-3} ${ry+1}`
  };
}
function browD(side, raise, inner, furrow){
  const ix = 400 + side*15, ox = 400 + side*55, mx = 400 + side*38;
  const base = 226 - raise*7;
  const iy = base + 2 - inner*6 + furrow*4, oy = base + 3 + inner*1.5, my = base - 7 - raise*1.5 + furrow*1.5;
  return `M${ix} ${f1(iy)}Q${mx} ${f1(my)} ${ox} ${f1(oy)}`;
}
function mouthD(open, wide, round, smile){
  const cx = 400, cy = 313;
  const w = 46 + wide*9 - round*15 + smile*7;
  const h = open*20;
  const sm = smile*5;
  const lx = f1(cx - w/2), rx = f1(cx + w/2), ey = f1(cy - sm);
  const upMid = cy - 1 - h*.25, upC = f1(2*upMid - (cy - sm));
  const loMid = cy + h + 1 + sm*.35, loC = f1(2*loMid - (cy - sm));
  const loOutC = f1(2*(loMid + 8.5) - (cy - sm));
  const top = cy - 6.5 - h*.25;
  return {
    inner:`M${lx} ${ey}Q${cx} ${upC} ${rx} ${ey}Q${cx} ${loC} ${lx} ${ey}Z`,
    upper:`M${lx} ${ey}C${f1(cx - w*.3)} ${f1(top - .5)} ${cx-6} ${f1(top - 3)} ${cx} ${f1(top)}C${cx+6} ${f1(top - 3)} ${f1(cx + w*.3)} ${f1(top - .5)} ${rx} ${ey}Q${cx} ${upC} ${lx} ${ey}Z`,
    lower:`M${rx} ${ey}Q${cx} ${loOutC} ${lx} ${ey}Q${cx} ${loC} ${rx} ${ey}Z`,
    line:`M${lx} ${ey}Q${cx} ${upC} ${rx} ${ey}`,
    dimL:`M${f1(cx - w/2 - 1)} ${f1(cy - sm - 4)}Q${f1(cx - w/2 - 5)} ${f1(cy - sm + 1)} ${f1(cx - w/2 - 2)} ${f1(cy - sm + 5)}`,
    dimR:`M${f1(cx + w/2 + 1)} ${f1(cy - sm - 4)}Q${f1(cx + w/2 + 5)} ${f1(cy - sm + 1)} ${f1(cx + w/2 + 2)} ${f1(cy - sm + 5)}`,
    hi:`M${f1(cx - w*.18)} ${f1(loMid + 5)}Q${cx} ${f1(loMid + 7)} ${f1(cx + w*.18)} ${f1(loMid + 5)}`,
    teeth:{ x:f1(cx - w*.36), y:f1(upMid - 2), w:f1(w*.72), h:f1(Math.min(7.5, h*.55 + 1)) },
    tongue:{ cx, cy:f1(loMid - 1), rx:f1(w*.24), ry:f1(Math.max(.1, h*.28)) }
  };
}

function avFrame(now){
  if (!AV.running) return;
  AV.raf = requestAnimationFrame(avFrame);
  const E = AV.el; if (!E) return;
  const dt = Math.min(.05, AV.last ? (now - AV.last) / 1000 : .016); AV.last = now;
  const t = (now - AV.t0) / 1000;

  // state changes
  if (state !== AV.prevState) {
    AV.prevState = state; AV.stateAt = now;
    if (state === 'thinking') { AV.gaze.next = 0; AV.mood = 'neutral'; }
    if (state === 'listening') { AV.draftLen = 0; AV.gaze.next = 0; }
  }
  // mood from the reply that is streaming in
  const src = activeStream && activeStream.full;
  if (src && src !== AV.moodSrc) {
    AV.moodSrc = src;
    const all = [...src.split(MARK)[0].matchAll(MOOD_RE)];
    if (all.length) {
      const m = all[all.length - 1][1].toLowerCase();
      if (m !== AV.mood) { AV.mood = m; if (m === 'lacht') AV.laughAt = now; }
    }
  }
  // is the user talking? (speech recognition draft grows)
  if (state === 'listening') {
    const len = (transcript() + ' ' + interim).trim().length;
    if (len > AV.draftLen) {
      AV.draftLen = len; AV.userTalkAt = now;
      if (now > AV.nextNod && len > 25) { AV.nod = { start:now, amp:3 + Math.random()*3 }; AV.nextNod = now + 2600 + Math.random()*4200; }
    }
  }
  const userTalking = now - AV.userTalkAt < 1400;

  // expression target
  let target = MOODS[AV.mood] || MOODS.neutral;
  if (state === 'listening' && now - AV.stateAt > 2200) target = MOODS.listen;
  if (state === 'thinking') target = MOODS.thinking;
  const e = AV.e, k = Math.min(1, dt*4);
  for (const key of ['smile','raise','inner','furrow','squint','tilt','open']) e[key] += ((target[key] || 0) - e[key]) * k;
  let raise = e.raise, smile = e.smile;
  if (AV.qAt && now > AV.qAt && now < AV.qAt + 1500) raise += .45;
  if (userTalking) { smile = Math.min(1, smile + .08); raise += .08; }

  // blink
  let ap = 1;
  if (AV.blink.start < 0 && now > AV.blink.next) AV.blink.start = now;
  if (AV.blink.start >= 0) {
    const p = (now - AV.blink.start) / 150;
    if (p >= 1) { AV.blink.start = -1; AV.blink.next = now + (Math.random() < .15 ? 200 : 1800 + Math.random()*4200); }
    else ap = 1 - Math.sin(p*Math.PI) * .96;
  }
  // gaze: mostly into the camera, small saccades; looks up/aside while thinking
  const g = AV.gaze;
  if (now > g.next) {
    const th = state === 'thinking' && now - AV.stateAt < 2500;
    g.tx = th ? -3.4 + Math.random() : (Math.random() - .5) * 2.2;
    g.ty = th ? -2.8 : (Math.random() - .5) * 1.4;
    g.next = now + (th ? 1200 : 900 + Math.random()*2600);
  }
  const gs = Math.min(1, dt*22); g.x += (g.tx - g.x) * gs; g.y += (g.ty - g.y) * gs;

  // mouth: follow the utterance text with estimated timing, re-anchored by word-boundary events
  let tgt = [0, .5, 0];
  const u = AV.utt;
  if (AV.speaking && u) {
    let est = u.anchorEst + (now - u.anchorNow) / u.k;
    if (u.gotB) { let j = u.prevB.ci; while (j < u.text.length && !/\s/.test(u.text[j])) j++; est = Math.min(est, u.times[j] + 160); }
    while (u.idx < u.text.length - 1 && u.times[u.idx + 1] <= est) u.idx++;
    while (u.idx > 0 && u.times[u.idx] > est) u.idx--;
    if (est < u.times[u.text.length]) { tgt = viseme(u.text[u.idx]); tgt = [tgt[0] * (.82 + .3*Math.abs(Math.sin(t*17 + u.idx))), tgt[1], tgt[2]]; }
  } else if (now - AV.laughAt < 1100) {
    tgt = [.3 + .2*Math.abs(Math.sin(t*13)), .8, 0];
  } else tgt = [e.open, .5, 0];
  const M = AV.m, ms = Math.min(1, dt*20);
  M.open += (tgt[0] - M.open) * ms; M.wide += (tgt[1] - M.wide) * ms; M.round += (tgt[2] - M.round) * ms;

  // head & body motion
  let hx = Math.sin(t*.53)*2.2 + Math.sin(t*1.31)*.8;
  let hy = Math.sin(t*.71)*1.4 + Math.sin(t*.23)*1.1;
  let rot = Math.sin(t*.37)*1.3 + e.tilt;
  let yaw = Math.sin(t*.29)*.7 + (state === 'thinking' ? -1 : 0);
  if (AV.speaking) { hy += M.open*1.8; rot += Math.sin(t*2.1)*.7; yaw += Math.sin(t*1.7)*.4; }
  if (now - AV.laughAt < 1100) hy += Math.sin(t*13)*1.6;
  if (AV.nod.start >= 0) { const p = (now - AV.nod.start) / 700; if (p >= 1) AV.nod.start = -1; else hy += Math.sin(p*Math.PI*2) * AV.nod.amp * (1 - p*.4); }
  const br = Math.sin(t*1.45) * 1.3;
  const headT = `translate(${f1(hx)} ${f1(hy + br*.5)}) rotate(${f1(rot)} 400 340)`;
  E.avBody.setAttribute('transform', `translate(0 ${f1(br)})`);
  E.avNeck.setAttribute('transform', `translate(${f1(hx*.3)} ${f1(br*.8)})`);
  E.avHeadBack.setAttribute('transform', headT);
  E.avHead.setAttribute('transform', headT);
  E.avFeat.setAttribute('transform', `translate(${f1(yaw*5)} 0)`);

  // eyes
  const up = 9 * ap * (1 + raise*.12) * (1 - e.squint*.3), low = 6.5 * ap * (1 - e.squint*.55);
  for (const [s, cx] of [[-1, 368], [1, 432]]) {
    const d = eyeD(cx, 246, up, low, s), L = s < 0 ? 'L' : 'R';
    E['avEyeClip' + L].setAttribute('d', d.clip);
    E['avLash' + L].setAttribute('d', d.lash);
    E['avLow' + L].setAttribute('d', d.low);
    E['avCrease' + L].setAttribute('d', `M${cx-15} ${f1(239 - raise*2.2)}Q${cx} ${f1(229 - raise*3)} ${cx+15} ${f1(239 - raise*2.2)}`);
    E['avIris' + L].setAttribute('transform', `translate(${f1(g.x)} ${f1(g.y*.7 + (1 - ap)*2)})`);
    E['avBrow' + L].setAttribute('d', browD(s, raise, e.inner, e.furrow));
  }
  // mouth
  const md = mouthD(M.open, M.wide, M.round, smile);
  E.avMouthIn.setAttribute('d', md.inner); E.avMouthClip.setAttribute('d', md.inner);
  E.avLipU.setAttribute('d', md.upper); E.avLipD.setAttribute('d', md.lower);
  E.avLipLine.setAttribute('d', md.line); E.avLipLine.setAttribute('stroke-opacity', f1(Math.max(0, .9 - M.open*3)));
  E.avLipHi.setAttribute('d', md.hi);
  const dop = f1(Math.max(0, smile - .3) * .7);
  E.avDimL.setAttribute('d', md.dimL); E.avDimR.setAttribute('d', md.dimR); E.avDimL.setAttribute('stroke-opacity', dop); E.avDimR.setAttribute('stroke-opacity', dop);
  const th = md.teeth; E.avTeeth.setAttribute('x', th.x); E.avTeeth.setAttribute('y', th.y); E.avTeeth.setAttribute('width', th.w); E.avTeeth.setAttribute('height', th.h);
  const tg = md.tongue; E.avTongue.setAttribute('cx', tg.cx); E.avTongue.setAttribute('cy', tg.cy); E.avTongue.setAttribute('rx', tg.rx); E.avTongue.setAttribute('ry', tg.ry);
  const bo = f1(.18 + smile*.14); E.avBlushL.setAttribute('opacity', bo); E.avBlushR.setAttribute('opacity', bo);

  callFrame(now, userTalking);
}

/* ---------------- Call screen ---------------- */
const CALL_CSS = `
.call{position:fixed;inset:0;z-index:50;background:#0d0f12;color:#f3efe8;overflow:hidden;font-family:var(--sans);-webkit-tap-highlight-color:transparent}
.call .c-stage{position:absolute;inset:0;transition:filter .5s}
.call .c-stage svg{width:100%;height:100%;display:block}
.call.lobby .c-stage,.call.summary .c-stage{filter:brightness(.5) saturate(.85)}
.call.ringing .c-stage{filter:brightness(.35) blur(6px)}
.c-top{position:absolute;top:0;left:0;right:0;padding:calc(14px + env(safe-area-inset-top)) 18px 36px;background:linear-gradient(rgba(0,0,0,.5),transparent);pointer-events:none}
.c-who b{display:block;font:600 19px/1.2 var(--sans);letter-spacing:.01em;text-shadow:0 1px 6px rgba(0,0,0,.4)}
.c-who span{font-size:13.5px;opacity:.85;font-variant-numeric:tabular-nums}
.c-who span.warn{color:#ffd27a;opacity:1}
.c-self{position:absolute;top:calc(14px + env(safe-area-inset-top));right:14px;width:min(27vw,200px);aspect-ratio:3/4;border-radius:14px;overflow:hidden;background:#22262c;box-shadow:0 8px 24px rgba(0,0,0,.45);outline:2px solid rgba(255,255,255,.08);outline-offset:0;transition:outline-color .25s,outline-width .25s;z-index:2}
@media (min-aspect-ratio:1/1){.c-self{aspect-ratio:4/3;width:min(22vw,250px)}}
.c-self video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);display:block}
.c-self .c-nocam{position:absolute;inset:0;display:grid;place-items:center;font-size:13px;color:#9aa0a8;text-align:center;padding:8px}
.c-self.listen{outline-color:rgba(70,200,130,.55)}
.c-self.talk{outline:3px solid #46c882}
.c-self.muted{outline-color:rgba(229,72,77,.7)}
.c-ctrl{position:absolute;left:0;right:0;bottom:0;padding:28px 16px calc(22px + env(safe-area-inset-bottom));display:flex;justify-content:center;gap:18px;background:linear-gradient(transparent,rgba(0,0,0,.55))}
.cbtn{width:58px;height:58px;border-radius:50%;border:0;background:rgba(255,255,255,.17);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;display:grid;place-items:center;padding:0;font:600 14px var(--sans)}
.cbtn svg{width:25px;height:25px}
.cbtn.off{background:#f3efe8;color:#16181c}
.cbtn.end{background:#e5484d;width:70px;border-radius:29px}
.cbtn.end svg{transform:rotate(135deg)}
.c-caps{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(110px + env(safe-area-inset-bottom));width:min(92vw,720px);display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none}
.c-caps div{background:rgba(10,12,14,.66);padding:6px 13px;border-radius:10px;font-size:17px;line-height:1.4;text-align:center}
.c-caps div:empty{display:none}
.c-caps .you{color:#a6e9c3;font-size:15px}
.c-toast{position:absolute;left:50%;top:calc(76px + env(safe-area-inset-top));transform:translateX(-50%);width:max-content;max-width:min(80vw,460px);background:rgba(10,12,14,.72);backdrop-filter:blur(10px);padding:9px 14px;border-radius:12px;font-size:14px;text-align:center;transition:opacity .4s;pointer-events:auto}
@media (max-aspect-ratio:1/1){.c-toast{top:calc(min(27vw,200px)*1.333 + 30px + env(safe-area-inset-top))}}
.c-toast button{margin-left:8px;border:0;border-radius:99px;padding:3px 10px;background:#f3efe8;color:#16181c;font-weight:600;font-size:13px}
.c-ring{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;pointer-events:none}
.c-ring b{font:650 30px var(--serif)}
.c-ring span{opacity:.8;animation:cpulse 1.4s ease-in-out infinite}
@keyframes cpulse{50%{opacity:.35}}
.c-card{position:absolute;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(94vw,440px);max-height:calc(100% - 40px - env(safe-area-inset-top));overflow:auto;border-radius:22px;padding:20px 20px 18px;box-shadow:0 16px 50px rgba(0,0,0,.5)}
@media (min-width:900px) and (min-aspect-ratio:1/1){.c-card.c-lobby,.c-card.c-sum{left:max(32px,calc(50% - 600px));top:50%;bottom:auto;transform:translateY(-50%);width:400px}}
.c-lobby{background:rgba(20,22,26,.84);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.08)}
.c-card h2{font:650 24px/1.2 var(--serif);margin:0 0 4px;letter-spacing:-.01em}
.c-card p.sub{margin:0 0 14px;font-size:14px;opacity:.78}
.c-row{display:flex;align-items:center;gap:10px;margin:10px 0}
.c-row>label{width:70px;flex:none;font-size:13.5px;opacity:.75}
.c-seg{display:flex;flex:1;background:rgba(255,255,255,.08);border-radius:99px;padding:3px}
.c-seg button{flex:1;border:0;background:transparent;color:#cfd3da;padding:6px 0;border-radius:99px;font-weight:500;font-size:14px}
.c-seg button.on{background:#f3efe8;color:#14161a}
.c-lobby input,.c-lobby select{flex:1;min-width:0;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#f3efe8;border-radius:10px;padding:8px 11px;font-size:14px}
.c-lobby select option{color:#111}
.c-lobby .mini{border:1px solid rgba(255,255,255,.16);background:transparent;color:#f3efe8;border-radius:99px;padding:6px 12px;font-size:13px;flex:none}
.c-go{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin-top:16px;border:0;border-radius:99px;padding:13px;background:#2fbf71;color:#fff;font:600 16px var(--sans)}
.c-go svg{width:20px;height:20px}
.c-go:disabled{opacity:.5}
.c-foot{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:12.5px;opacity:.7;gap:10px}
.c-foot button{border:0;background:none;color:inherit;text-decoration:underline;padding:0;font-size:12.5px}
.c-warn{background:rgba(229,72,77,.18);border:1px solid rgba(229,72,77,.4);border-radius:10px;padding:8px 11px;font-size:13.5px;margin:6px 0}
.c-sum{background:var(--surface);color:var(--ink)}
.c-sum p.sub{color:var(--muted);opacity:1}
.c-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
.c-tiles div{background:var(--surface-2);border-radius:12px;padding:10px 8px;text-align:center}
.c-tiles b{display:block;font:650 20px var(--serif)}
.c-tiles span{font-size:12px;color:var(--muted)}
.c-sum h3{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:14px 0 4px}
.c-sum .said{font-size:13px;color:var(--muted);margin-top:8px}
.c-sum .empty{color:var(--muted);font-size:14px}
.c-sum .acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.c-sum .acts .pill.go{background:#2fbf71;border-color:#2fbf71;color:#fff}
`;

const IC = {
  mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  micOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 9.3V6a3 3 0 0 0-5.7-1.3M9 9v2a3 3 0 0 0 4.9 2.3M5 11a7 7 0 0 0 11.3 5.5M19 11a7 7 0 0 1-.6 2.8M12 18v3M3 3l18 18"/></svg>',
  cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M15.5 10.5 21 7.5v9l-5.5-3"/></svg>',
  camOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6h3.5A2.5 2.5 0 0 1 16 8.5v2l5-3v9l-1.6-.9M16 16v-.5M15.2 17.6A2.5 2.5 0 0 1 13.5 18H5a2.5 2.5 0 0 1-2.5-2.5v-7A2.5 2.5 0 0 1 5 6M3 3l18 18"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>'
};

function callBuild(){
  if ($('call')) return;
  const st = document.createElement('style'); st.textContent = CALL_CSS; document.head.appendChild(st);
  const c = el('div', 'call'); c.id = 'call'; c.hidden = true;
  c.innerHTML = `
    <div class="c-stage" id="cStage"></div>
    <div class="c-top"><div class="c-who"><b>Lena</b><span id="cSub">Videoanruf</span></div></div>
    <div class="c-self" id="cSelf"><video id="cVideo" autoplay playsinline muted></video><div class="c-nocam" id="cNoCam" hidden>Kamera aus</div></div>
    <div class="c-caps" id="cCaps" hidden><div class="her" id="cCapHer"></div><div class="you" id="cCapYou"></div></div>
    <div class="c-toast" id="cToast" hidden></div>
    <div class="c-ring" id="cRing" hidden><b>Lena</b><span>Klingelt …</span></div>
    <div class="c-ctrl" id="cCtrl" hidden>
      <button class="cbtn" id="cMic" title="Mikrofon an/aus (M)" aria-label="Mikrofon">${IC.mic}</button>
      <button class="cbtn" id="cCam" title="Kamera an/aus" aria-label="Kamera">${IC.cam}</button>
      <button class="cbtn" id="cCC" title="Untertitel" aria-label="Untertitel">CC</button>
      <button class="cbtn end" id="cEnd" title="Auflegen" aria-label="Auflegen">${IC.phone}</button>
    </div>
    <div class="c-card c-lobby" id="cLobby" hidden>
      <h2>Lena anrufen</h2>
      <p class="sub">Redakteurin aus Bochum, plaudert gern. Sie korrigiert dich nicht während des Gesprächs – deine Fehler siehst du nach dem Auflegen.</p>
      <div id="cWarn"></div>
      <div class="c-row"><label>Dauer</label><div class="c-seg" id="cMin"><button data-v="5">5 min</button><button data-v="10">10 min</button><button data-v="15">15 min</button></div></div>
      <div class="c-row"><label>Niveau</label><div class="c-seg" id="cLevel"><button data-v="A2">A2</button><button data-v="B1">B1</button><button data-v="B2">B2</button><button data-v="C1">C1</button></div></div>
      <div class="c-row"><label>Thema</label><input id="cTopic" placeholder="optional – sonst einfach quatschen" autocomplete="off"></div>
      <div class="c-row"><label>Stimme</label><select id="cVoice"></select><button class="mini" id="cTest" type="button">Hören</button></div>
      <button class="c-go" id="cStart">${IC.phone}<span>Anrufen</span></button>
      <div class="c-foot"><span id="cLast"></span><button id="cClose" type="button">Abbrechen</button></div>
    </div>
    <div class="c-card c-sum" id="cSum" hidden></div>`;
  document.body.appendChild(c);
  avInit($('cStage'));

  $('cMin').onclick = e => { const b = e.target.closest('button'); if (!b) return; call.min = Number(b.dataset.v); S.callMin = call.min; saveSettings(); lobbySync(); };
  $('cLevel').onclick = e => { const b = e.target.closest('button'); if (!b) return; setLevel(b.dataset.v, true); lobbySync(); };
  $('cVoice').onchange = e => { S.callVoice = e.target.value; saveSettings(); };
  $('cTest').onclick = () => { stopSpeaking(); voiceOverride = $('cVoice').value; speakText('Hallo! Ich bin Lena. Schön, dass du anrufst.', false); };
  $('cStart').onclick = startCall;
  $('cClose').onclick = closeCall;
  $('cEnd').onclick = () => hangUp();
  $('cMic').onclick = toggleMute;
  $('cCam').onclick = () => { S.callCam = !(S.callCam !== false); saveSettings(); camSync(); };
  $('cCC').onclick = () => { S.callCC = !S.callCC; saveSettings(); ccSync(); };
  // tapping Lena = interrupt her, or send what you just said right away
  $('cStage').onclick = () => { if (!callActive || call.ringing || call.muted) return; micAction(); };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && callActive && state === 'idle' && !call.muted && !call.ringing) startListening();
  });
  document.addEventListener('keydown', e => {
    if (!callActive || e.target.tagName === 'INPUT') return;
    if (e.key === 'm' || e.key === 'M') toggleMute();
  });
}

function capHer(text){ if ($('cCapHer')) $('cCapHer').textContent = callActive ? text : ''; }
function ccSync(){ $('cCaps').hidden = !S.callCC; $('cCC').classList.toggle('off', !!S.callCC); }
function toast(html, ms){
  const t = $('cToast'); t.innerHTML = html; t.hidden = false; t.style.opacity = 1;
  clearTimeout(call.toastT);
  if (ms) call.toastT = setTimeout(() => { t.style.opacity = 0; setTimeout(() => { t.hidden = true; }, 400); }, ms);
  return t;
}
function hideToast(){ clearTimeout(call.toastT); $('cToast').hidden = true; }

function lobbySync(){
  document.querySelectorAll('#cMin button').forEach(b => b.classList.toggle('on', Number(b.dataset.v) === call.min));
  document.querySelectorAll('#cLevel button').forEach(b => b.classList.toggle('on', b.dataset.v === S.level));
}
function fillVoices(){
  const sel = $('cVoice'); sel.innerHTML = '';
  const list = [...voices].sort((a, b) => (CALL_FEMALE.test(b.name) - CALL_FEMALE.test(a.name)) || (CALL_MALE.test(a.name) - CALL_MALE.test(b.name)));
  if (!list.length) { sel.appendChild(el('option', null, 'Keine deutsche Stimme')); return; }
  for (const v of list) { const o = el('option', null, v.name.replace(/^Microsoft\s+/, '').replace(/\s*-\s*German.*$/i, '') + (CALL_MALE.test(v.name) ? ' (männlich)' : '')); o.value = v.name; sel.appendChild(o); }
  if (!list.some(v => v.name === S.callVoice)) S.callVoice = (list.find(v => CALL_FEMALE.test(v.name) && !CALL_MALE.test(v.name)) || list.find(v => !CALL_MALE.test(v.name)) || list[0]).name;
  sel.value = S.callVoice;
}

async function camSync(){
  const on = S.callCam !== false;
  $('cCam').classList.toggle('off', !on); $('cCam').innerHTML = on ? IC.cam : IC.camOff;
  if (on && !call.cam) {
    try {
      call.cam = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user', width:{ ideal:640 }, height:{ ideal:480 } }, audio:false });
      if ($('call').hidden) { camStop(); return; }
      $('cVideo').srcObject = call.cam; $('cNoCam').hidden = true;
    } catch (err) { call.cam = null; $('cNoCam').hidden = false; $('cNoCam').textContent = 'Kamera nicht verfügbar'; }
  } else if (!on) { camStop(); $('cNoCam').hidden = false; $('cNoCam').textContent = 'Kamera aus'; }
}
function camStop(){ if (call.cam) { call.cam.getTracks().forEach(t => t.stop()); call.cam = null; } if ($('cVideo')) $('cVideo').srcObject = null; }

/* ---------------- Open, call, hang up ---------------- */
function openCall(){
  callBuild();
  stopAll(); setState('idle');
  const c = $('call');
  c.hidden = false; c.className = 'call lobby';
  $('cLobby').hidden = false; $('cSum').hidden = true; $('cCtrl').hidden = true; $('cRing').hidden = true; $('cCaps').hidden = true; hideToast();
  $('cSub').textContent = 'Videoanruf';
  call.min = [5,10,15].includes(Number(S.callMin)) ? Number(S.callMin) : 10;
  $('cTopic').value = $('topic').value.trim();
  fillVoices(); lobbySync();
  const warn = [];
  if (!SR) warn.push('Spracherkennung fehlt in diesem Browser – bitte Edge oder Chrome verwenden.');
  if (!hasTTS || !voices.length) warn.push('Keine deutsche Sprachausgabe gefunden.');
  if (!S.apiKey) warn.push('Zuerst unter ⚙︎ den Claude API-Schlüssel eintragen.');
  $('cWarn').innerHTML = warn.map(w => `<div class="c-warn">${w}</div>`).join('');
  $('cStart').disabled = !SR || !S.apiKey;
  const last = callNotes[callNotes.length - 1];
  $('cLast').textContent = last ? 'Letzter Anruf: ' + new Date(last.at).toLocaleDateString('de-DE', { weekday:'short', day:'numeric', month:'short' }) : '';
  AV.mood = 'lächelt';
  avStart(); camSync();
}
function closeCall(){
  if (callActive) return;
  stopSpeaking(); voiceOverride = null;
  avStop(); camStop();
  $('call').hidden = true;
}

function ringTone(){
  // German ringback: 425 Hz, two short rings
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    for (const s of [0, 1.6]) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 425; o.connect(g); g.connect(audioCtx.destination);
      const t0 = audioCtx.currentTime + s;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + .03);
      g.gain.setValueAtTime(0.12, t0 + .95); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1);
      o.start(t0); o.stop(t0 + 1.02);
    }
  } catch(e){}
}

async function startCall(){
  if (!S.apiKey) { closeCall(); openSettings('Bitte zuerst deinen Claude API-Schlüssel eintragen.'); return; }
  if (history.length && sess && !confirm('Das aktuelle Gespräch wird beendet. Anrufen?')) return;
  stopSpeaking();
  if (mode !== 'free') switchMode('free', true); else newConversation();
  const topic = $('cTopic').value.trim();
  voiceOverride = S.callVoice || null;
  call.info = { when: callWhen(new Date()), topic, memory: callMemory() };
  Object.assign(call, { warned:false, timeUp:false, farewell:false, ended:false, muted:false, silenceSent:false, ringing:true, idleSince:0 });
  callActive = true;
  callHooks = {
    hold: true,
    handsFree: () => !call.muted && !call.ringing,
    suffix: callSuffix,
    after: () => { if (call.farewell && !call.ended) { call.ended = true; return () => setTimeout(() => hangUp(), 700); } return null; },
    onError: callError
  };
  const c = $('call'); c.className = 'call ringing';
  $('cLobby').hidden = true; $('cRing').hidden = false; $('cCtrl').hidden = false;
  $('cCapHer').textContent = ''; $('cCapYou').textContent = ''; ccSync();
  $('cMic').classList.remove('off'); $('cMic').innerHTML = IC.mic;
  AV.mood = 'neutral'; AV.moodSrc = null;
  try { if ('wakeLock' in navigator) call.wake = await navigator.wakeLock.request('screen'); } catch(e){}
  ensureSession(); sess.mode = 'call';
  ringTone();
  sendUser('[ANRUF START]', { hidden:true, label:`Videoanruf mit Lena · ${call.min} min` });
  setTimeout(() => {
    if (!callActive) return;
    call.ringing = false; callHooks.hold = false;
    c.className = 'call'; $('cRing').hidden = true;
    call.start = Date.now(); call.end = call.start + call.min * 60000;
    clearInterval(call.tick); call.tick = setInterval(callTick, 500); callTick();
    if (!S.callHintSeen) { toast('Tipp: Tippe auf Lena, um sie zu unterbrechen – oder um deinen Satz sofort abzuschicken.', 7000); S.callHintSeen = true; saveSettings(); }
    if (speechQueue.length && !speakingNow) speakNext(speechGen);
  }, 2700);
}

function callSuffix(){
  if (!callActive) return '';
  if (call.timeUp && !call.farewell) { call.farewell = true; return '\n[Hinweis der App: Die Zeit ist um. Reagiere kurz auf das, was er gesagt hat, und verabschiede dich dann herzlich. Keine Frage mehr.]'; }
  if (!call.warned && call.end && call.end - Date.now() < 75000) { call.warned = true; return '\n[Hinweis der App: Noch etwa eine Minute. Lenk das Gespräch langsam auf einen Abschluss, aber verabschiede dich noch nicht.]'; }
  return '';
}

function callTick(){
  if (!callActive || !call.start) return;
  const now = Date.now(), left = Math.max(0, Math.round((call.end - now) / 1000));
  const sub = $('cSub');
  sub.textContent = fmtClock(left) + (call.muted ? ' · Mikro aus' : '');
  sub.classList.toggle('warn', left <= 60);
  if (left <= 0 && !call.timeUp) call.timeUp = true;
  // time is up: say goodbye at the next natural moment
  if (call.timeUp && !call.farewell) {
    const empty = !(transcript() || interim);
    if ((state === 'listening' && empty && now - listenStart > 4000) || (state === 'idle' && !speakingNow)) {
      call.farewell = true;
      if (state === 'listening') discardListening();
      sendUser('[ANRUF ENDE]', { hidden:true });
    }
  }
  if (call.timeUp && now > call.end + 75000) hangUp();
  // long silence: Lena checks whether you're still there (once per silence)
  if (state === 'listening' && !call.timeUp) {
    if (transcript() || interim) call.silenceSent = false;
    else if (!call.silenceSent && now - listenStart > 20000) { call.silenceSent = true; discardListening(); sendUser('[STILLE]', { hidden:true }); }
  }
}

function callFrame(now, userTalking){
  if (!callActive) return;
  const self = $('cSelf');
  self.classList.toggle('muted', call.muted);
  self.classList.toggle('listen', state === 'listening' && !userTalking);
  self.classList.toggle('talk', state === 'listening' && userTalking);
  if (S.callCC) $('cCapYou').textContent = state === 'listening' ? [transcript(), interim].filter(Boolean).join(' ') : '';
  if (!AV.speaking && state !== 'speaking' && $('cCapHer').textContent && state === 'listening' && now - AV.stateAt > 4000) $('cCapHer').textContent = '';
}

function toggleMute(){
  if (!callActive || call.ringing) return;
  call.muted = !call.muted;
  $('cMic').classList.toggle('off', call.muted); $('cMic').innerHTML = call.muted ? IC.micOff : IC.mic;
  if (call.muted) { if (listening || finishing) discardListening(); }
  else if (state === 'idle') startListening();
  callTick();
}

function callError(msg, retry){
  const t = toast(`${msg} <button id="cRetry">Nochmal</button>`, 0);
  t.querySelector('#cRetry').onclick = () => { hideToast(); retry(); };
}

function hangUp(){
  if (!callActive) return;
  const startedAt = call.start || Date.now();
  stopAll(); setState('idle');
  callActive = false; callHooks = null; voiceOverride = null;
  clearInterval(call.tick); call.tick = null;
  try { call.wake && call.wake.release(); } catch(e){} call.wake = null;
  camStop(); hideToast();
  const sec = Math.round((Date.now() - startedAt) / 1000);
  showSummary(sec);
  if (sess && sess.turns >= 2) saveCallNotesFromHistory(sec);
}

function callCorrections(){
  // pair every reply's correction block with the user turn before it
  const out = []; let said = null;
  for (const h of history) {
    if (h.role === 'user') { said = /^\[/.test(h.content) ? null : h.content.replace(/\n\[Hinweis der App:[^\]]*\]\s*$/, ''); continue; }
    if (!said) continue;
    const p = parseCorrections(splitOutput(h.content).corr);
    if (p.items.length) out.push({ said, items:p.items });
    said = null;
  }
  return out;
}

function showSummary(sec){
  const c = $('call'); c.className = 'call summary';
  $('cCtrl').hidden = true; $('cCaps').hidden = true; $('cRing').hidden = true;
  $('cSub').textContent = 'Anruf beendet';
  const corr = callCorrections();
  const nItems = corr.reduce((n, g) => n + g.items.length, 0);
  const box = $('cSum'); box.innerHTML = ''; box.hidden = false;
  box.appendChild(el('h2', null, 'Anruf beendet'));
  box.appendChild(el('p', 'sub', `${fmtClock(sec)} Minuten mit Lena · Niveau ${S.level}`));
  const tiles = el('div', 'c-tiles');
  tiles.innerHTML = `<div><b>${sess ? fmtMin(sess.userSec) : '–'}</b><span>du gesprochen</span></div><div><b>${sess ? sess.turns : 0}</b><span>Beiträge</span></div><div><b>${nItems}</b><span>Korrekturen</span></div>`;
  box.appendChild(tiles);
  box.appendChild(el('h3', null, 'Das kannst du besser sagen'));
  if (S.strict === 'off') box.appendChild(el('p', 'empty', 'Korrekturen sind in den Einstellungen ausgeschaltet.'));
  else if (!corr.length) box.appendChild(el('p', 'empty', sess && sess.turns ? 'Nichts notiert – sehr gut!' : 'Du hast in diesem Anruf noch nichts gesagt.'));
  for (const g of corr) {
    box.appendChild(el('div', 'said', '„' + g.said + '“'));
    for (const it of g.items) box.appendChild(corrRow(it));
  }
  const acts = el('div', 'acts');
  const again = el('button', 'pill go', 'Nochmal anrufen'); again.onclick = () => { endSession(); openCall(); };
  const rep = el('button', 'pill', 'Bericht anhören'); rep.disabled = !sess || !sess.turns;
  rep.onclick = () => { closeCall(); endSessionWithReport(); };
  const done = el('button', 'pill', 'Zum Verlauf'); done.onclick = () => { endSession(); closeCall(); };
  acts.append(again, rep, done); box.appendChild(acts);
  AV.mood = 'lächelt';
}

async function saveCallNotesFromHistory(sec){
  const lines = [];
  for (const h of history) {
    if (h.role === 'user') { if (!/^\[/.test(h.content)) lines.push('Er: ' + h.content.replace(/\n\[Hinweis der App:[^\]]*\]\s*$/, '')); }
    else { const s = cleanSpeech(splitOutput(h.content).spoken); if (s) lines.push('Lena: ' + s); }
  }
  if (lines.length < 3) return;
  try {
    const j = await apiJSON(
      'Du fasst ein Telefonat zwischen dem Deutschlernenden („Er“) und seiner Sprachpartnerin Lena für Lenas Gedächtnis zusammen. Antworte nur mit JSON.',
      `Gespräch:\n${lines.join('\n').slice(-12000)}\n\nGib JSON zurück: {"ueber_ihn":[…], "nachfragen":[…], "lena":[…]}\n- ueber_ihn: höchstens 4 neue, konkrete Fakten über ihn, die er erzählt hat (Pläne, Menschen, Erlebnisse, Vorlieben). Kurz, im Telegrammstil.\n- nachfragen: höchstens 3 Dinge, nach denen Lena beim nächsten Anruf fragen kann (z. B. ein Termin, der bevorsteht).\n- lena: höchstens 3 Dinge, die Lena über sich selbst erzählt hat, damit sie beim nächsten Mal dabei bleibt.\nNur, was wirklich gesagt wurde. Leere Listen sind in Ordnung.`, 600);
    const pick = a => Array.isArray(a) ? a.filter(x => typeof x === 'string' && x.trim()).slice(0, 4).map(x => x.trim().slice(0, 160)) : [];
    callNotes.push({ at:Date.now(), min:Math.round(sec / 60), about:pick(j.ueber_ihn), open:pick(j.nachfragen), lena:pick(j.lena) });
    saveCallNotes();
  } catch(e){ /* memory is a bonus – ignore failures */ }
}
