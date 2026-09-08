/* H2 Server — shared client logic (static / GitHub Pages friendly) */

const H2 = {
  SESSION_KEY: "h2_session",
  USERS_KEY: "h2_users",
  DATA_KEY: "h2_http_data",
  SHEETS_URL_KEY: "h2_sheets_url",
  SHEETS_DEFAULT_COMPANY_KEY: "h2_default_company",
  SHEETS_DEFAULT_PROJECT_KEY: "h2_default_project",
  ADMIN_USER: "H2@123",
  ADMIN_PASS: "h2tech@123",
  MAX_DATA: 100,
};

H2.getBuiltInConfig = function () {
  return window.H2_CONFIG || {};
};

/* ---------- local users (browser) ---------- */

H2.seedUsers = function () {
  const raw = localStorage.getItem(H2.USERS_KEY);
  if (raw) return;
  const seed = [
    {
      id: "admin",
      username: H2.ADMIN_USER,
      password: H2.ADMIN_PASS,
      role: "admin",
      company: "H2 TECHNOLOGY WORLD",
      project: "h2server.online",
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(H2.USERS_KEY, JSON.stringify(seed));
};

H2.getUsers = function () {
  H2.seedUsers();
  try {
    return JSON.parse(localStorage.getItem(H2.USERS_KEY) || "[]");
  } catch (e) {
    return [];
  }
};

H2.saveUsers = function (users) {
  localStorage.setItem(H2.USERS_KEY, JSON.stringify(users));
};

H2.findUser = function (username) {
  const name = String(username || "").trim();
  return H2.getUsers().find(function (u) {
    return u.username === name;
  });
};

H2.validateLogin = function (username, password) {
  const user = H2.findUser(username);
  if (!user) return false;
  return user.password === password;
};

H2.setSession = function (username) {
  const session = {
    username: username,
    at: Date.now(),
  };
  sessionStorage.setItem(H2.SESSION_KEY, JSON.stringify(session));
};

H2.getSession = function () {
  try {
    return JSON.parse(sessionStorage.getItem(H2.SESSION_KEY) || "null");
  } catch (e) {
    return null;
  }
};

H2.isLoggedIn = function () {
  return !!(H2.getSession() && H2.getSession().username);
};

H2.logout = function () {
  sessionStorage.removeItem(H2.SESSION_KEY);
};

H2.requireAuth = function () {
  if (!H2.isLoggedIn()) {
    window.location.replace("index.html");
    return false;
  }
  return true;
};

/**
 * Add a user with company + project.
 * opts: { role, company, project }
 */
H2.addUser = function (username, password, roleOrOpts, maybeCompany, maybeProject) {
  const name = String(username || "").trim();
  const pass = String(password || "");

  var role = "user";
  var company = "";
  var project = "";

  if (roleOrOpts && typeof roleOrOpts === "object") {
    role = roleOrOpts.role || "user";
    company = String(roleOrOpts.company || "").trim();
    project = String(roleOrOpts.project || "").trim();
  } else {
    role = roleOrOpts || "user";
    company = String(maybeCompany || "").trim();
    project = String(maybeProject || "").trim();
  }

  if (!name || !pass) {
    return { ok: false, error: "Username and password are required." };
  }
  if (name.length < 3) {
    return { ok: false, error: "Username must be at least 3 characters." };
  }
  if (pass.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }
  if (!company) {
    return { ok: false, error: "Company name is required." };
  }
  if (!project) {
    return { ok: false, error: "Project name is required." };
  }
  if (H2.findUser(name)) {
    return { ok: false, error: "That username already exists." };
  }

  const user = {
    id: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    username: name,
    password: pass,
    role: role || "user",
    company: company,
    project: project,
    createdAt: new Date().toISOString(),
  };

  const users = H2.getUsers();
  users.push(user);
  H2.saveUsers(users);

  H2.sheetsSend({
    action: "addUser",
    id: user.id,
    username: user.username,
    password: user.password,
    role: user.role,
    company: user.company,
    project: user.project,
    createdAt: user.createdAt,
  });

  return { ok: true, user: user };
};

H2.deleteUser = function (id) {
  const users = H2.getUsers().filter(function (u) {
    if (u.id === id && u.username === H2.ADMIN_USER) return true;
    return u.id !== id;
  });
  H2.saveUsers(users);
};

/* ---------- local HTTP data log (browser) ---------- */

H2.getDataLog = function () {
  try {
    return JSON.parse(localStorage.getItem(H2.DATA_KEY) || "[]");
  } catch (e) {
    return [];
  }
};

H2.saveDataLog = function (items) {
  localStorage.setItem(H2.DATA_KEY, JSON.stringify(items.slice(0, H2.MAX_DATA)));
};

/**
 * Save payload locally + Google Sheet (by company/project).
 * meta: { company, project, source }
 */
H2.pushData = function (payload, sourceOrMeta) {
  var source = "manual";
  var company = H2.getDefaultCompany();
  var project = H2.getDefaultProject();

  if (sourceOrMeta && typeof sourceOrMeta === "object") {
    source = sourceOrMeta.source || "manual";
    if (sourceOrMeta.company) company = String(sourceOrMeta.company).trim();
    if (sourceOrMeta.project) project = String(sourceOrMeta.project).trim();
  } else if (typeof sourceOrMeta === "string") {
    source = sourceOrMeta;
  }

  const entry = {
    id: "d_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    at: new Date().toISOString(),
    source: source || "manual",
    company: company || "",
    project: project || "",
    data: payload,
  };

  const items = H2.getDataLog();
  items.unshift(entry);
  H2.saveDataLog(items);

  try {
    localStorage.setItem("h2_data_ping", String(Date.now()));
  } catch (e) {}

  var dataText =
    typeof payload === "string" ? payload : JSON.stringify(payload);

  H2.sheetsSend({
    action: "addData",
    id: entry.id,
    at: entry.at,
    source: entry.source,
    company: entry.company,
    project: entry.project,
    data: dataText,
  });

  return entry;
};

H2.clearData = function () {
  localStorage.removeItem(H2.DATA_KEY);
  localStorage.setItem("h2_data_ping", String(Date.now()));
};

/* ---------- Google Sheets config ---------- */

H2.getSheetsUrl = function () {
  try {
    var saved = String(localStorage.getItem(H2.SHEETS_URL_KEY) || "").trim();
    if (saved) return saved;
  } catch (e) {}
  var cfg = H2.getBuiltInConfig();
  return String(cfg.APPS_SCRIPT_URL || "").trim();
};

H2.setSheetsUrl = function (url) {
  localStorage.setItem(H2.SHEETS_URL_KEY, String(url || "").trim());
};

H2.getDefaultCompany = function () {
  try {
    var saved = String(localStorage.getItem(H2.SHEETS_DEFAULT_COMPANY_KEY) || "").trim();
    if (saved) return saved;
  } catch (e) {}
  var cfg = H2.getBuiltInConfig();
  return String(cfg.DEFAULT_COMPANY || "H2 TECHNOLOGY WORLD").trim();
};

H2.setDefaultCompany = function (v) {
  localStorage.setItem(H2.SHEETS_DEFAULT_COMPANY_KEY, String(v || "").trim());
};

H2.getDefaultProject = function () {
  try {
    var saved = String(localStorage.getItem(H2.SHEETS_DEFAULT_PROJECT_KEY) || "").trim();
    if (saved) return saved;
  } catch (e) {}
  var cfg = H2.getBuiltInConfig();
  return String(cfg.DEFAULT_PROJECT || "h2server.online").trim();
};

H2.setDefaultProject = function (v) {
  localStorage.setItem(H2.SHEETS_DEFAULT_PROJECT_KEY, String(v || "").trim());
};

H2.getSheetUrl = function () {
  var cfg = H2.getBuiltInConfig();
  return String(cfg.SHEET_URL || "").trim();
};

H2.isSheetsConfigured = function () {
  return /^https:\/\//i.test(H2.getSheetsUrl());
};

/**
 * Always refresh built-in Web App URL + defaults into localStorage.
 */
H2.applyBuiltInSheetsConfig = function () {
  var cfg = H2.getBuiltInConfig();
  try {
    if (cfg.APPS_SCRIPT_URL) {
      localStorage.setItem(H2.SHEETS_URL_KEY, String(cfg.APPS_SCRIPT_URL).trim());
    }
    if (cfg.DEFAULT_COMPANY) {
      localStorage.setItem(
        H2.SHEETS_DEFAULT_COMPANY_KEY,
        String(cfg.DEFAULT_COMPANY).trim()
      );
    }
    if (cfg.DEFAULT_PROJECT) {
      localStorage.setItem(
        H2.SHEETS_DEFAULT_PROJECT_KEY,
        String(cfg.DEFAULT_PROJECT).trim()
      );
    }
  } catch (e) {}
};

H2.parseJsonSafe = function (text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

/**
 * Send JSON to Google Apps Script web app.
 * 1) CORS POST (readable response)
 * 2) no-cors POST fallback (data still arrives; response opaque)
 */
H2.sheetsSend = function (body) {
  var url = H2.getSheetsUrl();
  if (!url) {
    return Promise.resolve({ ok: false, skipped: true, reason: "not_configured" });
  }

  var payload = JSON.stringify(body || {});

  return fetch(url, {
    method: "POST",
    mode: "cors",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: payload,
  })
    .then(function (res) {
      return res.text().then(function (text) {
        var parsed = H2.parseJsonSafe(text);
        if (parsed) return parsed;
        return { ok: res.ok, raw: text };
      });
    })
    .catch(function () {
      return fetch(url, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      })
        .then(function () {
          return {
            ok: true,
            opaque: true,
            note: "sent_via_no_cors",
          };
        })
        .catch(function (err2) {
          console.warn("Google Sheets send failed", err2);
          return {
            ok: false,
            error: String(err2 && err2.message ? err2.message : err2),
          };
        });
    });
};

/**
 * Connection test:
 * 1) GET ?action=ping (best readable check)
 * 2) POST ping with CORS / no-cors fallback
 */
H2.sheetsTest = function () {
  var url = H2.getSheetsUrl();
  if (!url) {
    return Promise.resolve({ ok: false, error: "not_configured" });
  }

  var pingUrl =
    url + (url.indexOf("?") >= 0 ? "&" : "?") + "action=ping&t=" + Date.now();

  return fetch(pingUrl, {
    method: "GET",
    mode: "cors",
    redirect: "follow",
    credentials: "omit",
  })
    .then(function (res) {
      return res.text().then(function (text) {
        var parsed = H2.parseJsonSafe(text);
        if (parsed && (parsed.ok || parsed.pong)) {
          return parsed;
        }
        if (res.ok) {
          return { ok: true, pong: true, raw: text };
        }
        return { ok: false, error: "Bad response from Apps Script" };
      });
    })
    .catch(function () {
      return H2.sheetsSend({
        action: "ping",
        at: new Date().toISOString(),
      }).then(function (res) {
        if (res && (res.ok || res.pong || res.opaque)) {
          return {
            ok: true,
            pong: true,
            opaque: !!res.opaque,
            note: res.note || "",
          };
        }
        return res || { ok: false, error: "Failed to reach Apps Script" };
      });
    });
};

/* ---------- helpers ---------- */

H2.escapeHtml = function (str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

H2.formatTime = function (iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
};
