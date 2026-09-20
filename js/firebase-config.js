// ─────────────────────────────────────────────────────────────
// js/firebase-config.js — ตั้งค่า Firebase ให้ทุกหน้าเรียกใช้ร่วมกัน
// export ตัวแปร db (Firestore) และ auth (Authentication) ให้ไฟล์อื่น import ไปใช้
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqJnIq9hKORQrNLvc-5JSZFgugKQllYWw",
  authDomain: "leaveeasy-aa5a3.firebaseapp.com",
  projectId: "leaveeasy-aa5a3",
  storageBucket: "leaveeasy-aa5a3.firebasestorage.app",
  messagingSenderId: "549781361680",
  appId: "1:549781361680:web:81b7fc00c134dd55572695",
  measurementId: "G-ESXCHP0V5Q"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
