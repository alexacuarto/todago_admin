import { useMemo, useState } from "react";
import { FeedbackReport } from "../../types";
import { supabase } from "../../lib/supabase";

interface FeedbackViewProps {
  reports: FeedbackReport[];
  onRefresh: () => Promise<void> | void;
}

export default function FeedbackView({ reports, onRefresh }: FeedbackViewProps) {
  const [typeFilter, setTypeFilter] = useState("All");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const typeOk = typeFilter === "All" || report.reportType === typeFilter;
      return typeOk;
    });
  }, [reports, typeFilter]);

  const updateReport = async (report: FeedbackReport, status = "RESOLVED") => {
    setSavingId(report.id);
    const adminNotesText = (notesById[report.id] ?? report.adminNotes ?? "").trim();

    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          admin_notes: adminNotesText || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", report.id);
      if (error) throw error;

      // Automated notifications dispatched to Passenger and/or Driver
      const notificationsToInsert: any[] = [];

      // 1. Notify reporting passenger
      if (report.reporterProfileId) {
        notificationsToInsert.push({
          recipient_id: report.reporterProfileId,
          type: "in_app",
          title: "Feedback Resolved",
          body: adminNotesText
            ? `Admin response on "${report.title}": ${adminNotesText}`
            : `Your feedback "${report.title}" has been reviewed and resolved by administration.`,
          notification_category: "feedback",
          is_sent: true,
          is_read: false,
          data: {
            report_id: report.id,
            status,
            category: report.category,
            notes: adminNotesText,
          },
        });
      }

      // 2. Notify driver if involved and not the reporter
      if (report.driverProfileId && report.driverProfileId !== report.reporterProfileId) {
        notificationsToInsert.push({
          recipient_id: report.driverProfileId,
          type: "in_app",
          title: "Trip Feedback Update",
          body: adminNotesText
            ? `Admin note regarding feedback on your ride: ${adminNotesText}`
            : `A trip feedback report has been reviewed and marked as resolved by administration.`,
          notification_category: "feedback",
          is_sent: true,
          is_read: false,
          data: {
            report_id: report.id,
            status,
            notes: adminNotesText,
          },
        });
      }

      if (notificationsToInsert.length > 0) {
        console.log("[Supabase Query] Sending in-app notifications for feedback resolution:", notificationsToInsert);
        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notificationsToInsert);
        if (notifError) {
          console.warn("[Supabase Warning] Notification insert warning:", notifError.message);
        }
      }

      alert("Feedback saved and notification sent successfully!");
      await onRefresh();
    } catch (err: any) {
      console.error("[Supabase Error] Updating feedback report:", err);
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
          <p className="text-sm font-semibold text-slate-500 mt-1">User reports and feedback management.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 bg-white outline-hidden focus:border-[#000C7D]"
          >
            <option value="All">All Types</option>
            <option value="APP_FEEDBACK">App Feedback</option>
            <option value="DRIVER_FEEDBACK">Driver Feedback</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400">
          <div className="col-span-4">Report</div>
          <div className="col-span-2">Reporter</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-4 text-right">Action & Notes</div>
        </div>
        {filteredReports.map((report) => {
          const isDriver = report.reporterRole === "driver" || report.reportType === "DRIVER_FEEDBACK";
          return (
            <div key={report.id} className="grid grid-cols-12 gap-3 px-5 py-4 border-t border-slate-100 text-sm items-start">
              <div className="col-span-12 md:col-span-4">
                <p className="font-extrabold text-slate-800">{report.title}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {report.category || "General"} · {new Date(report.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {report.message}
                </p>
              </div>

              <div className="col-span-6 md:col-span-2 font-bold text-slate-700">
                <p className="text-[#000C7D] font-extrabold">{report.reporterName || "Unknown User"}</p>
                {report.driverName && (
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Ref Driver: {report.driverName}</p>
                )}
              </div>

              <div className="col-span-6 md:col-span-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                    isDriver
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-sky-50 text-sky-700 border-sky-200"
                  }`}
                >
                  {isDriver ? "Driver" : "Passenger"}
                </span>
                {report.route && (
                  <p className="text-[10px] text-slate-400 font-medium mt-1.5 truncate">{report.route}</p>
                )}
              </div>

              <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
                <textarea
                  rows={2}
                  value={notesById[report.id] ?? report.adminNotes ?? ""}
                  onChange={(event) => setNotesById((current) => ({ ...current, [report.id]: event.target.value }))}
                  placeholder="Enter admin response or resolution notes..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 resize-none outline-hidden focus:border-[#000C7D]"
                />
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {report.adminNotes && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span>✓</span> Notes Saved
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => updateReport(report, "RESOLVED")}
                    disabled={savingId === report.id}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{savingId === report.id ? "Sending..." : "Done & Notify"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredReports.length === 0 && (
          <div className="px-5 py-12 text-center text-sm font-semibold text-slate-400">No feedback reports found.</div>
        )}
      </div>
    </div>
  );
}
