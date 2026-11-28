/* global Split */
(() => {
  const { parseVND, formatVND, settle } = Split;
  const $ = s => document.querySelector(s);
  const KEY = 'chiatien.v1';

  // Plastic-stool colours; `ink` is the text colour that stays readable on top.
  const SEATS = [
    ['#1F5FD6', '#fff'], ['#F5B700', '#1A1408'], ['#13773C', '#fff'], ['#D6336C', '#fff'],
    ['#C8470A', '#fff'], ['#7048E8', '#fff'], ['#0B7285', '#fff'], ['#82C91E', '#14200A'],
    ['#8D5524', '#fff'], ['#4DABF7', '#0A1A2A'], ['#343A40', '#fff'], ['#F783AC', '#2A0A16'],
  ];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const today = () => new Date().toISOString().slice(0, 10);
  const short = name => { const w = name.trim().split(/\s+/).pop(); return w.length > 7 ? w.slice(0, 6) + '…' : w; };
  const vnDate = d => d ? d.split('-').reverse().join('/') : '';
  const k = n => (n / 1000).toLocaleString('vi-VN') + 'k';
  const initial = name => name.trim().split(/\s+/).pop().charAt(0).toUpperCase();

  /* ---------- storage ---------- */
  function newSession(members = []) {
    return { id: uid(), name: 'Buổi đi chơi', date: today(), members, expenses: [], done: {} };
  }
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.sessions) && d.sessions.length) { d.sessions.forEach(fixColors); return d; }
    } catch (e) { /* corrupted storage: start fresh below */ }
    const s = newSession();
    return { sessions: [s], currentId: s.id };
  }
  let db = load();
  const cur = () => db.sessions.find(s => s.id === db.currentId) || db.sessions[0];
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { toast('Không lưu được trên máy này. Hãy bấm "Gửi link" để giữ dữ liệu.'); }
    render();
  }
  // Each member keeps the colour index they got on joining, so removing someone never repaints the others.
  function fixColors(s) { s.members.forEach((m, i) => { if (!Number.isInteger(m.color)) m.color = i % SEATS.length; }); return s; }
  function freeColor(s) {
    const used = new Set(s.members.map(m => m.color));
    for (let i = 0; i < SEATS.length; i++) if (!used.has(i)) return i;
    return s.members.length % SEATS.length;
  }
  const colorOf = (s, id) => { const m = s.members.find(x => x.id === id); return SEATS[m ? m.color % SEATS.length : 0]; };
  const nameOf = (s, id) => (s.members.find(m => m.id === id) || { name: '?' }).name;

  /* ---------- share link: the whole session lives in the URL hash ---------- */
  function encode(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    let bin = ''; bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(str) {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
  }
  // The link is untrusted input: rebuild a clean session or reject it.
  function sanitize(x) {
    const str = (v, max) => typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
    if (!x || !Array.isArray(x.members) || !Array.isArray(x.expenses)) throw new Error('shape');
    const members = x.members.map(m => ({ id: str(m && m.id, 20), name: str(m && m.name, 40),
      color: m && Number.isInteger(m.color) && m.color >= 0 && m.color < SEATS.length ? m.color : undefined }));
    const ids = new Set(members.map(m => m.id));
    if (members.some(m => !m.id || !m.name) || ids.size !== members.length) throw new Error('members');
    const expenses = x.expenses.map(e => {
      const sharerIds = Array.isArray(e.sharerIds) ? [...new Set(e.sharerIds)] : [];
      const ok = str(e.name, 60) && Number.isSafeInteger(e.amount) && e.amount > 0 && ids.has(e.payerId)
        && sharerIds.length && sharerIds.every(id => ids.has(id));
      if (!ok) throw new Error('expense');
      return { id: str(e.id, 20) || uid(), name: str(e.name, 60), amount: e.amount, payerId: e.payerId, sharerIds, note: str(e.note, 120) || '' };
    });
    const done = {};
    if (x.done && typeof x.done === 'object') for (const key in x.done) if (x.done[key] === true) done[key.slice(0, 80)] = true;
    return fixColors({ id: str(x.id, 20) || uid(), name: str(x.name, 60) || 'Buổi đi chơi', date: /^\d{4}-\d{2}-\d{2}$/.test(x.date) ? x.date : today(), members, expenses, done });
  }
  function importFromHash() {
    const m = location.hash.match(/^#d=([\w-]+)$/);
    if (!m) return;
    history.replaceState(null, '', location.pathname + location.search);
    let s;
    try { s = sanitize(decode(m[1])); } catch (e) { toast('Link bị lỗi hoặc thiếu, không mở được.'); return; }
    const i = db.sessions.findIndex(x => x.id === s.id);
    if (i >= 0) {
      if (JSON.stringify(db.sessions[i]) !== JSON.stringify(s)
        && !confirm('Máy này đang có bản khác của buổi "' + s.name + '". Thay bằng bản trong link?')) { db.currentId = s.id; return; }
      db.sessions[i] = s;
    } else db.sessions.unshift(s);
    db.currentId = s.id;
    localStorage.setItem(KEY, JSON.stringify(db));
    toast('Đã mở buổi "' + s.name + '" từ link.');
  }

  /* ---------- the round table ---------- */
  const CAT = `
  <g class="cat">
    <image class="cat-anim" href="cat.gif" x="121" y="100" width="138" height="145"/>
    <image class="cat-still" href="cat-still.png" x="121" y="100" width="138" height="145"/>
    <rect x="162" y="250" width="56" height="16" rx="4" fill="#C8935A" stroke="#7A4E22" stroke-width="1.5"/>
    <text x="190" y="261.6" text-anchor="middle" font-size="11" font-weight="800" fill="#3E2410">Chủ toạ</text>
  </g>`;

  // Lì xì tucked into the empty corners around the round table (drawn under seats and threads).
  const LIXI = word => `<g class="lixi">
    <rect x="-20" y="-28" width="40" height="56" rx="4" fill="#D7262E" stroke="#7A0F18" stroke-width="1.5"/>
    <path d="M-20 -24 Q0 -2 20 -24 V-28 H-20 Z" fill="#B51C24"/>
    <path d="M-19 -23 Q0 -2 19 -23" fill="none" stroke="#F5C518" stroke-width="1.6"/>
    <circle cx="0" cy="6" r="10.5" fill="#F5C518" stroke="#9A6B00" stroke-width="1"/>
    <text x="0" y="9.6" font-size="9.5" font-weight="900" text-anchor="middle" fill="#9E1B26">${word}</text>
    <path d="M-13 22 H13" stroke="#F5C518" stroke-width="1.2" stroke-dasharray="2 2.5"/></g>`;
  // Lì xì dropped between the seats, half under the table or past the frame's edge. Positions are
  // random per session but seeded by its id, so they stay put while you edit that session.
  function envelopes(id, n) {
    let h = 2166136261;
    for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    const rnd = () => { h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
    const gaps = Math.max(n, 6), picked = new Set(), out = [];
    const count = 4 + Math.floor(rnd() * 2), WORDS = ['Tài', 'Lộc', 'Phúc', 'Thọ'];
    while (picked.size < Math.min(count, gaps)) picked.add(Math.floor(rnd() * gaps));
    for (const g of picked) {
      const a = -Math.PI / 2 + (2 * Math.PI * (g + 0.5 + (rnd() - 0.5) * 0.4)) / gaps, d = 172 + rnd() * 34;
      // Sideways they may run off the screen edge; vertically they stay inside the table's frame.
      const x = C + d * Math.cos(a), y = Math.min(354, Math.max(26, C + d * Math.sin(a))), rot = (rnd() - 0.5) * 80, k = 0.8 + rnd() * 0.3;
      out.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${k.toFixed(2)})">${LIXI(WORDS[Math.floor(rnd() * WORDS.length)])}</g>`);
    }
    return out.join('');
  }

  const C = 190, SEAT_RING = 158, PULL = 140;
  function drawTable(s, result) {
    const svg = $('#tableSvg'), n = s.members.length;
    const r = Math.min(29, (Math.PI * SEAT_RING) / Math.max(n, 1) - 4);
    const pos = {};
    s.members.forEach((m, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      pos[m.id] = [C + SEAT_RING * Math.cos(a), C + SEAT_RING * Math.sin(a)];
    });

    // Each transfer is a thread from payer seat to receiver seat. Threads that would
    // cross the middle bend outward so they never run through the cat.
    const threads = result.transfers.map(t => {
      const [x1, y1] = pos[t.from], [x2, y2] = pos[t.to];
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      let dx = mx - C, dy = my - C, cx = mx, cy = my;
      if (Math.hypot(dx, dy) < PULL) {
        if (Math.hypot(dx, dy) < 1) { dx = -(y2 - y1); dy = x2 - x1; } // opposite seats: bend sideways
        const L = Math.hypot(dx, dy); cx = C + (dx / L) * PULL; cy = C + (dy / L) * PULL;
      }
      const pull = (x, y, gap) => { const L = Math.hypot(cx - x, cy - y); return [x + ((cx - x) / L) * gap, y + ((cy - y) / L) * gap]; };
      const [ax, ay] = pull(x1, y1, r + 4), [tx, ty] = pull(x2, y2, r + 3); // t = arrow tip at the receiver
      // Arrowhead drawn by hand along the curve's end tangent (tip − control) so it takes the payer's colour.
      const ux = tx - cx, uy = ty - cy, uL = Math.hypot(ux, uy), nx = -uy / uL, ny = ux / uL;
      const bx = tx - (ux / uL) * 12, by = ty - (uy / uL) * 12; // line stops at the arrowhead's base
      const head = `M${tx.toFixed(1)} ${ty.toFixed(1)} L${(bx + nx * 8).toFixed(1)} ${(by + ny * 8).toFixed(1)} L${(bx - nx * 8).toFixed(1)} ${(by - ny * 8).toFixed(1)} Z`;
      const d = `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
      // Label at t = 0.3 (payer side): when several threads meet one receiver, midpoints crowd the wrong seats.
      const lx = 0.49 * ax + 0.42 * cx + 0.09 * bx, ly = 0.49 * ay + 0.42 * cy + 0.09 * by;
      const label = k(t.amount), w = 12 + label.length * 7.4, done = s.done[doneKey(t)], [col] = colorOf(s, t.from);
      // Ink casing + payer-coloured core reads on both the lacquer and the light ground; the dots run payer → receiver.
      return {
        line: `<g class="thread${done ? ' done' : ''}" style="--c:${col}">
          <path class="casing" d="${d}"/><path class="core" d="${d}"/><path class="flow" d="${d}"/>
          <path class="head" d="${head}"/></g>`,
        label: `<g class="thread-label${done ? ' done' : ''}"><rect x="${(lx - w / 2).toFixed(1)}" y="${(ly - 11).toFixed(1)}" width="${w.toFixed(1)}" height="22" rx="11" stroke="${col}"/>
          <text x="${lx.toFixed(1)}" y="${(ly + 4.5).toFixed(1)}">${label}</text></g>`,
      };
    });

    const seats = s.members.map(m => {
      const [x, y] = pos[m.id], [bg, ink] = colorOf(s, m.id);
      return `<g class="seat"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${bg}"/>
        <text x="${x.toFixed(1)}" y="${y.toFixed(1)}" dy=".36em" fill="${ink}" font-size="15">${esc(short(m.name))}</text></g>`;
    }).join('');

    svg.innerHTML = `<desc id="tableDesc">${esc(tableDesc(s, result))}</desc>
      ${envelopes(s.id, n)}
      <circle cx="${C}" cy="${C}" r="132" class="table-top"/>
      <circle cx="${C}" cy="${C}" r="118" class="table-inlay"/>
      ${CAT}${threads.map(x => x.line).join('')}${seats}${threads.map(x => x.label).join('')}`;
    // Shrink a name until it clears the seat's edge by 5px on each side.
    svg.querySelectorAll('.seat text').forEach(t => {
      const max = 2 * r - 10, w = t.getComputedTextLength();
      if (w > max) t.setAttribute('font-size', (15 * max / w).toFixed(1));
    });
  }
  function tableDesc(s, res) {
    if (!res.transfers.length) return 'Bàn tròn với ' + s.members.length + ' người, không ai cần chuyển tiền.';
    return 'Bàn tròn. ' + res.transfers.map(t => nameOf(s, t.from) + ' chuyển ' + nameOf(s, t.to) + ' ' + formatVND(t.amount) + ' đồng').join('. ');
  }

  /* ---------- render ---------- */
  const doneKey = t => t.from + '>' + t.to + ':' + t.amount;
  const dot = (s, id) => { const [bg] = colorOf(s, id); return `<i class="dot" style="background:${bg}"></i>`; };
  const party = (s, id) => { const [bg, ink] = colorOf(s, id), n = nameOf(s, id);
    return `<span class="party"><span class="av" style="--bg:${bg};--on:${ink}" aria-hidden="true">${esc(initial(n))}</span><span class="nm">${esc(n)}</span></span>`; };
  const num = (key, n, suffix = '', sign = false) => `data-key="${esc(key)}" data-num="${n}" data-suffix="${suffix}"${sign ? ' data-sign' : ''}`;
  const COPY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>';

  // Numbers glide from their previous value to the new one after every change.
  const lastNum = new Map(), calm = matchMedia('(prefers-reduced-motion: reduce)');
  function tween() {
    document.querySelectorAll('[data-num]').forEach(el => {
      const key = el.dataset.key, to = Number(el.dataset.num), from = lastNum.has(key) ? lastNum.get(key) : to;
      lastNum.set(key, to);
      if (from === to || calm.matches) return;
      const paint = v => { el.textContent = ('sign' in el.dataset && v > 0 ? '+' : '') + formatVND(v) + el.dataset.suffix; };
      const t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / 450);
        paint(p === 1 ? to : Math.round(from + (to - from) * (1 - Math.pow(2, -10 * p))));
        if (p < 1) requestAnimationFrame(step);
      };
      paint(from); requestAnimationFrame(step);
    });
  }

  function catSays(s, res) {
    if (s.members.length < 2) return 'Mời mọi người vào bàn đã.';
    if (!s.expenses.length) return 'Chưa có món nào. Gọi món đi!';
    if (!res.transfers.length) return 'Không ai nợ ai. Hoà cả làng!';
    const left = res.transfers.filter(t => !s.done[doneKey(t)]).length;
    if (!left) return 'Xong hết rồi. Phát tài!';
    return left === res.transfers.length ? `${left} lượt chuyển là xong.` : `Còn ${left} lượt nữa là xong.`;
  }

  function render() {
    const s = cur(), res = settle(s);
    $('#sessionName').textContent = s.name;
    $('#sessionMeta').textContent = [vnDate(s.date), s.members.length + ' người'].join(' · ');
    $('#catLine').textContent = catSays(s, res);
    $('#inviteBtn').hidden = s.members.length >= 2;
    $('#settleBlock').hidden = $('#peopleBlock').hidden = !s.expenses.length;
    drawTable(s, res);

    $('#transfers').innerHTML = res.transfers.map(t => {
      const key = doneKey(t), done = !!s.done[key], from = nameOf(s, t.from), to = nameOf(s, t.to);
      const msg = `${from} chuyển ${to} ${formatVND(t.amount)}đ (${s.name})`;
      return `<li class="ticket${done ? ' done' : ''}">
        <div class="ticket-top">
          ${party(s, t.from)}
          <svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h17M14 6l6 6-6 6"/></svg>
          ${party(s, t.to)}
          <span class="amt" ${num('t:' + t.from + '>' + t.to, t.amount, 'đ')}>${formatVND(t.amount)}đ</span>
        </div>
        <div class="ticket-foot">
          <label class="done-tog"><input type="checkbox" data-done="${esc(key)}" ${done ? 'checked' : ''}><span>Đã chuyển</span></label>
          <span class="grow"></span>
          <button type="button" class="mini" data-copy="${t.amount}" data-ok="Đã copy số tiền ${formatVND(t.amount)}." aria-label="Copy số tiền ${formatVND(t.amount)} đồng">${COPY_ICON}Số tiền</button>
          <button type="button" class="mini" data-copy="${esc(msg)}" data-ok="Đã copy tin nhắn." aria-label="Copy tin nhắn: ${esc(msg)}">${COPY_ICON}Tin nhắn</button>
        </div></li>`;
    }).join('') || '<li class="empty">Mọi người đã trả đúng phần mình. Không cần chuyển gì.</li>';

    $('#roundNote').textContent = roundingNote(s, res);

    $('#peopleRows').innerHTML = res.rows.map(r => `<tr>
      <th scope="row">${dot(s, r.id)}${esc(r.name)}</th>
      <td>${formatVND(r.paid)}</td><td>${formatVND(r.owed)}</td>
      <td class="${r.net > 0 ? 'pos' : r.net < 0 ? 'neg' : ''}" ${num('net:' + r.id, r.net, '', true)}>${r.net > 0 ? '+' : ''}${formatVND(r.net)}</td></tr>`).join('');

    $('#itemCount').textContent = s.expenses.length || '';
    $('#itemsTotal').innerHTML = s.expenses.length ? `Tổng <span ${num('total', res.total, 'đ')}>${formatVND(res.total)}đ</span> · ${s.expenses.length} món` : '';
    $('#items').innerHTML = s.expenses.map(e => `<li><button type="button" class="item" data-edit="${esc(e.id)}">
        ${dot(s, e.payerId)}
        <span class="item-main"><b>${esc(e.name)}</b>
          <small>${esc(nameOf(s, e.payerId))} trả · ${esc(sharersText(s, e))}${e.note ? ' · ' + esc(e.note) : ''}</small></span>
        <span class="amt">${formatVND(e.amount)}</span></button></li>`).join('')
      || '<li class="empty">Chưa có món nào. Bấm “Thêm món” để ghi khoản đầu tiên.</li>';
    tween();
  }
  const sharersText = (s, e) => e.sharerIds.length === s.members.length ? 'cả bàn' : 'chia ' + s.members.filter(m => e.sharerIds.includes(m.id)).map(m => m.name).join(', ');

  function roundingNote(s, res) {
    const moved = res.rows.filter(r => r.roundDiff);
    if (!moved.length) return '';
    return 'Làm tròn đến 1.000đ: ' + moved.map(r => r.name + (r.roundDiff < 0 ? ' chịu thêm ' : ' được lợi ') + formatVND(Math.abs(r.roundDiff)) + 'đ').join(', ') + '. Cộng lại vẫn bằng 0.';
  }

  function summaryText(s) {
    const res = settle(s), L = [];
    L.push(`${s.name} (${vnDate(s.date)})`, `Tổng: ${formatVND(res.total)}đ · ${s.members.length} người`, '');
    L.push(res.transfers.length ? `Chuyển khoản (${res.transfers.length} lượt):` : 'Không ai cần chuyển khoản.');
    res.transfers.forEach(t => L.push(`- ${nameOf(s, t.from)} → ${nameOf(s, t.to)}: ${formatVND(t.amount)}đ${s.done[doneKey(t)] ? ' (đã chuyển)' : ''}`));
    L.push('', 'Từng người (đã trả / phải chịu / chênh lệch):');
    res.rows.forEach(r => L.push(`- ${r.name}: ${formatVND(r.paid)} / ${formatVND(r.owed)} / ${r.net > 0 ? '+' : ''}${formatVND(r.net)}`));
    const note = roundingNote(s, res);
    if (note) L.push('', note);
    L.push('', 'Các món:');
    s.expenses.forEach(e => L.push(`- ${e.name}: ${formatVND(e.amount)}đ, ${nameOf(s, e.payerId)} trả, ${sharersText(s, e)}${e.note ? ' (' + e.note + ')' : ''}`));
    return L.join('\n');
  }

  /* ---------- helpers ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  async function copy(text, okMsg) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) { // older browsers / non-https
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    toast(okMsg);
  }

  /* ---------- tabs ---------- */
  function showTab(which) {
    const items = which === 'items';
    $('#viewTable').hidden = items; $('#viewItems').hidden = !items;
    $('#tabTable').setAttribute('aria-selected', String(!items));
    $('#tabItems').setAttribute('aria-selected', String(items));
  }
  $('#tabTable').onclick = () => showTab('table');
  $('#tabItems').onclick = () => showTab('items');

  /* ---------- transfers ---------- */
  $('#transfers').addEventListener('change', e => {
    const key = e.target.dataset.done; if (!key) return;
    const s = cur();
    if (e.target.checked) s.done[key] = true; else delete s.done[key];
    save();
  });
  $('#transfers').addEventListener('click', e => {
    const b = e.target.closest('[data-copy]'); if (b) copy(b.dataset.copy, b.dataset.ok);
  });
  $('#copySummary').onclick = () => copy(summaryText(cur()), 'Đã copy tóm tắt. Dán vào nhóm chat nhé.');
  $('#shareLink').onclick = async () => {
    const s = cur(), url = location.origin + location.pathname + '#d=' + encode(s);
    if (navigator.share) { try { await navigator.share({ title: s.name, text: 'Chia tiền: ' + s.name, url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    copy(url, 'Đã copy link. Ai mở link sẽ thấy đúng bản này.');
  };

  /* ---------- item sheet ---------- */
  const itemDlg = $('#itemDlg'), form = $('#itemForm');
  let editingId = null, lastPayer = null;
  function seatInputs(s, type, name, checked) {
    return s.members.map(m => {
      const [bg, ink] = colorOf(s, m.id);
      return `<label class="seat-chip" style="--bg:${bg};--on:${ink}"><input type="${type}" name="${name}" value="${esc(m.id)}" ${checked(m.id) ? 'checked' : ''}><span>${esc(m.name)}</span></label>`;
    }).join('');
  }
  function openItem(id) {
    const s = cur();
    if (s.members.length < 1) { openSession(); return; }
    const e = s.expenses.find(x => x.id === id);
    editingId = e ? e.id : null;
    $('#itemDlgTitle').textContent = e ? 'Sửa món' : 'Thêm món';
    form.name.value = e ? e.name : '';
    form.amount.value = e ? formatVND(e.amount) : '';
    form.note.value = e ? e.note : '';
    const payer = e ? e.payerId : (s.members.some(m => m.id === lastPayer) ? lastPayer : s.members[0].id);
    $('#payerPick').innerHTML = seatInputs(s, 'radio', 'payer', id2 => id2 === payer);
    $('#sharerPick').innerHTML = seatInputs(s, 'checkbox', 'sharer', id2 => e ? e.sharerIds.includes(id2) : true);
    $('#delItem').hidden = !e;
    $('#itemErr').textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
    updatePreview();
    itemDlg.showModal();
    if (!e) form.name.focus();
  }
  form.amount.addEventListener('input', () => {
    const n = parseVND(form.amount.value);
    form.amount.value = Number.isNaN(n) ? '' : n.toLocaleString('vi-VN');
  });
  // What each sharer pays, updated on every keystroke and tap.
  function updatePreview() {
    const a = parseVND(form.amount.value), n = form.querySelectorAll('[name=sharer]:checked').length;
    if (!(a > 0) || !n) { $('#sharePreview').textContent = ''; return; }
    const per = Math.floor(a / n);
    $('#sharePreview').textContent = `${n} người chia · mỗi người ${formatVND(per)}${a % n ? '–' + formatVND(per + 1) : ''}đ`;
  }
  form.addEventListener('input', e => { e.target.removeAttribute('aria-invalid'); updatePreview(); });
  form.addEventListener('change', updatePreview);
  $('#allBtn').onclick = () => { form.querySelectorAll('[name=sharer]').forEach(c => { c.checked = true; }); updatePreview(); };
  $('#noneBtn').onclick = () => { form.querySelectorAll('[name=sharer]').forEach(c => { c.checked = false; }); updatePreview(); };
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const s = cur(), name = form.name.value.trim(), amount = parseVND(form.amount.value);
    const payerId = (form.querySelector('[name=payer]:checked') || {}).value;
    const sharerIds = [...form.querySelectorAll('[name=sharer]:checked')].map(c => c.value);
    const [err, field] = !name ? ['Nhập tên món.', form.name] : !(amount > 0) ? ['Nhập số tiền lớn hơn 0.', form.amount]
      : amount > 1e11 ? ['Số tiền quá lớn.', form.amount] : !payerId ? ['Chọn người trả trước.', form.querySelector('[name=payer]')]
      : !sharerIds.length ? ['Chọn ít nhất một người chia món này.', form.querySelector('[name=sharer]')] : [''];
    if (err) { $('#itemErr').textContent = err; field.setAttribute('aria-invalid', 'true'); field.focus(); return; }
    const item = { id: editingId || uid(), name, amount, payerId, sharerIds, note: form.note.value.trim() };
    const i = s.expenses.findIndex(x => x.id === editingId);
    if (i >= 0) s.expenses[i] = item; else s.expenses.push(item);
    lastPayer = payerId;
    itemDlg.close(); save();
  });
  $('#delItem').onclick = () => {
    const s = cur(), e = s.expenses.find(x => x.id === editingId);
    if (!e || !confirm('Xoá món "' + e.name + '"?')) return;
    s.expenses = s.expenses.filter(x => x.id !== editingId);
    itemDlg.close(); save();
  };
  $('#addItem').onclick = () => openItem(null);
  $('#items').addEventListener('click', e => { const b = e.target.closest('[data-edit]'); if (b) openItem(b.dataset.edit); });
  document.querySelectorAll('[data-close]').forEach(b => { b.onclick = () => b.closest('dialog').close(); });
  // Tap on the dim backdrop closes a sheet.
  document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  /* ---------- session sheet ---------- */
  const sDlg = $('#sessionDlg'), sForm = $('#sessionForm');
  function renderSessionSheet() {
    const s = cur();
    $('#memberList').innerHTML = s.members.map(m => {
      const [bg, ink] = colorOf(s, m.id);
      return `<li class="member" style="--bg:${bg};--on:${ink}"><span>${esc(m.name)}</span>
        <button type="button" data-remove="${esc(m.id)}" aria-label="Bỏ ${esc(m.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button></li>`;
    }).join('');
    const canDel = db.sessions.length > 1; // the last session stays, so there is always one to show
    $('#sessionList').innerHTML = db.sessions.map(x => `<li><button type="button" data-open="${esc(x.id)}" ${x.id === s.id ? 'aria-current="true"' : ''}>
      <b>${esc(x.name)}</b><small>${vnDate(x.date)} · ${x.members.length} người · ${x.expenses.length} món</small></button>${canDel ? `
      <button type="button" class="del" data-del="${esc(x.id)}" aria-label="Xoá buổi ${esc(x.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button>` : ''}</li>`).join('');
  }
  // The name/date fields belong to the session they were loaded from, not to whatever is
  // current when the sheet closes (switching or deleting changes `cur()` before close fires).
  let formSessionId = null;
  function loadFields(s) { formSessionId = s.id; sForm.name.value = s.name; sForm.date.value = s.date; }
  function openSession() {
    loadFields(cur());
    $('#sessionErr').textContent = '';
    renderSessionSheet();
    sDlg.showModal();
  }
  function commitFields() {
    const s = db.sessions.find(x => x.id === formSessionId);
    if (!s) return; // deleted while the sheet was open
    s.name = sForm.name.value.trim() || 'Buổi đi chơi';
    s.date = sForm.date.value || today();
  }
  function addMembers() {
    const s = cur(), names = $('#memberInput').value.split(/[,\n]/).map(x => x.trim()).filter(Boolean);
    for (const n of names) {
      if (s.members.some(m => m.name.toLowerCase() === n.toLowerCase())) { $('#sessionErr').textContent = '"' + n + '" đã có trong bàn.'; continue; }
      s.members.push({ id: uid(), name: n.slice(0, 40), color: freeColor(s) });
      // A newcomer joins only items added from now on; old items keep their sharers.
    }
    $('#memberInput').value = '';
    save(); renderSessionSheet();
  }
  $('#memberAdd').onclick = addMembers;
  $('#memberInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addMembers(); } });
  $('#memberList').addEventListener('click', e => {
    const b = e.target.closest('[data-remove]'); if (!b) return;
    const s = cur(), id = b.dataset.remove;
    const used = s.expenses.filter(x => x.payerId === id || x.sharerIds.includes(id));
    if (used.length) { $('#sessionErr').textContent = nameOf(s, id) + ' đang có trong ' + used.length + ' món. Sửa các món đó trước khi bỏ người này.'; return; }
    s.members = s.members.filter(m => m.id !== id);
    $('#sessionErr').textContent = '';
    save(); renderSessionSheet();
  });
  $('#sessionList').addEventListener('click', e => {
    const d = e.target.closest('[data-del]');
    if (d) {
      const x = db.sessions.find(y => y.id === d.dataset.del);
      if (!x || db.sessions.length < 2 || !confirm('Xoá buổi "' + x.name + '" và toàn bộ món của nó? Không hoàn tác được.')) return;
      commitFields();
      db.sessions = db.sessions.filter(y => y.id !== x.id);
      if (!db.sessions.some(y => y.id === db.currentId)) db.currentId = db.sessions[0].id;
      loadFields(cur()); save(); renderSessionSheet();
      return;
    }
    const b = e.target.closest('[data-open]'); if (!b) return;
    commitFields(); db.currentId = b.dataset.open; save(); sDlg.close(); showTab('table');
  });
  $('#newSession').onclick = () => {
    commitFields();
    // Same friends usually go out again: copy the member list, start with no items.
    const s = newSession(cur().members.map(m => ({ ...m })));
    db.sessions.unshift(s); db.currentId = s.id; save();
    loadFields(s); renderSessionSheet(); sForm.name.select();
  };
  sForm.addEventListener('submit', e => { e.preventDefault(); commitFields(); save(); sDlg.close(); });
  sDlg.addEventListener('close', () => { commitFields(); save(); });
  $('#sessionBtn').onclick = openSession;
  $('#inviteBtn').onclick = openSession;

  /* ---------- start ---------- */
  importFromHash();
  window.addEventListener('hashchange', () => { importFromHash(); render(); });
  render();
  document.fonts.ready.then(render); // re-fit seat names once Be Vietnam Pro has loaded
})();
