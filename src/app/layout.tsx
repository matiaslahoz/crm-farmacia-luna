import "./globals.css";

export const metadata = {
  title: "CRM Chatbot",
  description: "Mini CRM para conversaciones del chatbot",
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
