/**
 * H2 Server — Google Apps Script backend
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4/edit
 *
 * Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * After EVERY code change:
 *   Deploy → Manage deployments → pencil → New version → Deploy
 *
 * Web app URL must end with /exec
 */

var SPREADSHEET_ID = "1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4";
var PASSWORDS_SHEET = "Passwords";
var DATA_PREFIX = "DATA__";

/**
 * GET — supports JSONP via ?callback=fn (avoids browser CORS / Failed to fetch)
 * Examples:
 *   ?action=ping&callback=h2_cb
 *   ?action=addData&company=X&project=Y&data=hello
 */
function doGet(e) {
  var result;
  try {
    var p = (e && e.parameter) || {};
    var action = String(p.action || "ping").toLowerCase();

    if (action === "ping" || action === "") {
      ensurePasswordsSheet_();
      result = {
        ok: true,
        pong: true,
        service: "H2 Server Sheets API",
        sheetId: SPREADSHEET_ID,
        at: new Date().toISOString(),
      };
    } else if (action === "adddata") {
      result = addData_({
        id: p.id || "",
        company: p.company || "",
        project: p.project || "",
        source: p.source || "http-get",
        data: p.data || p.json || "",
        at: p.at || new Date().toISOString(),
      });
    } else if (action === "adduser") {
      result = addUser_({
        id: p.id || "",
        username: p.username || "",
        password: p.password || "",
        role: p.role || "user",
        company: p.company || "",
        project: p.project || "",
        createdAt: p.createdAt || new Date().toISOString(),
      });
    } else {
      result = {
        ok: true,
        service: "H2 Server Sheets API",
        sheetId: SPREADSHEET_ID,
        hint: "GET ?action=ping|addData|addUser  or POST payload=",
      };
    }
  } catch (err) {
    result = { ok: false, error: String(err) };
  }
  return respond_(result, e);
}

/**
 * POST — JSON body, text/plain JSON, or form field "payload"
 */
function doPost(e) {
  var result;
  try {
    var body = parseBody_(e);
    var action = String(body.action || "").toLowerCase();

    if (action === "ping" || action === "") {
      ensurePasswordsSheet_();
      result = {
        ok: true,
        pong: true,
        sheetId: SPREADSHEET_ID,
        at: new Date().toISOString(),
      };
    } else if (action === "adduser") {
      result = addUser_(body);
    } else if (action === "adddata") {
      result = addData_(body);
    } else {
      result = { ok: false, error: "Unknown action: " + action };
    }
  } catch (err) {
    result = { ok: false, error: String(err) };
  }
  return respond_(result, e);
}

/** JSON or JSONP response */
function respond_(obj, e) {
  var cb =
    e && e.parameter && e.parameter.callback
      ? String(e.parameter.callback)
      : "";
  cb = cb.replace(/[^a-zA-Z0-9_$.]/g, "");
  var text = JSON.stringify(obj);
  if (cb) {
    return ContentService.createTextOutput(cb + "(" + text + ");").setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }
  return ContentService.createTextOutput(text).setMimeType(
    ContentService.MimeType.JSON
  );
}

function parseBody_(e) {
  var body = {};

  if (e && e.parameter && e.parameter.payload) {
    try {
      body = JSON.parse(e.parameter.payload);
      return body;
    } catch (err) {}
  }

  var raw = (e && e.postData && e.postData.contents) || "";
  var type = (e && e.postData && e.postData.type) || "";

  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch (err1) {
      if (String(type).indexOf("application/x-www-form-urlencoded") !== -1) {
        body = parseForm_(raw);
        if (body.payload) {
          try {
            body = JSON.parse(body.payload);
          } catch (err2) {}
        }
      } else {
        body = { action: "addData", data: raw };
      }
    }
  }

  if (e && e.parameter) {
    if (!body.action && e.parameter.action) body.action = e.parameter.action;
    if (!body.company && e.parameter.company) body.company = e.parameter.company;
    if (!body.project && e.parameter.project) body.project = e.parameter.project;
  }

  return body;
}

function parseForm_(raw) {
  var out = {};
  String(raw)
    .split("&")
    .forEach(function (pair) {
      var i = pair.indexOf("=");
      if (i === -1) return;
      var k = decodeURIComponent(pair.substring(0, i).replace(/\+/g, " "));
      var v = decodeURIComponent(pair.substring(i + 1).replace(/\+/g, " "));
      out[k] = v;
    });
  return out;
}

function ss_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function ensurePasswordsSheet_() {
  var ss = ss_();
  var sh = ss.getSheetByName(PASSWORDS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(PASSWORDS_SHEET);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      "Timestamp",
      "ID",
      "Username",
      "Password",
      "Role",
      "Company",
      "Project",
      "CreatedAt",
    ]);
    sh.getRange(1, 1, 1, 8).setFontWeight("bold");
  }
  return sh;
}

function safeSheetName_(company, project) {
  var c = String(company || "Unknown")
    .replace(/[\\\/\?\*\[\]\:]/g, "-")
    .trim();
  var p = String(project || "General")
    .replace(/[\\\/\?\*\[\]\:]/g, "-")
    .trim();
  if (!c) c = "Unknown";
  if (!p) p = "General";
  var name = DATA_PREFIX + c + "__" + p;
  if (name.length > 90) name = name.substring(0, 90);
  return name;
}

function ensureDataSheet_(company, project) {
  var ss = ss_();
  var name = safeSheetName_(company, project);
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      "Timestamp",
      "ID",
      "Company",
      "Project",
      "Source",
      "Data (JSON)",
      "ReceivedAt",
    ]);
    sh.getRange(1, 1, 1, 7).setFontWeight("bold");
  }
  return { sheet: sh, name: name };
}

function addUser_(body) {
  var sh = ensurePasswordsSheet_();
  sh.appendRow([
    new Date(),
    body.id || "",
    body.username || "",
    body.password || "",
    body.role || "user",
    body.company || "",
    body.project || "",
    body.createdAt || new Date().toISOString(),
  ]);
  return {
    ok: true,
    sheet: PASSWORDS_SHEET,
    username: body.username || "",
  };
}

function addData_(body) {
  var company = body.company || "Unknown";
  var project = body.project || "General";
  var info = ensureDataSheet_(company, project);
  var dataVal = body.data;
  if (dataVal != null && typeof dataVal === "object") {
    dataVal = JSON.stringify(dataVal);
  }
  info.sheet.appendRow([
    new Date(),
    body.id || "",
    company,
    project,
    body.source || "http",
    dataVal == null ? "" : String(dataVal),
    body.at || new Date().toISOString(),
  ]);
  return {
    ok: true,
    sheet: info.name,
    company: company,
    project: project,
  };
}
