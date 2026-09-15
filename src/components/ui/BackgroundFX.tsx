/**
 * طبقة التأثيرات البصرية خلف محتوى الموقع:
 * هالات لونية كبيرة تتحرك ببطء + شبكة نقاط خفيفة في الأعلى.
 * كلها CSS خالص (بلا JavaScript)، وتتوقف الحركة لمن يفعّل "تقليل الحركة" في نظامه.
 */
export function BackgroundFX() {
  return (
    <div className="bg-fx" aria-hidden>
      <span className="bg-fx-blob bg-fx-blob-1" />
      <span className="bg-fx-blob bg-fx-blob-2" />
      <span className="bg-fx-blob bg-fx-blob-3" />
      <span className="bg-fx-dots" />
    </div>
  );
}
