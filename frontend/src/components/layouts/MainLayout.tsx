import { Drawer } from "@components/Drawer";
import { TopNav } from "@components/TopNav";
import { FloatingNav } from "@components/ui/aceternity/floating-navbar";
import React from "react";


function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div>
                <TopNav />
                <FloatingNav />
                {/* <Drawer /> */}
            </div>
            <main className="w-full">
                {children}
            </main>
        </>


    )
}

export default MainLayout;