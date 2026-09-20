// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างตามหัวข้อ 7 ของสเปกลง Firestore จริง
// ใช้ setDoc กับรหัสเอกสารคงที่ (u001, lt001, lr001, ap001, ...)
// กดปุ่มซ้ำได้ ข้อมูลจะถูกเขียนทับด้วยชุดเดิม ไม่เกิดข้อมูลซ้ำ
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// 📁 users — ผู้ใช้ 3 คน 3 บทบาท
var ผู้ใช้ = [
  { id: "u001", name: "สมชาย ใจดี",   email: "somchai@example.com", role: "employee" },
  { id: "u002", name: "สมหญิง รักงาน", email: "somying@example.com", role: "manager" },
  { id: "u003", name: "สมศรี ตั้งใจ",  email: "somsri@example.com",  role: "hr" }
];

// 📁 leaveTypes — ประเภทการลา 3 แบบ
var ประเภทการลา = [
  { id: "lt001", name: "ลาพักร้อน" },
  { id: "lt002", name: "ลาป่วย" },
  { id: "lt003", name: "ลากิจ" }
];

// 📁 leaveRequests — ใบขอลา 5 ใบ · สถานะกระจายครบทั้ง 3 ค่า
var ใบลา = [
  {
    id: "lr001",
    title: "ลาพักร้อนไปเที่ยวกับครอบครัว",
    reason: "วางแผนเดินทางไปต่างจังหวัดกับครอบครัว จองที่พักไว้ล่วงหน้าแล้ว",
    status: "รอพิจารณา",
    requesterId: "u001", requesterName: "สมชาย ใจดี",
    approverId: "u002",  approverName: "สมหญิง รักงาน",
    leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
    startDate: "2026-09-07", endDate: "2026-09-09",
    createdAt: "2026-09-01 09:15"
  },
  {
    id: "lr002",
    title: "ลาป่วยไข้หวัดใหญ่",
    reason: "มีไข้สูงและไอมาก แพทย์แนะนำให้พักอยู่บ้าน 2 วัน",
    status: "อนุมัติ",
    requesterId: "u001", requesterName: "สมชาย ใจดี",
    approverId: "u002",  approverName: "สมหญิง รักงาน",
    leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
    startDate: "2026-08-24", endDate: "2026-08-25",
    createdAt: "2026-08-24 08:05"
  },
  {
    id: "lr003",
    title: "ลากิจไปทำบัตรประชาชน",
    reason: "บัตรประชาชนหมดอายุ ต้องไปทำที่สำนักงานเขตในวันทำการ",
    status: "รอพิจารณา",
    requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
    approverId: "",      approverName: "",
    leaveTypeId: "lt003", leaveTypeName: "ลากิจ",
    startDate: "2026-09-15", endDate: "2026-09-15",
    createdAt: "2026-09-10 16:30"
  },
  {
    id: "lr004",
    title: "ลาพักร้อนช่วงวันหยุดยาว",
    reason: "อยากต่อวันหยุดยาวไปพักผ่อนกับครอบครัวอีก 3 วัน",
    status: "ไม่อนุมัติ",
    requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
    approverId: "u002",  approverName: "สมหญิง รักงาน",
    leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
    startDate: "2026-10-12", endDate: "2026-10-16",
    createdAt: "2026-09-20 11:00"
  },
  {
    id: "lr005",
    title: "ลาป่วยไปพบแพทย์ตามนัด",
    reason: "มีนัดตรวจติดตามอาการกับแพทย์ในช่วงเช้า",
    status: "รอพิจารณา",
    requesterId: "u001", requesterName: "สมชาย ใจดี",
    approverId: "u002",  approverName: "สมหญิง รักงาน",
    leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
    startDate: "2026-09-22", endDate: "2026-09-22",
    createdAt: "2026-09-18 14:45"
  }
];

// 📁 leaveRequests/{id}/approvals — ความเห็นการอนุมัติ (โฟลเดอร์ย่อย)
// lr001 มี 2 รายการ · lr002 มี 1 รายการ · lr004 มี 1 รายการ (บังคับตามกฎ "ไม่อนุมัติต้องมีความเห็นก่อน")
// lr003 และ lr005 ยังไม่มีความเห็น (ตรงกับสถานะรอพิจารณาที่ยังไม่มีใครพิจารณา)
var ความเห็น = [
  {
    requestId: "lr001", id: "ap001",
    authorId: "u002", authorName: "สมหญิง รักงาน",
    message: "รับเรื่องแล้ว ขอดูตารางงานของทีมช่วงนั้นก่อนนะครับ",
    createdAt: "2026-09-01 13:40"
  },
  {
    requestId: "lr001", id: "ap002",
    authorId: "u003", authorName: "สมศรี ตั้งใจ",
    message: "ตรวจแล้ว วันลาพักร้อนคงเหลือครอบคลุมช่วงที่ขอ ไม่ติดขัดฝั่งฝ่ายบุคคล",
    createdAt: "2026-09-02 10:05"
  },
  {
    requestId: "lr002", id: "ap003",
    authorId: "u002", authorName: "สมหญิง รักงาน",
    message: "อนุมัติแล้ว พักผ่อนให้เต็มที่ งานที่ค้างไว้เดี๋ยวทีมช่วยดูให้",
    createdAt: "2026-08-24 09:20"
  },
  {
    requestId: "lr004", id: "ap004",
    authorId: "u002", authorName: "สมหญิง รักงาน",
    message: "ช่วงนั้นทีมมีงานส่งมอบพอดี ขอเลื่อนเป็นสัปดาห์ถัดไปได้ไหมครับ",
    createdAt: "2026-09-20 15:10"
  }
];

async function ใส่ข้อมูลตัวอย่าง() {
  var ปุ่ม = document.getElementById("ปุ่มSeed");
  var สถานะข้อความ = document.getElementById("สถานะข้อความ");

  ปุ่ม.disabled = true;
  สถานะข้อความ.className = "alert alert-warn";
  สถานะข้อความ.textContent = "กำลังใส่ข้อมูลตัวอย่างลง Firestore …";
  สถานะข้อความ.classList.remove("hidden");

  try {
    for (var i = 0; i < ผู้ใช้.length; i++) {
      var u = ผู้ใช้[i];
      await setDoc(doc(db, "users", u.id), { name: u.name, email: u.email, role: u.role });
    }

    for (var j = 0; j < ประเภทการลา.length; j++) {
      var lt = ประเภทการลา[j];
      await setDoc(doc(db, "leaveTypes", lt.id), { name: lt.name });
    }

    for (var k = 0; k < ใบลา.length; k++) {
      var lr = Object.assign({}, ใบลา[k]);
      var รหัสใบลา = lr.id;
      delete lr.id;
      await setDoc(doc(db, "leaveRequests", รหัสใบลา), lr);
    }

    for (var m = 0; m < ความเห็น.length; m++) {
      var ap = Object.assign({}, ความเห็น[m]);
      var รหัสใบลาของความเห็น = ap.requestId;
      var รหัสความเห็น = ap.id;
      delete ap.requestId;
      delete ap.id;
      await setDoc(doc(db, "leaveRequests", รหัสใบลาของความเห็น, "approvals", รหัสความเห็น), ap);
    }

    สถานะข้อความ.className = "alert alert-ok";
    สถานะข้อความ.textContent =
      "✅ ใส่ข้อมูลตัวอย่างสำเร็จ — เปิด Firebase Console เพื่อตรวจสอบได้เลย (กดซ้ำได้ ข้อมูลจะถูกเขียนทับด้วยชุดเดิม ไม่ซ้ำ)";
  } catch (err) {
    console.error(err);
    สถานะข้อความ.className = "alert alert-error";
    สถานะข้อความ.textContent = "❌ ใส่ข้อมูลไม่สำเร็จ: " + err.message;
  } finally {
    ปุ่ม.disabled = false;
  }
}

document.getElementById("ปุ่มSeed").addEventListener("click", ใส่ข้อมูลตัวอย่าง);
