import { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./login.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caserito",
  description: "App para que el gate lleve más fácil los números del case.",
};

export default async function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className={GeistSans.className}>
      <head>
        <meta
          name="description"
          content="Aplicación WEB para negocios que brindan servicios de estética vehicular. Gestionar y conocer los números de tu emprendimiento NUNCA fue tan sencillo."
        />

        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/icon.png"></link>
        <link rel="icon" type="image/png" href="/icon.png"></link>
        <meta name="msapplication-TileImage" content="/icon.png"></meta>
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:title" content="Aquapp" />
        <meta
          property="og:description"
          content="El Software de gestión ideal para negocios de lavado, reparación y detailing vehicular."
        />
        <meta property="og:image" content="https://www.aquapp.lat/banner.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:url" content="https://aquapp.lat" />
        <meta property="og:type" content="website" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Aquapp" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:description"
          content="Gestioná tu negocio de lavado,reparación o detailing como nunca antes."
        />
        <meta name="twitter:image" content="https://aquapp.lat/banner.jpg" />
      </head>
      {children}
    </html>
  );
}
