import { Card } from "@/components/ui/card";
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
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">{children}</div>
    </div>
  );
};

export default Layout;
