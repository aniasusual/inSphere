import { FloatingNav } from "@components/ui/aceternity/floating-navbar";
import React from "react";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@components/ui/sidebar"
import { AppSidebar } from "@components/app-sidebar"


function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SidebarProvider>
                <FloatingNav />
                <AppSidebar />
                <SidebarTrigger />
                <main className="w-full">
                    {children}
                </main>
            </SidebarProvider >
        </>


    )
}

export default MainLayout;