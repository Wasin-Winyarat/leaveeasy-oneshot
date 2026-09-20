// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่ (สัปดาห์ที่ 7)
// บันทึกลงฐานข้อมูล Firestore จริง
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase-config.js";
import { getCurrentUser } from "./auth-helpers.js";
import { OPENROUTER_API_KEY, OPENROUTER_MODEL } from "./config.js";
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

(async function () {
  var ฟอร์ม = document.getElementById("ฟอร์มใบลา");
  var ช่องประเภท = document.getElementById("leaveTypeId");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่มAI = document.getElementById("ปุ่มAI");
  var ป้ายAI = document.getElementById("ป้ายAI");
  var ข้อความAI = document.getElementById("ข้อความAI");
  var ข้อความปุ่มAIปกติ = ปุ่มAI.textContent;

  // โหลดประเภทการลาจาก Firestore
  var แมพประเภท = {}; // เก็บ id → name เพื่อค้นหาชื่อเร็ว
  try {
    var ลิสต์ประเภท = await getDocs(collection(db, "leaveTypes"));
    ลิสต์ประเภท.forEach(function (เอกสาร) {
      var ประเภท = เอกสาร.data();
      var id = เอกสาร.id;
      แมพประเภท[id] = ประเภท.name;

      // เติมตัวเลือก
      var ตัวเลือก = document.createElement("option");
      ตัวเลือก.value = id;
      ตัวเลือก.textContent = ประเภท.name;
      ช่องประเภท.appendChild(ตัวเลือก);
    });
  } catch (error) {
    console.error("ไม่สามารถโหลดประเภทการลา:", error);
    เตือน("ไม่สามารถโหลดข้อมูลประเภทการลา");
  }

  // ปุ่มให้ AI ช่วยจัดประเภทการลา (US-09)
  ปุ่มAI.addEventListener("click", async function () {
    var เหตุผล = document.getElementById("reason").value.trim();
    var รายชื่อประเภท = Object.values(แมพประเภท);

    // ซ่อนผลลัพธ์เก่าก่อนเริ่มรอบใหม่
    ป้ายAI.classList.add("hidden");
    ข้อความAI.classList.add("hidden");
    ข้อความAI.textContent = "";

    if (!เหตุผล) {
      แจ้งAI("กรอกเหตุผลการลาก่อน แล้วค่อยให้ AI ช่วยจัดประเภท");
      return;
    }
    if (รายชื่อประเภท.length === 0) {
      แจ้งAI("ยังไม่มีประเภทการลาในระบบให้ AI เลือก");
      return;
    }

    // ระหว่างรอ: ปุ่มกดซ้ำไม่ได้ และเปลี่ยนข้อความ
    ปุ่มAI.disabled = true;
    ปุ่มAI.textContent = "กำลังจัดประเภท...";

    var ตัวควบคุม = new AbortController();
    var หมดเวลา = setTimeout(function () { ตัวควบคุม.abort(); }, 15000);

    try {
      var คำสั่ง =
        "คุณเป็นผู้ช่วยจัดประเภทการลาให้ระบบขอลาออนไลน์ " +
        "นี่คือประเภทการลาที่มีอยู่จริงในระบบเท่านั้น: " + รายชื่อประเภท.join(", ") + ". " +
        "อ่านเหตุผลการลาต่อไปนี้แล้วเลือกประเภทที่ตรงที่สุดจากรายชื่อด้านบน " +
        "ตอบกลับมาเป็นชื่อประเภทเป๊ะ ๆ ตัวเดียวจากรายชื่อเท่านั้น ห้ามมีคำอธิบายหรือข้อความอื่นปนมา\n\n" +
        "เหตุผลการลา: " + เหตุผล;

      var คำตอบ = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + OPENROUTER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [{ role: "user", content: คำสั่ง }]
        }),
        signal: ตัวควบคุม.signal
      });

      if (!คำตอบ.ok) {
        throw new Error("OpenRouter ตอบกลับผิดพลาด: " + คำตอบ.status);
      }

      var ข้อมูล = await คำตอบ.json();
      var ข้อความตอบ = (ข้อมูล.choices && ข้อมูล.choices[0] && ข้อมูล.choices[0].message &&
        ข้อมูล.choices[0].message.content || "").trim();
      // ตัดเครื่องหมายคำพูดที่ AI อาจใส่มาเกิน แล้วค่อยเทียบเป๊ะ ๆ
      ข้อความตอบ = ข้อความตอบ.replace(/^["'“”]+|["'“”]+$/g, "").trim();

      // หา id ของประเภทที่ชื่อ "ตรงเป๊ะ" กับที่ AI ตอบมา
      var idที่ตรง = Object.keys(แมพประเภท).find(function (id) {
        return แมพประเภท[id] === ข้อความตอบ;
      });

      if (idที่ตรง) {
        ช่องประเภท.value = idที่ตรง;
        ป้ายAI.classList.remove("hidden");
      } else {
        แจ้งAI("AI จัดประเภทให้ไม่ได้ ลองเลือกเองได้เลย");
      }
    } catch (error) {
      console.error("เรียก AI จัดประเภทการลาไม่สำเร็จ:", error);
      แจ้งAI("AI จัดประเภทให้ไม่ได้ ลองเลือกเองได้เลย");
    } finally {
      clearTimeout(หมดเวลา);
      ปุ่มAI.disabled = false;
      ปุ่มAI.textContent = ข้อความปุ่มAIปกติ;
    }
  });

  function แจ้งAI(ข้อความ) {
    ข้อความAI.textContent = "⚠️ " + ข้อความ;
    ข้อความAI.classList.remove("hidden");
  }

  ฟอร์ม.addEventListener("submit", async function (e) {
    e.preventDefault();

    var ค่า = {
      title: document.getElementById("title").value.trim(),
      reason: document.getElementById("reason").value.trim(),
      leaveTypeId: ช่องประเภท.value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value
    };

    // ตรวจว่ากรอกครบก่อนบันทึก
    if (!ค่า.title || !ค่า.reason || !ค่า.leaveTypeId || !ค่า.startDate || !ค่า.endDate) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดบันทึก");
      return;
    }
    if (ค่า.endDate < ค่า.startDate) {
      เตือน("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มลา");
      return;
    }

    // เอาข้อมูลผู้ใช้ที่ล็อกอินอยู่
    var ผู้ใช้ = await getCurrentUser();
    if (!ผู้ใช้) {
      เตือน("ไม่สามารถดึงข้อมูลผู้ใช้ได้ — กรุณาล็อกอินใหม่");
      return;
    }

    // เตรียมเอกสารใหม่
    var ใบใหม่ = {
      title: ค่า.title,
      reason: ค่า.reason,
      status: "รอพิจารณา", // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
      requesterId: ผู้ใช้.uid,
      requesterName: ผู้ใช้.displayName,
      approverId: "",
      approverName: "",
      leaveTypeId: ค่า.leaveTypeId,
      leaveTypeName: แมพประเภท[ค่า.leaveTypeId],
      startDate: ค่า.startDate,
      endDate: ค่า.endDate,
      createdAt: เวลาตอนนี้()
    };

    // เขียนลง Firestore
    try {
      await addDoc(collection(db, "leaveRequests"), ใบใหม่);
      // บันทึกสำเร็จ กลับหน้ารายการ
      location.href = "leave-requests.html";
    } catch (error) {
      console.error("ไม่สามารถบันทึกใบลา:", error);
      เตือน("บันทึกไม่สำเร็จ — ลองใหม่อีกครั้ง");
    }
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();
