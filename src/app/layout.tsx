import "./globals.css";

export const metadata = {
  title: "Farmacia Luna CRM",
  description: "CRM para Farmacia Luna",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body className="bg-gray-50 text-gray-800 antialiased">{children}</body>
    </html>
  );
}
