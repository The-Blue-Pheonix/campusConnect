# 🚀 Netlify Deployment Guide for Campus Connect

This guide provides the exact settings and step-by-step instructions to deploy the **Campus Connect** project on [Netlify](https://www.netlify.com/).

---

## ⚙️ Netlify Build & Deploy Settings

When configuring your site on the Netlify dashboard under **Site Settings > Build & Deploy > Continuous Deployment**, fill in the form fields as follows:

| Netlify UI Field | Recommended Value | Explanation |
| :--- | :--- | :--- |
| **Branch to deploy** | `main` | The default Git branch Netlify will build from when updates are pushed. |
| **Base directory** | `frontend` | The directory where Netlify installs dependencies (`npm install`) and runs the build. |
| **Build command** | `npm run build` | The command to build your Vite project for production. |
| **Publish directory** | `dist` *(or `frontend/dist` if Base directory is empty)* | The output directory containing compiled HTML/JS/CSS assets. |
| **Functions directory** | *(Leave Empty)* | Not needed for this Single Page Application (SPA). |

---

## 🔑 Environment Variables (Optional)

If you decide to extract your Firebase or Supabase configurations into environment variables instead of hardcoding them, set them under **Site Settings > Environment Variables** on Netlify:

| Variable Key | Example Value | Scope |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyCOycpIK...` | All deploy contexts |
| `VITE_FIREBASE_AUTH_DOMAIN` | `campus-connect-429ae.firebaseapp.com` | All deploy contexts |
| `VITE_FIREBASE_PROJECT_ID` | `campus-connect-429ae` | All deploy contexts |
| `VITE_FIREBASE_STORAGE_BUCKET` | `campus-connect-429ae.appspot.com` | All deploy contexts |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `646988887058` | All deploy contexts |
| `VITE_FIREBASE_APP_ID` | `1:646988887058:web:1a0022b2bf4069cb7ad4cb` | All deploy contexts |

> 💡 **Note**: In Vite projects, all client-side environment variables **must** start with `VITE_`.

---

## 📄 Automated Configuration Files Included in Repository

To ensure Netlify automatically detects all settings without manual entry:

1. **`netlify.toml`** (at root):
   ```toml
   [build]
     base = "frontend"
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **`frontend/public/_redirects`**:
   ```text
   /*    /index.html   200
   ```
   *(Prevents 404 errors when refreshing sub-pages like `/discover`, `/chat`, or `/community` in React Router).*

---

## 🛠️ Step-by-Step Deployment Instructions

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Configure Netlify deployment settings"
   git push origin main
   ```

2. **Log into Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com/).
   - Click **"Add new site"** > **"Import an existing project"**.
   - Select **GitHub** (or your Git provider) and authorize access.
   - Choose your `campusConnect` repository.

3. **Verify Build Settings**:
   - Netlify will automatically pre-fill settings from `netlify.toml`:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/dist`
   - Click **"Deploy campusConnect"**.

4. **Verify Deployment**:
   - Wait 1–2 minutes for the build to finish.
   - Click the generated URL (e.g., `https://campusconnect-xxxx.netlify.app`) to test your live app!
