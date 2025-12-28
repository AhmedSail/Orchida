"use client";

import {
  AllChapters,
  AllContent,
  AllModules,
} from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import React, { useState } from "react";
import { Button } from "../ui/button";
import AddModuleDialog from "./addModuleDialog";
import AddChapterDialog from "./addChapterDialog";
import AddContentDialog from "./addContentDialog";
import ViewContentDialog from "./viewContentDialog";

interface Props {
  modules: AllModules[];
  sectionId: string;
  userId: string;
  courseId: string | null;
  chapters: AllChapters[];
  contents: AllContent[];
}

const SectionContent = ({
  modules: initialModules,
  userId,
  sectionId,
  courseId,
  chapters: initialChapters,
  contents,
}: Props) => {
  const [modules, setModules] = useState(initialModules);
  const [chapters, setChapters] = useState(initialChapters);

  const [activeModules, setActiveModules] = useState(false);
  const [activeChapterModuleId, setActiveChapterModuleId] = useState<
    string | null
  >(null);
  const [activeContentChapterId, setActiveContentChapter] = useState<
    boolean | null
  >(null);
  const [activeContent, setActiveContent] = useState<AllContent | null>(null);

  // ✅ إضافة وحدة جديدة مباشرة للـ state
  const handleModuleAdded = (newModule: AllModules) => {
    setModules((prev) => [...prev, newModule]);
  };

  // ✅ إضافة فصل جديد مباشرة للـ state
  const handleChapterAdded = (newChapter: AllChapters) => {
    setChapters((prev) => [...prev, newChapter]);
  };

  return (
    <div>
      <div>
        <Button onClick={() => setActiveModules(true)}> اضافة وحدة</Button>
        {activeModules && (
          <AddModuleDialog
            userId={userId}
            sectionId={sectionId}
            active={activeModules}
            setActive={setActiveModules}
            courseId={courseId}
            onModuleAdded={handleModuleAdded} // ✅ callback
          />
        )}
      </div>

      <Accordion type="single" collapsible className="w-full mt-4">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger className="text-2xl">
              <div className="flex justify-start items-center gap-3">
                <span className="text-3xl">📦</span>
                <h1>{module.title}</h1>
                <p className="text-sm text-gray-400">({module.description})</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-lg space-y-4">
              <Button onClick={() => setActiveChapterModuleId(module.id)}>
                اضافة فصل
              </Button>

              {activeChapterModuleId === module.id && (
                <AddChapterDialog
                  active={true}
                  setActive={() => setActiveChapterModuleId(null)}
                  moduleId={module.id}
                  onChapterAdded={handleChapterAdded} // ✅ callback
                />
              )}

              <Accordion type="single" collapsible className="ml-6">
                {chapters
                  .filter((ch) => ch.moduleId === module.id)
                  .map((chapter) => (
                    <AccordionItem key={chapter.id} value={chapter.id}>
                      <AccordionTrigger className="text-lg">
                        📖 {chapter.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600 mb-2">
                          {chapter.description}
                        </p>

                        {/* زر إضافة محتوى */}
                        <Button
                          onClick={() => setActiveContentChapter(true)}
                          className="mb-10"
                        >
                          إضافة محتوى
                        </Button>
                        {activeContentChapterId && (
                          <AddContentDialog
                            active={true}
                            setActive={() =>
                              setActiveContentChapter(!activeContentChapterId)
                            }
                            chapterId={chapter.id}
                          />
                        )}
                        {contents
                          .filter((c) => c.chapterId === chapter.id)
                          .map((content) => (
                            <div
                              key={content.id}
                              className="border rounded p-3 bg-gray-50 my-2"
                            >
                              <h3 className="font-semibold">{content.title}</h3>
                              <p className="text-sm text-gray-500">
                                {content.description}
                              </p>

                              <Button
                                onClick={() => setActiveContent(content)}
                                className="mt-3"
                              >
                                👁️ عرض{" "}
                                {content.contentType === "image"
                                  ? "الصورة"
                                  : ""}
                                {content.contentType === "attachment"
                                  ? "الملف "
                                  : ""}
                                {content.contentType === "text" ? "النص" : ""}
                                {content.contentType === "video"
                                  ? "الفيديو "
                                  : ""}
                              </Button>
                            </div>
                          ))}
                        {activeContent && (
                          <ViewContentDialog
                            active={true}
                            setActive={() => setActiveContent(null)}
                            content={activeContent}
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SectionContent;
