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

The `.env` file already has your credentials. **Never commit this file to Git.**

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

## Deploy to Vercel (Free, Recommended)

1. Push your code to GitHub (**make sure `.env` is in `.gitignore`**)
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add all variables from your `.env` file
4. Click Deploy

After deploy, go to **Firebase Console → Authentication → Authorized domains** and add your Vercel URL.

---

## Deploy to Netlify (Alternative)

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → New site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Site Settings → Environment Variables

---

## Admin Access

- Visit `/admin/login`
- Click **Sign in with Google**
- Only `binashad7@gmail.com` can access the admin panel

## Security Notes

- All API keys are in `.env` — never exposed in browser source
- Firestore rules enforce server-side admin-only write access
- Google Auth enforces only your email can log in
- ImgBB key is client-side (unavoidable for direct upload) — it's rate-limited by your ImgBB account
