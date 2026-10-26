// Home hero: the desk window and the patient's phone take turns through real screens.
(() => {
  const { show, reduce } = window.Ophia;
  const desk = document.getElementById('heroDesk'), phone = document.getElementById('heroPhone');
  const path = document.getElementById('heroPath'), tag = document.getElementById('heroTag');
  if (!desk) return;
  const DESK = [
    ['doctor-findings', '/dashboard/consultation', 'Doctor · both eyes side by side'],
    ['refraction-values', '/refraction', 'Optometry · refraction for each eye'],
    ['theatre-today', '/ot', 'Theatre · no consent, no start'],
    ['ward-bed-board', '/ward', 'Ward · the live bed board'],
    ['front-desk-waitlist', '/front-office/wait-list', 'Front desk · today\'s wait list'],
  ];
  const PHONE = ['app-today', 'app-prescriptions', 'app-book', 'app-visits', 'app-home'];
  let i = 0;
  const step = () => {
    const [name, p, t] = DESK[i];
    show(desk, name, t);
    show(phone, PHONE[i % PHONE.length], 'The patient app');
    path.textContent = p; tag.textContent = t;
  };
  step();
  if (reduce) return;
  setInterval(() => { if (!document.hidden) { i = (i + 1) % DESK.length; step(); } }, 4200);
})();
