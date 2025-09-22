"use client";

import KnowledgeEditor from "@/components/knowledge/KnowledgeEditor";
import Guidelines from "@/components/knowledge/Guidelines";

export default function ConocimientoPage() {
  return (
    <div className="flex flex-col gap-4 overflow-auto">
      <h1 className="text-lg font-semibold text-gray-900">
        Base de conocimientos
      </h1>
      <Guidelines />
      <KnowledgeEditor />
    </div>
  );
}
