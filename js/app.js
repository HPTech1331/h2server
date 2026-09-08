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
  const user = H2.findUser(username) || {};
  const session = {
    username: username,
    role: user.role || "user",
    company: user.company || "",
    project: user.project || "",
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

H2.getCurrentUser = function () {
  var session = H2.getSession();
  if (!session || !session.username) return null;
  var user = H2.findUser(session.username);
  if (user) return user;
  return {
    username: session.username,
    role: session.role || "user",
    company: session.company || "",
    project: session.project || "",
  };
};

H2.isAdmin = function () {
  var user = H2.getCurrentUser();
  if (!user) return false;
  if (user.username === H2.ADMIN_USER) return true;
  return String(user.role || "").toLowerCase() === "admin";
};

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

H2.getVisibleDataLog = function () {
  var items = H2.getDataLog();
  if (H2.isAdmin()) return items;

  var user = H2.getCurrentUser() || {};
  var company = String(user.company || "").trim().toLowerCase();
  var project = String(user.project || "").trim().toLowerCase();

  return items.filter(function (item) {
    var ic = String(item.company || "").trim().toLowerCase();
    var ip = String(item.project || "").trim().toLowerCase();
    if (company && project) {
      return ic === company && ip === project;
    }
    if (company) return ic === company;
    if (project) return ip === project;
    return false;
  });
};

H2.saveDataLog = function (items) {
  localStorage.setItem(H2.DATA_KEY, JSON.stringify(items.slice(0, H2.MAX_DATA)));
};

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
  var cfg = H2.getBuiltInConfig();
  var builtIn = String(cfg.APPS_SCRIPT_URL || "").trim();
  try {
    var saved = String(localStorage.getItem(H2.SHEETS_URL_KEY) || "").trim();
    if (saved) return saved;
  } catch (e) {}
  return builtIn;
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

H2.applyBuiltInSheetsConfig = function () {
  var cfg = H2.getBuiltInConfig();
  try {
    if (cfg.APPS_SCRIPT_URL) {
      localStorage.setItem(H2.SHEETS_URL_KEY, String(cfg.APPS_SCRIPT_URL).trim());
    }
    if (cfg.DEFAULT_COMPANY && !localStorage.getItem(H2.SHEETS_DEFAULT_COMPANY_KEY)) {
      localStorage.setItem(H2.SHEETS_DEFAULT_COMPANY_KEY, cfg.DEFAULT_COMPANY);
    }
    if (cfg.DEFAULT_PROJECT && !localStorage.getItem(H2.SHEETS_DEFAULT_PROJECT_KEY)) {
      localStorage.setItem(H2.SHEETS_DEFAULT_PROJECT_KEY, cfg.DEFAULT_PROJECT);
    }
  } catch (e) {}
};

/**
 * JSONP GET — works cross-origin (no CORS / no Failed to fetch from fetch()).
 */
H2.sheetsJsonp = function (params) {
  var base = H2.getSheetsUrl();
  if (!base) {
    return Promise.resolve({ ok: false, error: "not_configured" });
  }

  return new Promise(function (resolve) {
    var cbName = "h2SheetsCb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
    var settled = false;
    var script = document.createElement("script");

    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        delete window[cbName];
      } catch (e) {
        window[cbName] = undefined;
      }
      if (script.parentNode) script.parentNode.removeChild(script);
      resolve(result);
    }

    window[cbName] = function (data) {
      finish(data && typeof data === "object" ? data : { ok: true, raw: data });
    };

    var q = [];
    var src = params || {};
    Object.keys(src).forEach(function (k) {
      if (src[k] == null || src[k] === "") return;
      q.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(src[k])));
    });
    q.push("callback=" + encodeURIComponent(cbName));
    q.push("_=" + Date.now());

    script.src = base + (base.indexOf("?") >= 0 ? "&" : "?") + q.join("&");
    script.async = true;
    script.onerror = function () {
      finish({
        ok: false,
        error:
          "JSONP blocked or Apps Script not redeployed. Deploy web app as Anyone, New version.",
      });
    };

    var timer = setTimeout(function () {
      finish({
        ok: false,
        error: "Timeout — redeploy Apps Script (Anyone) and try again.",
      });
    }, 20000);

    (document.head || document.body || document.documentElement).appendChild(script);
  });
};

/**
 * Hidden form POST — reliable write path (no CORS read needed).
 */
H2.sheetsFormPost = function (body) {
  var url = H2.getSheetsUrl();
  if (!url) {
    return Promise.resolve({ ok: false, skipped: true, reason: "not_configured" });
  }

  return new Promise(function (resolve) {
    var name = "h2_fr_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
    var iframe = document.createElement("iframe");
    iframe.name = name;
    iframe.setAttribute("name", name);
    iframe.style.cssText = "display:none;width:0;height:0;border:0;position:absolute";
    iframe.setAttribute("aria-hidden", "true");

    var form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    form.target = name;
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    var input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(body || {});
    form.appendChild(input);

    var actionField = document.createElement("input");
    actionField.type = "hidden";
    actionField.name = "action";
    actionField.value = (body && body.action) || "";
    form.appendChild(actionField);

    var settled = false;
    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      setTimeout(function () {
        try {
          if (form.parentNode) form.parentNode.removeChild(form);
        } catch (e1) {}
        try {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        } catch (e2) {}
      }, 2000);
      resolve(result);
    }

    iframe.onload = function () {
      finish({ ok: true, via: "form" });
    };

    document.body.appendChild(iframe);
    document.body.appendChild(form);

    try {
      form.submit();
    } catch (err) {
      finish({ ok: false, error: String(err && err.message ? err.message : err) });
      return;
    }

    var timer = setTimeout(function () {
      finish({ ok: true, via: "form", note: "submitted" });
    }, 6000);
  });
};

/**
 * Send to Sheets: JSONP for small/simple actions, form POST otherwise.
 * Avoids fetch() CORS "Failed to fetch" with Apps Script redirects.
 */
H2.sheetsSend = function (body) {
  var url = H2.getSheetsUrl();
  if (!url) {
    return Promise.resolve({ ok: false, skipped: true, reason: "not_configured" });
  }

  var data = body || {};
  var action = String(data.action || "").toLowerCase();

  if (action === "ping") {
    return H2.sheetsJsonp({ action: "ping" });
  }

  if (action === "adddata") {
    var dataStr =
      data.data == null
        ? ""
        : typeof data.data === "string"
          ? data.data
          : JSON.stringify(data.data);
    if (dataStr.length < 1200) {
      return H2.sheetsJsonp({
        action: "addData",
        id: data.id || "",
        company: data.company || "",
        project: data.project || "",
        source: data.source || "http",
        data: dataStr,
        at: data.at || new Date().toISOString(),
      }).then(function (res) {
        if (res && res.ok) return res;
        return H2.sheetsFormPost(data);
      });
    }
  }

  if (action === "adduser") {
    return H2.sheetsJsonp({
      action: "addUser",
      id: data.id || "",
      username: data.username || "",
      password: data.password || "",
      role: data.role || "user",
      company: data.company || "",
      project: data.project || "",
      createdAt: data.createdAt || new Date().toISOString(),
    }).then(function (res) {
      if (res && res.ok) return res;
      return H2.sheetsFormPost(data);
    });
  }

  return H2.sheetsFormPost(data);
};

/** Connection test via JSONP (real ok/pong from Apps Script). */
H2.sheetsTest = function () {
  return H2.sheetsJsonp({ action: "ping" }).then(function (res) {
    if (res && (res.ok || res.pong)) return res;
    return H2.sheetsFormPost({
      action: "ping",
      at: new Date().toISOString(),
    }).then(function (formRes) {
      if (formRes && formRes.ok) {
        return {
          ok: true,
          pong: true,
          via: "form",
          note: "Form submit reached Google. Confirm Apps Script has JSONP deploy for full test.",
        };
      }
      return res && res.error
        ? res
        : { ok: false, error: (formRes && formRes.error) || "Connection failed" };
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
