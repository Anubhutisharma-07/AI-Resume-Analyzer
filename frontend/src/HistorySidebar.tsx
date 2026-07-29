import React, { useState, useEffect } from "react";
import type { AnalysisEntry } from "./hooks/useAnalysisHistory";

type SortMode = "recent" | "most-matched" | "most-missing";

interface HistorySidebarProps {
  entries: AnalysisEntry[];
  onSelect: (entry: AnalysisEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SORT_MODE_STORAGE_KEY = "history_sort_mode";

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  entries,
  onSelect,
  onDelete,
  onClear,
  isOpen,
  onToggle,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    try {
      const saved = localStorage.getItem(SORT_MODE_STORAGE_KEY);
      if (saved === "recent" || saved === "most-matched" || saved === "most-missing") {
        return saved;
      }
    } catch {
      // localStorage may be unavailable
    }
    return "recent";
  });

  // Persist sort mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SORT_MODE_STORAGE_KEY, sortMode);
    } catch {
      // localStorage may be unavailable
    }
  }, [sortMode]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort entries based on current sort mode
  const sortedEntries = React.useMemo(() => {
    const entriesCopy = [...entries];
    switch (sortMode) {
      case "most-matched":
        return entriesCopy.sort((a, b) => b.matchedSkills.length - a.matchedSkills.length);
      case "most-missing":
        return entriesCopy.sort((a, b) => b.missingSkills.length - a.missingSkills.length);
      case "recent":
      default:
        return entriesCopy.sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [entries, sortMode]);

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        className="history-toggle-btn"
        onClick={onToggle}
        aria-label={isOpen ? "Close history" : "Open history"}
        title={isOpen ? "Close history" : "View history"}
      >
        {isOpen ? "✕" : "📋"}
        {!isOpen && entries.length > 0 && (
          <span className="history-badge">{entries.length}</span>
        )}
      </button>

      {/* Sidebar panel */}
      <div className={`history-sidebar ${isOpen ? "history-sidebar--open" : ""}`}>
        <div className="history-sidebar-header">
          <h3>📚 History</h3>
          {entries.length > 0 && (
            <button
              className="history-clear-btn"
              onClick={() => {
                if (confirmClear) {
                  onClear();
                  setConfirmClear(false);
                } else {
                  setConfirmClear(true);
                  setTimeout(() => setConfirmClear(false), 2500);
                }
              }}
            >
              {confirmClear ? "Confirm?" : "Clear All"}
            </button>
          )}
        </div>

        {/* Sort mode toggle */}
        {entries.length > 0 && (
          <div className="history-sort-controls">
            <button
              className={`history-sort-btn ${sortMode === "recent" ? "history-sort-btn--active" : ""}`}
              onClick={() => setSortMode("recent")}
              title="Sort by most recent"
            >
              Recent
            </button>
            <button
              className={`history-sort-btn ${sortMode === "most-matched" ? "history-sort-btn--active" : ""}`}
              onClick={() => setSortMode("most-matched")}
              title="Sort by most matched skills"
            >
              Most Matched
            </button>
            <button
              className={`history-sort-btn ${sortMode === "most-missing" ? "history-sort-btn--active" : ""}`}
              onClick={() => setSortMode("most-missing")}
              title="Sort by most missing skills"
            >
              Most Missing
            </button>
          </div>
        )}

        {entries.length === 0 ? (
          <p className="history-empty">No past analyses yet.</p>
        ) : (
          <ul className="history-list">
            {sortedEntries.map((entry) => (
              <li
                key={entry.id}
                className="history-item"
                onClick={() => onSelect(entry)}
              >
                <div className="history-item-top">
                  <span className="history-item-score">{entry.score}%</span>
                  <button
                    className="history-item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }}
                    title="Delete entry"
                  >
                    🗑️
                  </button>
                </div>
                <div className="history-item-role">{entry.targetRole}</div>
                <div className="history-item-file">{entry.fileName}</div>
                <div className="history-item-time">{formatDate(entry.timestamp)}</div>
                <div className="history-item-skills">
                  {entry.skills.slice(0, 4).join(" · ")}
                  {entry.skills.length > 4 && ` +${entry.skills.length - 4} more`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};