(function () {
  const root = document.getElementById("booking-app");
  if (!root) return;
  const locale = root.dataset.locale || "en";
  const ready = root.dataset.ready === "1";
  const zh = locale === "zh-Hant";
  const copy = zh
    ? {
        first: "名字", last: "姓氏", phone: "聯絡電話", email: "電郵地址",
        date: "選擇參觀日期", slot: "選擇時段", guests: "參觀人數",
        referral: "您從何處得知我們", next: "下一步", submit: "提交",
        terms: "提交此登記即表示本人已閱讀、理解並同意校史館的條款及細則。",
        success: "預約已完成", keep: "請保存預約編號，進場時需要出示。",
        another: "再預約一次", home: "返回主頁",
        emailOk: "確認信已發送至",
        emailNo: "預約已保存。若未收到電郵，請保存編號並寫至 museum@hksyu.edu。",
        pick: "請先選擇日期以顯示時段。",
        left: (n) => "尚餘 " + n,
        full: "已滿",
        loading: "正在查詢剩餘名額…",
        help: "每個時段 1.5 小時，最多 30 人。",
        extraTitle: "同行訪客",
        extraHelp: "請填寫每位額外訪客的名字與姓氏，須與身份證明文件／護照相同。確認信只寄至您的電郵，全團共用一個預約編號。",
        extraGuest: (n) => "訪客 " + n,
        extraNeed: "請填寫每位額外訪客的名字及姓氏。",
        yourDetails: "預約人資料",
        nameId: "進場時或須出示有效身份證明。證件上的姓名必須與預約所用姓名完全一致。",
        phoneHelp: "只可輸入數字。",
        emailHelp: "須包含 @ 及網域，例如 name@example.com。",
        errTitle: "請先補齊或更正以下資料",
        errHint: "點選項目可跳至該欄。",
        needDate: "請選擇參觀日期。",
        needSlot: "請選擇參觀時段。",
        needFirst: "請填寫名字。",
        needLast: "請填寫姓氏。",
        needPhone: "請填寫正確的電話號碼（只可用數字）。",
        needPhoneLen: (n, ex) => "此區號須為 " + n + " 位數字，例如 " + ex + "。",
        needEmailEmpty: "請填寫電郵地址。",
        needEmailAt: "電郵須包含 @，例如 name@example.com。",
        needEmail: "請輸入正確電郵，須包含 @ 及網域（例如 .com、.edu、.hk）。",
        needReferral: "請告訴我們您從何處得知我們。",
        reviewVisit: "參觀資料",
        reviewParty: "訪客",
        reviewDate: "日期",
        reviewSlot: "時段",
        reviewGuests: "人數",
        reviewName: "姓名",
        reviewPhone: "電話",
        reviewEmail: "電郵",
        reviewReferral: "得知途徑",
        back: "返回",
        calHint: "您可以選用方向鍵移動日期，再按 Enter 或空白鍵選擇。",
        calSelected: "參觀日期：",
        calNone: "尚未選擇日期",
      }
    : {
        first: "First Name", last: "Last Name", phone: "Phone Number", email: "Email Address",
        date: "Pick Date of Visitation", slot: "Choose a session", guests: "Number of Guest(s)",
        referral: "How You Heard About Us", next: "Next", submit: "Submit",
        terms: "By submitting this registration, I confirm that I have read, understood, and agree to the Museum's Terms and Conditions.",
        success: "Your visit is booked", keep: "Please save your booking reference — you will need it at the entrance.",
        another: "Make another booking", home: "Return to the home page",
        emailOk: "We sent your confirmation to",
        emailNo: "Your booking is saved. If email did not arrive, keep this reference and write to museum@hksyu.edu.",
        pick: "Choose a date to see session times.",
        left: (n) => n + " left",
        full: "Full",
        loading: "Checking remaining places…",
        help: "Each session lasts 1.5 hours and admits up to 30 visitors.",
        extraTitle: "Other guests",
        extraHelp: "Give the first and last name of each extra visitor, exactly as on their ID or passport. One confirmation email is sent to you, with one booking reference for the whole party.",
        extraGuest: (n) => "Guest " + n,
        extraNeed: "Enter the first and last name of each extra guest.",
        yourDetails: "Your details",
        nameId: "Visitors may be required to present a valid form of identification upon entry. The name on the identification must match the name used in the reservation.",
        phoneHelp: "Digits only.",
        emailHelp: "Must include @ and a domain, for example name@example.com.",
        errTitle: "Please complete or correct the items below",
        errHint: "Select a link to jump to that field.",
        needDate: "Choose the date of your visit.",
        needSlot: "Choose a session time.",
        needFirst: "Enter your first name.",
        needLast: "Enter your last name.",
        needPhone: "Enter a valid phone number using digits only.",
        needPhoneLen: (n, ex) => "This country code uses " + n + " digits, for example " + ex + ".",
        needEmailEmpty: "Enter your email address.",
        needEmailAt: "Email must include @, for example name@example.com.",
        needEmail: "Enter a valid email with @ and a domain (for example .com, .edu, .hk).",
        needReferral: "Tell us how you heard about us.",
        reviewVisit: "Your visit",
        reviewParty: "Who is visiting",
        reviewDate: "Date",
        reviewSlot: "Session",
        reviewGuests: "Guests",
        reviewName: "Name",
        reviewPhone: "Phone",
        reviewEmail: "Email",
        reviewReferral: "How you heard about us",
        back: "Back",
        calHint: "You can choose to use the arrow keys to move between dates, then press Enter or Space to select.",
        calSelected: "Date of Visitation:",
        calNone: "No date chosen yet",
      };

  const referrals = [
    ["social_media", zh ? "社交媒體" : "Social media"],
    ["university_website", zh ? "大學網站" : "University website"],
    ["friend_family_colleague", zh ? "親友 / 同事" : "Friend / family / colleague"],
    ["campus_posters", zh ? "校園海報或橫額" : "On-campus posters or banners"],
    ["email_newsletter", zh ? "電郵 / 通訊" : "Email / newsletter"],
    ["search_engine", zh ? "搜尋引擎" : "Search engine"],
    ["other", zh ? "其他" : "Other"],
  ];

  const phoneFmt = {
    "+852": { min: 8, max: 8, ex: "9123 4567" },
    "+86": { min: 11, max: 11, ex: "138 0013 8000" },
    "+853": { min: 8, max: 8, ex: "6281 2345" },
    "+886": { min: 9, max: 10, ex: "912 345 678" },
    "+44": { min: 10, max: 10, ex: "7911 123456" },
    "+1": { min: 10, max: 10, ex: "202 555 0147" },
  };

  const state = {
    step: 1,
    firstName: "", lastName: "", phoneCountryCode: "+852", phone: "",
    email: "", visitDate: "", visitSlot: "", guests: 1, extraGuests: [], referralSource: "",
    acceptedTerms: false, slots: [], loading: false, error: "", errorList: [], success: null, cursor: null, calFocus: null, calRefocus: false,
  };

  function pad(n) { return String(n).padStart(2, "0"); }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseIso(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12); }

  function closed(isoDate) { return parseIso(isoDate).getDay() === 1; }
  function tooSoon(isoDate) {
    const t = new Date(); t.setHours(12, 0, 0, 0);
    return isoDate < iso(t);
  }
  function tooLate(isoDate) {
    const t = new Date(); t.setHours(12, 0, 0, 0);
    t.setDate(t.getDate() + 180);
    return isoDate > iso(t);
  }
  function bookable(isoDate) {
    return !closed(isoDate) && !tooSoon(isoDate) && !tooLate(isoDate);
  }
  function addDays(id, n) {
    const d = parseIso(id);
    d.setDate(d.getDate() + n);
    return iso(d);
  }
  function formatChosen(id) {
    if (!id) return copy.calNone;
    const d = parseIso(id);
    if (zh) return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  function findEnabled(from, jump) {
    let cur = addDays(from, jump);
    const dir = jump > 0 ? 1 : -1;
    for (let i = 0; i < 400; i++) {
      if (tooSoon(cur) && dir < 0) return null;
      if (tooLate(cur) && dir > 0) return null;
      if (bookable(cur)) return cur;
      cur = addDays(cur, dir);
    }
    return null;
  }
  function focusCalDay() {
    if (!state.calFocus) return;
    const btn = root.querySelector('button.day[data-date="' + state.calFocus + '"]');
    if (btn && !btn.disabled) btn.focus();
  }
  function handleCalKey(e) {
    if (state.step !== 1) return;
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("input, select, textarea")) return;
    const cal = root.querySelector(".cal");
    if (!cal || !cal.contains(t)) return;
    if (t.id === "prevM" || t.id === "nextM") return;
    const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key === "Enter" || e.key === " ") {
      const id = (t.dataset && t.dataset.date) || state.calFocus;
      const btn = root.querySelector('button.day[data-date="' + id + '"]');
      if (btn && !btn.disabled) {
        e.preventDefault();
        btn.click();
      }
      return;
    }
    if (!map[e.key]) return;
    e.preventDefault();
    const from = (t.dataset && t.dataset.date) || state.calFocus || state.visitDate || iso(new Date());
    const next = findEnabled(from, map[e.key]);
    if (!next) return;
    keepFields();
    state.calFocus = next;
    state.calRefocus = true;
    const parts = next.split("-").map(Number);
    state.cursor = { y: parts[0], m: parts[1] - 1 };
    render();
  }
  root.addEventListener("keydown", handleCalKey);

  async function loadSlots(date) {
    if (!date || !ready) { state.slots = []; return; }
    state.loading = true;
    state.calRefocus = true;
    render();
    try {
      const res = await fetch("/api/slots.php?date=" + encodeURIComponent(date));
      state.slots = await res.json();
    } catch (e) {
      state.slots = [];
      state.error = "Could not load sessions.";
    }
    state.loading = false;
    state.calRefocus = true;
    render();
  }

  function calendarHtml() {
    const now = new Date();
    if (!state.cursor) state.cursor = { y: now.getFullYear(), m: now.getMonth() };
    const year = state.cursor.y;
    const month = state.cursor.m;
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const weekdays = zh ? "日一二三四五六" : "SMTWTFS";
    let firstOn = "";
    let cells = "";
    for (let i = 0; i < startPad; i++) cells += "<td></td>";
    for (let d = 1; d <= days; d++) {
      const id = year + "-" + pad(month + 1) + "-" + pad(d);
      const off = closed(id) || tooSoon(id) || tooLate(id);
      if (!firstOn && !off) firstOn = id;
      const sel = state.visitDate === id ? " sel" : "";
      const tab = !off && id === (state.calFocus || firstOn) ? "0" : "-1";
      cells += `<td><button type="button" class="day${sel}" data-date="${id}" tabindex="${tab}" ${off ? "disabled" : ""}>${d}</button></td>`;
      if ((startPad + d) % 7 === 0) cells += "</tr><tr>";
    }
    if (!state.calFocus) state.calFocus = (state.visitDate && bookable(state.visitDate)) ? state.visitDate : firstOn;
    const monthName = new Date(year, month, 1).toLocaleString(zh ? "zh-HK" : "en-GB", { month: "long", year: "numeric" });
    return `<p class="cal-status">${copy.calSelected} <strong>${formatChosen(state.visitDate)}</strong></p><div class="cal"><p><button type="button" id="prevM" aria-label="Previous month">‹</button> ${monthName} <button type="button" id="nextM" aria-label="Next month">›</button></p><table role="grid" aria-label="${copy.date}"><thead><tr>${[...weekdays].map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody><tr>${cells}</tr></tbody></table><p class="cal-hint" id="cal-hint">${copy.calHint}</p></div>`;
  }

  function render() {
    if (state.success) {
      const s = state.success;
      root.innerHTML = `<div class="book-card">
        <h2>${copy.success}</h2>
        <p class="success-ref">${s.reference}</p>
        <p>${copy.keep}</p>
        <p>${s.visitDate} · ${s.visitSlot} · ${s.guests}</p>
        <p>${s.emailSent ? copy.emailOk + " " + s.email : copy.emailNo}</p>
        <p class="actions"><button class="btn outline" id="again">${copy.another}</button>
        <a class="btn" href="/">${copy.home}</a></p>
      </div>`;
      document.getElementById("again").onclick = () => {
        Object.assign(state, { step: 1, success: null, visitDate: "", visitSlot: "", acceptedTerms: false, error: "" });
        render();
      };
      return;
    }

    if (state.step === 2) {
      const terms = zh
        ? `<h3>條款及細則</h3>
           <ul>
             <li>持確認預約者優先入場；現場候補視乎名額。</li>
             <li>參觀以 1.5 小時計。時段滿 30 人即停止接受預約。</li>
             <li>請於預約時段開始時到達。星期一休館。</li>
             <li>進場時或需出示有效身份證明及預約編號。</li>
           </ul>`
        : `<h3>Terms and Conditions</h3>
           <ul>
             <li>Entry is prioritised for visitors with a confirmed reservation. Walk-ins only if capacity allows.</li>
             <li>Each visit is a 1.5-hour session. A session closes at 30 visitors.</li>
             <li>Arrive at the start of your booked session. Closed on Mondays.</li>
             <li>Bring this booking reference; you may be asked for identification.</li>
           </ul>`;
      const referralLabel = (referrals.find((r) => r[0] === state.referralSource) || [,"—"])[1];
      root.innerHTML = `<div class="book-card">
        <div class="review-grid">
          <section class="review-block">
            <h3>${copy.reviewVisit}</h3>
            <dl>
              <div class="review-row"><dt>${copy.reviewDate}</dt><dd>${esc(prettyDate(state.visitDate))}</dd></div>
              <div class="review-row"><dt>${copy.reviewSlot}</dt><dd>${esc(slotRange())}</dd></div>
              <div class="review-row"><dt>${copy.reviewGuests}</dt><dd>${state.guests}</dd></div>
              <div class="review-row"><dt>${copy.reviewReferral}</dt><dd>${esc(referralLabel)}</dd></div>
            </dl>
          </section>
          <section class="review-block">
            <h3>${copy.reviewParty}</h3>
            <dl>
              <div class="review-row"><dt>${copy.reviewName}</dt><dd>${esc(state.firstName)} ${esc(state.lastName)}</dd></div>
              <div class="review-row"><dt>${copy.reviewPhone}</dt><dd>${esc(state.phoneCountryCode)} ${esc(state.phone)}</dd></div>
              <div class="review-row"><dt>${copy.reviewEmail}</dt><dd>${esc(state.email)}</dd></div>
              ${extraList()}
            </dl>
          </section>
        </div>
        <div class="terms-box">${terms}</div>
        <label class="check"><input id="terms" type="checkbox" ${state.acceptedTerms ? "checked" : ""}>
        <span><span class="req">✱</span> ${copy.terms}</span></label>
        ${state.error ? `<p class="alert">${esc(state.error)}</p>` : ""}
        <p class="actions"><button class="btn outline" id="back" type="button">${copy.back}</button>
        <button class="btn lg" id="go" type="button">${copy.submit}</button></p>
      </div>`;
      document.getElementById("terms").onchange = (e) => { state.acceptedTerms = e.target.checked; };
      document.getElementById("back").onclick = () => { state.step = 1; render(); };
      document.getElementById("go").onclick = submit;
      return;
    }

    const slotButtons = !state.visitDate
      ? `<p>${copy.pick}</p>`
      : state.loading
        ? `<p>${copy.loading}</p>`
        : `<p>${copy.help}</p><div class="slots">${state.slots.map((s) => {
            const full = s.remaining <= 0;
            const small = !full && s.remaining < state.guests;
            const dis = full || small;
            const label = full ? copy.full : copy.left(s.remaining);
            const sel = state.visitSlot === s.slot ? " sel" : "";
            return `<button type="button" class="slot${sel}" data-slot="${s.slot}" ${dis ? "disabled" : ""}>
              <strong>${s.slot} – ${s.end}</strong><br><span>${label}</span></button>`;
          }).join("")}</div>`;

    root.innerHTML = `<form class="book-card" id="f">
      ${errorBox()}
      <div class="row two">
        <div id="booking-visitDate"><span class="req">✱</span> ${copy.date}${calendarHtml()}</div>
        <div>
          <div id="booking-visitSlot"><span class="req">✱</span> ${copy.slot}${slotButtons}</div>
          <label style="margin-top:1rem;display:block;">${copy.guests}
            <div class="stepper">
              <button type="button" id="minus">−</button>
              <input name="guests" type="number" min="1" max="30" value="${state.guests}">
              <button type="button" id="plus">+</button>
            </div>
          </label>
        </div>
      </div>
      <p style="margin:1.5rem 0 .35rem;"><strong>${copy.yourDetails}</strong></p>
      <div class="row two">
        <label><span class="req">✱</span> ${copy.first}<input id="booking-firstName" class="${bad("booking-firstName")}" name="firstName" required maxlength="60" autocomplete="given-name" value="${esc(state.firstName)}"></label>
        <label><span class="req">✱</span> ${copy.last}<input id="booking-lastName" class="${bad("booking-lastName")}" name="lastName" required maxlength="60" autocomplete="family-name" value="${esc(state.lastName)}"></label>
      </div>
      <p class="name-id">${copy.nameId}</p>
      <label><span class="req">✱</span> ${copy.phone}
        <div class="phone-row">
          <select name="phoneCountryCode">${["+852","+86","+853","+886","+44","+1"].map((c) =>
            `<option value="${c}" ${state.phoneCountryCode === c ? "selected" : ""}>${c}</option>`).join("")}</select>
          <input id="booking-phone" class="${bad("booking-phone")}" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" maxlength="${phoneMax()}" placeholder="${esc((phoneFmt[state.phoneCountryCode] || {}).ex || "9123 4567")}" value="${esc(state.phone)}">
        </div>
        <small class="hint">${copy.phoneHelp} ${esc((phoneFmt[state.phoneCountryCode] || {}).ex || "")}</small>
      </label>
      <label><span class="req">✱</span> ${copy.email}<input id="booking-email" class="${bad("booking-email")}" name="email" type="email" inputmode="email" autocomplete="email" spellcheck="false" placeholder="name@example.com" value="${esc(state.email)}"><small class="hint">${copy.emailHelp}</small></label>
      ${extraGuestFields()}
      <label><span class="req">✱</span> ${copy.referral}
        <select id="booking-referral" name="referralSource"><option value="">${zh ? "請選擇一項" : "Please choose an option"}</option>
        ${referrals.map(([v, l]) => `<option value="${v}" ${state.referralSource === v ? "selected" : ""}>${l}</option>`).join("")}
        </select>
      </label>
      <p class="actions"><button class="btn lg" type="submit">${copy.next}</button></p>
    </form>`;

    const form = document.getElementById("f");
    document.querySelectorAll("#err-box a").forEach((a) => {
      a.onclick = (ev) => {
        ev.preventDefault();
        const id = (a.getAttribute("href") || "").replace("#", "");
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        if (typeof el.focus === "function") el.focus();
      };
    });
    form.onsubmit = (e) => {
      e.preventDefault();
      pull(form);
      resizeExtra();
      const issues = collectIssues();
      if (issues.length) {
        state.error = "";
        state.errorList = issues;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
        const box = document.getElementById("err-box");
        if (box) box.focus();
        return;
      }
      state.error = "";
      state.errorList = [];
      state.step = 2;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    form.querySelectorAll("button.day").forEach((b) => {
      b.onclick = () => {
        keepFields();
        state.visitDate = b.dataset.date;
        state.calFocus = b.dataset.date;
        state.calRefocus = true;
        state.visitSlot = "";
        loadSlots(state.visitDate);
      };
    });
    if (state.calRefocus) {
      state.calRefocus = false;
      requestAnimationFrame(focusCalDay);
    }
    form.querySelectorAll("button.slot").forEach((b) => {
      b.onclick = () => { keepFields(); state.visitSlot = b.dataset.slot; render(); };
    });
    document.getElementById("minus").onclick = () => { keepFields(); state.guests = Math.max(1, state.guests - 1); resizeExtra(); render(); };
    document.getElementById("plus").onclick = () => { keepFields(); state.guests = Math.min(30, state.guests + 1); resizeExtra(); render(); };
    const phoneInput = document.getElementById("booking-phone");
    if (phoneInput) {
      phoneInput.addEventListener("keydown", (ev) => {
        if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
        if (ev.key.length === 1 && /[^\d\s-]/.test(ev.key)) ev.preventDefault();
      });
      phoneInput.addEventListener("beforeinput", (ev) => {
        if (ev.data && /[^\d\s-]/.test(ev.data)) ev.preventDefault();
      });
      phoneInput.addEventListener("paste", (ev) => {
        ev.preventDefault();
        const text = ((ev.clipboardData && ev.clipboardData.getData("text")) || "").replace(/[^\d\s-]/g, "");
        const start = phoneInput.selectionStart || 0;
        const end = phoneInput.selectionEnd || 0;
        phoneInput.value = (phoneInput.value.slice(0, start) + text + phoneInput.value.slice(end)).replace(/[^\d\s-]/g, "");
      });
      phoneInput.oninput = () => {
        phoneInput.value = phoneInput.value.replace(/[^\d\s-]/g, "");
      };
    }
    const codeSel = form.querySelector('select[name="phoneCountryCode"]');
    if (codeSel) {
      codeSel.onchange = () => { keepFields(); render(); };
    }
    const guestsInput = form.querySelector('input[name="guests"]');
    if (guestsInput) {
      guestsInput.onchange = () => {
        keepFields();
        state.guests = Math.min(30, Math.max(1, Number(state.guests) || 1));
        resizeExtra();
        render();
      };
    }
    const prevM = document.getElementById("prevM");
    const nextM = document.getElementById("nextM");
    if (prevM) prevM.onclick = () => {
      keepFields();
      if (!state.cursor) return;
      state.cursor.m -= 1;
      if (state.cursor.m < 0) { state.cursor.m = 11; state.cursor.y -= 1; }
      render();
    };
    if (nextM) nextM.onclick = () => {
      keepFields();
      if (!state.cursor) return;
      state.cursor.m += 1;
      if (state.cursor.m > 11) { state.cursor.m = 0; state.cursor.y += 1; }
      render();
    };
  }

  function keepFields() {
    const existing = document.getElementById("f");
    if (existing) pull(existing);
  }

  function pull(form) {
    const fd = new FormData(form);
    state.firstName = (fd.get("firstName") || "").toString().trim();
    state.lastName = (fd.get("lastName") || "").toString().trim();
    state.phoneCountryCode = (fd.get("phoneCountryCode") || "+852").toString();
    state.phone = (fd.get("phone") || "").toString().replace(/[^\d\s-]/g, "");
    state.email = (fd.get("email") || "").toString().trim();
    state.guests = Number(fd.get("guests") || state.guests);
    const extra = [];
    const need = Math.max(0, state.guests - 1);
    for (let i = 0; i < need; i++) {
      extra.push({
        firstName: (fd.get("extraFirst-" + i) || "").toString().trim(),
        lastName: (fd.get("extraLast-" + i) || "").toString().trim(),
      });
    }
    state.extraGuests = extra;
    state.referralSource = (fd.get("referralSource") || "").toString();
  }

  function resizeExtra() {
    const need = Math.max(0, state.guests - 1);
    const extra = (state.extraGuests || []).slice(0, need);
    while (extra.length < need) extra.push({ firstName: "", lastName: "" });
    state.extraGuests = extra;
  }

  function extraGuestsComplete() {
    const need = Math.max(0, state.guests - 1);
    if ((state.extraGuests || []).length !== need) return false;
    return state.extraGuests.every((g) => g.firstName && g.lastName);
  }

  function phoneMax() {
    const fmt = phoneFmt[state.phoneCountryCode] || { max: 15 };
    return String(fmt.max + 4);
  }

  function bad(id) {
    return (state.errorList || []).some((item) => item.id === id) ? "bad" : "";
  }

  function phoneMsg() {
    const fmt = phoneFmt[state.phoneCountryCode] || { min: 8, max: 15, ex: "9123 4567" };
    const d = (state.phone || "").replace(/\D+/g, "");
    if (!d) return copy.needPhone;
    if (d.length < fmt.min || d.length > fmt.max) {
      const n = fmt.min === fmt.max ? String(fmt.min) : fmt.min + "–" + fmt.max;
      return copy.needPhoneLen(n, fmt.ex);
    }
    return copy.needPhone;
  }

  function emailMsg() {
    const value = (state.email || "").trim();
    if (!value) return copy.needEmailEmpty;
    if (!value.includes("@")) return copy.needEmailAt;
    return copy.needEmail;
  }

  function phoneOk() {
    const fmt = phoneFmt[state.phoneCountryCode] || { min: 8, max: 15 };
    const d = (state.phone || "").replace(/\D+/g, "");
    return d.length >= fmt.min && d.length <= fmt.max;
  }

  function emailOk() {
    return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})*$/.test((state.email || "").trim());
  }

  function collectIssues() {
    const issues = [];
    if (!state.visitDate) issues.push({ id: "booking-visitDate", label: copy.date, msg: copy.needDate });
    if (!state.visitSlot) issues.push({ id: "booking-visitSlot", label: copy.slot, msg: copy.needSlot });
    if (!state.firstName) issues.push({ id: "booking-firstName", label: copy.first, msg: copy.needFirst });
    if (!state.lastName) issues.push({ id: "booking-lastName", label: copy.last, msg: copy.needLast });
    if (!phoneOk()) issues.push({ id: "booking-phone", label: copy.phone, msg: phoneMsg() });
    if (!emailOk()) issues.push({ id: "booking-email", label: copy.email, msg: emailMsg() });
    if (!extraGuestsComplete()) issues.push({ id: "booking-extraGuests", label: copy.extraTitle, msg: copy.extraNeed });
    if (!state.referralSource) issues.push({ id: "booking-referral", label: copy.referral, msg: copy.needReferral });
    return issues;
  }

  function errorBox() {
    const list = state.errorList || [];
    if (state.error) return `<p class="alert">${esc(state.error)}</p>`;
    if (!list.length) return "";
    return `<div class="err-box" id="err-box" tabindex="-1">
      <p><strong>${copy.errTitle}</strong></p>
      <p class="hint">${copy.errHint}</p>
      <ul>${list.map((item) => `<li><a href="#${item.id}">${esc(item.label)} — ${esc(item.msg)}</a></li>`).join("")}</ul>
    </div>`;
  }

  function extraGuestFields() {
    const need = Math.max(0, state.guests - 1);
    if (need === 0) return "";
    const rows = (state.extraGuests || []).slice(0, need).map((g, i) =>
      `<div class="row two extra-guest">
        <label><span class="req">✱</span> ${copy.extraGuest(i + 2)} — ${copy.first}
          <input name="extraFirst-${i}" required value="${esc(g.firstName || "")}">
        </label>
        <label><span class="req">✱</span> ${copy.extraGuest(i + 2)} — ${copy.last}
          <input name="extraLast-${i}" required value="${esc(g.lastName || "")}">
        </label>
      </div>`
    ).join("");
    return `<div class="extra-box" id="booking-extraGuests"><p><strong>${copy.extraTitle}</strong></p><p class="hint">${copy.extraHelp}</p>${rows}</div>`;
  }

  function extraList() {
    const names = (state.extraGuests || [])
      .map((g) => (g.firstName + " " + g.lastName).trim())
      .filter(Boolean);
    if (!names.length) return "";
    return names.map((n, i) =>
      `<div class="review-row"><dt>${esc(guestOrdinal(i + 2))}</dt><dd>${esc(n)}</dd></div>`
    ).join("");
  }

  function guestOrdinal(n) {
    if (zh) return "第" + n + "位訪客";
    const j = n % 10;
    const k = n % 100;
    const suf = k >= 11 && k <= 13 ? "th" : j === 1 ? "st" : j === 2 ? "nd" : j === 3 ? "rd" : "th";
    return n + suf + " guest";
  }

  function prettyDate(iso) {
    if (!iso) return "";
    const d = parseIso(iso);
    if (zh) return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function slotRange() {
    const found = (state.slots || []).find((s) => s.slot === state.visitSlot);
    return found ? state.visitSlot + " – " + found.end : state.visitSlot;
  }

  async function submit() {
    if (!state.acceptedTerms) {
      state.error = zh ? "提交前必須同意條款及細則。" : "You must agree to the Terms and Conditions before submitting.";
      render();
      return;
    }
    state.error = "";
    try {
      const res = await fetch("/api/book.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state, locale, acceptedTerms: true }),
      });
      const data = await res.json();
      if (data.status === "success") {
        state.success = data;
        state.step = 3;
      } else if (data.status === "invalid" && data.errors && data.errors.guests === "capacityFull") {
        state.error = zh
          ? "抱歉，該時段已滿。請另選時段或減少人數。"
          : "That session is fully booked. Please choose another session or reduce your party size.";
        state.step = 1;
        await loadSlots(state.visitDate);
        return;
      } else if (data.status === "invalid" && data.errors) {
        state.step = 1;
        const issues = collectIssues();
        state.errorList = issues.length ? issues : [{ id: "booking-visitDate", label: copy.errTitle, msg: zh ? "請檢查表格後再試。" : "Please check the form and try again." }];
        state.error = "";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      } else {
        state.error = zh ? "系統出錯，請稍後再試。" : "Something went wrong. Please try again.";
      }
    } catch (e) {
      state.error = zh ? "未能連接預約服務。" : "Could not reach the booking service.";
    }
    render();
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&" + "amp;")
      .replace(/</g, "&" + "lt;")
      .replace(/>/g, "&" + "gt;")
      .replace(/"/g, "&" + "quot;")
      .replace(/'/g, "&#39;");
  }

  try { render(); } catch (err) {
    root.innerHTML = '<p class="alert">Booking form failed to load. Please refresh.</p>';
    console.error(err);
  }
})();
