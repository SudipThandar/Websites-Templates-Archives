/* Kanchen House — interactions (vanilla, no dependencies) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icon = id => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /* ---------- Data ---------- */
  const ROOMS = [
    { id: 'garden', name: 'Garden Room', rate: 7200, count: 4, size: '28 m²', bed: 'Queen bed', view: 'Rose garden & estate', max: 2,
      img: 'assets/img/room-window.jpg', gallery: ['assets/img/room-window.jpg', 'assets/img/room-detail.jpg', 'assets/img/tea-rows.jpg'],
      badge: 'Step-free',
      desc: 'Our quietest rooms, opening onto the rose garden planted in 1911. Step-free from the drive, with a cast-iron wood stove and a reading chair by the window.',
      amen: ['Wood stove', 'Rain shower', 'Estate tea tray', 'Electric blanket', 'Fibre Wi-Fi', 'Garden sit-out'] },
    { id: 'heritage', name: 'Heritage Room', rate: 9800, count: 4, size: '34 m²', bed: 'King or twin', view: 'Tea slopes', max: 3,
      img: 'assets/img/room-heritage.jpg', gallery: ['assets/img/room-heritage.jpg', 'assets/img/room-detail.jpg', 'assets/img/estate-village.jpg'],
      badge: 'Most booked',
      desc: 'Original teak floors, planters’ chairs and a tall sash window over the slopes. The rooms where the estate’s managers lived for half a century.',
      amen: ['Working fireplace', 'Clawfoot tub', 'Writing desk', 'Planter’s chairs', 'Fibre Wi-Fi', 'Bose speaker'] },
    { id: 'planters', name: 'Planter’s Suite', rate: 14200, count: 3, size: '52 m²', bed: 'King bed + day bed', view: 'Valley & peaks', max: 3,
      img: 'assets/img/room-planters.jpg', gallery: ['assets/img/room-planters.jpg', 'assets/img/lounge-leather.jpg', 'assets/img/kanchen-trees.jpg'],
      badge: 'Best for couples',
      desc: 'A bedroom and a separate sitting room with its own fire, painted in the green the first planter chose in 1889. Corner windows catch both sunrise and the valley.',
      amen: ['Separate sitting room', 'Two fireplaces', 'Clawfoot tub', 'Rain shower', 'Butler on call', 'Mini bar of estate teas'] },
    { id: 'kanchen', name: 'Kangchenjunga Suite', rate: 18500, count: 2, size: '60 m²', bed: 'King bed', view: 'Full Kangchenjunga', max: 3,
      img: 'assets/img/room-kanchen.jpg', gallery: ['assets/img/room-kanchen.jpg', 'assets/img/kanchen-alpenglow.jpg', 'assets/img/room-window.jpg'],
      badge: 'The view',
      desc: 'A bay of five French windows aimed squarely at the mountain, 74 km away across the valley. We knock with tea whenever the peaks come out at dawn.',
      amen: ['Five-window bay', 'Bath with a mountain view', 'Telescope', 'Fireplace', 'Private verandah', 'Dawn wake-up call'] },
    { id: 'cottage', name: 'Tea Master’s Cottage', rate: 26000, count: 1, size: '85 m²', bed: '2 bedrooms', view: 'Private garden', max: 5,
      img: 'assets/img/room-cottage.jpg', gallery: ['assets/img/room-cottage.jpg', 'assets/img/lounge-fire.jpg', 'assets/img/lone-tree.jpg'],
      badge: 'Families',
      desc: 'The stone cottage where the estate’s tea master lived, set apart in its own walled garden. Two bedrooms, a timbered living room with a big fire, and a kitchenette.',
      amen: ['Two bedrooms', 'Living room & fireplace', 'Walled garden', 'Kitchenette', 'Children’s tea kit', 'Private bonfire nights'] }
  ];
  const EXTRA_ADULT = 2200;
  const TRANSFER = 4500;
  const gstRate = rate => (rate <= 7500 ? 0.05 : 0.18);
  const otaRate = rate => Math.round((rate * 1.16) / 50) * 50;

  /* ---------- Dates ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const nightsBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const pretty = s => parse(s).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const state = {
    checkin: iso(addDays(today, 14)),
    checkout: iso(addDays(today, 18)),
    adults: 2, children: 0, room: null, step: 1
  };

  /* ---------- Header, sticky booking bar, mobile bar ---------- */
  const hdr = $('#hdr');
  const bookbarWrap = $('#bookbar');
  const mbook = $('#mbook');
  const hero = $('.hero');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const heroBottom = hero.offsetHeight - 80;
    hdr.classList.toggle('is-solid', y > 30);
    const goingDown = y > lastY + 2;
    const goingUp = y < lastY - 2;
    if (y > heroBottom && goingDown && !hdr.classList.contains('menu-open')) hdr.classList.add('is-hidden');
    else if (goingUp || y < heroBottom) hdr.classList.remove('is-hidden');
    bookbarWrap.classList.toggle('with-hdr', !hdr.classList.contains('is-hidden'));
    bookbarWrap.classList.toggle('stuck', bookbarWrap.getBoundingClientRect().top <= 80);
    mbook.classList.toggle('show', y > hero.offsetHeight * 0.55);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const menuBtn = $('.menu-btn');
  const mnav = $('#mnav');
  const setMenu = open => {
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mnav.classList.toggle('open', open);
    hdr.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  $$('a, button', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal, .route').forEach((el, i) => {
      // gentle stagger for siblings
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 5) * 90}ms`;
      io.observe(el);
    });
  } else {
    $$('.reveal, .route').forEach(el => el.classList.add('in'));
  }

  /* ---------- Parallax ---------- */
  const px = $$('[data-parallax]');
  if (px.length && !reduceMotion) {
    let ticking = false;
    const run = () => {
      const vh = innerHeight;
      px.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax);
        const offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.transform = `translate3d(0,${offset.toFixed(1)}px,0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(run); ticking = true; } }, { passive: true });
    run();
  }

  /* ---------- Room cards ---------- */
  const grid = $('#room-grid');
  grid.innerHTML = ROOMS.map(r => `
    <button class="room reveal" data-room="${r.id}" aria-haspopup="dialog">
      <div class="room__media">
        <img src="${r.img}" alt="${r.name} interior" loading="lazy">
        <span class="room__badge">${r.badge}</span>
      </div>
      <div class="room__body">
        <div class="room__top">
          <h3 class="room__name">${r.name}</h3>
          <span class="room__price">from <strong>${inr(r.rate)}</strong></span>
        </div>
        <ul class="room__specs">
          <li>${icon('area')}${r.size}</li>
          <li>${icon('bed')}${r.bed}</li>
          <li>${icon('view')}${r.view}</li>
          <li>${icon('guests')}Up to ${r.max}</li>
        </ul>
        <span class="room__more">View room ${icon('arrow')}</span>
      </div>
    </button>`).join('');
  // newly added reveals
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } }), { threshold: 0.08 });
    $$('.room', grid).forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 110}ms`; io2.observe(el); });
  } else $$('.room', grid).forEach(el => el.classList.add('in'));

  /* ---------- Modals ---------- */
  const openDialog = d => {
    if (!d.open) d.showModal();
    document.body.style.overflow = 'hidden';
  };
  const closeDialog = d => {
    d.close();
  };
  $$('dialog').forEach(d => {
    d.addEventListener('close', () => { if (!$$('dialog').some(x => x.open)) document.body.style.overflow = ''; });
    d.addEventListener('click', e => { if (e.target === d) closeDialog(d); });
    $$('[data-close]', d).forEach(b => b.addEventListener('click', () => closeDialog(d)));
  });

  // Room detail
  const roomModal = $('#room-modal');
  const rmContent = $('#rm-content');
  const roomById = id => ROOMS.find(r => r.id === id);
  const leftFor = r => {
    const seed = (parse(state.checkin).getDate() + r.count * 7 + r.id.length) % 3;
    return Math.max(1, Math.min(r.count, r.count - seed));
  };
  const openRoom = id => {
    const r = roomById(id);
    const left = leftFor(r);
    rmContent.innerHTML = `
      <div class="rm__gallery">
        <img class="rm__main" src="${r.gallery[0]}" alt="${r.name}">
        <div class="rm__thumbs">${r.gallery.map((g, i) => `<button type="button" aria-pressed="${i === 0}" aria-label="Show photo ${i + 1}"><img src="${g}" alt=""></button>`).join('')}</div>
      </div>
      <div class="rm__info">
        <p class="eyebrow">${r.count} ${r.count > 1 ? 'rooms' : 'cottage'} · ${r.badge}</p>
        <h2 id="rm-title">${r.name}</h2>
        <p>${r.desc}</p>
        <ul class="rm__specs">
          <li>${icon('area')}${r.size}</li><li>${icon('bed')}${r.bed}</li>
          <li>${icon('view')}${r.view}</li><li>${icon('guests')}Up to ${r.max} guests</li>
        </ul>
        <ul class="rm__amen">${r.amen.map(a => `<li>${a}</li>`).join('')}<li>Breakfast &amp; high tea</li><li>Guided garden walk</li></ul>
        <div class="rm__cta">
          <p>from <strong>${inr(r.rate)}</strong> / night<span class="rm__left">${left <= 2 ? `Only ${left} left for your dates` : `${left} available for your dates`} · ${inr(otaRate(r.rate))} on OTAs</span></p>
          <button class="btn btn--tea" type="button" data-select="${r.id}">Select room ${icon('arrow')}</button>
        </div>
      </div>`;
    const main = $('.rm__main', rmContent);
    $$('.rm__thumbs button', rmContent).forEach((b, i) => b.addEventListener('click', () => {
      main.src = r.gallery[i];
      $$('.rm__thumbs button', rmContent).forEach(x => x.setAttribute('aria-pressed', x === b));
    }));
    $('[data-select]', rmContent).addEventListener('click', () => {
      state.room = r.id;
      closeDialog(roomModal);
      if (state.adults + state.children > r.max) { state.adults = Math.min(state.adults, r.max); state.children = Math.max(0, Math.min(state.children, r.max - state.adults)); }
      openBooking(1);
    });
    openDialog(roomModal);
  };
  grid.addEventListener('click', e => { const b = e.target.closest('[data-room]'); if (b) openRoom(b.dataset.room); });

  /* ---------- Booking bar ---------- */
  const bbForm = $('#bookbar-form');
  const bbIn = $('#bb-in'), bbOut = $('#bb-out'), bbAdults = $('#bb-adults');
  const bbErr = $('.bookbar__err', bbForm);
  bbIn.min = iso(today); bbOut.min = iso(addDays(today, 1));
  const syncBar = () => { bbIn.value = state.checkin; bbOut.value = state.checkout; bbAdults.value = String(Math.min(5, state.adults)); };
  syncBar();
  bbIn.addEventListener('change', () => {
    if (bbIn.value && (!bbOut.value || bbOut.value <= bbIn.value)) bbOut.value = iso(addDays(parse(bbIn.value), 2));
    bbOut.min = bbIn.value ? iso(addDays(parse(bbIn.value), 1)) : bbOut.min;
  });
  const validateDates = (ci, co) => {
    if (!ci || !co) return 'Please choose both arrival and departure dates.';
    if (parse(ci) < today) return 'Arrival can’t be in the past.';
    const n = nightsBetween(ci, co);
    if (n < 1) return 'Departure must be after arrival.';
    if (n > 30) return 'For stays over 30 nights, please write to stay@kanchenhouse.in.';
    return '';
  };
  bbForm.addEventListener('submit', e => {
    e.preventDefault();
    const err = validateDates(bbIn.value, bbOut.value);
    bbErr.textContent = err;
    if (err) return;
    state.checkin = bbIn.value; state.checkout = bbOut.value; state.adults = +bbAdults.value;
    openBooking(2);
  });

  /* ---------- Booking flow ---------- */
  const bookModal = $('#book-modal');
  const bk = $('#bk-form');
  const stepsEl = $$('#bk-steps li');
  const panels = $$('.bk__step', bk);
  const backBtn = $('#bk-back'), nextBtn = $('#bk-next');
  const errEl = $('#bk-err'), totalEl = $('#bk-total');
  const ci = bk.elements.checkin, co = bk.elements.checkout;
  ci.min = iso(today);

  const nights = () => Math.max(0, nightsBetween(state.checkin, state.checkout));
  const quote = r => {
    const n = nights();
    const extra = Math.max(0, state.adults - 2) * EXTRA_ADULT;
    const nightly = r.rate + extra;
    const base = nightly * n;
    const gst = base * gstRate(nightly);
    const freeTransfer = n >= 4;
    const transfer = bk.elements.pickup.checked && !freeTransfer ? TRANSFER : 0;
    const ota = (otaRate(r.rate) + extra) * n * (1 + gstRate(otaRate(r.rate) + extra));
    return { n, nightly, extra, base, gst, transfer, freeTransfer, total: base + gst + transfer, otaSave: ota - (base + gst) };
  };

  const renderRooms = () => {
    const guests = state.adults + state.children;
    $('#bk-rooms').innerHTML = ROOMS.map(r => {
      const fits = guests <= r.max;
      const left = leftFor(r);
      const n = nights();
      return `<label class="bkroom${fits ? '' : ' disabled'}">
        <input type="radio" name="room" value="${r.id}" ${state.room === r.id && fits ? 'checked' : ''} ${fits ? '' : 'disabled'}>
        <img src="${r.img}" alt="">
        <div><h4>${r.name}</h4><p>${r.size} · ${r.view} · up to ${r.max}</p>
          <p class="left">${fits ? (left <= 2 ? `Only ${left} left` : `${left} available`) : `Sleeps ${r.max}, too small for ${guests}`}</p></div>
        <div class="bkroom__price"><strong>${inr(r.rate)}</strong>/night · ${n} night${n === 1 ? '' : 's'} ${inr(r.rate * n)}</div>
      </label>`;
    }).join('');
    $$('#bk-rooms input').forEach(i => i.addEventListener('change', () => { state.room = i.value; errEl.textContent = ''; updateTotal(); }));
  };

  const renderSummary = () => {
    const r = roomById(state.room);
    const q = quote(r);
    const gstPct = Math.round(gstRate(q.nightly) * 100);
    const perks = ['Late checkout till 2 pm', 'Welcome tea tasting', '10% off spa'];
    if (q.freeTransfer) perks.push('Free Bagdogra / NJP transfer');
    $('#bk-summary').innerHTML = `
      <div class="summary__room"><img src="${r.img}" alt="">
        <div><h4>${r.name}</h4><p>${pretty(state.checkin)} → ${pretty(state.checkout)} · ${q.n} night${q.n > 1 ? 's' : ''}<br>${state.adults} adult${state.adults > 1 ? 's' : ''}${state.children ? `, ${state.children} child${state.children > 1 ? 'ren' : ''}` : ''} · ${bk.elements.name.value.trim()}</p></div>
      </div>
      <ul class="perks-applied" aria-label="Direct booking perks applied">${perks.map(p => `<li>${icon('check')}${p}</li>`).join('')}</ul>
      <ul class="lines">
        <li><span>${inr(r.rate)} × ${q.n} night${q.n > 1 ? 's' : ''}</span><span>${inr(r.rate * q.n)}</span></li>
        ${q.extra ? `<li><span>Extra adult · ${inr(EXTRA_ADULT)} × ${q.n}</span><span>${inr(q.extra * q.n)}</span></li>` : ''}
        <li><span>GST ${gstPct}%<small>${gstPct === 5 ? 'Tariff up to ₹7,500 per night' : 'Tariff above ₹7,500 per night'}</small></span><span>${inr(q.gst)}</span></li>
        ${bk.elements.pickup.checked ? `<li class="${q.freeTransfer ? 'perk' : ''}"><span>Airport / station transfer</span><span>${q.freeTransfer ? 'Complimentary' : inr(TRANSFER)}</span></li>` : ''}
        <li class="perk"><span>Breakfast, high tea &amp; garden walk</span><span>Included</span></li>
        <li class="total"><span>Total payable at the house</span><strong>${inr(q.total)}</strong></li>
      </ul>
      <p class="save">${icon('shield')}<span>You save about <strong>${inr(Math.max(0, q.otaSave))}</strong> versus the same stay on OTAs. ${addDays(parse(state.checkin), -14) > today ? `Free cancellation until ${pretty(iso(addDays(parse(state.checkin), -14)))}.` : 'Arrival is within 14 days, so one night is non-refundable.'}</span></p>`;
  };

  const updateTotal = () => {
    const n = nights();
    if (state.step >= 2 && state.room && n > 0) {
      const q = quote(roomById(state.room));
      totalEl.innerHTML = `<strong>${inr(q.total)}</strong>${n} night${n > 1 ? 's' : ''}, incl. GST`;
    } else if (n > 0) {
      totalEl.innerHTML = `<strong>${n} night${n > 1 ? 's' : ''}</strong>${pretty(state.checkin)} – ${pretty(state.checkout)}`;
    } else totalEl.innerHTML = '';
  };

  const setStep = s => {
    state.step = s;
    panels.forEach(p => p.classList.toggle('active', +p.dataset.step === s));
    stepsEl.forEach(li => {
      const n = +li.dataset.step;
      li.classList.toggle('done', n < s);
      li.classList.toggle('current', n === s);
      if (n === s) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    bk.classList.toggle('is-done', s === 5);
    backBtn.style.visibility = s > 1 && s < 5 ? 'visible' : 'hidden';
    nextBtn.innerHTML = s === 4 ? `Confirm reservation ${icon('arrow')}` : `Continue ${icon('arrow')}`;
    errEl.textContent = '';
    if (s === 1) { ci.value = state.checkin; co.value = state.checkout; updateNightsHint(); }
    if (s === 2) renderRooms();
    if (s === 3) bk.elements.name.focus({ preventScroll: true });
    if (s === 4) renderSummary();
    if (s === 5) $('.bk__done', bk).focus();
    $('#pickup-note').textContent = nights() >= 4 ? 'Complimentary for your 4+ night stay' : '₹4,500 per car · free on stays of 4+ nights';
    updateTotal();
    $('.modal__body', bookModal).scrollTop = 0;
  };

  const updateNightsHint = () => {
    const n = ci.value && co.value ? nightsBetween(ci.value, co.value) : 0;
    $('#bk-nights').textContent = n > 0
      ? `${n} night${n > 1 ? 's' : ''}${n >= 4 ? ' · includes free airport transfer' : ' · stay 4+ nights for a free airport transfer'}`
      : '';
  };
  const syncSteppers = () => {
    bk.elements['adults-out'].value = state.adults;
    bk.elements['children-out'].value = state.children;
  };
  $$('[data-step-btn]', bk).forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.stepBtn, d = +b.dataset.delta;
    const lim = k === 'adults' ? [1, 5] : [0, 3];
    state[k] = Math.min(lim[1], Math.max(lim[0], state[k] + d));
    if (state.adults + state.children > 5) state[k] -= d;
    syncSteppers();
  }));
  ci.addEventListener('change', () => {
    if (ci.value && (!co.value || co.value <= ci.value)) co.value = iso(addDays(parse(ci.value), 2));
    co.min = ci.value ? iso(addDays(parse(ci.value), 1)) : '';
    state.checkin = ci.value; state.checkout = co.value; updateNightsHint(); updateTotal();
  });
  co.addEventListener('change', () => { state.checkout = co.value; updateNightsHint(); updateTotal(); });
  bk.elements.pickup.addEventListener('change', updateTotal);

  const validateStep = s => {
    $$('.field--box', bk).forEach(f => f.classList.remove('invalid'));
    if (s === 1) {
      const err = validateDates(ci.value, co.value);
      if (err) { ci.closest('.field').classList.add('invalid'); return err; }
      state.checkin = ci.value; state.checkout = co.value;
    }
    if (s === 2) {
      if (!state.room) return 'Please choose a room to continue.';
      if (state.adults + state.children > roomById(state.room).max) return 'That room is too small for your party. Please choose another.';
    }
    if (s === 3) {
      const bad = ['name', 'phone', 'email'].map(n => bk.elements[n]).filter(i => !i.checkValidity() || !i.value.trim());
      bad.forEach(i => i.closest('.field').classList.add('invalid'));
      if (bad.length) { bad[0].focus(); return bad[0].name === 'email' ? 'Please enter a valid email address.' : bad[0].name === 'phone' ? 'Please enter a valid mobile number.' : 'Please tell us your name.'; }
    }
    return '';
  };

  bk.addEventListener('submit', e => {
    e.preventDefault();
    const err = validateStep(state.step);
    if (err) { errEl.textContent = err; return; }
    if (state.step === 4) {
      const ref = 'KH-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      $('#bk-ref').textContent = ref;
      $('#bk-email').textContent = bk.elements.email.value.trim();
      setStep(5);
      return;
    }
    // skip room step if room already chosen from room modal and we're on dates
    setStep(state.step + 1);
  });
  backBtn.addEventListener('click', () => setStep(Math.max(1, state.step - 1)));

  function openBooking(step = 1) {
    syncSteppers();
    ci.value = state.checkin; co.value = state.checkout;
    if (state.step === 5) { bk.reset(); state.room = state.room; }
    openDialog(bookModal);
    setStep(step);
  }
  $$('[data-open-booking]').forEach(b => b.addEventListener('click', () => openBooking(1)));
  bookModal.addEventListener('close', syncBar);

  /* ---------- Weather widget (static data, live clock) ---------- */
  const clock = $('#wx-clock'), wdate = $('#wx-date');
  const tick = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    wdate.textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
    const h = +now.toLocaleTimeString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
    $('#wx-state').textContent = h >= 5 && h < 10 ? 'out' : h >= 10 && h < 18 ? 'resting in cloud' : 'due at dawn';
  };
  tick(); setInterval(tick, 30000);

  /* ---------- Seasons ---------- */
  const MONTHS = [
    ['Jan', 'v', 'Crisp, clear and cold', '2° – 9°', 'The clearest skies of the year and frost on the tea. Fires all day, quiet house, the mountain out most mornings.'],
    ['Feb', 'v', 'Late winter light', '4° – 11°', 'Clear dawns continue and rhododendrons begin flowering on the upper road. Excellent value midweek.'],
    ['Mar', 'vf', 'First flush begins', '7° – 15°', 'The year’s most prized tea is plucked. Factory tours run daily and the mountain still shows most mornings.'],
    ['Apr', 'vf', 'Peak first flush', '10° – 18°', 'Magnolias, cherry blossom and first-flush tastings. Book early: April and May fill by January.'],
    ['May', 'f', 'Second flush & warm days', '12° – 19°', 'The muscatel second flush starts. Haze softens the views, but evenings on the verandah are perfect.'],
    ['Jun', 'fr', 'Monsoon arrives', '14° – 19°', 'Cloud pours through the garden. Waterfalls, orchids, and the best rates of the year.'],
    ['Jul', 'r', 'Deep monsoon', '15° – 20°', 'Rain most afternoons and a hushed, green house. For writers, readers and long lunches.'],
    ['Aug', 'r', 'Monsoon garden', '15° – 20°', 'Lush and misty. Rain flush teas, cloud-forest walks with leeches kept politely at bay by our guides.'],
    ['Sep', 'rf', 'Rains clear out', '14° – 19°', 'Late in the month the skies begin to wash clean and autumnal plucking begins.'],
    ['Oct', 'vf', 'The great clearing', '10° – 17°', 'Puja holidays, the autumn flush and the first long views of the season. Our most-requested month.'],
    ['Nov', 'v', 'Clearest views', '7° – 14°', 'Kangchenjunga out almost every morning, often all day. Golden light and bonfire evenings.'],
    ['Dec', 'v', 'Christmas in the hills', '3° – 11°', 'Clear, cold and festive. Plum cake, carols at St Andrew’s and a roaring fire in every room.']
  ];
  const monthsEl = $('#months'), note = $('#month-note');
  monthsEl.innerHTML = MONTHS.map((m, i) => `<button class="month" role="tab" aria-selected="false" data-i="${i}" aria-controls="month-note">${m[0]}<span class="dots" aria-hidden="true"><i class="v ${m[1].includes('v') ? 'on' : ''}"></i><i class="f ${m[1].includes('f') ? 'on' : ''}"></i><i class="r ${m[1].includes('r') ? 'on' : ''}"></i></span></button>`).join('');
  const showMonth = i => {
    $$('.month', monthsEl).forEach(b => b.setAttribute('aria-selected', +b.dataset.i === i));
    const m = MONTHS[i];
    note.innerHTML = `<span class="temp">${m[0]} · ${m[3]}</span><h4>${m[2]}</h4><p>${m[4]}</p>`;
  };
  monthsEl.addEventListener('click', e => { const b = e.target.closest('.month'); if (b) showMonth(+b.dataset.i); });
  monthsEl.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const cur = $$('.month', monthsEl).findIndex(b => b.getAttribute('aria-selected') === 'true');
    const nxt = (cur + (e.key === 'ArrowRight' ? 1 : 11)) % 12;
    showMonth(nxt); $$('.month', monthsEl)[nxt].focus();
  });
  showMonth(today.getMonth());

  /* ---------- Experiences ---------- */
  const expItems = $$('.exp-item');
  const prev = $('#exp-preview'), prevCap = $('#exp-preview-cap');
  const activate = li => {
    expItems.forEach(x => x.classList.toggle('is-active', x === li));
    const src = li.dataset.img;
    const cap = `${$('.exp-item__n', li).textContent} — ${$('.exp-item__title', li).textContent}`;
    if (prev.getAttribute('src') === src) return;
    prev.classList.add('fade');
    setTimeout(() => { prev.style.objectPosition = li.dataset.pos || ''; prev.src = src; prev.alt = $('.exp-item__img', li).alt; prevCap.textContent = cap; prev.classList.remove('fade'); }, reduceMotion ? 0 : 260);
  };
  expItems.forEach(li => {
    li.addEventListener('mouseenter', () => activate(li));
    $('.exp-item__btn', li).addEventListener('focus', () => activate(li));
    $('.exp-item__btn', li).addEventListener('click', () => activate(li));
  });
  activate(expItems[0]);
  $$('.tabs button').forEach(t => t.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.setAttribute('aria-selected', x === t));
    const f = t.dataset.filter;
    expItems.forEach(li => { li.hidden = f !== 'all' && li.dataset.cat !== f; });
    const first = expItems.find(li => !li.hidden);
    if (first) activate(first);
  }));

  /* ---------- Gallery lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  const gItems = $$('.gal__item');
  let gi = 0;
  const showG = i => {
    gi = (i + gItems.length) % gItems.length;
    const img = $('img', gItems[gi]);
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = `${gItems[gi].dataset.cap}  ·  ${gi + 1} / ${gItems.length}`;
  };
  gItems.forEach((b, i) => b.addEventListener('click', () => { showG(i); openDialog(lb); }));
  $('.lb__prev').addEventListener('click', () => showG(gi - 1));
  $('.lb__next').addEventListener('click', () => showG(gi + 1));
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') showG(gi - 1); if (e.key === 'ArrowRight') showG(gi + 1); });
  let tx = null;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) showG(gi + (dx < 0 ? 1 : -1)); tx = null; });

  /* ---------- Newsletter ---------- */
  const nl = $('#letters-form');
  nl.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#nl-email', nl), msg = $('.letters__msg', nl);
    if (!input.checkValidity() || !input.value.trim()) { msg.textContent = 'Please enter a valid email address.'; input.focus(); return; }
    msg.textContent = `Thank you. The next letter arrives with the ${today.getMonth() < 5 ? 'second' : 'autumn'} flush.`;
    input.value = '';
  });

  // Deep link: #reserve opens booking
  if (location.hash === '#reserve') openBooking(1);
})();
