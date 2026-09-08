# h2server.online

Login + main dashboard for **Electronics World** (static site, free on GitHub Pages).

## Login

| Field | Value |
|-------|--------|
| Username | `H2@123` |
| Password | `h2tech@123` |

After sign-in you go to **main.html**.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Login |
| `main.html` | Main page — **Add user** + **HTTP data** log |
| `ingest.html` | HTTP data receiver (query string → main page) |
| `js/app.js` | Shared logic (users, session, data log) |
| `styles.css` | Styling |
| `CNAME` | Custom domain → h2server.online |

## HTTP data

Open (or call from a device):

```text
ingest.html?data=hello
ingest.html?temp=24&hum=60
ingest.html?json={"temp":24.5}
```

The payload is saved and shown live on the main page.

## Preview on your PC

Double-click `index.html`, or:

```bash
npm start
```

Then open http://localhost:3000

## Deploy

See **[DEPLOY.md](DEPLOY.md)** for GitHub Pages + domain setup.
