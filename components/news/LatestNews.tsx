"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { InferSelectModel } from "drizzle-orm";
import { news } from "@/src/db/schema";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { useEdgeStore } from "@/lib/edgestore";
import TableNews from "../tableNews";
import { Link } from "next-view-transitions";

export type News = InferSelectModel<typeof news>;

const LatestNews = ({
  news,
  userId,
  role,
}: {
  news: News[];
  userId: string;
  role: string;
}) => {
  const [pending, setPending] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary mb-6">أحدث المستجدات</h1>
        <Link href={`/${role}/${userId}/news/newNews`}>
          <Button
            className={`bg-primary text-white flex items-center gap-2 disabled:${pending} `}
            onClick={() => setPending(!pending)}
          >
            إضافة خبر جديد
          </Button>
        </Link>
      </div>
      <TableNews news={news} userId={userId} />
    </div>
  );
};

export default LatestNews;
