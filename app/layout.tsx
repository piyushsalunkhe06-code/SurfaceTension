import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "DeepSea Guardian — Protecting Earth's Oceans",
  description: "Explore, understand, and protect the world's oceans through immersive 3D visualization and real-time environmental data.",
  keywords: ["ocean conservation", "marine biology", "ocean health", "coral reef", "marine life", "environmental monitoring"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-abyss text-pearl antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
