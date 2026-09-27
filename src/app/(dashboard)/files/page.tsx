'use client';

import * as React from "react";
import {
  Files,
  Upload,
  Download,
  Trash2,
  FileText,
  Video,
  Image as ImageIcon,
  FileCode,
  Lock,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/use-app-store";
import { FileCategory, TeamFile } from "@/lib/types";
import { canUserAccessTeam } from "@/lib/utils/permissions";
import { format, parseISO } from "date-fns";

export default function FilesPage() {
  const { files, teams, teamMembers, users, currentUser, addFile, deleteFile } = useAppStore();

  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>(teams[0]?.id || "");
  const [uploadFileName, setUploadFileName] = React.useState("");
  const [uploadCategory, setUploadCategory] = React.useState<FileCategory>("PDF");

  // Filter files by user authorization (RLS policy simulation)
  const accessibleFiles = React.useMemo(() => {
    return files.filter((f) => {
      const authorized = canUserAccessTeam(currentUser, f.team_id, teamMembers);
      if (!authorized) return false;
      if (categoryFilter !== "ALL" && f.category !== categoryFilter) return false;
      return true;
    });
  }, [files, currentUser, teamMembers, categoryFilter]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim() || !selectedTeamId) return;

    addFile({
      team_id: selectedTeamId,
      file_name: uploadFileName.trim(),
      file_size: Math.floor(Math.random() * 5000000) + 500000,
      file_type: uploadCategory === "PDF" ? "application/pdf" : uploadCategory === "VIDEO" ? "video/mp4" : "image/png",
      storage_path: `teams/${selectedTeamId}/${uploadFileName.trim()}`,
      public_url: null,
      category: uploadCategory,
      uploaded_by: currentUser?.id || "user-guest",
    });

    setUploadFileName("");
  };

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case "PDF":
      case "DOC":
        return <FileText className="h-4 w-4 text-rose-400" />;
      case "VIDEO":
        return <Video className="h-4 w-4 text-indigo-400" />;
      case "SCREENSHOT":
      case "DIAGRAM":
        return <ImageIcon className="h-4 w-4 text-cyan-400" />;
      case "PPT":
      default:
        return <FileCode className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">File Vault</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Supabase Storage
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Team-isolated storage assets with strict RLS permissions.
          </p>
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="PDF">PDF Documents</option>
          <option value="PPT">Presentations (PPT)</option>
          <option value="VIDEO">Demo Videos</option>
          <option value="SCREENSHOT">Screenshots</option>
          <option value="DIAGRAM">Architecture Diagrams</option>
        </select>
      </div>

      {/* Upload Zone */}
      <Card className="p-5 bg-zinc-950/70 border-zinc-800/90 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-zinc-100">Upload Deliverable / Architecture Asset</h3>
        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="File name (e.g. Pitch_Deck_v2.pdf)"
            value={uploadFileName}
            onChange={(e) => setUploadFileName(e.target.value)}
            className="sm:col-span-2 h-9 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 focus:outline-none"
            required
          />

          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as FileCategory)}
            className="h-9 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="PDF">PDF</option>
            <option value="PPT">PPT</option>
            <option value="VIDEO">Demo Video</option>
            <option value="SCREENSHOT">Screenshot</option>
            <option value="DIAGRAM">Diagram</option>
            <option value="DOC">Doc</option>
          </select>

          <Button type="submit" variant="primary" size="sm" className="h-9 text-xs">
            <Upload className="h-3.5 w-3.5 mr-1" />
            Upload File
          </Button>
        </form>
      </Card>

      {/* Files List */}
      <Card className="p-0 overflow-hidden border-zinc-800/90 bg-zinc-950/60 shadow-lg">
        {accessibleFiles.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Files Accessible"
              description="Either no files match your filters, or RLS policies restrict visibility to assigned squad members."
              icon={<Lock className="h-6 w-6 text-zinc-500" />}
            />
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {accessibleFiles.map((f) => {
              const team = teams.find((t) => t.id === f.team_id);
              const uploader = users.find((u) => u.id === f.uploaded_by);

              return (
                <div
                  key={f.id}
                  className="p-4 hover:bg-zinc-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/60 shrink-0">
                      {getCategoryIcon(f.category)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-zinc-100">{f.file_name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5 font-mono">
                        <span className="text-indigo-400">{team?.name}</span>
                        <span>·</span>
                        <span>{(f.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>·</span>
                        <span>Uploaded by {uploader?.full_name || "Squad Member"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge variant="outline">{f.category}</Badge>
                    <button
                      onClick={() => {
                        if (f.public_url) {
                          window.open(f.public_url, '_blank');
                        } else {
                          const blob = new Blob([`SquadSync File Export: ${f.file_name}`], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = f.file_name;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      }}
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                      title="Download File"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteFile(f.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
