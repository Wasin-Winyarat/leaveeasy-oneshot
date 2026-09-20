// ─────────────────────────────────────────────────────────────
// js/leave-requests.js — หน้าที่ 1 รายการใบลา
// สัปดาห์ที่ 6: อ่านข้อมูลจริงจาก Firestore (โฟลเดอร์ leaveRequests) — ตัว R ตัวเดียว
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase-config.js";
import { getCurrentUser } from "./auth-helpers.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

(async function () {
  var กล่อง = document.getElementById("ผลลัพธ์");

  // ถ้ามีสถานะติดมาท้าย URL ให้กรองเฉพาะสถานะนั้น (ใช้เมื่อกดมาจากกล่องตัวเลขในหน้าแดชบอร์ด)
  var สถานะที่กรอง = ค่าจากURL("status");
  if (สถานะที่กรอง) {
    document.querySelector(".subtitle").textContent =
      "กำลังแสดงเฉพาะใบลาที่สถานะ " + สถานะที่กรอง + " · กดเมนู รายการใบลา เพื่อดูทั้งหมด";
  }

  var ใบลาทั้งหมด = [];
  try {
    // ผู้ขอลา (employee) เห็นเฉพาะใบของตัวเอง · ผู้อนุมัติ/ฝ่ายบุคคลเห็นทุกใบ
    // ต้องกรองด้วย where ตั้งแต่ตอน query เพราะ Security Rules ปฏิเสธ list ที่ไม่กรองทั้งหมด
    var ผู้ใช้ = await getCurrentUser();
    var คำสั่งค้นหา = (ผู้ใช้ && ผู้ใช้.role === "employee")
      ? query(collection(db, "leaveRequests"), where("requesterId", "==", ผู้ใช้.uid))
      : collection(db, "leaveRequests");

    var ผลลัพธ์ = await getDocs(คำสั่งค้นหา);
    ผลลัพธ์.forEach(function (เอกสาร) {
      ใบลาทั้งหมด.push(Object.assign({ id: เอกสาร.id }, เอกสาร.data()));
    });
  } catch (err) {
    console.error(err);
    กล่อง.innerHTML = "<p>โหลดข้อมูลจาก Firestore ไม่สำเร็จ — ลองรีเฟรชหน้าอีกครั้ง</p>";
    return;
  }

  if (สถานะที่กรอง) {
    ใบลาทั้งหมด = ใบลาทั้งหมด.filter(function (ใบ) { return ใบ.status === สถานะที่กรอง; });
  }

  แสดงตาราง(ใบลาทั้งหมด);

  function แสดงตาราง(รายการ) {
    if (รายการ.length === 0) {
      กล่อง.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
      return;
    }

    var html =
      "<table><thead><tr>" +
      "<th>หัวข้อ</th>" +
      "<th>ประเภทการลา</th>" +
      "<th>สถานะ</th>" +
      '<th class="hide-mobile">ผู้ขอลา</th>' +
      '<th class="hide-mobile">วันที่ลา</th>' +
      "</tr></thead><tbody>";

    รายการ.forEach(function (ใบ) {
      html +=
        '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
        "<td>" + esc(ใบ.title) + "</td>" +
        "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
        "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate) + "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    กล่อง.innerHTML = html;

    // กดที่แถวไหน ไปหน้ารายละเอียดของใบนั้น
    กล่อง.querySelectorAll("tr.clickable").forEach(function (แถว) {
      แถว.addEventListener("click", function () {
        location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
      });
    });
  }
})();
