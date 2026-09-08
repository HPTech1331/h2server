# Complete HTTP / JSON data links

## Public site on phone (working now)

Custom domain `h2server.online` DNS is down (“server IP not found” / NXDOMAIN).  
**Use GitHub Pages:**

| Page | URL |
|------|-----|
| Login | https://hptech1331.github.io/h2server/ |
| Main | https://hptech1331.github.io/h2server/main.html |
| Ingest base | https://hptech1331.github.io/h2server/ingest.html |

Login: user `H2@123` / pass `h2tech@123`

Google Sheet:  
https://docs.google.com/spreadsheets/d/1FDX6ykEnS-gy__3QXHSv3B2Hpy2dKbrmMGsyP_9q5o4/edit?usp=sharing

Apps Script Web App:  
https://script.google.com/macros/s/AKfycbxWNF1aGuAfLCHaxjO-ooLP1aOA-RGMa6DjfWcft8lJuUfUTrxB7uPVr6R4502nc5bdyQ/exec

---

## How to hit with JSON

Use the `json=` query parameter (full object). Always send `company` + `project` so the row goes to the right sheet tab.

### Pattern

```text
ingest.html?company=YOUR_COMPANY&project=YOUR_PROJECT&json={"key":"value","temp":24.5}
```

### GitHub Pages — JSON examples (use these)

Temperature + humidity + device:

```text
https://hptech1331.github.io/h2server/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&json={"temp":24.5,"hum":60,"device":"ESP32"}
```

Gas sensor:

```text
https://hptech1331.github.io/h2server/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&json={"sensor":"MQ2","value":412,"unit":"ppm"}
```

Custom company/project:

```text
https://hptech1331.github.io/h2server/ingest.html?company=Acme&project=IoT&json={"temp":24.5,"hum":60,"device":"ESP32"}
```

### GitHub Pages — non-JSON helpers

```text
https://hptech1331.github.io/h2server/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&temp=24.5&hum=60&device=ESP32
```

```text
https://hptech1331.github.io/h2server/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&data=hello-from-device
```

### Local (npm start → port 3000) — JSON

```text
http://localhost:3000/ingest.html?company=H2%20TECHNOLOGY%20WORLD&project=h2server.online&json={"temp":24.5,"hum":60,"device":"ESP32"}
```

```text
http://localhost:3000/ingest.html?company=DemoCo&project=DemoProject&json={"temp":24.5,"hum":60}
```

### Local — fields / text

```text
http://localhost:3000/ingest.html?company=DemoCo&project=DemoProject&temp=24.5&hum=60&device=ESP32
```

```text
http://localhost:3000/ingest.html?company=DemoCo&project=DemoProject&data=hello-from-device
```

### curl (JSON via GitHub Pages)

```bash
curl -G "https://hptech1331.github.io/h2server/ingest.html" \
  --data-urlencode "company=H2 TECHNOLOGY WORLD" \
  --data-urlencode "project=h2server.online" \
  --data-urlencode "json={\"temp\":24.5,\"hum\":60,\"device\":\"ESP32\"}"
```

---

## After you hit a link

1. Open main.html → **HTTP data** (local live list)
2. Open Google Sheet → tab `DATA__Company__Project` for the cloud row
