# Fix GitHub Pages (read this)

## Why the site broke

1. **Jekyll** tried to write theme CSS into `assets/` and crashed the build.
2. The **CNAME** file forced every visitor to `h2server.online`.
   That domain DNS is not working, so phones/PCs showed "server IP address could not be found".

## What we changed

- Logo moved to `img/` (no `assets/` clash)
- `.nojekyll` + `_config.yml` (static site)
- **Removed `CNAME`** so the site works on GitHub Pages URL
- Added workflow `.github/workflows/pages.yml` (deploys without Jekyll)

## What you must do

### 1. Push

```bash
git push origin main
```

### 2. GitHub Pages settings

1. Open repo **Settings → Pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. Open the **Actions** tab, wait for **Deploy static site to Pages** to finish green

### 3. Open this URL (not the custom domain yet)

https://hptech1331.github.io/h2server/

### 4. Custom domain later

Only after DNS A/CNAME records work:

1. Rename `CNAME.example` → `CNAME` (content: `h2server.online`)
2. Pages → Custom domain → `h2server.online` → Save
3. Enable **Enforce HTTPS**
