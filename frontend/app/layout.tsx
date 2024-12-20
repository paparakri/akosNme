import "@/app/ui/global.css"
import Navbar from "./ui/navbar";
import Footer from "./ui/footer";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ChakraProvider } from "@chakra-ui/react";
import 'leaflet/dist/leaflet.css'
import { ReservationProvider } from "./ui/reservationContext";
import { AuthProvider } from "./lib/authContext";
import { ViewModeProvider } from "./lib/viewModelContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "To Kone - Your Premium Nightlife Experience",
  description: "Book the best tables at the hottest clubs in town",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} min-h-screen bg-black text-white overflow-x-hidden`}>
        <AuthProvider>
          <ReservationProvider>
            <ChakraProvider>
              <ViewModeProvider>
                <div className="relative min-h-screen">
                  {/* Background gradient overlay */}
                  <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black pointer-events-none" />
                  
                  {/* Animated background elements */}
                  <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div 
                      className="absolute w-[500px] h-[500px] -top-48 -left-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
                      style={{ animationDuration: '8s' }}
                    />
                    <div 
                      className="absolute w-[500px] h-[500px] -bottom-48 -right-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
                      style={{ animationDuration: '10s' }}
                    />
                  </div>

                  {/* Content wrapper */}
                  <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />
                    
                    {/* Main content */}
                    <main className="flex-grow">
                      {children}
                    </main>

                    {/* Footer */}
                    <Footer />
                  </div>
                </div>
              </ViewModeProvider>
            </ChakraProvider>
          </ReservationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}