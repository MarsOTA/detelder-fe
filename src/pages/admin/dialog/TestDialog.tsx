import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const TestDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Apri Dialog di Test</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
            w-full
            max-w-[95vw] md:max-w-[1400px]
            h-5/6
            overflow-y-auto
            rounded-lg border p-6 shadow-lg
            bg-background
          "
        >
          <DialogHeader>
            <DialogTitle>Dialog di Test</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Questo dialog usa la larghezza massima possibile, fino a 1400px su desktop e 95% del viewport su mobile.
            </p>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            {/* Contenuto di test */}
            {Array.from({ length: 50 }).map((_, i) => (
              <p key={i}>Riga di contenuto {i + 1}</p>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Chiudi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
