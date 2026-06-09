// هذا الملف مطلوب فقط ليقوم Expo بتحميل الـ plugin.
// المنطق الحقيقي موجود في الـ Native module (GooglePlayBillingModule.kt)
module.exports = function withGooglePlayBilling(config) {
  // لا تعديلات على config، فقط نعيده كما هو
  return config;
};
