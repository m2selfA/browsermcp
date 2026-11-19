import { type FormEvent, useState } from "react";

import { ArrowLeftIcon } from "lucide-react";

import {
  normalizeBrowserLabel,
  sendBrowserControlMessage,
  useBrowserControl,
} from "@browsermcp/extension-core/popup";
import {
  MAX_BROWSER_DESCRIPTION_LENGTH,
  RELAY_PORTS,
  isValidRelayPort,
  normalizeBrowserDescription,
} from "@browsermcp/protocol";

import { Button, ErrorAlert } from "./ui";

/**
 * The popup's profile name and purpose, plus the port of a server started with `--port`.
 */
export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [view, refresh] = useBrowserControl();
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
    await refresh();
  };

  return (
    <div className="w-80 text-[13px]">
      <div className="flex items-center gap-1 px-2 py-2.5">
        <Button variant="ghost" size="icon" aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon className="size-5 rtl:rotate-180" />
        </Button>
        <h1 className="text-[15px] font-semibold">Settings</h1>
      </div>
      {error && (
        <div className="px-4 pb-3">
          <ErrorAlert>{error}</ErrorAlert>
        </div>
      )}
      {view && (
        <div className="border-t px-4 py-3">
          <LabelSetting
            // Remounts with the saved name, so the field shows it
            key={view.label ?? ""}
            label={view.label}
            onSave={(label) =>
              run(() => sendBrowserControlMessage("setBrowserLabel", { label }))
            }
          />
        </div>
      )}
      {view && (
        <div className="border-t px-4 py-3">
          <DescriptionSetting
            key={view.description ?? ""}
            description={view.description}
            onSave={(description) =>
              run(() =>
                sendBrowserControlMessage("setBrowserDescription", {
                  description,
                }),
              )
            }
          />
        </div>
      )}
      {view && (
        <div className="border-t px-4 py-3">
          <PortSetting
            // Remounts with the saved port, so the field shows it
            key={view.relayPort ?? "default"}
            relayPort={view.relayPort}
            onSave={(port) =>
              run(() => sendBrowserControlMessage("setRelayPort", { port }))
            }
          />
        </div>
      )}
    </div>
  );
}

/**
 * This browser profile's name, which agents see when several browsers or profiles are connected. Empty unsets it
 */
function LabelSetting({
  label,
  onSave,
}: {
  label: string | null;
  onSave: (label: string | null) => void;
}) {
  const [value, setValue] = useState(label ?? "");
  const unchanged = normalizeBrowserLabel(value) === label;

  const save = (event: FormEvent) => {
    event.preventDefault();
    // Shows what's saved: trimmed and capped
    const normalized = normalizeBrowserLabel(value);
    setValue(normalized ?? "");
    onSave(normalized);
  };

  return (
    <form onSubmit={save} className="space-y-2">
      <label htmlFor="settings-label" className="block font-medium">
        Browser name
      </label>
      <div className="flex gap-2">
        <input
          id="settings-label"
          className="h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="e.g. Work"
          autoComplete="off"
          value={value}
          aria-describedby="settings-label-help"
          onChange={(event) => setValue(event.target.value)}
        />
        <Button type="submit" variant="outline" disabled={unchanged}>
          Save
        </Button>
      </div>
      <p id="settings-label-help" className="text-xs text-muted-foreground">
        Names this browser to AI agents when several browsers or profiles are
        connected.
      </p>
    </form>
  );
}

/** The profile purpose, shared with agents only after pairing. Empty clears it. */
function DescriptionSetting({
  description,
  onSave,
}: {
  description: string | null;
  onSave: (description: string | null) => Promise<void>;
}) {
  const [value, setValue] = useState(description ?? "");
  const [saving, setSaving] = useState(false);
  const normalized = normalizeBrowserDescription(value);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(normalized);
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={save} className="space-y-2">
      <label htmlFor="settings-description" className="block font-medium">
        Profile description
      </label>
      <textarea
        id="settings-description"
        className="w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        rows={3}
        placeholder="e.g. Research papers using my university account"
        autoComplete="off"
        aria-describedby="settings-description-help"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <p
        id="settings-description-help"
        className="text-xs text-muted-foreground"
      >
        Helps AI agents choose this profile. Saved locally in this profile and
        shared after pairing. Up to {MAX_BROWSER_DESCRIPTION_LENGTH} characters;
        whitespace is collapsed. Leave empty to clear.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {Array.from(normalized ?? "").length}/{MAX_BROWSER_DESCRIPTION_LENGTH}{" "}
          characters to save
        </span>
        <Button
          type="submit"
          variant="outline"
          disabled={saving || normalized === description}
        >
          Save
        </Button>
      </div>
    </form>
  );
}

/** The port of a server started with `--port`. */
function PortSetting({
  relayPort,
  onSave,
}: {
  relayPort: number | null;
  onSave: (port: number | null) => void;
}) {
  const [value, setValue] = useState(relayPort?.toString() ?? "");
  const [invalid, setInvalid] = useState(false);

  const save = (event: FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (text === "") {
      onSave(null);
      return;
    }
    const port = Number(text);
    if (!/^\d+$/.test(text) || !isValidRelayPort(port)) {
      setInvalid(true);
      return;
    }
    onSave(port);
  };

  return (
    <form onSubmit={save} className="space-y-2">
      <label htmlFor="settings-port" className="block font-medium">
        Server port
      </label>
      <div className="flex gap-2">
        <input
          id="settings-port"
          className="h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
          inputMode="numeric"
          placeholder={RELAY_PORTS.join(", ")}
          value={value}
          aria-invalid={invalid}
          aria-describedby="settings-port-help"
          onChange={(event) => {
            setValue(event.target.value);
            setInvalid(false);
          }}
        />
        <Button type="submit" variant="outline">
          Save
        </Button>
      </div>
      <p
        id="settings-port-help"
        className={`text-xs ${invalid ? "text-destructive" : "text-muted-foreground"}`}
      >
        {invalid
          ? "Enter a port from 1024 to 65535, other than 9009."
          : "Only if the server runs with --port. Enter the same port here. Leave it empty for the default ports."}
      </p>
      {relayPort !== null && (
        <Button
          type="button"
          variant="link"
          size="inline"
          onClick={() => onSave(null)}
        >
          Use default ports
        </Button>
      )}
    </form>
  );
}
