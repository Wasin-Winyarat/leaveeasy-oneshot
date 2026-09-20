// ─────────────────────────────────────────────────────────────
// js/nav.js — แถบเมนูด้านบนที่ใช้ร่วมกันทุกหน้า
// แก้เมนูที่ไฟล์นี้ที่เดียว ทุกหน้าเปลี่ยนตามพร้อมกัน
//
// วิธีใช้: ทุกหน้ามี <div id="nav"></div> ไว้บนสุดของ body
// เป็น ES module (ต้องใช้ <script type="module" src="js/nav.js">) เพราะต้องรู้ว่าใครล็อกอินอยู่
// ─────────────────────────────────────────────────────────────

import { auth } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getCurrentUser } from "./auth-helpers.js";

(function () {
  var เมนู = [
    { href: "index.html",             ชื่อ: "หน้าแรก" },
    { href: "leave-requests.html",    ชื่อ: "รายการใบลา" },
    { href: "new-leave-request.html", ชื่อ: "ยื่นใบลาใหม่" },
    { href: "leave-types.html",       ชื่อ: "ประเภทการลา" },
    { href: "dashboard.html",         ชื่อ: "แดชบอร์ด" }
  ];

  // ชื่อไฟล์ของหน้าที่กำลังเปิดอยู่ เอาไว้ขีดเส้นใต้เมนูที่ตรงกัน
  var หน้าปัจจุบัน = location.pathname.split("/").pop() || "index.html";

  var html = '<div class="navbar"><span class="brand">🔧 LeaveEasy</span>';
  เมนู.forEach(function (m) {
    var active = m.href === หน้าปัจจุบัน ? ' class="active"' : "";
    // เมนู "ประเภทการลา" ซ่อนไว้ก่อน จะโชว์เฉพาะฝ่ายบุคคล (hr) เมื่อรู้ role แน่นอนแล้วด้านล่าง
    var idAttr = m.href === "leave-types.html" ? ' id="navLeaveTypesLink" style="display:none"' : "";
    html += '<a href="' + m.href + '"' + active + idAttr + ">" + m.ชื่อ + "</a>";
  });
  // ช่องแสดงชื่อคนที่ล็อกอินอยู่ / ลิงก์เข้าสู่ระบบ (เติมค่าด้านล่าง)
  html += '<span class="nav-user" id="navUser"></span></div>';

  var ที่วาง = document.getElementById("nav");
  if (ที่วาง) ที่วาง.innerHTML = html;
})();

// เติมชื่อผู้ใช้ที่ล็อกอินอยู่ + ปุ่มออกจากระบบ หรือลิงก์เข้าสู่ระบบถ้ายังไม่ได้ล็อกอิน
getCurrentUser().then(function (ผู้ใช้) {
  // โชว์เมนู "ประเภทการลา" เฉพาะฝ่ายบุคคล (hr) ตามหัวข้อ 4 หน้าที่ 4 ของสเปก
  var ลิงก์ประเภทการลา = document.getElementById("navLeaveTypesLink");
  if (ลิงก์ประเภทการลา && ผู้ใช้ && ผู้ใช้.role === "hr") {
    ลิงก์ประเภทการลา.style.display = "";
  }

  var ช่องผู้ใช้ = document.getElementById("navUser");
  if (!ช่องผู้ใช้) return;

  if (ผู้ใช้) {
    ช่องผู้ใช้.innerHTML =
      '<span>👤 ' + (ผู้ใช้.displayName || ผู้ใช้.email) + '</span>' +
      '<button type="button" id="ปุ่มออกจากระบบ" class="btn-ghost">ออกจากระบบ</button>';

    document.getElementById("ปุ่มออกจากระบบ").addEventListener("click", async function () {
      await signOut(auth);
      location.href = "login.html";
    });
  } else {
    ช่องผู้ใช้.innerHTML = '<a href="login.html">เข้าสู่ระบบ</a>';
  }
});

// แถบเตือนสีเหลือง ใช้ตอนที่ยังไม่ได้ตั้งค่า Firebase
function showConfigWarning(ข้อความ) {
  var กล่อง = document.createElement("div");
  กล่อง.className = "alert alert-warn";
  กล่อง.innerHTML =
    "⚠️ <strong>ยังไม่ได้ตั้งค่า Firebase</strong> — " +
    (ข้อความ || "หน้านี้จึงยังไม่ได้อ่านข้อมูลจากฐานข้อมูลจริง") +
    "<br>วิธีตั้งค่าอยู่ในไฟล์ SETUP.md ขั้นที่ 4";
  var ที่วาง = document.querySelector(".container") || document.body;
  ที่วาง.insertBefore(กล่อง, ที่วาง.firstChild);
}
window.showConfigWarning = showConfigWarning;
