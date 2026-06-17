import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zelian",
  description: "Projet initialisé avec le template zelian-starter du framework Zelian"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
