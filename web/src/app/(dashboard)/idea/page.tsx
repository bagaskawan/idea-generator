"use client";

import { useState } from "react";
import IdeaForm from "@/components/IdeaForm";
import IdeaList from "@/components/IdeaList";
import IdeaDetailModal from "@/components/IdeaDetailModal";
import DevelopIdeaModal from "@/components/DevelopIdeaModal";
import { useIdeaManager } from "@/hooks/features/useIdeaManager";
import { ProjectData } from "@/types";
import { redirect } from "next/navigation";

export default function Idea() {
  redirect("/idea/generate");
}
