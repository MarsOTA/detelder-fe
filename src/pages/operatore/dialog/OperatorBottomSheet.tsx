import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OperatorBottomSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export const OperatorBottomSheet = ({
  open,
  setOpen,
  title,
  subtitle,
  icon,
  children,
}: OperatorBottomSheetProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="fixed bottom-0 left-0 right-0 top-auto w-full max-w-none translate-x-0 translate-y-0 rounded-t-[24px] rounded-b-none border border-b-0 border-[#2b4457] bg-[#0c1d2d] p-0 text-white shadow-[0_-15px_45px_rgba(0,0,0,0.35)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full data-[state=open]:duration-500 data-[state=closed]:duration-500 [&>button]:right-5 [&>button]:top-5 [&>button]:text-white [&>button]:opacity-100"
      >
        <div className="max-h-[88vh] overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4 font-['Mulish'] sm:px-6">
          <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-[#607889]/70" />

          <DialogHeader className="pr-10 text-left">
            <div className="flex items-start gap-3">
              {icon ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#16f0c4]/20 bg-[#0f3340] text-[#16f0c4]">
                  {icon}
                </div>
              ) : null}

              <div className="min-w-0">
                <DialogTitle className="text-[24px] font-extrabold leading-tight text-[#16f0c4]">
                  {title}
                </DialogTitle>
                {subtitle ? (
                  <p className="mt-1 text-[14px] leading-5 text-[#9db2bf]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
