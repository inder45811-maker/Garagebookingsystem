
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "BayFlow - Garage Management System",
  description: "Modern job management for independent garages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
