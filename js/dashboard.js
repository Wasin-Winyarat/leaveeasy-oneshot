// ─────────────────────────────────────────────────────────────
// js/dashboard.js — หน้าที่ 5 แดชบอร์ดสรุป
// Module 2: เป็นโครงหน้าจาก prototype เท่านั้น ใช้ข้อมูลตัวอย่างจาก js/data.js
// การนับจากฐานข้อมูลจริงเป็นงานสัปดาห์ที่ 7 (ดูสเปกหัวข้อ 4 หน้าที่ 5)
// ─────────────────────────────────────────────────────────────

(function () {
  var ใบลาทั้งหมด = window.LEAVE_DATA.leaveRequests;
  var สถานะทั้งหมด = ["รอพิจารณา", "อนุมัติ", "ไม่อนุมัติ"];

  // ── กล่องตัวเลข 3 กล่องตามสถานะ กดแล้วไปหน้ารายการพร้อมกรองสถานะนั้น ──
  var กล่องสถิติ = document.getElementById("กล่องสถิติ");
  กล่องสถิติ.innerHTML = สถานะทั้งหมด.map(function (สถานะ) {
    var จำนวน = ใบลาทั้งหมด.filter(function (ใบ) { return ใบ.status === สถานะ; }).length;
    return (
      '<a class="stat" href="leave-requests.html?status=' + encodeURIComponent(สถานะ) + '">' +
      '<div class="number">' + จำนวน + "</div>" +
      "<div>" + esc(สถานะ) + "</div>" +
      "</a>"
    );
  }).join("");

  // ── รายการใบลา 5 รายการล่าสุด เรียงจากยื่นล่าสุดไปเก่าสุด ──
  var กล่องล่าสุด = document.getElementById("กล่องล่าสุด");
  var ล่าสุด5ใบ = ใบลาทั้งหมด.slice()
    .sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; })
    .slice(0, 5);

  if (ล่าสุด5ใบ.length === 0) {
    กล่องล่าสุด.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
    return;
  }

  var html =
    "<table><thead><tr>" +
    "<th>หัวข้อ</th>" +
    "<th>ประเภทการลา</th>" +
    "<th>สถานะ</th>" +
    '<th class="hide-mobile">ผู้ขอลา</th>' +
    '<th class="hide-mobile">วันที่ยื่น</th>' +
    "</tr></thead><tbody>";

  ล่าสุด5ใบ.forEach(function (ใบ) {
    html +=
      "<tr>" +
      "<td>" + esc(ใบ.title) + "</td>" +
      "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
      "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
      '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
      '<td class="hide-mobile">' + esc(ใบ.createdAt) + "</td>" +
      "</tr>";
  });

  html += "</tbody></table>";
  กล่องล่าสุด.innerHTML = html;
})();
