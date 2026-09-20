// ─────────────────────────────────────────────────────────────
// js/login.js — ล็อกอินด้วยอีเมล/รหัสผ่าน สำเร็จแล้วพาไปหน้าแรก
// ─────────────────────────────────────────────────────────────

import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

var ฟอร์ม = document.getElementById("ฟอร์มล็อกอิน");
var ปุ่มล็อกอิน = document.getElementById("ปุ่มล็อกอิน");
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

  var อีเมล = document.getElementById("email").value.trim();
  var รหัสผ่าน = document.getElementById("password").value;

  if (!อีเมล || !รหัสผ่าน) {
    แสดงข้อผิดพลาด("กรอกอีเมลและรหัสผ่านให้ครบ");
    return;
  }

  ปุ่มล็อกอิน.disabled = true;
  ปุ่มล็อกอิน.textContent = "กำลังเข้าสู่ระบบ…";

  try {
    await signInWithEmailAndPassword(auth, อีเมล, รหัสผ่าน);
    location.href = "index.html";
  } catch (err) {
    แสดงข้อผิดพลาด(แปลข้อผิดพลาด(err));
    ปุ่มล็อกอิน.disabled = false;
    ปุ่มล็อกอิน.textContent = "เข้าสู่ระบบ";
  }
});

function แปลข้อผิดพลาด(err) {
  var รหัส = err && err.code;
  if (รหัส === "auth/invalid-credential" || รหัส === "auth/wrong-password" || รหัส === "auth/user-not-found") {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }
  if (รหัส === "auth/invalid-email") return "รูปแบบอีเมลไม่ถูกต้อง";
  if (รหัส === "auth/too-many-requests") return "ลองผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
  return "เข้าสู่ระบบไม่สำเร็จ: " + (err && err.message ? err.message : "ไม่ทราบสาเหตุ");
}
