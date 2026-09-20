// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// สัปดาห์ที่ 7: อ่าน/เขียนข้อมูลจริงจาก Firestore
//   - ใบลา: leaveRequests/{id}
//   - ความเห็น: leaveRequests/{id}/approvals (subcollection)
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase-config.js";
import { getCurrentUser } from "./auth-helpers.js";
import {
  doc, getDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

var รหัสใบลา = ค่าจากURL("id");
var กล่องใบลา = document.getElementById("กล่องใบลา");
var กล่องความเห็น = document.getElementById("กล่องความเห็น");
var กล่องปุ่มลบ = document.getElementById("กล่องปุ่มลบ");

var ใบ = null;         // ข้อมูลใบลาปัจจุบัน (จาก Firestore)
var ความเห็น = [];      // รายการความเห็นปัจจุบัน (จาก subcollection approvals)
var ผู้ใช้ปัจจุบัน = null;  // { uid, displayName, email, role } ของคนที่ล็อกอินอยู่

เริ่มทำงาน();

async function เริ่มทำงาน() {
  ผู้ใช้ปัจจุบัน = await getCurrentUser();

  var โหลดสำเร็จ = await โหลดใบลา();
  if (!โหลดสำเร็จ) return;

  await โหลดความเห็น();
  วาดใบลา();
  วาดความเห็น();
  กล่องความเห็น.classList.remove("hidden");

  document.getElementById("ปุ่มส่งความเห็น").addEventListener("click", ส่งความเห็น);
  document.getElementById("ปุ่มลบใบลา").addEventListener("click", ลบใบลา);
}

// ── โหลดข้อมูลใบลาจาก Firestore ──
async function โหลดใบลา() {
  var เอกสาร;
  try {
    เอกสาร = await getDoc(doc(db, "leaveRequests", รหัสใบลา));
  } catch (err) {
    // เช่น เปิดใบของคนอื่นตรงๆ ผ่าน URL แล้วโดน Security Rules ปฏิเสธ
    กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
    return false;
  }
  if (!เอกสาร.exists()) {
    กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
    return false;
  }
  ใบ = Object.assign({ id: เอกสาร.id }, เอกสาร.data());
  return true;
}

// ── โหลดความเห็นจาก subcollection approvals เรียงเก่า→ใหม่ ──
async function โหลดความเห็น() {
  var รายการ;
  try {
    รายการ = await getDocs(
      query(collection(db, "leaveRequests", รหัสใบลา, "approvals"), orderBy("createdAt"))
    );
  } catch (err) {
    // orderBy มีปัญหาเรื่อง index ก็ดึงมาทั้งหมดแล้ว sort ฝั่ง JS แทน
    รายการ = await getDocs(collection(db, "leaveRequests", รหัสใบลา, "approvals"));
  }
  ความเห็น = รายการ.docs
    .map(function (d) { return Object.assign({ id: d.id }, d.data()); })
    .sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : (a.createdAt > b.createdAt ? 1 : 0); });
}

// ── วาดข้อมูลใบลาลงหน้าจอ ──
function วาดใบลา() {
  var แถว = [
    ["หัวข้อ", esc(ใบ.title)],
    ["เหตุผลการลา", esc(ใบ.reason)],
    ["ประเภทการลา", esc(ใบ.leaveTypeName)],
    ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
    ["ผู้ขอลา", esc(ใบ.requesterName)],
    ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
    ["สถานะ", ป้ายสถานะ(ใบ.status)],
    ["วันที่ยื่น", esc(ใบ.createdAt)]
  ];

  var html = แถว.map(function (r) {
    return '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
  }).join("");

  // เปลี่ยนสถานะได้เฉพาะผู้อนุมัติ/ฝ่ายบุคคล (ผู้ขอลาเปลี่ยนสถานะเองไม่ได้ — หัวข้อ 6)
  var เป็นผู้อนุมัติหรือฝ่ายบุคคล = ผู้ใช้ปัจจุบัน && (ผู้ใช้ปัจจุบัน.role === "manager" || ผู้ใช้ปัจจุบัน.role === "hr");

  // ปุ่มอนุมัติ / ไม่อนุมัติ ขึ้นเฉพาะใบที่ยังรอพิจารณา และเฉพาะคนที่มีสิทธิ์เปลี่ยนสถานะ
  if (ใบ.status === "รอพิจารณา" && เป็นผู้อนุมัติหรือฝ่ายบุคคล) {
    html +=
      '<div class="btn-row">' +
      '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
      '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>' +
      "</div>";
  } else if (ใบ.status !== "รอพิจารณา") {
    html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะต่อไม่ได้</p>';
  }

  กล่องใบลา.innerHTML = html;

  if (ใบ.status === "รอพิจารณา" && เป็นผู้อนุมัติหรือฝ่ายบุคคล) {
    document.getElementById("ปุ่มอนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("อนุมัติ"); });
    document.getElementById("ปุ่มไม่อนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("ไม่อนุมัติ"); });
  }

  // ปุ่มลบ กดได้เฉพาะเจ้าของใบเอง และใบต้องยังรอพิจารณาเท่านั้น (หัวข้อ 2, 6)
  var เป็นเจ้าของใบ = ผู้ใช้ปัจจุบัน && ใบ.requesterId === ผู้ใช้ปัจจุบัน.uid;
  if (ใบ.status === "รอพิจารณา" && เป็นเจ้าของใบ) {
    กล่องปุ่มลบ.classList.remove("hidden");
  } else {
    กล่องปุ่มลบ.classList.add("hidden");
  }
}

// ── เปลี่ยนสถานะจริงใน Firestore ──
async function เปลี่ยนสถานะ(สถานะใหม่) {
  // ใบที่พิจารณาแล้ว (อนุมัติ/ไม่อนุมัติ) เปลี่ยนต่อไม่ได้ — กันไว้อีกชั้นแม้ปุ่มจะไม่โผล่อยู่แล้ว
  if (ใบ.status !== "รอพิจารณา") return;

  // กฎ: จะไม่อนุมัติได้ ต้องมีความเห็นอย่างน้อย 1 รายการจริงในฐานข้อมูลก่อน
  if (สถานะใหม่ === "ไม่อนุมัติ" && ความเห็น.length === 0) {
    alert("ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้");
    return;
  }

  // แก้เฉพาะช่อง status เท่านั้น ห้ามเขียนทับช่องอื่นในไฟล์เดิม
  await updateDoc(doc(db, "leaveRequests", รหัสใบลา), { status: สถานะใหม่ });

  await โหลดใบลา();
  วาดใบลา();
}

// ── รายการความเห็น เรียงจากเก่าไปใหม่ ──
function วาดความเห็น() {
  var ที่วาง = document.getElementById("รายการความเห็น");
  if (ความเห็น.length === 0) {
    ที่วาง.innerHTML = "<p>ยังไม่มีความเห็นในใบนี้</p>";
    return;
  }
  ที่วาง.innerHTML = ความเห็น
    .map(function (c) {
      return '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
             "</div><div>" + esc(c.message) + "</div></div>";
    }).join("");
}

// ── ส่งความเห็นใหม่ ──
async function ส่งความเห็น() {
  var ช่อง = document.getElementById("ข้อความความเห็น");
  var เตือน = document.getElementById("เตือนความเห็น");
  var ข้อความ = ช่อง.value.trim();

  if (!ข้อความ) {
    เตือน.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
    เตือน.classList.remove("hidden");
    return;
  }
  เตือน.classList.add("hidden");

  var ผู้ใช้ = await getCurrentUser();

  await addDoc(collection(db, "leaveRequests", รหัสใบลา, "approvals"), {
    authorId: ผู้ใช้.uid,
    authorName: ผู้ใช้.displayName,
    message: ข้อความ,
    createdAt: เวลาตอนนี้()
  });

  ช่อง.value = "";
  await โหลดความเห็น();
  วาดความเห็น();
}

// ── ลบใบลา (เฉพาะตอนสถานะยังรอพิจารณา) ──
async function ลบใบลา() {
  if (ใบ.status !== "รอพิจารณา") return;

  var ยืนยัน = confirm("ยืนยันลบใบขอลานี้หรือไม่? การลบไม่สามารถย้อนกลับได้");
  if (!ยืนยัน) return;

  await deleteDoc(doc(db, "leaveRequests", รหัสใบลา));
  location.href = "leave-requests.html";
}
