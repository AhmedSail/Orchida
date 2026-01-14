# شرح نظام رفع الملفات الكبيرة

## الفرق بين Presigned URL و Public URL

### 1. Presigned URL (رابط مؤقت للرفع فقط)

- **الغرض**: السماح للمتصفح برفع الملف مباشرة إلى R2
- **المدة**: صالح لمدة ساعة واحدة فقط
- **الاستخدام**: يُستخدم مرة واحدة فقط لرفع الملف
- **مثال**: `https://xxx.r2.cloudflarestorage.com/bucket/file.mp4?X-Amz-Signature=...`

### 2. Public URL (رابط دائم للوصول)

- **الغرض**: الوصول الدائم للملف المرفوع
- **المدة**: دائم (لا ينتهي)
- **الاستخدام**: يُحفظ في قاعدة البيانات ويُستخدم لعرض الملف
- **مثال**: `https://your-domain.r2.dev/abc123.mp4`

## كيف يعمل النظام؟

```
1. المستخدم يختار ملف (2GB مثلاً)
   ↓
2. الفرونت إند يطلب presigned URL من السيرفر
   ↓
3. السيرفر يُنشئ:
   - presigned URL (مؤقت للرفع)
   - public URL (دائم للوصول)
   ↓
4. الفرونت إند يرفع الملف مباشرة لـ R2 باستخدام presigned URL
   ↓
5. بعد نجاح الرفع، يحفظ public URL في قاعدة البيانات
   ↓
6. public URL يبقى يشتغل للأبد!
```

## مثال استخدام المكون

```tsx
import LargeFileUpload from "@/components/upload/LargeFileUpload";

function MyPage() {
  const handleUploadComplete = (publicUrl: string) => {
    console.log("الرابط الدائم:", publicUrl);
    // احفظ publicUrl في قاعدة البيانات
    // هذا الرابط دائم ولن ينتهي
  };

  return (
    <LargeFileUpload
      onUploadComplete={handleUploadComplete}
      maxSizeMB={2048} // 2GB
      accept="video/*"
    />
  );
}
```

## المميزات

✅ رفع ملفات حتى 2GB
✅ progress bar يعرض نسبة الرفع
✅ رفع مباشر من المتصفح لـ R2 (أسرع)
✅ لا يمر عبر السيرفر (يوفر موارد)
✅ الرابط النهائي دائم ومستقر
✅ يدعم الفيديوهات والصور

## ملاحظات مهمة

⚠️ الـ presigned URL ينتهي بعد ساعة، لكن هذا طبيعي لأنه للرفع فقط
✅ الـ public URL اللي بترجع هو الدائم وهو اللي بتحفظه
✅ بعد الرفع، الملف يبقى على R2 للأبد والرابط يشتغل للأبد
