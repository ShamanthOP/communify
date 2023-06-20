import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/Toaster";
import React from "react";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Communify",
    description:
        "Join, engage, and collaborate with like-minded individuals in diverse communities.",
};

export default function RootLayout({
    children,
    authModal,
}: {
    children: React.ReactNode;
    authModal: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={cn(
                "bg-white text-slate-900 antialiased light",
                inter.className
            )}
        >
            <body className="min-h-screen pt-12 bg-slate-50 antialiased">
                <Providers>
                    <NavBar />

                    {authModal}

                    <div className="container max-w-7xl mx-auto h-full pt-12">
                        {children}
                    </div>

                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
