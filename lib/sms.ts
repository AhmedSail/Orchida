export async function sendSMS({
  mobile,
  text,
}: {
  mobile: string;
  text: string;
}) {
  const apiToken = process.env.HOT_SMS_TOKEN || "";
  const sender = process.env.HOT_SMS_SENDER || "SMS";

  // Format mobile number: replace leading 0 with 970
  let formattedMobile = mobile.replace(/\s+/g, "").replace("+", "");
  if (formattedMobile.startsWith("05") && formattedMobile.length === 10) {
    formattedMobile = "970" + formattedMobile.substring(1);
  }

  // type=2 for UTF-8 Arabic support, which is often more reliable
  const url = `http://hotsms.ps/sendbulksms.php?api_token=${apiToken}&sender=${sender}&mobile=${formattedMobile}&type=0&msg_id=YES&text=${encodeURIComponent(
    text
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.text();

    if (data.includes("1001")) {
      console.log("✅ SMS sent successfully:", data);
      return { success: true, data };
    } else {
      const errorMap: Record<string, string> = {
        "1000": "لا يوجد رصيد كافي",
        "2000": "خطأ في عملية التفويض (API Token غير صحيح)",
        "3000": "خطأ في نوع المسج",
        "4000": "أحد المدخلات المطلوبة غير موجود",
        "5000": "رقم المحمول غير مدعوم",
        "6000": "اسم المرسل غير معرف على حسابك",
        "10000": "هذا الأيبي غير مفوض للارسال",
        "15000": "خاصية الـ API غير مفعلة في حسابك",
      };

      const errorDesc = errorMap[data.trim()] || "خطأ غير معروف";
      console.error(`❌ SMS failed (Code ${data}): ${errorDesc}`);
      return { success: false, error: data, description: errorDesc };
    }
  } catch (err) {
    console.error("❌ Error sending SMS:", err);
    return { success: false, error: err };
  }
}
