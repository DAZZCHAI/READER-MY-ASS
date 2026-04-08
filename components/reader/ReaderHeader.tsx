"use client";

import Link from "next/link";
import { ArrowLeft, PanelRight, PanelRightClose, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useReaderStore } from "@/store/readerStore";

interface Props {
  title: string;
}

export function ReaderHeader({ title }: Props) {
  const { sidebarOpen, toggleSidebar } = useReaderStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-12 border-b border-border flex items-center px-3 gap-3 flex-shrink-0 bg-background z-10">
      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      <div className="h-4 w-px bg-border" />

      <h1 className="text-sm font-medium truncate flex-1" title={title}>
        {title}
      </h1>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
          title={sidebarOpen ? "Ocultar barra lateral" : "Mostrar barra lateral"}
        >
          {sidebarOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
