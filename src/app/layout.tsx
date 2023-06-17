import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Streamz",
    description: "Dive into a world of endless content streams",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
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
                <NavBar />
                <div className="container max-w-7xl mx-auto h-full pt-12">
                    {children}
                </div>
                <Toaster />
            </body>
        </html>
    );
}
