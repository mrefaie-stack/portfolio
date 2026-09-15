/**
 * طبقة التأثيرات البصرية خلف محتوى الموقع:
 * هالات لونية كبيرة + أشكال فيكتور تطفو وتدور ببطء + شبكة نقاط خفيفة.
 * كلها CSS خالص (بلا JavaScript)، وتتوقف الحركة لمن يفعّل "تقليل الحركة" في نظامه.
 */
export function BackgroundFX() {
  return (
    <div className="bg-fx" aria-hidden>
      <span className="bg-fx-blob bg-fx-blob-1" />
      <span className="bg-fx-blob bg-fx-blob-2" />
      <span className="bg-fx-blob bg-fx-blob-3" />

      <div className="bg-fx-vectors">
        {/* حلقة */}
        <svg className="vec vec-1" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.4" />
        </svg>

        {/* حلقة متقطّعة تدور */}
        <svg className="vec vec-2" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.6" strokeDasharray="7 9" strokeLinecap="round" />
        </svg>

        {/* مربع بحواف دائرية */}
        <svg className="vec vec-3" viewBox="0 0 100 100" fill="none">
          <rect x="7" y="7" width="86" height="86" rx="22" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* مثلث */}
        <svg className="vec vec-4" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 L90 86 L10 86 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>

        {/* علامة زائد */}
        <svg className="vec vec-5" viewBox="0 0 100 100" fill="none">
          <path d="M50 16 V84 M16 50 H84" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>

        {/* ثلاث نقاط */}
        <svg className="vec vec-6" viewBox="0 0 100 100">
          <circle cx="20" cy="50" r="7" fill="currentColor" />
          <circle cx="50" cy="50" r="7" fill="currentColor" />
          <circle cx="80" cy="50" r="7" fill="currentColor" />
        </svg>

        {/* قوس */}
        <svg className="vec vec-7" viewBox="0 0 100 100" fill="none">
          <path d="M8 92 A84 84 0 0 1 92 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>

        {/* حلقتان متداخلتان */}
        <svg className="vec vec-8" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth="1.3" />
        </svg>

        {/* خط متعرّج */}
        <svg className="vec vec-9" viewBox="0 0 100 100" fill="none">
          <path d="M6 64 L31 34 L56 64 L81 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <span className="bg-fx-dots" />
    </div>
  );
}
