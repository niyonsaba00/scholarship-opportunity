const scholarships = [
  {
    id: 1,
    name: "Stipendium Hungaricum",
    provider: "Government of Hungary",
    country: "Hungary",
    level: "Undergraduate",
    funding: "Fully funded",
    field: "Medicine",
    deadline: "2026-12-31",
    url: "https://stipendiumhungaricum.hu/"
  },
  {
    id: 2,
    name: "University of Toronto International Awards",
    provider: "University of Toronto",
    country: "Canada",
    level: "Undergraduate",
    funding: "Partial funding",
    field: "Natural Sciences",
    deadline: "2027-01-15",
    url: "https://future.utoronto.ca/"
  },
  {
    id: 3,
    name: "DAAD Study Scholarships",
    provider: "DAAD",
    country: "Germany",
    level: "Master's",
    funding: "Fully funded",
    field: "Engineering",
    deadline: "2026-11-30",
    url: "https://www.daad.de/en/"
  },
  {
    id: 4,
    name: "Chevening Scholarships",
    provider: "UK Government",
    country: "United Kingdom",
    level: "Master's",
    funding: "Fully funded",
    field: "Business",
    deadline: "2026-11-04",
    url: "https://www.chevening.org/"
  },
  {
    id: 5,
    name: "Fulbright Foreign Student Program",
    provider: "U.S. Department of State",
    country: "United States",
    level: "Master's",
    funding: "Fully funded",
    field: "Natural Sciences",
    deadline: "2026-10-15",
    url: "https://foreign.fulbrightonline.org/"
  },
  {
    id: 6,
    name: "Australia Awards Scholarships",
    provider: "Australian Government",
    country: "Australia",
    level: "Master's",
    funding: "Fully funded",
    field: "Engineering",
    deadline: "2027-04-30",
    url: "https://www.dfat.gov.au/people-to-people/australia-awards"
  },
  {
    id: 7,
    name: "Global Undergraduate Scholarships",
    provider: "International University Network",
    country: "Canada",
    level: "Undergraduate",
    funding: "Partial funding",
    field: "Computer Science",
    deadline: "2027-02-20",
    url: "#"
  },
  {
    id: 8,
    name: "Global Health Fellowship",
    provider: "Health Education Foundation",
    country: "United Kingdom",
    level: "PhD",
    funding: "Fully funded",
    field: "Medicine",
    deadline: "2027-03-10",
    url: "#"
  },
  {
    id: 9,
    name: "African Leadership Scholarship",
    provider: "Regional Education Foundation",
    country: "Rwanda",
    level: "Undergraduate",
    funding: "Fully funded",
    field: "Business",
    deadline: "2026-10-25",
    url: "#"
  }
];

let saved = JSON.parse(
  localStorage.getItem("savedScholarships") || "[]"
);

let sortSoon = true;

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const daysUntil = date =>
  Math.ceil((new Date(date) - new Date()) / 86400000);

const esc = value =>
  String(value).replace(
    /[&<>"']/g,
    match => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[match])
  );

function modal(title, body) {
  const content = $("#modalContent");
  const box = $("#modal");

  if (!content || !box) return;

  content.innerHTML = `<h2>${title}</h2>${body}`;
  box.classList.remove("hidden");
}

function closeModal() {
  const modalBox = $("#modal");

  if (modalBox) {
    modalBox.classList.add("hidden");
  }
}

function render(list = scholarships) {
  const grid = $("#scholarshipGrid");

  if (!grid) return;

  if (!list.length) {
    grid.innerHTML =
      '<div class="empty"><h3>No scholarships found</h3><p>Try removing a filter or using a broader search.</p></div>';

    if ($("#resultCount")) {
      $("#resultCount").textContent = "0 opportunities";
    }

    return;
  }

  const sorted = [...list].sort((a, b) =>
    sortSoon
      ? new Date(a.deadline) - new Date(b.deadline)
      : a.name.localeCompare(b.name)
  );

  grid.innerHTML = sorted
    .map(
      scholarship => `
        <article class="card">
          <div class="card-top">
            <span class="badge">${esc(scholarship.funding)}</span>

            <button
              class="save ${saved.includes(scholarship.id) ? "active" : ""}"
              data-save="${scholarship.id}"
              aria-label="Save scholarship"
            >
              ★
            </button>
          </div>

          <h3>${esc(scholarship.name)}</h3>

          <div class="provider">
            ${esc(scholarship.provider)}
          </div>

          <div class="meta">
            <span>🎓 ${esc(scholarship.level)}</span>
            <span>🌍 ${esc(scholarship.country)}</span>
            <span>📚 ${esc(scholarship.field)}</span>
          </div>

          <div class="card-bottom">
            <div class="deadline">
              Deadline
              <strong>
                ${new Date(scholarship.deadline).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  }
                )}
              </strong>
            </div>

            <a
              class="apply"
              href="${scholarship.url}"
              target="_blank"
              rel="noopener"
            >
              Official source ↗
            </a>
          </div>
        </article>
      `
    )
    .join("");

  if ($("#resultCount")) {
    $("#resultCount").textContent =
      `${list.length} opportunities`;
  }

  $$("[data-save]").forEach(button => {
    button.addEventListener("click", () => {
      toggleSave(Number(button.dataset.save));
    });
  });
}

function toggleSave(id) {
  saved = saved.includes(id)
    ? saved.filter(item => item !== id)
    : [...saved, id];

  localStorage.setItem(
    "savedScholarships",
    JSON.stringify(saved)
  );

  applyFilters();
  renderDeadlines();
}

function applyFilters() {
  const q = (
    ($("#searchInput")?.value) ||
    ($("#heroSearch")?.value) ||
    ""
  )
    .toLowerCase()
    .trim();

  const level = $("#levelFilter")?.value || "";
  const funding = $("#fundingFilter")?.value || "";
  const country = $("#countryFilter")?.value || "";
  const field = $("#fieldFilter")?.value || "";

  const list = scholarships.filter(scholarship => {
    const haystack = [
      scholarship.name,
      scholarship.provider,
      scholarship.country,
      scholarship.level,
      scholarship.funding,
      scholarship.field
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!q || haystack.includes(q)) &&
      (!level || scholarship.level === level) &&
      (!funding || scholarship.funding === funding) &&
      (!country || scholarship.country === country) &&
      (!field || scholarship.field === field)
    );
  });

  render(list);
}

function renderDeadlines() {
  const panel = $("#deadlinePanel");

  if (!panel) return;

  const list = scholarships
    .filter(scholarship =>
      saved.includes(scholarship.id)
    )
    .sort(
      (a, b) =>
        new Date(a.deadline) - new Date(b.deadline)
    );

  panel.innerHTML = list.length
    ? list
        .slice(0, 5)
        .map(
          scholarship => `
            <div class="deadline-item">
              <div>
                <h4>${esc(scholarship.name)}</h4>
                <p>
                  ${esc(scholarship.country)} ·
                  ${new Date(
                    scholarship.deadline
                  ).toLocaleDateString()}
                </p>
              </div>

              <div class="days">
                ${Math.max(
                  0,
                  daysUntil(scholarship.deadline)
                )}
                days
              </div>
            </div>
          `
        )
        .join("")
    : `
      <div class="deadline-item">
        <div>
          <h4>Your shortlist is empty</h4>
          <p>
            Click ★ on a scholarship to track its
            deadline here.
          </p>
        </div>
      </div>
    `;
}

function showLogin() {
  modal(
    "Sign in",
    `<p>Sign in to your Scholarship Opportunity account.</p>

    <form id="loginForm">
      <label>Email</label>

      <input
        id="loginEmail"
        type="email"
        required
        autocomplete="email"
        placeholder="Your email"
      >

      <label>Password</label>

      <input
        id="loginPassword"
        type="password"
        required
        autocomplete="current-password"
        placeholder="Your password"
      >

      <p id="loginMessage" class="form-message"></p>

      <button
        class="btn btn-primary"
        type="submit"
      >
        Sign in
      </button>
    </form>

    <p style="margin-top:1rem">
      Don't have an account?
      <button
        type="button"
        class="text-btn"
        id="registerLink"
      >
        Create an account
      </button>
    </p>`
  );

  $("#loginForm")?.addEventListener(
    "submit",
    loginUser
  );

  $("#registerLink")?.addEventListener(
    "click",
    showRegister
  );
}

async function loginUser(e) {
  e.preventDefault();

  const msg = $("#loginMessage");

  if (msg) {
    msg.textContent = "Signing in...";
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: $("#loginEmail").value.trim(),
        password: $("#loginPassword").value
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.error ||
        data.message ||
        "Sign in failed"
      );
    }

    localStorage.setItem(
      "scholarshipAuth",
      JSON.stringify(data)
    );

    closeModal();
    updateAuthButton();

    const welcomeName = data.user?.name
      ? ", " + esc(data.user.name)
      : "";

    modal(
      "Welcome",
      `<p>Welcome back${welcomeName}.</p>

       <button
         class="btn btn-primary"
         type="button"
         id="accountContinue"
       >
         Continue
       </button>`
    );

    $("#accountContinue")?.addEventListener(
      "click",
      closeModal
    );

  } catch (err) {
    if (msg) {
      msg.textContent =
        err.message ||
        "Unable to sign in. Please try again.";
    }
  }
}

function showRegister() {
  modal(
    "Create account",
    `<p>
      Create a student account to use account features.
    </p>

    <form id="registerForm">
      <label>Name</label>

      <input
        id="registerName"
        required
        autocomplete="name"
        placeholder="Your name"
      >

      <label>Email</label>

      <input
        id="registerEmail"
        type="email"
        required
        autocomplete="email"
        placeholder="Your email"
      >

      <label>Password</label>

      <input
        id="registerPassword"
        type="password"
        minlength="6"
        required
        autocomplete="new-password"
        placeholder="At least 6 characters"
      >

      <p
        id="registerMessage"
        class="form-message"
      ></p>

      <button
        class="btn btn-primary"
        type="submit"
      >
        Create account
      </button>
    </form>

    <p style="margin-top:1rem">
      Already have an account?

      <button
        type="button"
        class="text-btn"
        id="backLogin"
      >
        Sign in
      </button>
    </p>`
  );

  $("#registerForm")?.addEventListener(
    "submit",
    registerUser
  );

  $("#backLogin")?.addEventListener(
    "click",
    showLogin
  );
}

async function registerUser(e) {
  e.preventDefault();

  const msg = $("#registerMessage");

  if (msg) {
    msg.textContent = "Creating account...";
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: $("#registerName").value.trim(),
        email: $("#registerEmail").value.trim(),
        password: $("#registerPassword").value
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.error ||
        data.message ||
        "Registration failed"
      );
    }

    localStorage.setItem(
      "scholarshipAuth",
      JSON.stringify(data)
    );

    closeModal();
    updateAuthButton();

    modal(
      "Account created",
      `<p>
        Your account has been created successfully.
      </p>

      <button
        class="btn btn-primary"
        type="button"
        id="accountContinue"
      >
        Continue
      </button>`
    );

    $("#accountContinue")?.addEventListener(
      "click",
      closeModal
    );

  } catch (err) {
    if (msg) {
      msg.textContent =
        err.message ||
        "Unable to create account.";
    }
  }
}

function updateAuthButton() {
  const btn = $("#loginBtn");

  if (!btn) return;

  const auth = JSON.parse(
    localStorage.getItem("scholarshipAuth") || "null"
  );

  btn.textContent = auth?.user
    ? "Account"
    : "Sign in";
}

function setupMenu() {
  const btn = $(".menu-toggle");
  const nav = $("#mainNav");

  if (!btn || !nav) return;

  btn.setAttribute("type", "button");
  btn.setAttribute("aria-expanded", "false");

  btn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();

    const open =
      !nav.classList.contains("open");

    nav.classList.toggle("open", open);

    btn.setAttribute(
      "aria-expanded",
      String(open)
    );
  });

  $$("#mainNav a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");

      btn.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  });
}

function init() {
  $("#modalClose")?.addEventListener(
    "click",
    closeModal
  );

  $("#modal")?.addEventListener("click", e => {
    if (e.target.id === "modal") {
      closeModal();
    }
  });

  $("#loginBtn")?.addEventListener("click", () => {
    const auth = JSON.parse(
      localStorage.getItem("scholarshipAuth") || "null"
    );

    if (auth?.user) {
      const name = esc(
        auth.user.name ||
        auth.user.email ||
        "student"
      );

      modal(
        "Your account",
        `<p>
          You are signed in as
          <b>${name}</b>.
        </p>

        <button
          class="btn btn-ghost"
          type="button"
          id="logoutBtn"
        >
          Sign out
        </button>`
      );

      $("#logoutBtn")?.addEventListener(
        "click",
        () => {
          localStorage.removeItem(
            "scholarshipAuth"
          );

          updateAuthButton();
          closeModal();
        }
      );

    } else {
      showLogin();
    }
  });

  $("#heroSearchBtn")?.addEventListener(
    "click",
    () => {
      if ($("#searchInput")) {
        $("#searchInput").value =
          $("#heroSearch").value;
      }

      document
        .querySelector("#scholarships")
        ?.scrollIntoView({
          behavior: "smooth"
        });

      applyFilters();
    }
  );

  $("#heroSearch")?.addEventListener(
    "keydown",
    e => {
      if (e.key === "Enter") {
        $("#heroSearchBtn")?.click();
      }
    }
  );

  [
    "searchInput",
    "levelFilter",
    "fundingFilter",
    "countryFilter",
    "fieldFilter"
  ].forEach(id => {
    $("#" + id)?.addEventListener(
      "input",
      applyFilters
    );
  });

  $$("[data-search]").forEach(button => {
    button.addEventListener("click", () => {
      if ($("#heroSearch")) {
        $("#heroSearch").value =
          button.dataset.search;
      }

      $("#heroSearchBtn")?.click();
    });
  });

  $$("[data-country]").forEach(button => {
    button.addEventListener("click", () => {
      if ($("#countryFilter")) {
        $("#countryFilter").value =
          button.dataset.country;
      }

      document
        .querySelector("#scholarships")
        ?.scrollIntoView({
          behavior: "smooth"
        });

      applyFilters();
    });
  });

  $("#resetFilters")?.addEventListener(
    "click",
    () => {
      [
        "searchInput",
        "levelFilter",
        "fundingFilter",
        "countryFilter",
        "fieldFilter"
      ].forEach(id => {
        const element = $("#" + id);

        if (element) {
          element.value = "";
        }
      });

      if ($("#heroSearch")) {
        $("#heroSearch").value = "";
      }

      applyFilters();
    }
  );

  $("#sortBtn")?.addEventListener(
    "click",
    () => {
      sortSoon = !sortSoon;

      $("#sortBtn").textContent = sortSoon
        ? "Sort: Deadline soonest ↕"
        : "Sort: Name A–Z ↕";

      applyFilters();
    }
  );

  $("#savedBtn")?.addEventListener(
    "click",
    () => {
      if ($("#searchInput")) {
        $("#searchInput").value = "";
      }

      render(
        scholarships.filter(
          scholarship =>
            saved.includes(scholarship.id)
        )
      );

      document
        .querySelector("#scholarships")
        ?.scrollIntoView({
          behavior: "smooth"
        });
    }
  );

  $("#alertBtn")?.addEventListener(
    "click",
    () => {
      modal(
        "Scholarship alerts",
        `<p>
          Get new opportunity alerts in your inbox.
        </p>

        <input
          id="modalEmail"
          type="email"
          placeholder="Email address"
        >

        <button
          class="btn btn-primary"
          type="button"
          id="modalSubscribe"
        >
          Subscribe
        </button>`
      );
    }
  );

  $("#newsletterForm")?.addEventListener(
    "submit",
    e => {
      e.preventDefault();

      if ($("#newsletterMsg")) {
        $("#newsletterMsg").textContent =
          "You're on the list. Check your inbox for confirmation.";
      }

      if ($("#emailInput")) {
        $("#emailInput").value = "";
      }
    }
  );

  setupMenu();
  updateAuthButton();
  render();
  renderDeadlines();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    init
  );
} else {
  init();
}