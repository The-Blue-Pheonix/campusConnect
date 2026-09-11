# 🚀 Campus Connect  
### The Next-Gen Student Discovery & Networking Portal  

Campus Connect is **not just a directory** — it’s a **real-time, campus-exclusive social ecosystem** built for university students to discover, connect, collaborate, and communicate securely.

Designed with performance, privacy, and modern UI principles at its core.

---

## ✨ Experience the Magic

- 🛡️ **Secure Gatekeeper**  
  Access restricted to **verified university registration numbers** only.

- 🌌 **Ghost Cursor (Experimental)**  
  High-performance **Three.js custom cursor** with glowing trail effects on dark UI.

- 💎 **Glassmorphism UI**  
  Frosted-glass aesthetics powered by **Tailwind CSS v4**.

- ⚡ **Real-Time Presence Control**  
  Admin **Kill Switch** instantly revokes sessions using Firestore listeners.

- 🃏 **Discovery Stack**  
  Swipe-style profile discovery backed by **Firestore real-time data**.

- 💬 **Private & Group Chat (WIP)**  
  Secure 1-to-1 and group messaging with Firebase rules enforcement.

- ⏳ **Ephemeral Chat Rooms (Planned)**  
  Special chat rooms that **auto-expire after 1 hour**.

- 📚 **Study & Research Space**  
  Share what you’re learning, building, or researching inside campus.

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React + Vite** — ultra-fast HMR & optimized builds
- 🎨 **Tailwind CSS v4** — modern utility-first styling with `@theme`
- 🧠 **Context API** — global auth & real-time state handling

### Backend (BaaS)
- 🔥 **Firebase Authentication**
- 📦 **Cloud Firestore**
- 🔐 **Firestore Security Rules (rules_version = 2)**

### Graphics & Effects
- 🧊 **Three.js**
- ✨ **UnrealBloomPass**
- 🖱️ Custom WebGL cursor effects

---

## 📦 Database Schema

Campus Connect uses a **two-tier security model**:

### `valid_students`
```json
{
  "registrationNumber": "2023CSE001",
Used for campus access validation.
```
users
```
{
  "uid": "firebase_uid",
  "name": "Student Name",
  "department": "CSE",
  "year": "2nd",
  "bio": "Builder | Learner",
  "interests": ["Coder", "Book Lover"],
  "photoURL": ""
}
```
friend_requests
```
{
  "from": "uidA",
  "to": "uidB",
  "status": "pending"
}
```
chats
```
{
  "users": ["uidA", "uidB"],
  "createdAt": "timestamp"
}
```
Subcollection: messages
```
{
  "senderId": "uidA",
  "text": "Hello!",
  "timestamp": "serverTimestamp"
}
```
🚀 Getting Started
1️⃣ Clone the Repository
```
git clone https://github.com/yourusername/campus-connect.git
cd campus-connect/frontend
```
2️⃣ Install Dependencies
```
npm install
```
3️⃣ Configure Firebase

Create the file:
```
src/conf/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```
4️⃣ Launch the Campus
```
npm run dev
```
🎨 UI Showcase

🌑 Ultra-dark theme

💡 Interactive light pillars

🃏 Swipeable discovery cards

🧑‍🎓 Profile management with editable bio

🔒 Read-only Registration Number

🔐 Security Philosophy

Firestore rules enforce user-level access

Chats readable only by participants

Auth-based document ownership

Admin-controlled campus access

🤝 Contributing

Contributions are what make the campus community thrive.

Fork the project

Create your feature branch

git checkout -b feature/AmazingFeature


Commit your changes

git commit -m "Add AmazingFeature"


Push to branch

git push origin feature/AmazingFeature


Open a Pull Request

🧪 Roadmap

✅ Auth + Campus Validation

✅ Profile System

✅ Friend Requests

🔄 Messaging & Group Chats

⏳ Ephemeral 1-Hour Chat Rooms

🤖 ML-based Interest Matching

📱 Mobile App (React Native)

📜 License

Distributed under the MIT License.
See LICENSE for more information.

🌟 Final Note

Campus Connect is built by students, for students — with real-world architecture, not shortcuts.

If this project excites you, ⭐ star the repo and help grow the campus.


---


