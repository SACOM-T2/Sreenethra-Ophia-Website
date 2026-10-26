// Product page: one player with a playlist of screen recordings.
(() => {
  const CLIPS = [
    ['frontdesk', 'The front desk', 'Today\'s wait list, then booking a new appointment.', '0:09'],
    ['refraction', 'Refraction', 'The queue, the history and the refraction for each eye.', '0:17'],
    ['consultation', 'A doctor\'s consultation', 'History, findings for each eye, the plan and the visit summary.', '0:33'],
    ['counselling', 'Surgical counselling', 'The case list, then a counselling record and its surgical plan.', '0:11'],
    ['ward', 'The ward', 'From the bed board to an admission, its rounds and discharge.', '0:25'],
    ['theatre', 'Theatre checks', 'The pre-op checklist, sign-in and time-out, implants and a locked operative record.', '0:43'],
    ['qr', 'Paper records by phone', 'One click puts a QR code on screen for a phone to scan.', '0:08'],
  ];
  const player = document.getElementById('player'), list = document.getElementById('playlist');
  if (!player) return;
  const esc = window.Ophia.esc;
  CLIPS.forEach(([k, t, d, len], i) => {
    const b = document.createElement('button');
    b.className = 'clip';
    b.innerHTML = `<span class="n">${String(i + 1).padStart(2, '0')}</span><span><b>${esc(t)}</b><span class="d">${esc(d)}</span></span><span class="t">${len}</span><span class="bar"><i></i></span>`;
    b.addEventListener('click', () => load(i, true));
    list.appendChild(b);
  });
  let cur = 0;
  function load(i, play) {
    cur = i;
    player.src = `assets/video/${CLIPS[i][0]}.mp4`; player.poster = `assets/video/${CLIPS[i][0]}.jpg`;
    list.querySelectorAll('.clip').forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
    if (play) player.play().catch(() => {});
  }
  player.addEventListener('timeupdate', () => {
    const bar = list.querySelector('.clip[aria-current="true"] .bar i');
    if (bar && player.duration) bar.style.width = `${(player.currentTime / player.duration) * 100}%`;
  });
  player.addEventListener('ended', () => { if (cur < CLIPS.length - 1) load(cur + 1, true); });
  load(0, false);
})();
