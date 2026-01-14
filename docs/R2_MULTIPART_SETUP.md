# إعداد Cloudflare R2 للرفع المجزأ (Multipart Upload)

## المتطلبات

لتفعيل رفع الملفات الكبيرة، تحتاج إلى إضافة المتغيرات التالية في ملف `.env`:

```env
# متغيرات R2 الأساسية (موجودة مسبقاً)
R2_ACCOUNT_ID=your_account_id
R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_API_TOKEN=your_api_token
R2_PUBLIC_DOMAIN=your_public_domain

# متغيرات S3 API (مطلوبة للرفع المجزأ)
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
```

## كيفية الحصول على Access Key و Secret Key من R2

1. اذهب إلى [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. اختر **R2** من القائمة الجانبية
3. اضغط على **Manage R2 API Tokens**
4. اضغط على **Create API Token**
5. اختر الصلاحيات:
   - **Object Read & Write** للـ Bucket المحدد
   - أو **Admin Read & Write** لجميع الـ Buckets
6. اضغط **Create API Token**
7. انسخ **Access Key ID** و **Secret Access Key**

> ⚠️ **مهم**: هذه المفاتيح مختلفة عن `CLOUDFLARE_API_TOKEN`!
>
> - `CLOUDFLARE_API_TOKEN`: يستخدم للـ REST API (للملفات الصغيرة < 100MB)
> - `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY`: يستخدمان للـ S3 API (للملفات الكبيرة حتى 5TB)

## كيف يعمل النظام

### للملفات الصغيرة (< 50MB):

- يستخدم الرفع العادي عبر `/api/upload/r2`
- يعتمد على `CLOUDFLARE_API_TOKEN`

### للملفات الكبيرة (> 50MB):

- يستخدم الرفع المجزأ عبر `/api/upload/multipart`
- يقسم الملف لأجزاء 10MB لكل جزء
- يرفع كل جزء على حدة مع تتبع التقدم
- يعتمد على `R2_ACCESS_KEY_ID` و `R2_SECRET_ACCESS_KEY`

## الحدود

| الطريقة           | الحد الأقصى |
| ----------------- | ----------- |
| REST API (العادي) | 100MB       |
| S3 API (المجزأ)   | 5TB         |

## استخدام الكومبوننت

```tsx
import LargeFileUpload from "@/components/upload/LargeFileUpload";

<LargeFileUpload
  accept="video/*,image/*"
  maxSizeMB={2048} // 2GB
  onUploadComplete={(url) => {
    console.log("تم الرفع:", url);
  }}
  onUploadError={(error) => {
    console.error("خطأ:", error);
  }}
/>;
```

## أو استخدام الدالة مباشرة

```tsx
import { uploadFile } from "@/lib/multipart-upload";

// تختار تلقائياً بين الرفع العادي والمجزأ
const url = await uploadFile(file, (progress) => {
  console.log(`${progress}%`);
});
```
