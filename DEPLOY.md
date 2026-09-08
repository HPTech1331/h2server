# Deploy h2server.online with GitHub Pages (free)

No paid hosting needed. GitHub hosts the site for free.

## What you need

- A free [GitHub](https://github.com) account
- This project folder
- Access to your domain DNS panel (optional, for h2server.online)

---

## Part A — Put the site on GitHub

### 1. Create a new repository

1. Open [https://github.com/new](https://github.com/new)
2. Repository name: `h2server` (or any name you like)
3. Public
4. Do **not** add README / .gitignore / license (files already exist here)
5. Click **Create repository**

### 2. Upload these files

**Easiest (no Git command line):**

1. On the new empty repo page, click **uploading an existing file**
2. Drag **all** of these from this folder:

| Path | Purpose |
|------|---------|
| `index.html` | Login page |
| `main.html` | Dashboard (add user + HTTP data) |
| `ingest.html` | HTTP data receiver |
| `styles.css` | Styling |
| `js/app.js` | Shared logic (create the `js` folder on upload) |
| `CNAME` | Custom domain → h2server.online |
| `README.md` | Project readme |
| `LINKS.md` | Dummy HTTP data links |
| `DEPLOY.md` | This guide |
| `package.json` | Local preview scripts |
| `.gitignore` | Ignore junk files |

3. Click **Commit changes**

**Tip for `js/app.js`:** GitHub upload may need you to create a `js` folder first, or drag the whole `js` folder so `js/app.js` is included.

**Or with Git (in this folder, in Terminal / PowerShell):**

```bash
git init
git add -A
git commit -m "Initial site for h2server.online"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/h2server.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `h2server` with your GitHub username and repo name.

### 3. Turn on GitHub Pages

1. Open the repo on GitHub
2. **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **Save**
5. Wait 1–2 minutes

Your site will appear at:

`https://YOUR_USERNAME.github.io/h2server/`

(If the repo is named `YOUR_USERNAME.github.io`, it is also at `https://YOUR_USERNAME.github.io/`)

---

## Part B — Point h2server.online to GitHub

Your domain may still be on parking nameservers. Those must be changed if you want the custom domain.

### Option 1 — Recommended: use GitHub + registrar DNS records

In your domain panel:

1. Click **Edit** next to **DNS / Nameservers**
2. If the panel only shows nameservers, switch to **Use registrar DNS** / **Default nameservers** (not parking)
3. Open **DNS records** (sometimes called Manage DNS / Zone editor)
4. Delete old parking / default A or CNAME records for `@` and `www` if they conflict
5. Add these records:

| Type | Name / Host | Value | TTL |
|------|-------------|-------|-----|
| **A** | `@` | `185.199.108.153` | 3600 |
| **A** | `@` | `185.199.109.153` | 3600 |
| **A** | `@` | `185.199.110.153` | 3600 |
| **A** | `@` | `185.199.111.153` | 3600 |
| **CNAME** | `www` | `YOUR_USERNAME.github.io` | 3600 |

Replace `YOUR_USERNAME` with your real GitHub username.

### Option 2 — Custom domain inside GitHub first

1. Repo → **Settings** → **Pages**
2. Under **Custom domain**, type: `h2server.online`
3. Click **Save**
4. GitHub will check DNS; it may show errors until Part B DNS is done
5. After DNS works, enable **Enforce HTTPS**

The `CNAME` file in this project already contains `h2server.online`, so GitHub keeps the domain after each push.

---

## Part C — Wait and test

1. DNS can take **15 minutes to a few hours** (sometimes up to 24–48 hours)
2. Check:
   - `https://YOUR_USERNAME.github.io/h2server/`
   - `http://h2server.online` then later `https://h2server.online`
3. In GitHub Pages settings, turn on **Enforce HTTPS** when it becomes available

### After deploy — login & HTTP data

| Item | Value |
|------|--------|
| Login | `https://h2server.online/` or `index.html` |
| Username | `H2@123` |
| Password | `h2tech@123` |
| Dummy data link | `https://h2server.online/ingest.html?data=hello-from-device` |

---

## Checklist

- [ ] GitHub account created
- [ ] Repo created and **all** files uploaded (including `main.html`, `ingest.html`, `js/app.js`)
- [ ] Pages enabled on branch `main` / root
- [ ] Custom domain set to `h2server.online` in Pages settings (optional)
- [ ] Parking nameservers removed (if using custom domain)
- [ ] Four GitHub **A** records for `@` added
- [ ] **CNAME** `www` → `YOUR_USERNAME.github.io` added
- [ ] Site loads and HTTPS is on
- [ ] Login works and HTTP data appears on main page

---

## Common problems

| Problem | Fix |
|---------|-----|
| 404 on GitHub URL | Pages not enabled, or files not on `main` |
| Domain still shows parking page | Nameservers still parking — edit DNS |
| Site works on github.io but not domain | A/CNAME records wrong or not saved yet |
| HTTPS stuck | Wait for DNS; then toggle Enforce HTTPS off/on |
| CSS missing | Confirm `styles.css` is in the same folder as `index.html` on GitHub |
| Login / main / data broken | Confirm `js/app.js`, `main.html`, and `ingest.html` were uploaded |
| Data not showing | Open ingest link in the **same browser** that is logged into main |

You do **not** need Domain Shield, transfer code, or domain unlock for this.
