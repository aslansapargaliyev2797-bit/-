import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Скрининг здоровья сотрудников — статистика",
  description:
    "Инфографика по результатам анкетирования сердечно-сосудистого риска: общая статистика, по филиалам, по подразделениям и в комбинированном виде.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer
          className="text-xs text-center py-6"
          style={{ color: "var(--text-muted)" }}
        >
          Данные обновляются автоматически из Google Таблицы · только
          агрегированная статистика, без персональных данных
        </footer>
      </body>
    </html>
  );
}
