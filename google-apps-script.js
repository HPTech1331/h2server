/**
 * H2 Server — Google Apps Script backend
 * Bound spreadsheet:
 * https://docs.google.com/spreadsheets/d/1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4/edit
 *
 * Deploy → Web app → Execute as Me → Who has access: Anyone
 *
 * Tabs:
 *   Passwords
 *   DATA__Company__Project
 */

var SPREADSHEET_ID = "1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4";
var PASSWORDS_SHEET = "Passwords";
var DATA_PREFIX = "DATA__";

function doGet(e) {
  return jsonOut({
    ok: true,
    service: "H2 Server Sheets API",
    sheetId: SPREADSHEET_ID,
    hint: "POST JSON with action addUser | addData | ping",
  });
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || "{}";
    var body = JSON.parse(raw);
    var action = String(body.action || "").toLowerCase();

    if (action === "ping") {
      ensurePasswordsSheet_();
      return jsonOut({
        ok: true,
        pong: true,
        sheetId: SPREADSHEET_ID,
        at: new Date().toISOString(),
      });
    }

    if (action === "adduser") {
      return jsonOut(addUser_(body));
    }

    if (action === "adddata") {
      return jsonOut(addData_(body));
    }

    return jsonOut({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
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
