// นำ Web App URL ที่ได้จาก Google Apps Script มาวางในเครื่องหมายคำพูดด้านล่างนี้ครับ
export const GAS_URL = "https://script.google.com/macros/s/AKfycbwseSsbiGGuweKdpYMQQv78nGxSwp8FVmUr-v193DJc-xxqd3VzMBnvk0krEHdqmJzt/exec";

export const api = {
  get: async (action) => {
    if (!GAS_URL) throw new Error("ยังไม่ได้ตั้งค่า GAS_URL");
    const response = await fetch(`${GAS_URL}?action=${action}`);
    return await response.json();
  },
  
  post: async (action, payload) => {
    if (!GAS_URL) throw new Error("ยังไม่ได้ตั้งค่า GAS_URL");
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, payload }),
      // ใช้ text/plain เพื่อเลี่ยงปัญหา CORS preflight กับ Google Apps Script
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    return await response.json();
  }
};
