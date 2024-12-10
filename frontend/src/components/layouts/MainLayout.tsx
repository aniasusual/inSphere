import { Drawer } from "@components/Drawer";
import { FloatingNav } from "@components/ui/aceternity/floating-navbar";
import React from "react";


function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <FloatingNav />
            <Drawer />
            <main className="w-full">
                {children}
            </main>
        </>


    )
}

export default MainLayout;