"use client";
import {
  AllChapters,
  AllContent,
  AllModules,
} from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import ViewContentDialog from "@/components/instructor/viewContentDialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface Props {
  modules: AllModules[];
  sectionId: string;
  userId: string;
  courseId: string | null;
  chapters: AllChapters[];
  contents: AllContent[];
}

const SectionContent = ({
  modules,
  userId,
  sectionId,
  courseId,
  chapters,
  contents,
}: Props) => {
  const [activeContent, setActiveContent] = useState<AllContent | null>(null);

  return (
    <div className="no-copy">
      <Accordion type="single" collapsible className="w-full mt-4">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger className="text-lg md:text-2xl ">
              <div className="md:flex justify-start items-center gap-3">
                <div className="flex justify-start items-center">
                  <span className="text-3xl">📦</span>
                  <h1>{module.title}</h1>
                </div>
                <p className="text-sm text-gray-400">({module.description})</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-lg space-y-4">
              <Accordion type="single" collapsible className="ml-6">
                {chapters
                  .filter((ch) => ch.moduleId === module.id)
                  .map((chapter) => (
                    <AccordionItem key={chapter.id} value={chapter.id}>
                      <AccordionTrigger className="text-sm md:text-lg ">
                        📖 {chapter.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600 mb-2">
                          {chapter.description}
                        </p>

                        {/* عرض المحتوى */}
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
                                  ? "الملف"
                                  : ""}
                                {content.contentType === "text" ? "النص" : ""}
                                {content.contentType === "video"
                                  ? "الفيديو"
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
