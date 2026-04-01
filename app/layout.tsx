// app/layout.tsx
// Root layout for the World of Humans frontend.

import type { Metadata } from "next";
import { Cinzel, Fira_Code } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const cinzel = Cinzel({
    variable: "--font-display",
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

const firaCode = Fira_Code({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "500"],
});

export const metadata: Metadata = {
    title: "World of Humans",
    description: "Classic WoW inspired game engine — frontend visualiser",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${cinzel.variable} ${firaCode.variable} h-full`}
        >
        <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}