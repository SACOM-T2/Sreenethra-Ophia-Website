// Product page: follow one patient through each desk. Each step cross-fades through
// that desk's screens (and the patient's phone where it plays a part), then moves on.
(() => {
  const { show, esc, reduce } = window.Ophia;
  const STEPS = [
    { nm: 'Registration and booking', who: 'Front desk, or the patient\'s phone',
      pts: ['Book at the front desk, or online in the patient app', 'Registered once; the MR number opens the same file at every desk', 'A live wait list with waiting times and priorities'],
      shots: [['front-desk-waitlist', '/front-office/wait-list', 'Today\'s wait list: who is waiting, for how long, and for which doctor.'],
              ['front-desk-booking', '/front-office/appointments/new', 'Booking at the desk against the doctor\'s free slots.']],
      phone: [['app-book', 'Booking from the phone: pick a service, a doctor and a slot.'], ['app-bookings', 'The patient\'s bookings, with payment status.']] },
    { nm: 'Refraction', who: 'Optometrist',
      pts: ['A refraction queue of patients checked in for eye tests', 'Vision, refraction and eye pressure for each eye', 'History, dilated refraction, squint, contact lens and biometry in one place'],
      shots: [['refraction-queue', '/refraction', 'The refraction queue: patients checked in and waiting.'],
              ['refraction-values', '/refraction', 'Refraction for each eye, with eye pressure in the middle.'],
              ['refraction-history', '/refraction', 'History taken by the optometrist before the doctor sees the patient.']] },
    { nm: 'Consultation', who: 'Doctor',
      pts: ['The optometrist\'s readings are already on screen', 'Findings, drawings and ICD-10 diagnoses for each eye', 'Plan and prescription, with medicines other doctors gave today'],
      shots: [['doctor-findings', '/dashboard/consultation', 'Findings for each eye, with the refraction from optometry.'],
              ['doctor-plan', '/dashboard/consultation', 'The plan: medicines, tests and procedures.'],
              ['doctor-history', '/dashboard/consultation', 'History and background, recorded once and kept with the patient.']] },
    { nm: 'Surgical counselling', who: 'Counsellor',
      pts: ['Cases arrive straight from the consultation', 'Eye, anaesthesia, package, cost and insurance agreed with the patient', 'Consent and pre-op documents tracked before a date is confirmed'],
      shots: [['counselling-cases', '/counselling', 'Cases waiting for counselling, and today\'s theatre list.'],
              ['counselling-record', '/counselling/cases', 'A counselling record with cost, insurance and referral source.']] },
    { nm: 'Ward', who: 'Ward nurse',
      pts: ['A live bed board for every room and ward', 'A 13-point checklist before the patient goes to theatre', 'Ward rounds and the discharge summary'],
      shots: [['ward-bed-board', '/ward', 'The bed board: who is in which bed.'],
              ['ward-admission', '/ward/admissions', 'An admission, with the ward checklist complete.'],
              ['ward-preop', '/ward/prep', 'Pre-op preparation: what is done and what is outstanding.']] },
    { nm: 'Theatre', who: 'Surgeon and theatre team',
      pts: ['Cases without signed consent are refused, with no override', 'A 20-point pre-op checklist, then sign-in, time-out and sign-out', 'Implants logged with lot and expiry; the operative record locks when done'],
      shots: [['theatre-today', '/ot', 'Today\'s list, refusing a case whose consent isn\'t signed.'],
              ['theatre-preop', '/ot/case', 'The pre-op checklist, after the ward has signed off.'],
              ['theatre-safety', '/ot/case', 'Sign-in, time-out and sign-out.'],
              ['theatre-implants', '/ot/case', 'The lens implanted, with serial number, lot and expiry.'],
              ['theatre-operative-record', '/ot/case', 'A completed operative record, locked against later edits.']] },
    { nm: 'Follow-up', who: 'Doctor, nurse and patient',
      pts: ['One summary of every visit, test, surgery and prescription', 'The same summary for nurses', 'Patients see their visits and prescriptions in the app'],
      shots: [['doctor-summary', '/dashboard/consultation', 'Every visit and surgery on one page.'],
              ['nurse-summary', '/nurse/patient-file', 'The nurse\'s view of the same summary.']],
      phone: [['app-visits', 'The patient\'s visit history, with diagnosis and advice.'], ['app-prescriptions', 'Prescriptions with eye-drop instructions.']] },
  ];
  const SLIDE = 4300;
  const stepsEl = document.getElementById('steps'), stage = document.getElementById('stage');
  if (!stepsEl) return;

  STEPS.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'step';
    b.innerHTML = `<span class="n">${String(i + 1).padStart(2, '0')}</span><span><b>${esc(s.nm)}</b><span class="who">${esc(s.who)}</span>
      <span class="more"><ul>${s.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></span><span class="track"><i></i></span></span>`;
    b.addEventListener('click', () => go(i, 0));
    stepsEl.appendChild(b);
  });
  stage.innerHTML = `<div class="stage-row" id="row">
      <div class="window"><div class="bar"><i></i><i></i><i></i><span id="stagePath"></span></div><div class="stack" id="stageDesk" data-zoom></div></div>
      <div class="handset" id="stagePhone" hidden><div class="stack" id="stagePhoneStack" data-zoom></div></div>
    </div>
    <div class="cap"><span id="stageCap"></span><span class="dots" id="dots"></span></div>`;
  const desk = document.getElementById('stageDesk'), phoneBox = document.getElementById('stagePhone');
  const phoneStack = document.getElementById('stagePhoneStack'), row = document.getElementById('row');
  const pathEl = document.getElementById('stagePath'), capEl = document.getElementById('stageCap'), dots = document.getElementById('dots');

  let cur = 0, slide = 0, t0 = performance.now(), paused = false, inView = false;
  function go(i, j) {
    cur = i; slide = j; t0 = performance.now();
    const s = STEPS[i], [name, path, cap] = s.shots[j];
    stepsEl.querySelectorAll('.step').forEach((b, n) => b.classList.toggle('on', n === i));
    show(desk, name, cap);
    desk.dataset.cap = cap; pathEl.textContent = path; capEl.textContent = cap;
    dots.innerHTML = s.shots.map((_, n) => `<i class="${n === j ? 'on' : ''}"></i>`).join('');
    if (s.phone) {
      const [pn, pc] = s.phone[j % s.phone.length];
      phoneBox.hidden = false; row.classList.add('with-phone');
      show(phoneStack, pn, pc); phoneStack.dataset.cap = pc;
    } else { phoneBox.hidden = true; row.classList.remove('with-phone'); }
  }
  function tick(now) {
    const s = STEPS[cur];
    if (!paused && inView && !reduce) {
      const el = now - t0;
      const bar = stepsEl.querySelector('.step.on .track i');
      if (bar) bar.style.width = `${((slide * SLIDE + Math.min(el, SLIDE)) / (s.shots.length * SLIDE)) * 100}%`;
      if (el >= SLIDE) slide + 1 < s.shots.length ? go(cur, slide + 1) : go((cur + 1) % STEPS.length, 0);
    } else t0 = now - Math.min(now - t0, SLIDE);
    requestAnimationFrame(tick);
  }
  stage.addEventListener('pointerenter', () => { paused = true; });
  stage.addEventListener('pointerleave', () => { paused = false; });
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; }, { threshold: 0.3 }).observe(stage);
  go(0, 0); requestAnimationFrame(tick);
})();
