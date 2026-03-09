"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "./CopyButton";

type SuffixStrategy = "pubkey" | "role" | "number";

const companionRoles = [
  { code: "PRIM", label: "Primary", description: "Default method to contact you" },
  { code: "SCND", label: "Secondary", description: "Less critical, still used regularly" },
  { code: "TERT", label: "Tertiary", description: "Used occasionally or for a specific purpose" },
  { code: "BKUP", label: "Backup", description: "Fallback if other devices are unavailable" },
  { code: "EMRG", label: "Emergency", description: "Reserved for critical situations" },
  { code: "MOBL", label: "Mobile", description: "Portable, used on the go (hiking, etc.)" },
  { code: "VHCL", label: "Vehicle", description: "Installed in a car or other vehicle" },
  { code: "HOME", label: "Home", description: "Stationary household node" },
];

export default function CompanionNamer() {
  const [emoji, setEmoji] = useState("");
  const [handle, setHandle] = useState("");
  const [strategy, setStrategy] = useState<SuffixStrategy>("pubkey");
  const [pubkeyPrefix, setPubkeyPrefix] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [number, setNumber] = useState("");

  const suffix = useMemo(() => {
    switch (strategy) {
      case "pubkey":
        return pubkeyPrefix.toUpperCase();
      case "role":
        return (role === "__custom" ? customRole : role).toUpperCase();
      case "number":
        return number ? `MY${number.padStart(2, "0")}` : "";
    }
  }, [strategy, pubkeyPrefix, role, customRole, number]);

  const generatedName = useMemo(() => {
    const parts: string[] = [];
    if (emoji) parts.push(emoji);
    if (handle) parts.push(handle.toUpperCase());
    if (suffix) parts.push(suffix);
    return parts.join(" ");
  }, [emoji, handle, suffix]);

  // Count visible characters (emoji = ~2 display chars, but counts as 1 in MeshCore)
  const charCount = generatedName.length;
  const isOverLimit = charCount > 23;

  const strategies: { value: SuffixStrategy; label: string; desc: string }[] = [
    { value: "pubkey", label: "Public key prefix", desc: "4 hex chars from your public key (default)" },
    { value: "role", label: "Role", desc: "2-4 chars: PRIM, SCND, HOME, etc." },
    { value: "number", label: "Number", desc: "01-99 (auto-prefixed with MY)" },
  ];

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <div className="card-mesh p-5 text-center">
        <p className="text-xs text-foreground-muted uppercase tracking-wider mb-2">
          Companion Name Preview
        </p>
        <div className="flex items-center justify-center gap-2">
          <p
            className={`font-mono text-xl md:text-2xl font-bold ${
              isOverLimit ? "text-red-500" : generatedName ? "text-mesh" : "text-foreground-muted"
            }`}
          >
            {generatedName || "\uD83D\uDC7B M3SHGH\u00D8ST F4"}
          </p>
          {generatedName && <CopyButton text={generatedName} />}
        </div>
        <span
          className={`text-sm font-mono ${
            isOverLimit ? "text-red-500 font-bold" : "text-foreground-muted"
          }`}
        >
          {charCount}/23 chars
        </span>
      </div>

      {/* Emoji */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Emoji
        </label>
        <p className="text-xs text-foreground-muted mb-2">
          One emoji per person. Claim yours in Discord first.
        </p>
        <input
          type="text"
          value={emoji}
          onChange={(e) => {
            // Allow a single emoji (grapheme cluster)
            const val = e.target.value;
            const segments = [...new Intl.Segmenter().segment(val)];
            setEmoji(segments.length > 0 ? segments[0].segment : "");
          }}
          placeholder="\uD83D\uDC7B"
          className="w-20 bg-night-800/50 border border-card-border rounded-lg px-4 py-2.5 text-foreground text-2xl text-center focus:ring-2 focus:ring-mesh focus:border-mesh outline-none"
        />
      </div>

      {/* Handle */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Handle
        </label>
        <p className="text-xs text-foreground-muted mb-2">
          Your mesh alias (not your real name). Max 10 characters.
        </p>
        <input
          type="text"
          value={handle}
          onChange={(e) =>
            setHandle(
              e.target.value.replace(/[^a-zA-Z0-9\u00D8]/g, "").slice(0, 10)
            )
          }
          placeholder="e.g. M3SHGH\u00D8ST"
          maxLength={10}
          className="w-full bg-night-800/50 border border-card-border rounded-lg px-4 py-2.5 text-foreground font-mono uppercase focus:ring-2 focus:ring-mesh focus:border-mesh outline-none placeholder:text-foreground-muted/50"
        />
      </div>

      {/* Suffix Strategy */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Identification Suffix
        </label>
        <p className="text-xs text-foreground-muted mb-3">
          How do you want to identify this device?
        </p>
        <div className="space-y-2">
          {strategies.map((s) => (
            <label
              key={s.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                strategy === s.value
                  ? "border-mesh bg-mesh/10"
                  : "border-card-border bg-night-800/20 hover:border-mesh/50"
              }`}
            >
              <input
                type="radio"
                name="suffix-strategy"
                value={s.value}
                checked={strategy === s.value}
                onChange={() => setStrategy(s.value)}
                className="mt-0.5 text-mesh focus:ring-mesh"
              />
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {s.label}
                </span>
                <p className="text-xs text-foreground-muted">{s.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Strategy-specific input */}
        <div className="mt-3">
          {strategy === "pubkey" && (
            <input
              type="text"
              value={pubkeyPrefix}
              onChange={(e) =>
                setPubkeyPrefix(
                  e.target.value.replace(/[^a-fA-F0-9]/g, "").slice(0, 4)
                )
              }
              placeholder="e.g. F4A2"
              maxLength={4}
              className="w-full bg-night-800/50 border border-card-border rounded-lg px-4 py-2.5 text-foreground font-mono uppercase focus:ring-2 focus:ring-mesh focus:border-mesh outline-none placeholder:text-foreground-muted/50"
            />
          )}
          {strategy === "role" && (
            <div className="space-y-2">
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); setCustomRole(""); }}
                className="w-full bg-night-800/50 border border-card-border rounded-lg px-4 py-2.5 text-foreground font-mono focus:ring-2 focus:ring-mesh focus:border-mesh outline-none"
              >
                <option value="">Select role...</option>
                {companionRoles.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.code} — {r.label}
                  </option>
                ))}
                <option value="__custom">Custom...</option>
              </select>
              {role === "__custom" && (
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) =>
                    setCustomRole(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 4))
                  }
                  placeholder="e.g. CAMP"
                  maxLength={4}
                  className="w-full bg-night-800/50 border border-card-border rounded-lg px-4 py-2.5 text-foreground font-mono uppercase focus:ring-2 focus:ring-mesh focus:border-mesh outline-none placeholder:text-foreground-muted/50"
                />
              )}
              {role && role !== "__custom" && (
                <p className="text-xs text-foreground-muted">
                  {companionRoles.find((r) => r.code === role)?.description}
                </p>
              )}
            </div>
          )}
          {strategy === "number" && (
            <input
              type="text"
              value={number}
              onChange={(e) =>
                setNumber(
                  e.target.value.replace(/[^0-9]/g, "").slice(0, 2)
                )
              }
              placeholder="e.g. 01"
              maxLength={2}
              className="w-full bg-night-800/50 border border-card-border rounded-lg px-4 py-2.5 text-foreground font-mono uppercase focus:ring-2 focus:ring-mesh focus:border-mesh outline-none placeholder:text-foreground-muted/50"
            />
          )}
        </div>
      </div>

      {/* Do Not rules */}
      <div className="card-mesh p-4 bg-sunset-500/5 border-sunset-500/20">
        <p className="text-sm font-semibold text-foreground mb-2">Do Not:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-foreground-muted">
          {[
            "Use your real name",
            "Put hardware in the name",
            "Use different emojis per device",
            "Take someone else\u2019s emoji",
            "Go over 23 characters",
          ].map((rule, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sunset-500">&#10005;</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
