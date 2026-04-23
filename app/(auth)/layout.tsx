import { Metadata } from "next";
import React from "react";
interface Props {
  children: React.ReactNode;
}
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوركيدة",
};
const Layout = ({ children }: Props) => {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-zinc-950">
      {children}
    </main>
  );
};

export default Layout;
