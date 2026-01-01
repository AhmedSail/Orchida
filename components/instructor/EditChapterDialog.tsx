"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  active: boolean;
  setActive: (val: boolean) => void;
  chapterId: string;
  initialTitle: string;
  initialDescription: string;
  onUpdate: (id: string, data: { title: string; description: string }) => void;
}

export default function EditChapterDialog({
  active,
  setActive,
  chapterId,
  initialTitle,
  initialDescription,
  onUpdate,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onUpdate(chapterId, { title, description }); // ✅ استدعاء الـ API
    setLoading(false);
    setActive(false);
  };

  return (
    <Dialog open={active} onOpenChange={setActive}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>✏️ تعديل الفصل</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان الفصل"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف الفصل"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setActive(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
