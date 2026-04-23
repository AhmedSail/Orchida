"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Loader2, Palette } from "lucide-react";
import Swal from "sweetalert2";

type Status = {
  id: string;
  value: string;
  label: string;
  color: string;
};

const StatusManagementDialog = ({ 
  open, 
  onOpenChange, 
  onRefresh 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}) => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("blue");

  const fetchStatuses = async () => {
    try {
      const res = await fetch("/api/admin/lead-statuses");
      const data = await res.json();
      setStatuses(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (open) fetchStatuses();
  }, [open]);

  const addStatus = async () => {
    if (!newLabel) return;
    setLoading(true);
    try {
      // Generate a simple value from label (e.g. "interested" from "مهتم")
      const value = Math.random().toString(36).substring(7);
      const res = await fetch("/api/admin/lead-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel, value, color: newColor }),
      });
      if (res.ok) {
        setNewLabel("");
        fetchStatuses();
        onRefresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStatus = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الحالة نهائياً!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444"
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/admin/lead-statuses/${id}`, { method: "DELETE" });
        fetchStatuses();
        onRefresh();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
      gray: "bg-gray-500",
    };
    return colors[color] || "bg-gray-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-center mb-4">إدارة حالات المهتمين</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {statuses.map((status) => (
            <div key={status.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100 group">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status.color)}`} />
                <span className="font-bold text-zinc-700">{status.label}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                onClick={() => deleteStatus(status.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-100 space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="اسم الحالة الجديدة..."
              className="rounded-xl h-11"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <select 
              className="h-11 px-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
            >
              <option value="blue">أزرق</option>
              <option value="green">أخضر</option>
              <option value="red">أحمر</option>
              <option value="yellow">أصفر</option>
              <option value="purple">بنفسجي</option>
              <option value="orange">برتقالي</option>
              <option value="pink">وردي</option>
              <option value="gray">رمادي</option>
            </select>
          </div>
          
          <Button 
            className="w-full h-12 rounded-2xl gap-2 font-black shadow-lg shadow-primary/20" 
            onClick={addStatus}
            disabled={loading || !newLabel}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            إضافة حالة جديدة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusManagementDialog;
