// ─────────────────────────────────────────────────────────────
// js/signup.js — สมัครสมาชิกด้วยอีเมล/รหัสผ่าน แล้วสร้างเอกสารใน users
// role เริ่มต้นเป็น employee เสมอ (ผู้ใช้เลือกเองไม่ได้)
// ─────────────────────────────────────────────────────────────

import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

var ฟอร์ม = document.getElementById("ฟอร์มสมัคร");
var ปุ่มสมัคร = document.getElementById("ปุ่มสมัคร");
var กล่องเตือน = document.getElementById("ข้อความเตือน");

function แสดงข้อผิดพลาด(ข้อความ) {
  กล่องเตือน.textContent = ข้อความ;
  กล่องเตือน.classList.remove("hidden");
}

function ซ่อนข้อผิดพลาด() {
  กล่องเตือน.classList.add("hidden");
}

ฟอร์ม.addEventListener("submit", async function (e) {
  e.preventDefault();
  ซ่อนข้อผิดพลาด();

  var ชื่อ = document.getElementById("name").value.trim();
  var อีเมล = document.getElementById("email").value.trim();
  var รหัสผ่าน = document.getElementById("password").value;

  if (!ชื่อ || !อีเมล || !รหัสผ่าน) {
    แสดงข้อผิดพลาด("กรอกข้อมูลให้ครบทุกช่อง");
    return;
  }

  ปุ่มสมัคร.disabled = true;
  ปุ่มสมัคร.textContent = "กำลังสมัคร…";

  try {
    var ผลลัพธ์ = await createUserWithEmailAndPassword(auth, อีเมล, รหัสผ่าน);
    var ผู้ใช้ = ผลลัพธ์.user;

    await updateProfile(ผู้ใช้, { displayName: ชื่อ });

    await setDoc(doc(db, "users", ผู้ใช้.uid), {
      name: ชื่อ,
      email: อีเมล,
      role: "employee"
    });

    location.href = "index.html";
  } catch (err) {
    แสดงข้อผิดพลาด(แปลข้อผิดพลาด(err));
    ปุ่มสมัคร.disabled = false;
    ปุ่มสมัคร.textContent = "สมัครสมาชิก";
  }
});

function แปลข้อผิดพลาด(err) {
  var รหัส = err && err.code;
  if (รหัส === "auth/email-already-in-use") return "อีเมลนี้มีผู้ใช้แล้ว";
  if (รหัส === "auth/invalid-email") return "รูปแบบอีเมลไม่ถูกต้อง";
  if (รหัส === "auth/weak-password") return "รหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัวอักษร)";
  return "สมัครสมาชิกไม่สำเร็จ: " + (err && err.message ? err.message : "ไม่ทราบสาเหตุ");
}
