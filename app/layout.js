import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "প্রশ্ন — EdTech Platform",
  description: "প্রশ্ন ব্যাংক, প্যাকেজ ও OMR শিট ব্যবস্থাপনা প্ল্যাটফর্ম",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className="h-full">
      <body className="min-h-full bg-neutral-50 text-neutral-800 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
