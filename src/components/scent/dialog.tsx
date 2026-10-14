import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
export function ScentDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  menu = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  menu?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="dialog-overlay" />
        <D.Content
          className={`dialog-content ${menu ? "menu-overlay" : ""}`}
          aria-describedby={description ? "dialog-description" : undefined}
        >
          <D.Title className={menu ? "sr-only" : "question"}>{title}</D.Title>
          {description && (
            <D.Description id="dialog-description" className="small muted">
              {description}
            </D.Description>
          )}
          <D.Close asChild>
            <Button variant="text" size="icon" className="dialog-close" aria-label={t.close}>
              <X size={20} />
            </Button>
          </D.Close>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
