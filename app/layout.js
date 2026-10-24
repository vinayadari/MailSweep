import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata = {
  title: "MailSweep — Clean Your Inbox & Bulk Unsubscribe",
  description:
    "Connect Gmail securely, detect unwanted newsletters automatically, and 1-click unsubscribe in bulk with MailSweep.",
  referrer: "no-referrer-when-downgrade",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#07080c" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
