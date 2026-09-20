// ─────────────────────────────────────────────────────────────
// js/leave-types.js — หน้าที่ 4 จัดการประเภทการลา (Firestore)
// เพิ่ม แก้ ลบ ประเภทการลาโดยบันทึกจริงลงใน Firestore
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

(async function () {
  const ที่วางตาราง = document.getElementById("ตารางประเภท");
  const ช่องชื่อใหม่ = document.getElementById("ชื่อประเภทใหม่");
  const กล่องเตือน = document.getElementById("เตือนประเภท");
  const ปุ่มเพิ่ม = document.getElementById("ปุ่มเพิ่ม");

  // โหลดรายการจาก Firestore เป็นครั้งแรก
  await โหลดและวาด();

  // ตั้งการทำงานของปุ่มเพิ่ม
  ปุ่มเพิ่ม.addEventListener("click", เพิ่มประเภท);

  async function โหลดและวาด() {
    try {
      const snapshot = await getDocs(collection(db, "leaveTypes"));
      const รายการ = [];
      snapshot.forEach((docSnapshot) => {
        รายการ.push({
          id: docSnapshot.id,
          name: docSnapshot.data().name
        });
      });

      วาดตาราง(รายการ);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดประเภทการลา:", error);
      ที่วางตาราง.innerHTML = "<p style='color: red;'>⚠️ ไม่สามารถโหลดข้อมูลได้ ลองรีเฟรชหน้า</p>";
    }
  }

  function วาดตาราง(รายการ) {
    if (รายการ.length === 0) {
      ที่วางตาราง.innerHTML = "<p>ยังไม่มีประเภทการลาในระบบ</p>";
      return;
    }

    let html = "<table><thead><tr><th>ชื่อประเภทการลา</th><th>จัดการ</th></tr></thead><tbody>";
    รายการ.forEach(function (ประเภท) {
      html +=
        "<tr><td>" + esc(ประเภท.name) + "</td><td>" +
        '<button type="button" class="btn-ghost" data-edit="' + esc(ประเภท.id) + '">แก้ไข</button> ' +
        '<button type="button" class="btn-danger" data-del="' + esc(ประเภท.id) + '">ลบ</button>' +
        "</td></tr>";
    });
    html += "</tbody></table>";
    ที่วางตาราง.innerHTML = html;

    // เอา event listener ไปติดกับปุ่มแก้และลบในตาราง
    ที่วางตาราง.querySelectorAll("[data-edit]").forEach(function (ปุ่ม) {
      ปุ่ม.addEventListener("click", function () { แก้ประเภท(ปุ่ม.dataset.edit); });
    });
    ที่วางตาราง.querySelectorAll("[data-del]").forEach(function (ปุ่ม) {
      ปุ่ม.addEventListener("click", function () { ลบประเภท(ปุ่ม.dataset.del); });
    });
  }

  async function เพิ่มประเภท() {
    const ชื่อ = ช่องชื่อใหม่.value.trim();
    if (!ชื่อ) {
      กล่องเตือน.textContent = "⚠️ พิมพ์ชื่อประเภทการลาก่อน จึงจะเพิ่มได้";
      กล่องเตือน.classList.remove("hidden");
      return;
    }

    try {
      // ปิดข้อความเตือนเมื่อเพิ่มสำเร็จ
      กล่องเตือน.classList.add("hidden");

      // เพิ่มประเภทใหม่ลง Firestore
      await addDoc(collection(db, "leaveTypes"), { name: ชื่อ });

      // ล้างช่องกรอก
      ช่องชื่อใหม่.value = "";

      // โหลดรายการใหม่และวาดตารางใหม่
      await โหลดและวาด();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่มประเภท:", error);
      กล่องเตือน.textContent = "⚠️ ไม่สามารถเพิ่มประเภท ลองใหม่";
      กล่องเตือน.classList.remove("hidden");
    }
  }

  async function แก้ประเภท(id) {
    try {
      // ดึงข้อมูลประเภทปัจจุบันจาก Firestore
      const snapshot = await getDocs(collection(db, "leaveTypes"));
      let ประเภท = null;
      snapshot.forEach((docSnapshot) => {
        if (docSnapshot.id === id) {
          ประเภท = { id: docSnapshot.id, name: docSnapshot.data().name };
        }
      });

      if (!ประเภท) {
        alert("ไม่พบประเภทการลานี้");
        return;
      }

      // ถามชื่อใหม่
      const ชื่อใหม่ = prompt("แก้ชื่อประเภทการลา", ประเภท.name);
      if (ชื่อใหม่ === null) return; // ยกเลิก

      if (!ชื่อใหม่.trim()) {
        alert("ชื่อประเภทการลาว่างเปล่าไม่ได้");
        return;
      }

      // อัปเดต Firestore
      await updateDoc(doc(db, "leaveTypes", id), { name: ชื่อใหม่.trim() });

      // โหลดรายการใหม่และวาดตารางใหม่
      await โหลดและวาด();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ประเภท:", error);
      alert("⚠️ ไม่สามารถแก้ประเภท");
    }
  }

  async function ลบประเภท(id) {
    try {
      // ดึงข้อมูลประเภทปัจจุบันเพื่อแสดงชื่อในหน้าต่างยืนยัน
      const snapshot = await getDocs(collection(db, "leaveTypes"));
      let ประเภท = null;
      snapshot.forEach((docSnapshot) => {
        if (docSnapshot.id === id) {
          ประเภท = { id: docSnapshot.id, name: docSnapshot.data().name };
        }
      });

      if (!ประเภท) {
        alert("ไม่พบประเภทการลานี้");
        return;
      }

      // ถามยืนยัน
      if (!confirm('ยืนยันการลบประเภท "' + ประเภท.name + '" หรือไม่')) return;

      // ลบจาก Firestore
      await deleteDoc(doc(db, "leaveTypes", id));

      // โหลดรายการใหม่และวาดตารางใหม่
      await โหลดและวาด();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบประเภท:", error);
      alert("⚠️ ไม่สามารถลบประเภท");
    }
  }
})();
