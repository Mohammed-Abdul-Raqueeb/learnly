/* ═══════════════════════════════════════════════════════════════
   LEARNLY — Online Learning Portal UI  (AAT-1)
   script.js — one shared script for all four pages.
   <body data-page="…"> decides which initialiser runs.
   THREE localStorage keys keep the portal stateful:
     learnly_cart      → {courseId: seats}
     learnly_progress  → {lessonKey: true}
     learnly_prefs     → reader typography preferences
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ───────────────────────── 1. Course catalogue ───────────────────────── */
const COURSES = [
  { id: "fullstack", name: "Full Stack Web Development", cat: "development", price: 499,
    level: "Intermediate", lessons: 42, hours: "8h 30m", assignments: 12, rating: 4.9, students: "3.1k",
    instructor: "Priya Raman", accent: "#5B3DF5" },
  { id: "uiux", name: "UI/UX Design Fundamentals", cat: "design", price: 449,
    level: "Beginner", lessons: 36, hours: "6h 45m", assignments: 9, rating: 4.8, students: "2.4k",
    instructor: "Aditya Menon", accent: "#FF6B5E" },
  { id: "python-ds", name: "Python for Data Science", cat: "data", price: 479,
    level: "Beginner", lessons: 40, hours: "7h 50m", assignments: 11, rating: 4.8, students: "2.9k",
    instructor: "Dr. Kavya Nair", accent: "#12A150" },
  { id: "js-deep", name: "JavaScript Deep Dive", cat: "development", price: 429,
    level: "Advanced", lessons: 38, hours: "7h 10m", assignments: 10, rating: 4.7, students: "1.8k",
    instructor: "Rahul Verma", accent: "#E8A400" },
  { id: "figma-fe", name: "Figma to Front-End", cat: "design", price: 399,
    level: "Intermediate", lessons: 28, hours: "5h 20m", assignments: 8, rating: 4.7, students: "1.5k",
    instructor: "Sneha Kulkarni", accent: "#0FA3B1" },
  { id: "sql-db", name: "SQL & Databases", cat: "data", price: 389,
    level: "Beginner", lessons: 30, hours: "5h 40m", assignments: 9, rating: 4.6, students: "2.0k",
    instructor: "Arjun Shetty", accent: "#7A4FF0" },
  { id: "css-mastery", name: "Responsive CSS Mastery", cat: "development", price: 359,
    level: "Beginner", lessons: 26, hours: "4h 55m", assignments: 7, rating: 4.8, students: "2.6k",
    instructor: "Priya Raman", accent: "#C6529E" },
  { id: "dataviz", name: "Data Visualization with D3", cat: "data", price: 469,
    level: "Advanced", lessons: 32, hours: "6h 15m", assignments: 8, rating: 4.6, students: "1.2k",
    instructor: "Dr. Kavya Nair", accent: "#3B82F6" }
];

/* the syllabus shown on the landing page (from the CSS Mastery course) */
const SYLLABUS = [
  { module: "Module 1 — Foundations", lessons: [
    { t: "Welcome & course tour", type: "video", dur: "4:10" },
    { t: "How the browser reads your CSS", type: "video", dur: "9:32" },
    { t: "Reading: the cascade in one page", type: "read", dur: "6 min" }
  ]},
  { module: "Module 2 — The Box Model", lessons: [
    { t: "Content, padding, border, margin", type: "video", dur: "11:05" },
    { t: "Reading layout like a browser", type: "read", dur: "8 min" },
    { t: "Assignment 3 — rebuild the lesson card", type: "assign", dur: "45 min" }
  ]},
  { module: "Module 3 — Responsive Layouts", lessons: [
    { t: "Flexbox: rows that behave", type: "video", dur: "12:44" },
    { t: "Grid: two-dimensional thinking", type: "video", dur: "13:20" },
    { t: "Assignment 4 — make this page mobile-first", type: "assign", dur: "60 min" }
  ]}
];

const GST_RATE = 0.18;
const CART_KEY = "learnly_cart";
const PROGRESS_KEY = "learnly_progress";
const PREFS_KEY = "learnly_prefs";

/* ───────────────────────── 2. Small helpers ───────────────────────── */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function money(n) { return "\u20B9" + n.toLocaleString("en-IN"); }
function getCourse(id) { return COURSES.find(c => c.id === id); }
function initials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {}; }
  catch (e) { return {}; }
}

/* ───────────────────────── 3. Cart state (localStorage) ───────────────────────── */
function getCart() { return readJSON(CART_KEY); }
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function cartCount() { return Object.values(getCart()).reduce((s, q) => s + q, 0); }
function cartTotals() {
  const cart = getCart();
  let subtotal = 0;
  for (const id in cart) {
    const c = getCourse(id);
    if (c) subtotal += c.price * cart[id];
  }
  const gst = Math.round(subtotal * GST_RATE);
  return { subtotal, gst, total: subtotal + gst };
}
function addToCart(id) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
}
function setQty(id, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart(cart);
}
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}
function updateCartBadge() {
  const badge = $("#cartCount");
  if (badge) badge.textContent = cartCount();
}

/* ───────────────────────── 4. Toast ───────────────────────── */
let toastTimer = null;
function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ───────────────────────── 5. Course card renderer ─────────────────────────
   ONE template renders every course card on the site — the hero
   preview and the whole catalogue come from this function. */
function renderCourseCard(c, withButton = true) {
  return `
    <article class="course-card" style="--accent:${c.accent}">
      <span class="course-tab" aria-hidden="true"></span>
      <div class="course-top">
        <span class="level">${c.level.toUpperCase()}</span>
        <span class="rating"><b>\u2605</b> ${c.rating} <span style="color:var(--muted)">(${c.students})</span></span>
      </div>
      <h3>${c.name}</h3>
      <p class="instructor">by ${c.instructor}</p>
      <div class="course-meta">
        <span>\u25B6 <b>${c.lessons}</b> lessons</span>
        <span>\u23F1 <b>${c.hours}</b></span>
        <span>\u270E <b>${c.assignments}</b> assignments</span>
      </div>
      ${withButton ? `
      <div class="course-foot">
        <span class="price">${money(c.price)}</span>
        <button class="add-btn" data-id="${c.id}">Enroll</button>
      </div>` : ""}
    </article>`;
}

/* ───────────────────────── 6. Landing page ───────────────────────── */
function initHome() {
  /* hero card */
  const hero = $("#heroCard");
  if (hero) hero.innerHTML = renderCourseCard(getCourse("fullstack"), false);

  initReader();
  initSyllabus();
}

/* — 6a. the Reader: typography controls via CSS custom properties — */
function initReader() {
  const reader = $("#readerCard");
  if (!reader) return;

  const SIZES = { small: "16px", medium: "18px", large: "20px" };
  const HEIGHTS = { compact: "1.55", comfy: "1.75", airy: "1.95" };

  const prefs = Object.assign(
    { size: "medium", height: "comfy", theme: "paper" },
    readJSON(PREFS_KEY)
  );

  function apply() {
    reader.style.setProperty("--r-size", SIZES[prefs.size]);
    reader.style.setProperty("--r-lh", HEIGHTS[prefs.height]);
    reader.dataset.theme = prefs.theme;
    // reflect active buttons
    $$("#readerControls .seg button").forEach(b => {
      const group = b.dataset.group;
      b.classList.toggle("active", prefs[group] === b.dataset.value);
    });
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }

  $("#readerControls").addEventListener("click", e => {
    const btn = e.target.closest("button[data-group]");
    if (!btn) return;
    prefs[btn.dataset.group] = btn.dataset.value;
    apply();
  });

  apply();
}

/* — 6b. syllabus accordion + persistent progress — */
function initSyllabus() {
  const wrap = $("#modules");
  if (!wrap) return;

  const total = SYLLABUS.reduce((s, m) => s + m.lessons.length, 0);

  function render() {
    const progress = readJSON(PROGRESS_KEY);
    wrap.innerHTML = SYLLABUS.map((m, mi) => {
      const doneCount = m.lessons.filter((_, li) => progress[`m${mi}l${li}`]).length;
      const rows = m.lessons.map((l, li) => {
        const key = `m${mi}l${li}`;
        const done = !!progress[key];
        const ic = l.type === "assign" ? ["assign", "\u270E"] : l.type === "read" ? ["read", "\u25A4"] : ["", "\u25B6"];
        return `
          <div class="lesson ${done ? "done" : ""}">
            <span class="type-ic ${ic[0]}" aria-hidden="true">${ic[1]}</span>
            <span class="l-title">${l.t}</span>
            <span class="dur">${l.dur}</span>
            <input type="checkbox" data-key="${key}" ${done ? "checked" : ""}
                   aria-label="Mark '${l.t}' as complete" />
          </div>`;
      }).join("");
      return `
        <div class="module ${mi === 0 ? "open" : ""}">
          <button class="module-head" aria-expanded="${mi === 0}">
            <span>
              <span class="m-title">${m.module}</span><br />
              <span class="m-meta">${m.lessons.length} lessons \u00B7 ${doneCount} done</span>
            </span>
            <span class="chev" aria-hidden="true">\u25B8</span>
          </button>
          <div class="lessons">${rows}</div>
        </div>`;
    }).join("");
    updateProgressCard();
  }

  function updateProgressCard() {
    const progress = readJSON(PROGRESS_KEY);
    const done = Object.values(progress).filter(Boolean).length;
    const pct = Math.round((done / total) * 100);
    $("#pFill").style.width = pct + "%";
    $("#pPct").textContent = pct + "%";
    $("#pNums").textContent = `${done} of ${total} lessons complete`;
  }

  wrap.addEventListener("click", e => {
    const head = e.target.closest(".module-head");
    if (head) {
      const mod = head.parentElement;
      const open = mod.classList.toggle("open");
      head.setAttribute("aria-expanded", open);
    }
  });
  wrap.addEventListener("change", e => {
    const box = e.target.closest("input[data-key]");
    if (!box) return;
    const progress = readJSON(PROGRESS_KEY);
    if (box.checked) progress[box.dataset.key] = true;
    else delete progress[box.dataset.key];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    render();   // re-render keeps counts, strikethroughs and the bar in sync
  });

  render();
}

/* ───────────────────────── 7. Courses page ───────────────────────── */
function initProducts() {
  const grid = $("#courseGrid");
  if (!grid) return;

  function renderGrid(filter) {
    const list = filter === "all" ? COURSES : COURSES.filter(c => c.cat === filter);
    grid.innerHTML = list.map(c => renderCourseCard(c)).join("");
  }

  renderGrid("all");

  $$(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      $$(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderGrid(chip.dataset.filter);
    });
  });

  /* enroll via event delegation (survives re-renders) */
  grid.addEventListener("click", e => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    const c = getCourse(btn.dataset.id);
    addToCart(c.id);
    showToast(`${c.name} added to cart`);
    btn.textContent = "Added \u2713";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "Enroll";
      btn.classList.remove("added");
    }, 1400);
  });
}

/* ───────────────────────── 8. Cart page ───────────────────────── */
function initCart() {
  const wrap = $("#cartWrap");
  if (!wrap) return;

  function render() {
    const cart = getCart();
    const ids = Object.keys(cart);

    if (ids.length === 0) {
      wrap.innerHTML = `
        <div class="empty-state">
          <div class="empty-mark">\u25B6</div>
          <h2>Your cart is empty</h2>
          <p>Pick a course and it will appear here, ready for checkout.</p>
          <a href="products.html" class="btn btn-primary">Browse courses</a>
        </div>`;
      return;
    }

    const rows = ids.map(id => {
      const c = getCourse(id);
      const qty = cart[id];
      return `
        <div class="cart-row">
          <div class="swatch" style="--accent:${c.accent}" aria-hidden="true">${initials(c.name)}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${c.name}</div>
            <div class="cart-item-price">${money(c.price)} per seat \u00B7 by ${c.instructor}</div>
          </div>
          <div class="qty">
            <button data-id="${c.id}" data-action="dec" aria-label="Fewer seats of ${c.name}">&minus;</button>
            <output>${qty}</output>
            <button data-id="${c.id}" data-action="inc" aria-label="More seats of ${c.name}">+</button>
          </div>
          <div class="line-total">${money(c.price * qty)}</div>
          <button class="remove-btn" data-id="${c.id}" data-action="remove"
                  aria-label="Remove ${c.name} from cart">&times;</button>
        </div>`;
    }).join("");

    const tt = cartTotals();
    wrap.innerHTML = `
      <div class="cart-layout">
        <div class="cart-list">${rows}</div>
        <aside class="summary">
          <h3>Order summary</h3>
          <div class="summary-line"><span>Subtotal</span><span>${money(tt.subtotal)}</span></div>
          <div class="summary-line"><span>GST (18%)</span><span>${money(tt.gst)}</span></div>
          <div class="summary-total"><span>Total</span><span>${money(tt.total)}</span></div>
          <a href="payment.html" class="btn btn-primary btn-block">Proceed to payment</a>
          <p class="summary-note">Lifetime access \u00B7 certificate on completion.</p>
        </aside>
      </div>`;
  }

  render();

  wrap.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { id, action } = btn.dataset;
    const cart = getCart();
    if (action === "inc") setQty(id, cart[id] + 1);
    if (action === "dec") setQty(id, cart[id] - 1);
    if (action === "remove") {
      setQty(id, 0);
      showToast(`${getCourse(id).name} removed`);
    }
    render();
  });
}

/* ───────────────────────── 9. Payment page ───────────────────────── */
function initPayment() {
  const form = $("#payForm");
  if (!form) return;

  /* — order summary — */
  const summaryBox = $("#paySummary");
  const cart = getCart();
  const ids = Object.keys(cart);
  const tt = cartTotals();

  if (ids.length === 0) {
    summaryBox.innerHTML = `
      <h3>Order summary</h3>
      <p style="color:var(--muted);font-size:.92rem;margin-bottom:18px;">
        Your cart is empty, so there is nothing to pay for yet.</p>
      <a href="products.html" class="btn btn-ghost btn-block">Browse courses</a>`;
    $("#payBtn").disabled = true;
  } else {
    const items = ids.map(id => {
      const c = getCourse(id);
      return `
        <div class="mini-item">
          <div class="swatch" style="--accent:${c.accent}" aria-hidden="true">${initials(c.name)}</div>
          <span class="m-name">${c.name}</span>
          <span class="m-qty">&times;${cart[id]}</span>
          <span class="m-price">${money(c.price * cart[id])}</span>
        </div>`;
    }).join("");
    summaryBox.innerHTML = `
      <h3>Order summary</h3>
      ${items}
      <div class="summary-line" style="margin-top:16px;"><span>Subtotal</span><span>${money(tt.subtotal)}</span></div>
      <div class="summary-line"><span>GST (18%)</span><span>${money(tt.gst)}</span></div>
      <div class="summary-total"><span>Total payable</span><span>${money(tt.total)}</span></div>
      <p class="summary-note">You will not be charged &mdash; this is a demo checkout.</p>`;
    $("#payBtn").textContent = `Pay ${money(tt.total)}`;
  }

  /* — live input formatting — */
  const cardInput = $("#cardNumber");
  cardInput.addEventListener("input", () => {
    const digits = cardInput.value.replace(/\D/g, "").slice(0, 16);
    cardInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });
  const expiryInput = $("#expiry");
  expiryInput.addEventListener("input", () => {
    let v = expiryInput.value.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    expiryInput.value = v;
  });
  $("#cvv").addEventListener("input", () => {
    $("#cvv").value = $("#cvv").value.replace(/\D/g, "").slice(0, 3);
  });
  $("#phone").addEventListener("input", () => {
    $("#phone").value = $("#phone").value.replace(/\D/g, "").slice(0, 10);
  });
  $("#pincode").addEventListener("input", () => {
    $("#pincode").value = $("#pincode").value.replace(/\D/g, "").slice(0, 6);
  });

  /* — validators: each returns an error message or "" — */
  const validators = {
    fullName: v => /^[A-Za-z][A-Za-z .]{2,}$/.test(v.trim())
      ? "" : "Enter your full name (letters only, min 3 characters).",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
      ? "" : "Enter a valid email address, e.g. name@example.com.",
    phone: v => /^[6-9]\d{9}$/.test(v.trim())
      ? "" : "Enter a valid 10-digit mobile number.",
    address: v => v.trim().length >= 10
      ? "" : "Address should be at least 10 characters.",
    city: v => /^[A-Za-z][A-Za-z ]{1,}$/.test(v.trim())
      ? "" : "Enter a valid city name.",
    pincode: v => /^\d{6}$/.test(v.trim())
      ? "" : "PIN code must be exactly 6 digits.",
    cardName: v => /^[A-Za-z][A-Za-z .]{2,}$/.test(v.trim())
      ? "" : "Enter the name printed on the card.",
    cardNumber: v => /^\d{16}$/.test(v.replace(/\s/g, ""))
      ? "" : "Card number must be 16 digits.",
    expiry: v => {
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim())) return "Use MM/YY format.";
      const [mm, yy] = v.split("/").map(Number);
      const expiryDate = new Date(2000 + yy, mm);   // first day AFTER expiry month
      return expiryDate > new Date() ? "" : "This card has expired.";
    },
    cvv: v => /^\d{3}$/.test(v.trim())
      ? "" : "CVV must be 3 digits."
  };

  function setFieldState(input, message) {
    const err = $(`#err-${input.id}`);
    if (message) {
      input.classList.add("invalid");
      if (err) { err.textContent = message; err.classList.add("show"); }
    } else {
      input.classList.remove("invalid");
      if (err) err.classList.remove("show");
    }
  }

  for (const id in validators) {
    const input = $("#" + id);
    input.addEventListener("blur", () => setFieldState(input, validators[id](input.value)));
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) {
        setFieldState(input, validators[id](input.value));
      }
    });
  }

  /* — submit — */
  form.addEventListener("submit", e => {
    e.preventDefault();                 // JS handles validation + success
    let firstInvalid = null;

    for (const id in validators) {
      const input = $("#" + id);
      const message = validators[id](input.value);
      setFieldState(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      showToast("Please fix the highlighted fields");
      return;
    }

    const orderId = "LN-" + Date.now().toString().slice(-6);
    $("#orderId").textContent = "Order ID: " + orderId;
    $("#successModal").classList.add("show");
    clearCart();
  });
}

/* ───────────────────────── 10. Boot ───────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  const burger = $("#burger");
  const navLinks = $("#navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });
  }

  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "products") initProducts();
  if (page === "cart") initCart();
  if (page === "payment") initPayment();
});
