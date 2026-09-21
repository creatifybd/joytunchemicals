# JOYTUN Chemical Industries — React Website

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Create your own `.env` file from the example. **Never commit this file to Git.**

### 3. Firebase Console Setup

**Authentication:**
- Go to Firebase Console → Authentication → Sign-in method
- Enable **Google** provider
- Add your domain to "Authorized domains" (after deploy)

**Firestore Database:**
- Go to Firestore Database → Create database → Start in **production mode**
- Go to **Rules** tab and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email in ["binashad7@gmail.com", "joytunchemicals@gmail.com"];
    }

    match /products/{doc} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email in ["binashad7@gmail.com", "joytunchemicals@gmail.com"];
    }

    match /categories/{doc} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email in ["binashad7@gmail.com", "joytunchemicals@gmail.com"];
    }

    match /orders/{doc} {
      allow write: if true;
      allow read, delete: if request.auth != null
        && request.auth.token.email in ["binashad7@gmail.com", "joytunchemicals@gmail.com"];
    }

    match /messages/{doc} {
      allow write: if true;
      allow read, delete: if request.auth != null
        && request.auth.token.email in ["binashad7@gmail.com", "joytunchemicals@gmail.com"];
    }
  }
}
```

### 4. Run locally
```bash
npm run dev
```
Visit: http://localhost:3000

---

## Automatic deployment to Hostinger

Every push or merge to `main` runs [Deploy to Hostinger](https://github.com/creatifybd/joytunchemicals/actions/workflows/deploy.yml).
The workflow installs the locked dependencies, tests deployment logic, builds the React site, uploads `dist/`, and checks the published website.
Other branches do not deploy. To republish `main`, select **Run workflow** on the Actions page.

### Repository secrets

In **Settings → Secrets and variables → Actions**, keep these repository secrets configured:

- `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`: the existing Hostinger FTP account.
- The `VITE_FIREBASE_*`, `VITE_ADMIN_EMAIL` / `VITE_ADMIN_EMAILS`, and `VITE_IMGBB_API_KEY` values used by the application.

These credentials are already referenced by the workflow; they do not belong in source files.

### Repository variables

| Variable | Default / behavior |
| --- | --- |
| `FTP_SERVER_DIR` | Optional absolute FTP web-root override. Otherwise use `/domains/joytunchemicals.com/public_html` when it exists, then `/public_html`. Missing destinations stop deployment. |
| `SITE_URL` | `https://www.joytunchemicals.com` |
| `FTP_SECURE` | Set to `true` to enable FTPS with certificate validation. Unset preserves the existing FTP connection mode. |

Uploads never clear the server directory. Assets are uploaded and checked before entry points are replaced, and older hashed assets stay available for existing visitors.
Only one deployment runs at a time. A failed upload or HTTP check fails the action.

### Verify and troubleshoot

The action checks the release marker, the home page, `/index.html`, `/products`, `/admin/login`, and the exact JavaScript/CSS files from the build.
`/deployment.json` records the deployed Git commit and release ID.
If the action reports HTTP 403 or a different release, check the website's document root and permissions in Hostinger, the `FTP_SERVER_DIR` variable, and the Hostinger cache.
An FTP upload alone does not establish that the domain is serving the build.

For local validation:

```bash
npm ci
node --test tests/deployment.test.js
npm run build
```

In Firebase Authentication, add `joytunchemicals.com` and `www.joytunchemicals.com` to **Authorized domains** for Google sign-in.

---

## Admin Access

- Visit `/admin/login`
- Click **Sign in with Google**
- Only `binashad7@gmail.com` can access the admin panel

## Security Notes

- Vite embeds `VITE_*` values into browser JavaScript. Use them only for browser configuration; never place FTP passwords or server-only credentials in `VITE_*` variables.
- Firestore rules enforce server-side admin-only write access
- Google Auth enforces only your email can log in
- ImgBB key is client-side (unavoidable for direct upload) — it's rate-limited by your ImgBB account
