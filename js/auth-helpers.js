// ─────────────────────────────────────────────────────────────
// js/auth-helpers.js — ตัวช่วยกลางเรื่องล็อกอิน ให้ทุกหน้า import ไปใช้ร่วมกัน
// (หน้าอื่น ๆ ที่ทีมอื่นทำ จะพึ่งพา getCurrentUser() นี้ — ห้ามเปลี่ยนรูปแบบค่าที่คืน)
// ─────────────────────────────────────────────────────────────

import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// getCurrentUser() → Promise
//   ล็อกอินอยู่    → resolve({ uid, displayName, email, role })
//   ไม่ได้ล็อกอิน → resolve(null)
//
// ใช้ onAuthStateChanged รอให้ Firebase รู้สถานะแน่นอนก่อน ค่อย resolve
// (ห้ามอ่านจาก auth.currentUser ตรง ๆ เพราะตอนโหลดหน้าแรกค่านี้อาจยังไม่พร้อม)
export function getCurrentUser() {
  return new Promise((resolve) => {
    const เลิกฟัง = onAuthStateChanged(auth, async (ผู้ใช้) => {
      เลิกฟัง();

      if (!ผู้ใช้) {
        resolve(null);
        return;
      }

      var role = "employee"; // ค่าเริ่มต้น ใช้ตอนอ่านเอกสารใน users ไม่ได้
      try {
        var เอกสาร = await getDoc(doc(db, "users", ผู้ใช้.uid));
        if (เอกสาร.exists() && เอกสาร.data().role) {
          role = เอกสาร.data().role;
        }
      } catch (err) {
        // อ่านไม่ได้ (เช่นยังไม่มีเอกสาร) ก็ปล่อยให้ใช้ค่าเริ่มต้น employee ต่อไป
      }

      resolve({
        uid: ผู้ใช้.uid,
        displayName: ผู้ใช้.displayName,
        email: ผู้ใช้.email,
        role: role
      });
    });
  });
}
