/* ===== TTB — script.js =====
   Needs data.js (MENU, SERVICES, GALLERY) loaded first.
   How it works: ONE page. We keep the chosen language in a variable (lang),
   and every time something changes we "render" the page again in that language. */

const PHONE = '25768857061';            // WhatsApp number (country code, no + sign)
const $ = (s) => document.querySelector(s);   // short helper: $('#app') = getElementById-like

/* ---------- 1. TRANSLATIONS (edit texts here; one block per language) ---------- */
const T = {
  fr: { reserve:'Réserver', service:'Service', gallery:'Galerie', search:'Rechercher un plat…', explore:'Explorer', cats:'catégories',
    food:'Nourriture', drinks:'Boissons', back:'Retour', order:'Commander', items:'articles', none:'Aucun résultat',
    reserveSub:'Choisissez votre créneau, nous confirmons par WhatsApp.', people:'Nombre de personnes', name:'Nom ou surnom',
    date:'Date', time:'Heure', event:"Type d'événement", confirm:'Confirmer la réservation', events:['Réunion','Anniversaire','Mariage','Repas','Autre'],
    serviceSub:'Choisissez le service souhaité.', contact:'Contact', follow:'Suivez-nous', hours:'Tous les jours 6h00 – minuit',
    about:'Cuisine, boissons, cérémonies et divertissement au cœur du Burundi.',
    msgOrder:(n)=>`Bonjour TTB, je commande 1x ${n} (Table/Lieu: ________)`,
    msgRes:(f)=>`Bonjour TTB, je voudrais réserver une table.\nNom: ${f.name}\nPersonnes: ${f.people}\nÉvénement: ${f.event}\nDate: ${f.date} à ${f.time}\nWhatsApp: ${f.phone}`,
    msgSvc:(n)=>`Bonjour TTB, je suis intéressé par: ${n}` },
  en: { reserve:'Reserve', service:'Service', gallery:'Gallery', search:'Search a dish…', explore:'Explore', cats:'categories',
    food:'Food', drinks:'Drinks', back:'Back', order:'Order', items:'items', none:'No results',
    reserveSub:'Choose your slot, we confirm on WhatsApp.', people:'Number of people', name:'Name or nickname',
    date:'Date', time:'Time', event:'Event type', confirm:'Confirm reservation', events:['Meeting','Birthday','Wedding','Meal','Other'],
    serviceSub:'Choose the service you want.', contact:'Contact', follow:'Follow us', hours:'Every day 6:00 AM – Midnight',
    about:'Food, drinks, ceremonies & entertainment in the heart of Burundi.',
    msgOrder:(n)=>`Hello TTB, I would like to order 1x ${n} (Table/Delivery: ________)`,
    msgRes:(f)=>`Hello TTB, I would like to reserve a table.\nName: ${f.name}\nPeople: ${f.people}\nEvent: ${f.event}\nDate: ${f.date} at ${f.time}\nWhatsApp: ${f.phone}`,
    msgSvc:(n)=>`Hello TTB, I am interested in: ${n}` },
  ki: { reserve:'Gufata', service:'Serivisi', gallery:'Amafoto', search:'Rondera ikiribwa…', explore:'Raba', cats:'amoko',
    food:'Ibiribwa', drinks:'Ibinyobwa', back:'Subira inyuma', order:'Tumako', items:'ibintu', none:'Nta kibonetse',
    reserveSub:'Hitamo igihe, tuzogushimangira kuri WhatsApp.', people:'Umubare w’abantu', name:'Izina',
    date:'Itariki', time:'Isaha', event:'Ikiboneka', confirm:'Emeza', events:['Inama','Isabukuru','Ubukwe','Ifunguro','Ibindi'],
    serviceSub:'Hitamo serivisi ushaka.', contact:'Twandikire', follow:'Dukurikire', hours:'Burimunsi 6h00 – ijoro',
    about:'Ibiribwa, ibinyobwa, ibirori n’imyidagaduro mu mutima w’Uburundi.',
    msgOrder:(n)=>`Amahoro TTB, ndashaka gutumako 1x ${n} (Ameza/Ahantu: ________)`,
    msgRes:(f)=>`Amahoro TTB, ndashaka gufata ameza.\nIzina: ${f.name}\nAbantu: ${f.people}\nIkiboneka: ${f.event}\nItariki: ${f.date} saa ${f.time}\nWhatsApp: ${f.phone}`,
    msgSvc:(n)=>`Amahoro TTB, ndashimikiye: ${n}` },
  sw: { reserve:'Weka nafasi', service:'Huduma', gallery:'Picha', search:'Tafuta chakula…', explore:'Gundua', cats:'makundi',
    food:'Chakula', drinks:'Vinywaji', back:'Rudi', order:'Agiza', items:'vitu', none:'Hakuna matokeo',
    reserveSub:'Chagua muda, tutathibitisha kwa WhatsApp.', people:'Idadi ya watu', name:'Jina',
    date:'Tarehe', time:'Saa', event:'Aina ya tukio', confirm:'Thibitisha', events:['Mkutano','Siku ya kuzaliwa','Harusi','Mlo','Nyingine'],
    serviceSub:'Chagua huduma unayotaka.', contact:'Mawasiliano', follow:'Tufuate', hours:'Kila siku 6:00 asubuhi – usiku wa manane',
    about:'Chakula, vinywaji, sherehe na burudani katikati ya Burundi.',
    msgOrder:(n)=>`Habari TTB, nataka kuagiza 1x ${n} (Meza/Mahali: ________)`,
    msgRes:(f)=>`Habari TTB, nataka kuweka nafasi ya meza.\nJina: ${f.name}\nWatu: ${f.people}\nTukio: ${f.event}\nTarehe: ${f.date} saa ${f.time}\nWhatsApp: ${f.phone}`,
    msgSvc:(n)=>`Habari TTB, ninavutiwa na: ${n}` }
};
const FLAGS = { fr:'franceIcon.png', en:'greatBretainIcon.png', ki:'burundiIcon.png', sw:'tanzaniaIcon.png' };

/* ---------- 2. STATE & HELPERS ---------- */
let lang = 'fr';                                   // default language
try { lang = localStorage.getItem('ttb-lang') || 'fr'; } catch (e) {}  // remember choice (may fail: ignore)

const tr  = (v) => (typeof v === 'string' ? v : v[lang] || v.fr || v.en);   // pick the text in current language
const txt = (k) => T[lang][k] ?? CT[lang][k];   // look in T first, then in the cart texts CT
const wa  = (msg) => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;  // build a WhatsApp link

/* ---------- 2b. CART ---------- */
// Cart texts + the WhatsApp message (one block per language)
const CT = {
  fr: { add:'Ajouter', cart:'Mon panier', empty:'Votre panier est vide.', room:'Salle', table:'Table', total:'Total', clear:'Vider le panier',
    send:'Commander sur WhatsApp', pick:'Choisissez la salle et la table pour commander.',
    msgCart:(l,t,r,n)=>`Bonjour TTB, je voudrais commander :\n\n${l.join('\n')}\n\nTotal : ${t}\nSalle : ${r}\nTable : ${n}` },
  en: { add:'Add', cart:'My cart', empty:'Your cart is empty.', room:'Room', table:'Table', total:'Total', clear:'Clear cart',
    send:'Order on WhatsApp', pick:'Choose the room and table to order.',
    msgCart:(l,t,r,n)=>`Hello TTB, I would like to order:\n\n${l.join('\n')}\n\nTotal: ${t}\nRoom: ${r}\nTable: ${n}` },
  ki: { add:'Ongera', cart:'Panier', empty:'Panier irimwo ubusa.', room:'Sare', table:'Ameza', total:'Yose hamwe', clear:'futa panier',
    send:'Tuma itegeko kuri WhatsApp', pick:'Hitamo Sare n’ameza kugira utumize.',
    msgCart:(l,t,r,n)=>`Amahoro TTB, ndashaka gutumako :\n\n${l.join('\n')}\n\nYose hamwe : ${t}\nSare : ${r}\nAmeza : ${n}` },
  sw: { add:'Ongeza', cart:'Kikapu changu', empty:'Kikapu chako ki tupu.', room:'Chumba', table:'Meza', total:'Jumla', clear:'Futa kikapu',
    send:'Agiza kwa WhatsApp', pick:'Chagua chumba na meza ili kuagiza.',
    msgCart:(l,t,r,n)=>`Habari TTB, nataka kuagiza :\n\n${l.join('\n')}\n\nJumla : ${t}\nChumba : ${r}\nMeza : ${n}` }
};
// The 3 rooms (each has tables 1 to 20)
const ROOMS = [
  { en:'Main Room', fr:'Grande salle', ki:'sare nini', sw:'Chumba Kikuu' },
  { en:'Small Room', fr:'Petite salle', ki:'sare ntoya', sw:'Chumba Kidogo' },
  { en:'TV Room', fr:'Salle avec écran TV', ki:'sare irimwo tereviziyo', sw:'Chumba cha TV' }
];
// Give every dish an id and a numeric price ("20,000 BIF" -> 20000). ALL[id] finds a dish quickly.
const ALL = [];
MENU.forEach((c) => c.items.forEach((i) => { i.id = ALL.length; i.num = parseInt(i.p.replace(/\D/g, '')) || 0; i.info = c.info; ALL.push(i); }));
// The cart is an object { dishId: quantity }, saved in the browser so a refresh keeps it
let cart = {};
try { cart = JSON.parse(localStorage.getItem('ttb-cart')) || {}; } catch (e) {}
Object.keys(cart).forEach((id) => { if (!ALL[id]) delete cart[id]; });   // forget dishes that no longer exist
const fmt = (n) => n.toLocaleString('en-US') + ' BIF';                  // 36000 -> "36,000 BIF"

// The button shown on each dish: "Add", or - 1 + once it is in the cart
const actHTML = (id) => cart[id]
  ? `<div class="qty"><button data-dec="${id}">−</button><b>${cart[id]}</b><button data-inc="${id}">+</button></div>`
  : `<button class="order" data-inc="${id}">🛒 ${txt('add')}</button>`;

function change(id, d) {                       // d = +1 or -1
  cart[id] = (cart[id] || 0) + d;
  if (cart[id] <= 0) delete cart[id];
  try { localStorage.setItem('ttb-cart', JSON.stringify(cart)); } catch (e) {}
  document.querySelectorAll(`.act[data-id="${id}"]`).forEach((e) => (e.innerHTML = actHTML(id)));
  renderCart();
}

function renderCart() {                        // redraws the floating button, the cart lines, the total and the WhatsApp link
  const ids = Object.keys(cart);
  const count = ids.reduce((s, i) => s + cart[i], 0);
  const total = ids.reduce((s, i) => s + ALL[i].num * cart[i], 0);
  $('#cartbtn').hidden = !count;
  $('#cartbtn').textContent = `🛒 ${count} · ${fmt(total)}`;
  $('#cartlines').innerHTML = ids.map((i) => `<div class="line"><span>${tr(ALL[i].n)}<small>${ALL[i].p}</small></span>
    <div class="qty"><button data-dec="${i}">−</button><b>${cart[i]}</b><button data-inc="${i}">+</button></div>
    <b>${fmt(ALL[i].num * cart[i])}</b></div>`).join('') || `<p class="sub">${txt('empty')}</p>`;
  $('#carttotal').textContent = fmt(total);
  const room = $('#room').value, table = $('#table').value, send = $('#send');
  const ready = count && room !== '' && table !== '';        // order only when room AND table are chosen
  send.classList.toggle('disabled', !ready);
  if (ready) {
    const lines = ids.map((i) => `${cart[i]}x ${tr(ALL[i].n)} — ${fmt(ALL[i].num * cart[i])}`);
    send.href = wa(txt('msgCart')(lines, fmt(total), tr(ROOMS[room]), table));
  } else send.removeAttribute('href');
}

/* ---------- 3. VIEWS: each function returns HTML for #app ---------- */
function homeView() {
  const card = (c) => `<a class="card" href="#cat-${c.id}">
      <img src="${c.img}" alt="" loading="lazy" onerror="this.style.display='none'" />
      <span>${c.e} ${tr(c.n)}</span><i>›</i></a>`;
  const group = (g) => `<section class="${g}">
      <h2 class="group">${g === 'food' ? '🍽️' : '🍹'} ${txt(g)}</h2>
      <div class="cards">${MENU.filter((c) => c.g === g).map(card).join('')}</div></section>`;
  return `<div class="row"><span class="label">${txt('explore')}</span>
      <span class="count">${MENU.length} ${txt('cats')}</span></div>${group('food')}${group('drinks')}`;
}

function itemHTML(it) {               // one dish: name, price, and the Add / quantity button (none for info-only items)
  return `<div class="item"><div class="top"><b>${tr(it.n)}</b><span class="price">${it.p}</span></div>
    ${it.info ? '' : `<div class="act" data-id="${it.id}">${actHTML(it.id)}</div>`}</div>`;
}

function listView(title, items, g) {
  return `<div class="row"><button class="back" onclick="location.hash=''">← ${txt('back')}</button>
      <h2>${title}</h2></div>
    <div class="row"><span></span><span class="count">${items.length} ${txt('items')}</span></div>
    <div class="items ${g}">${items.map((i) => itemHTML(i, g)).join('') || `<p>${txt('none')}</p>`}</div>`;
}

function galleryView() {
  return `<div class="row"><button class="back" onclick="location.hash=''">← ${txt('back')}</button>
      <h2>${txt('gallery')}</h2></div>
    <div class="gal">${GALLERY.map((g, i) => `<figure onclick="openLB(${i})">
      <img src="${g.img}" alt="${g.t}" loading="lazy" /><figcaption><h4>${g.t}</h4><p>${g.d}</p></figcaption></figure>`).join('')}</div>`;
}

/* ---------- 4. RENDER: choose the view from the URL hash ---------- */
function render() {
  const h = location.hash.slice(1);            // '' | 'gallery' | 'cat-xxx'
  const q = $('#search').value.trim().toLowerCase();
  let html;
  if (q) {                                     // searching: look in every dish name (all languages)
    const hits = MENU.flatMap((c) => c.items.map((i) => ({ ...i, g: c.g, info: c.info })))
      .filter((i) => JSON.stringify(i.n).toLowerCase().includes(q));
    html = listView('🔍 ' + q, hits, '');
  } else if (h === 'gallery') html = galleryView();
  else if (h.startsWith('cat-')) {
    const c = MENU.find((m) => m.id === h.slice(4));
    html = c ? listView(`${c.e} ${tr(c.n)}`, c.items.map((i) => ({ ...i, info: c.info })), c.g) : homeView();
  } else html = homeView();
  $('#app').innerHTML = html;
  $('#lang').style.display = (!h && !q) ? 'flex' : 'none';   // language switcher: home page only
  if (!q) window.scrollTo(0, 0);
}

/* ---------- 5. LANGUAGE: fill every [data-i] text, build buttons, popups ---------- */
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i]').forEach((el) => (el.textContent = txt(el.dataset.i)));
  $('#search').placeholder = txt('search');
  $('#evsel').innerHTML = txt('events').map((e) => `<option>${e}</option>`).join('');
  $('#svcgrid').innerHTML = SERVICES.map((s) => `<a class="svc" target="_blank" href="${wa(txt('msgSvc')(tr(s.n)))}">
      <em>${s.e}</em><b>${tr(s.n)}</b><small>${tr(s.d)}</small></a>`).join('');
  $('#lang').innerHTML = Object.keys(T).map((l) => `<button class="${l === lang ? 'on' : ''}" onclick="setLang('${l}')">
      <img src="images/${FLAGS[l]}" alt="">${l.toUpperCase()}</button>`).join('');
  const r = $('#room').value, t = $('#table').value;     // keep the choices when the language changes
  $('#room').innerHTML = `<option value="">${txt('room')}…</option>` + ROOMS.map((x, i) => `<option value="${i}">${tr(x)}</option>`).join('');
  $('#table').innerHTML = `<option value="">${txt('table')}…</option>` + Array.from({ length: 20 }, (_, i) => `<option>${i + 1}</option>`).join('');
  $('#room').value = r; $('#table').value = t;
  renderCart();
  render();
}
function setLang(l) { lang = l; try { localStorage.setItem('ttb-lang', l); } catch (e) {} applyLang(); }

/* ---------- 6. GALLERY full-screen viewer ---------- */
function openLB(i) {
  const g = GALLERY[i];
  $('#lb-img').src = g.img; $('#lb-t').textContent = g.t; $('#lb-d').textContent = g.d;
  $('#lightbox').hidden = false;
}
const closeLB = () => ($('#lightbox').hidden = true);

/* ---------- 7. EVENTS ---------- */
window.addEventListener('hashchange', () => { $('#search').value = ''; render(); });
$('#search').addEventListener('input', render);
document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => $('#' + b.dataset.open).showModal()));
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
document.querySelectorAll('[data-close-lb]').forEach((b) => b.addEventListener('click', closeLB));
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeLB());
$('#rform').addEventListener('submit', (e) => {      // reservation -> open WhatsApp with the details
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  window.open(wa(txt('msgRes')(f)), '_blank');
  $('#reserve').close();
});

// Cart events: one listener catches every "+", "-" and "Add" button (event delegation)
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-inc],[data-dec]');
  if (b) change(b.dataset.inc ?? b.dataset.dec, b.dataset.inc !== undefined ? 1 : -1);
});
$('#cartbtn').addEventListener('click', () => $('#cart').showModal());
$('#room').addEventListener('change', renderCart);
$('#table').addEventListener('change', renderCart);
$('#clear').addEventListener('click', () => { cart = {}; try { localStorage.removeItem('ttb-cart'); } catch (e) {} renderCart(); render(); });

applyLang();   // start!
