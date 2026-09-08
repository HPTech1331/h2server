/* H2 Server — shared client logic (static / GitHub Pages friendly) */

const H2 = {
  SESSION_KEY: "h2_session",
  USERS_KEY: "h2_users",
  DATA_KEY: "h2_http_data",
  ADMIN_USER: "H2@123",
  ADMIN_PASS: "h2tech@123",
  MAX_DATA: 100,
};

H2.seedUsers = function () {
  const raw = localStorage.getItem(H2.USERS_KEY);
  if (raw) return;
  const seed = [
    {
      id: "admin",
      username: H2.ADMIN_USER,
      password: H2.ADMIN_PASS,
      role: "admin",
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

H2.addUser = function (username, password, role) {
  const name = String(username || "").trim();
  const pass = String(password || "");
  if (!name || !pass) {
    return { ok: false, error: "Username and password are required." };
  }
  if (name.length < 3) {
    return { ok: false, error: "Username must be at least 3 characters." };
  }
  if (pass.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }
  if (H2.findUser(name)) {
    return { ok: false, error: "That username already exists." };
  }
  const users = H2.getUsers();
  users.push({
    id: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    username: name,
    password: pass,
    role: role || "user",
    createdAt: new Date().toISOString(),
  });
  H2.saveUsers(users);
  return { ok: true };
};

H2.deleteUser = function (id) {
  const users = H2.getUsers().filter(function (u) {
    if (u.id === id && u.username === H2.ADMIN_USER) return true;
    return u.id !== id;
  });
  H2.saveUsers(users);
};

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

H2.pushData = function (payload, source) {
  const items = H2.getDataLog();
  const entry = {
    id: "d_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    at: new Date().toISOString(),
    source: source || "manual",
    data: payload,
  };
  items.unshift(entry);
  H2.saveDataLog(items);
  try {
    localStorage.setItem("h2_data_ping", String(Date.now()));
  } catch (e) {}
  return entry;
};

H2.clearData = function () {
  localStorage.removeItem(H2.DATA_KEY);
  localStorage.setItem("h2_data_ping", String(Date.now()));
};

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
