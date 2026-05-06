"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { ApiResponse, MapNode } from "@/lib/types";
import { API_ROUTES } from "@/lib/constants";

interface PrefixMatrixProps {
  onSelectPrefix?: (hex: string) => void;
}

interface CellData {
  hex: string;
  nodes: MapNode[];
}

export default function PrefixMatrix({ onSelectPrefix }: PrefixMatrixProps) {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchNodes = async () => {
      try {
        const res = await fetch(API_ROUTES.MAP_NODES);
        const json = (await res.json()) as ApiResponse<MapNode[]>;
        if (cancelled) return;
        if (json.success && json.data) {
          setNodes(json.data);
        } else {
          setError("Failed to load node data");
        }
      } catch {
        if (!cancelled) setError("Failed to connect to API");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchNodes();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build the 256-cell grid indexed by first byte of public key
  const grid = useMemo(() => {
    const map = new Map<string, MapNode[]>();
    for (let i = 0; i < 256; i++) {
      map.set(i.toString(16).padStart(2, "0").toUpperCase(), []);
    }
    for (const node of nodes) {
      if (node.publicKey && node.publicKey.length >= 2) {
        const prefix = node.publicKey.slice(0, 2).toUpperCase();
        const existing = map.get(prefix);
        if (existing) existing.push(node);
      }
    }
    return map;
  }, [nodes]);

  // Search filtering
  const highlightedCells = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const matches = new Set<string>();
    for (const [hex, cellNodes] of grid) {
      if (hex.toLowerCase().includes(q)) {
        matches.add(hex);
      }
      for (const node of cellNodes) {
        if (
          node.name?.toLowerCase().includes(q) ||
          node.publicKey?.toLowerCase().includes(q)
        ) {
          matches.add(hex);
        }
      }
    }
    return matches;
  }, [search, grid]);

  const freeCount = useMemo(() => {
    let count = 0;
    for (const cellNodes of grid.values()) {
      if (cellNodes.length === 0) count++;
    }
    return count;
  }, [grid]);

  const suggestFreePrefix = useCallback(() => {
    const freeHexes: string[] = [];
    for (const [hex, cellNodes] of grid) {
      if (cellNodes.length === 0) freeHexes.push(hex);
    }
    if (freeHexes.length === 0) return;
    const randomFirst = freeHexes[Math.floor(Math.random() * freeHexes.length)];
    // Generate random second byte
    const randomSecond = Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
    const suggested = randomFirst + randomSecond;
    onSelectPrefix?.(suggested);
    setSelectedCell(randomFirst);
  }, [grid, onSelectPrefix]);

  const hexRow = (rowIdx: number): CellData[] => {
    const cells: CellData[] = [];
    for (let col = 0; col < 16; col++) {
      const byte = rowIdx * 16 + col;
      const hex = byte.toString(16).padStart(2, "0").toUpperCase();
      cells.push({ hex, nodes: grid.get(hex) || [] });
    }
    return cells;
  };

  if (loading) {
    return (
      <div className="card-mesh p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 border-2 border-mesh border-t-transparent rounded-full animate-spin" />
          <span className="text-foreground-muted">Loading prefix data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-mesh p-8 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-mesh hover:text-mesh-light text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const selectedNodes = selectedCell ? grid.get(selectedCell) || [] : [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by node name or public key..."
          className="flex-1 bg-night-800/50 border border-card-border rounded-lg px-4 py-2.5 text-foreground text-sm focus:ring-2 focus:ring-mesh focus:border-mesh outline-none placeholder:text-foreground-muted/50"
        />
        <button
          onClick={suggestFreePrefix}
          className="btn-accent px-4 py-2.5 text-sm whitespace-nowrap"
        >
          Suggest Free Prefix
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-night-800/50 border border-card-border" />
          <span>Free ({freeCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-mesh/30 border border-mesh/50" />
          <span>1 node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-amber-500/40 border border-amber-500/60" />
          <span>2+ nodes (crowded)</span>
        </div>
        <span className="text-foreground-muted/50">|</span>
        <span>{nodes.length} nodes across {256 - freeCount} prefixes</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[520px]">
          {/* Column headers */}
          <div className="flex gap-0.5 mb-0.5 pl-8">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[10px] font-mono text-foreground-muted/50"
              >
                {i.toString(16).toUpperCase()}
              </div>
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: 16 }, (_, rowIdx) => (
            <div key={rowIdx} className="flex gap-0.5 mb-0.5">
              {/* Row header */}
              <div className="w-7 flex items-center justify-end pr-1 text-[10px] font-mono text-foreground-muted/50">
                {rowIdx.toString(16).toUpperCase()}x
              </div>

              {hexRow(rowIdx).map((cell) => {
                const count = cell.nodes.length;
                const occupied = count > 0;
                const crowded = count >= 2;
                const isSelected = selectedCell === cell.hex;
                const isDimmed =
                  highlightedCells !== null && !highlightedCells.has(cell.hex);

                return (
                  <button
                    key={cell.hex}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCell(null);
                      } else {
                        setSelectedCell(cell.hex);
                        if (!occupied) {
                          onSelectPrefix?.(cell.hex);
                        }
                      }
                    }}
                    title={`${cell.hex}: ${
                      occupied
                        ? `${count} node(s)`
                        : "Free — click to use"
                    }`}
                    className={`flex-1 aspect-square rounded-sm text-[9px] font-mono flex items-center justify-center transition-all ${
                      isSelected
                        ? occupied
                          ? "bg-red-500/80 text-white ring-1 ring-red-400 scale-110 z-10"
                          : "bg-mesh text-white ring-1 ring-mesh scale-110 z-10"
                        : crowded
                        ? "bg-amber-500/40 border border-amber-500/60 text-amber-400 hover:bg-amber-500/50"
                        : occupied
                        ? "bg-mesh/30 border border-mesh/50 text-mesh hover:bg-mesh/40"
                        : "bg-night-800/50 border border-card-border text-foreground-muted/30 hover:border-mesh/50 hover:text-foreground-muted"
                    } ${isDimmed ? "opacity-20" : ""}`}
                  >
                    {occupied ? count : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedCell && (
        <div className="card-mesh p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-mono text-sm font-bold text-foreground">
              Prefix: 0x{selectedCell}
            </h4>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-foreground-muted hover:text-foreground text-sm"
            >
              Close
            </button>
          </div>
          {selectedNodes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-forest-500 font-semibold text-sm mb-1">
                This prefix is free!
              </p>
              <p className="text-xs text-foreground-muted">
                No nodes are using the 0x{selectedCell} prefix byte.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedNodes.length >= 2 && (
                <p className="text-xs text-amber-500 flex items-center gap-1.5 pb-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {selectedNodes.length} nodes share this prefix byte &mdash; consider a less crowded prefix.
                </p>
              )}
              <div className="max-h-48 overflow-y-auto space-y-1">
              {selectedNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-card-border last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        node.isOnline ? "bg-forest-500" : "bg-foreground-muted/30"
                      }`}
                    />
                    <span className="text-foreground truncate">
                      {node.name || "Unnamed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="font-mono text-xs text-foreground-muted">
                      {node.publicKey?.slice(0, 8)}...
                    </span>
                    {node.lastHeardAt && (
                      <span className="text-xs text-foreground-muted/50">
                        {formatLastSeen(node.lastHeardAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* How to change your key */}
      <div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-sm text-mesh hover:text-mesh-light transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showHelp ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          How to get a non-conflicting key
        </button>

        {showHelp && (
          <div className="mt-3 card-mesh p-5 space-y-4 text-sm text-foreground-muted">
            <div>
              <h5 className="font-semibold text-foreground mb-2">Generating a new key:</h5>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check which prefixes are free using the grid above or{" "}
                  <a href="https://analyzer.letsmesh.net/nodes/prefix-utilization" target="_blank" rel="noopener noreferrer" className="text-mesh hover:text-mesh-light">
                    analyzer.letsmesh.net
                  </a>{" "}for the broader network
                </li>
                <li>Go to the{" "}
                  <a href="https://gessaman.com/mc-keygen/" target="_blank" rel="noopener noreferrer" className="text-mesh hover:text-mesh-light">
                    MeshCore Key Generator
                  </a>
                </li>
                <li>Enter your desired 2-character hex prefix (first byte)</li>
                <li>Click &ldquo;Generate Key&rdquo; &mdash; it finds a matching Ed25519 key pair in seconds</li>
                <li>Copy the <strong className="text-foreground">private key</strong> (128 hex characters)</li>
              </ol>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-2">Applying to a Companion device (via mobile app):</h5>
              <ol className="list-decimal list-inside space-y-1">
                <li>Connect your device via USB-C or Bluetooth</li>
                <li>Open the MeshCore app &rarr; tap Settings (gear icon, top-right)</li>
                <li>Scroll down &rarr; tap &ldquo;Manage Identity Key&rdquo;</li>
                <li>Paste your 128-character <strong className="text-foreground">private key</strong> (not the public key)</li>
                <li>Tap &ldquo;Import Private Key&rdquo;</li>
                <li>Tap the checkmark to save</li>
                <li>Verify the new public key prefix on the main screen</li>
              </ol>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-2">Applying to a Repeater (via serial console):</h5>
              <ol className="list-decimal list-inside space-y-1">
                <li>Connect repeater to computer via USB</li>
                <li>Open the{" "}
                  <a href="https://flasher.meshcore.co.uk/" target="_blank" rel="noopener noreferrer" className="text-mesh hover:text-mesh-light">
                    MeshCore Web Console
                  </a>{" "}or a serial terminal
                </li>
                <li>Run: <code className="bg-night-800 px-1.5 py-0.5 rounded font-mono text-xs text-mesh">set prv.key &lt;your_128_char_private_key&gt;</code></li>
                <li>Takes effect immediately &mdash; verify the prefix matches</li>
              </ol>
            </div>

            <div className="card-mesh p-3 bg-sunset-500/5 border-sunset-500/20">
              <p className="text-xs">
                <strong className="text-foreground">Heads up:</strong> Changing your key means other nodes will see you as a new device. Message history with your old key is lost. Your custom key persists through firmware re-flashes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatLastSeen(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
