import { FloatingNav } from "@components/ui/aceternity/floating-navbar";
import React from "react";

import { SidebarProvider, SidebarTrigger } from "@components/ui/sidebar"
import { AppSidebar } from "@components/app-sidebar"


function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <FloatingNav />
            <nav>
                <SidebarTrigger />
            </nav>
            <main>
                {children}
            </main>
        </SidebarProvider >


    )
}

export default MainLayout;