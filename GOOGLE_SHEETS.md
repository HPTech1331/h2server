# Google Sheets setup (H2 Server)

## Your configured sheet

- **Spreadsheet:** [Open sheet](https://docs.google.com/spreadsheets/d/1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4/edit?usp=sharing)
- **Sheet ID:** `1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4`
- **Web App URL (built into `js/config.js`):**
  `https://script.google.com/macros/s/AKfycbxWNF1aGuAfLCHaxjO-ooLP1aOA-RGMa6DjfWcft8lJuUfUTrxB7uPVr6R4502nc5bdyQ/exec`

## Tabs created automatically

| Tab | Purpose |
|-----|---------|
| `Passwords` | Username, password, role, company, project |
| `DATA__Company__Project` | One tab per company + project for HTTP/JSON data |

## If you need to re-deploy Apps Script

1. Open the sheet → **Extensions → Apps Script**
2. Paste contents of `google-apps-script.js` (uses your Sheet ID)
3. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the `/exec` URL into `js/config.js` → `APPS_SCRIPT_URL`

## Test

1. Login → main page
2. Click **Test connection** under Google Sheets
3. **Add user** → check **Passwords** tab
4. **Push data** or open an ingest link → check `DATA__…` tab

## Device / ingest example

```text
ingest.html?company=Acme&project=IoT&json={"temp":24.5,"hum":60}
```
