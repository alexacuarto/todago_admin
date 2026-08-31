import { useMemo, useState } from "react";
import { FeedbackReport } from "../../types";
import { supabase } from "../../lib/supabase";

interface FeedbackViewProps {
  reports: FeedbackReport[];
  onRefresh: () => Promise<void> | void;
}

const statusClass = (status: string) => {
  if (status === "RESOLVED") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "REVIEWING") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "DISMISSED") return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-100";
};

export default function FeedbackView({ reports, onRefresh }: FeedbackViewProps) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const statusOk = statusFilter === "All" || report.status === statusFilter;
      const typeOk = typeFilter === "All" || report.reportType === typeFilter;
      return statusOk && typeOk;
    });
  }, [reports, statusFilter, typeFilter]);

  const updateReport = async (report: FeedbackReport, status: string) => {
    setSavingId(report.id);
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          admin_notes: notesById[report.id] ?? report.adminNotes ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", report.id);
      if (error) throw error;
      await onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to update feedback report.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#000C7D]">Feedback</h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">Passenger reports for drivers and app issues.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 bg-white">
            <option value="All">All Types</option>
            <option value="APP_FEEDBACK">App</option>
            <option value="DRIVER_FEEDBACK">Driver</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 bg-white">
            <option value="All">All Status</option>
            <option value="OPEN">Open</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400">
          <div className="col-span-3">Report</div>
          <div className="col-span-2">Passenger</div>
          <div className="col-span-2">Driver / Trip</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Action</div>
        </div>
        {filteredReports.map((report) => (
          <div key={report.id} className="grid grid-cols-12 gap-3 px-5 py-4 border-t border-slate-100 text-sm">
            <div className="col-span-12 md:col-span-3">
              <p className="font-extrabold text-slate-800">{report.title}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">{report.category || "General"} · {new Date(report.createdAt).toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{report.message}</p>
            </div>
            <div className="col-span-6 md:col-span-2 font-bold text-slate-700">{report.reporterName || "Unknown Passenger"}</div>
            <div className="col-span-6 md:col-span-2">
              <p className="font-bold text-slate-700">{report.driverName || (report.reportType === "APP_FEEDBACK" ? "App Feedback" : "Unknown Driver")}</p>
              {report.route && <p className="text-[11px] text-slate-500 mt-1">{report.route}</p>}
            </div>
            <div className="col-span-6 md:col-span-2">
              <span className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-extrabold ${statusClass(report.status)}`}>{report.status}</span>
              {report.adminNotes && <p className="text-[11px] text-slate-500 mt-2">{report.adminNotes}</p>}
            </div>
            <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
              <textarea
                rows={2}
                value={notesById[report.id] ?? report.adminNotes ?? ""}
                onChange={(event) => setNotesById((current) => ({ ...current, [report.id]: event.target.value }))}
                placeholder="Admin notes"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 resize-none"
              />
              <div className="flex flex-wrap justify-end gap-2">
                {["REVIEWING", "RESOLVED", "DISMISSED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateReport(report, status)}
                    disabled={savingId === report.id}
                    className="px-3 py-1.5 rounded-lg bg-[#000C7D] text-white text-[10px] font-extrabold cursor-pointer disabled:opacity-60"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredReports.length === 0 && (
          <div className="px-5 py-12 text-center text-sm font-semibold text-slate-400">No feedback reports found.</div>
        )}
      </div>
    </div>
  );
}
