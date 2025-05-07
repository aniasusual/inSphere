import { TopNav } from "@components/TopNav";
import { FloatingNav } from "@components/ui/aceternity/floating-navbar";
import React from "react";
import FloatingActionMenu from "@components/floatingButton";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div>
        <TopNav />
        <FloatingNav />
      </div>
      <FloatingActionMenu />

      <main className="w-full h-full">{children}</main>
    </>
  );
}

export default MainLayout;
