# h2server.online

Login + main dashboard for **H2 TECHNOLOGY WORLD** (static site, free on GitHub Pages).

**GitHub:** [https://github.com/HPTech1331/h2server](https://github.com/HPTech1331/h2server)

---

## Public site (use this on phone)

Custom domain DNS is currently broken (`NXDOMAIN` / “server IP not found”).  
**Use the GitHub Pages URL until DNS is fixed:**

| Page | Working URL |
|------|-------------|
| **Login (phone / public)** | https://hptech1331.github.io/h2server/ |
| **Main** | https://hptech1331.github.io/h2server/main.html |
| **Ingest** | https://hptech1331.github.io/h2server/ingest.html |
| Custom domain (down) | https://h2server.online/ |
| Local login | http://localhost:3000/ |
| Local main | http://localhost:3000/main.html |

Open the **github.io** link on mobile — not `h2server.online` until DNS works again.

---

## Login

| Field | Value |
|-------|--------|
| Username | `H2@123` |
| Password | `h2tech@123` |

After sign-in you go to **main.html**.

---

## What you need (checklist)

| # | Item | Status / where |
|---|------|----------------|
| 1 | This website (GitHub Pages or `npm start`) | Repo + `index.html` / `main.html` / `ingest.html` |
| 2 | Google account | Free |
| 3 | Google Sheet | Link below |
| 4 | Apps Script code | File `google-apps-script.js` (paste into Extensions → Apps Script) |
| 5 | Web App deploy | Execute as **Me**, access **Anyone** |
| 6 | Web App URL | Already saved in `js/config.js` |
| 7 | Login on main page | Optional: click **Test connection** |

---

## Google Sheet — all links

| What | Link |
|------|------|
| **Open the spreadsheet** | https://docs.google.com/spreadsheets/d/1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4/edit?usp=sharing |
| **Sheet ID** | `1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4` |
| **Apps Script Web App (API)** | https://script.google.com/macros/s/AKfycbxWNF1aGuAfLCHaxjO-ooLP1aOA-RGMa6DjfWcft8lJuUfUTrxB7uPVr6R4502nc5bdyQ/exec |
| Config in project | `js/config.js` |
| Script source to paste | `google-apps-script.js` |
| Setup notes | `GOOGLE_SHEETS.md` |

### Tabs inside the sheet

| Tab name | Purpose |
|----------|---------|
| **Passwords** | Users: username, password, role, company, project |
| **DATA__Company__Project** | One tab per company + project for HTTP/JSON sensor data |

Example data tab name:

```text
DATA__H2 TECHNOLOGY WORLD__h2server.online
```

Default company / project (from config):

| Field | Default value |
|-------|----------------|
| Company | `H2 TECHNOLOGY WORLD` |
| Project | `h2server.online` |

---

## How to send JSON data (hit the API)

Use **`ingest.html`** with query parameters.

### Required for Google Sheets routing

| Param | Meaning | Example |
|-------|---------|---------|
| `company` | Company name → part of sheet tab | `H2 TECHNOLOGY WORLD` |
| `project` | Project name → part of sheet tab | `h2server.online` |
| `json` **or** other fields | The payload | see below |

### Method 1 — `json=` parameter (recommended)

**GitHub Pages (works while custom domain is down):**

```text
https://hptech1331.github.io/h2server/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&json={"temp":24.5,"hum":60,"device":"ESP32"}
```

**Custom domain (only after DNS is fixed):**

```text
https://h2server.online/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&json={"temp":24.5,"hum":60,"device":"ESP32"}
```

**Local preview:**

```text
http://localhost:3000/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&json={"temp":24.5,"hum":60,"device":"ESP32"}
```

### Method 2 — plain fields

```text
https://hptech1331.github.io/h2server/ingest.html?company=Acme&project=IoT&temp=24.5&hum=60&device=ESP32
```

### Method 3 — simple `data=` text

```text
https://hptech1331.github.io/h2server/ingest.html?company=Acme&project=IoT&data=hello-from-device
```

### Method 4 — open main page and push manually

1. Login → **main.html**
2. Set company + project
3. Paste JSON in **Send test data** → **Push data**

---

## Ready-made links (copy / open)

### GitHub Pages — JSON (use these on phone / devices)

```text
https://hptech1331.github.io/h2server/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&json={"temp":24.5,"hum":60,"device":"ESP32"}
```

```text
https://hptech1331.github.io/h2server/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&json={"sensor":"MQ2","value":412,"unit":"ppm"}
```

### GitHub Pages — fields / text

```text
https://hptech1331.github.io/h2server/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&temp=24.5&hum=60&device=ESP32
```

```text
https://hptech1331.github.io/h2server/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&data=hello-from-device
```

### Local (`npm start` → port 3000) — JSON

```text
http://localhost:3000/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&json={"temp":24.5,"hum":60,"device":"ESP32"}
```

```text
http://localhost:3000/ingest.html?company=DemoCo&project=DemoProject&json={"temp":24.5,"hum":60}
```

---

## After you hit a link

1. Data is saved in the **browser** (local log on main page).
2. If Apps Script is connected, a row is added to Google Sheet tab  
   `DATA__<Company>__<Project>`.
3. Login → **main.html** → see **HTTP data** list (live every few seconds).
4. Open the [Google Sheet](https://docs.google.com/spreadsheets/d/1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4/edit?usp=sharing) to confirm the cloud row.

---

## Where data is stored

| Data | Storage |
|------|---------|
| Users / passwords (local) | Browser `localStorage` |
| HTTP / JSON log (local) | Browser `localStorage` |
| Users / passwords (cloud) | Google Sheet tab **Passwords** |
| Sensor / JSON data (cloud) | Google Sheet tab **DATA__Company__Project** |

---

## Pages / files

| File | Purpose |
|------|---------|
| `index.html` | Login |
| `main.html` | Dashboard — Sheets settings, add user, HTTP data |
| `ingest.html` | HTTP/JSON receiver (devices hit this) |
| `js/config.js` | Sheet ID + Apps Script URL + defaults |
| `js/app.js` | Shared logic |
| `google-apps-script.js` | Paste into Google Apps Script |
| `GOOGLE_SHEETS.md` | Sheets setup guide |
| `LINKS.md` | Extra dummy links |
| `styles.css` | Styling |
| `CNAME` | Custom domain → h2server.online |

---

## Preview on your PC

```bash
npm start
```

Open http://localhost:3000

---

## Deploy / DNS

Repo: **HPTech1331/h2server** → Settings → Pages → branch `main` / root.

- **Working public URL:** https://hptech1331.github.io/h2server/
- **Custom domain fix:** **[DEPLOY.md](DEPLOY.md)** — `h2server.online` needs valid A/CNAME records (error `DNS_PROBE_FINISHED_NXDOMAIN` = domain not found)
- Google Sheets detail: **[GOOGLE_SHEETS.md](GOOGLE_SHEETS.md)**
- More sample links: **[LINKS.md](LINKS.md)**
