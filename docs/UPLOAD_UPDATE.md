# تحديثات الرفع (Upload)

تم تحديث نظام الرفع في الموقع بالكامل ليدعم:

1. **الرفع المجزأ (Multipart Upload)**: يسمح برفع ملفات بحجم يصل إلى 5 تيرا بايت.
2. **شريط التقدم (Progress Bar)**: يظهر نسبة التقدم الحقيقية للرفع.

## المكونات المحدثة

جميع المكونات التالية تستخدم الآن النظام الجديد تلقائياً:

### 1. `SingleUploader`

المكون القياسي لرفع ملف واحد (صور، فيديو، إلخ).

- **الموقع**: `components/SingleUploader.tsx`
- **الميزات**: شريط تقدم، دعم الإلغاء، دعم الملفات الكبيرة تلقائياً.

### 2. `MultiUploader`

المكون المخصص لرفع ملفات متعددة.

- **الموقع**: `components/MultiUploader.tsx`
- **الميزات**: شريط تقدم لكل ملف على حدة، رفع متوازي (Parallel Upload).

### 3. `LargeFileUpload` (جديد)

مكون جديد مخصص للحالات التي تحتاج فيها واجهة رفع كبيرة وواضحة جداً وتفاصيل دقيقة عن التقدم.

- **الموقع**: `components/upload/LargeFileUpload.tsx`
- **الميزات**:
  - منطقة سحب وإفلات كبيرة.
  - تفاصيل دقيقة عن حجم الملف والسرعة.
  - زر واضح لإلغاء الرفع.
  - رسائل حالة (نجاح/فشل) واضحة.

## كيفية الاستخدام

لا تحتاج لتغيير طريقة استخدامك للمكونات الحالية (`SingleUploader` أو `MultiUploader`)، التحديث تم داخلياً!

إذا أردت استخدام المكون الجديد `LargeFileUpload`:

```tsx
import LargeFileUpload from "@/components/upload/LargeFileUpload";

export default function MyPage() {
  return (
    <div className="p-4">
      <LargeFileUpload
        maxSizeMB={5000} // 5GB حد أقصى
        onUploadComplete={(url) => {
          console.log("تم الرفع:", url);
          // قم بحفظ الرابط في قاعدة البيانات هنا
        }}
        onUploadError={(msg) => alert(msg)}
      />
    </div>
  );
}
```
