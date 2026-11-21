import { HelpCircleIcon, SettingsIcon } from "lucide-react";

import { formatProfileTitle } from "@browsermcp/extension-core/popup";

import logo from "@/assets/logo.svg";

import { APP_NAME, DOCS_URL } from "./links";
import { Button, openPage } from "./ui";

export function PopupHeader({
  label,
  description,
  onOpenSettings,
}: {
  label: string | null;
  description: string | null;
  onOpenSettings: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <img src={logo} alt="" width={30} height={30} className="shrink-0" />
        <span
          className="min-w-0 flex-1 text-[14px] leading-4 font-semibold break-words"
          title={formatProfileTitle(label, description, APP_NAME)}
        >
          {formatProfileTitle(label, description, APP_NAME)}
        </span>
      </div>
      <div className="flex shrink-0 items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
          onClick={onOpenSettings}
        >
          <SettingsIcon className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Help"
          onClick={() => openPage(DOCS_URL)}
        >
          <HelpCircleIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
}
