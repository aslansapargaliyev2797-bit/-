"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        Не удалось загрузить данные
      </h2>
      <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
        {error.message || "Проверьте, что таблица доступна по ссылке."}
      </p>
      <button
        onClick={reset}
        className="mt-2 px-4 py-2 rounded-full text-sm text-white"
        style={{ background: "var(--series-1)" }}
      >
        Попробовать снова
      </button>
    </div>
  );
}
