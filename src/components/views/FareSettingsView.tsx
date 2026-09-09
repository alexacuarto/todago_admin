import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface FareConfig {
  id: string;
  tripType: string;
  displayLabel: string;
  baseFare: number;
  includedKm: number;
  succeedingKmFare: number;
  studentDiscount: number;
  pwdDiscount: number;
  seniorCitizenDiscount: number;
  lastUpdated: string;
}

const DEFAULT_ONE_WAY: Omit<FareConfig, "id"> = {
  tripType: "one_way",
  displayLabel: "One Way Trip",
  baseFare: 25,
  includedKm: 1,
  succeedingKmFare: 2,
  studentDiscount: 20,
  pwdDiscount: 20,
  seniorCitizenDiscount: 20,
  lastUpdated: new Date().toLocaleString(),
};

function mapDbRow(row: any): FareConfig {
  const rate = (field: string, percentage = false) => {
    if (row[field] == null) throw new Error(`Missing fare setting: ${field}`);
    const value = Number(row[field]);
    if (!Number.isFinite(value) || value < 0 || (percentage && value > 100)) throw new Error(`Invalid fare setting: ${field}`);
    return value;
  };
  return {
    id: row.id,
    tripType: row.trip_type ?? "one_way",
    displayLabel: row.display_label ?? "One Way Trip",
    baseFare: rate('base_fare'),
    includedKm: rate('included_km'),
    succeedingKmFare: rate('succeeding_km_fare'),
    studentDiscount: rate('student_discount', true),
    pwdDiscount: rate('pwd_discount', true),
    seniorCitizenDiscount: rate('senior_citizen_discount', true),
    lastUpdated: row.updated_at
      ? new Date(row.updated_at).toLocaleString()
      : new Date().toLocaleString(),
  };
}

export default function FareSettingsView() {
  const [fareConfig, setFareConfig] = useState<FareConfig>({ id: "", ...DEFAULT_ONE_WAY });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [savingFare, setSavingFare] = useState(false);
  const [fareChangeMessage, setFareChangeMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchFareSettings();
  }, []);

  const fetchFareSettings = async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from("fare_configurations")
        .select("*")
        .eq("is_active", true)
        .order("trip_type", { ascending: true });

      if (error) throw error;

      const oneWayRow = data?.find(row => row.trip_type === 'one_way') || data?.[0];
      if (oneWayRow) {
        const config = mapDbRow(oneWayRow);
        setFareConfig(config);
        localStorage.setItem("toda_go_fare_oneway", JSON.stringify(config));
      } else {
        throw new Error("No active fare settings found in Supabase.");
      }
    } catch (err: any) {
      console.error("Error fetching fare settings:", err);
      setFetchError(err.message || "Failed to load fare settings");
    } finally {
      setIsLoadingData(false);
    }
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveFare = async () => {
    if (!fareChangeMessage.trim()) {
      triggerToast("Error: Please add a fare change message before saving.");
      return;
    }

    setSavingFare(true);
    try {
      const { error } = await supabase.rpc("update_fare_configuration_with_message", {
        p_trip_type: fareConfig.tripType || "one_way",
        p_display_label: fareConfig.displayLabel || "One Way Trip",
        p_base_fare: fareConfig.baseFare,
        p_included_km: fareConfig.includedKm,
        p_succeeding_km_fare: fareConfig.succeedingKmFare,
        p_student_discount: fareConfig.studentDiscount,
        p_pwd_discount: fareConfig.pwdDiscount,
        p_senior_citizen_discount: fareConfig.seniorCitizenDiscount,
        p_message: fareChangeMessage.trim(),
      });

      if (error) throw error;

      const { data: saved, error: readError } = await supabase
        .from('fare_configurations')
        .select('*')
        .eq('id', fareConfig.id)
        .single();

      if (readError) throw readError;
      const updated = mapDbRow(saved);
      setFareConfig(updated);
      localStorage.setItem("toda_go_fare_oneway", JSON.stringify(updated));
      setFareChangeMessage("");
      triggerToast("TODA tariff pricing updated and notifications dispatched to apps.");
    } catch (err: any) {
      console.error("Error saving fare settings:", err);
      triggerToast(`Error: ${err.message || "Failed to save"}`);
    } finally {
      setSavingFare(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider">Loading Fare Settings...</p>
      </div>
    );
  }

  if (fetchError || !fareConfig.id) {
    return (
      <div role="alert" className="p-6 text-rose-800">
        <p>{fetchError || 'Fare settings are unavailable.'}</p>
        <button onClick={fetchFareSettings} className="mt-3 rounded border px-4 py-2">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-3.5 rounded-xl shadow-xl font-bold flex items-center gap-3 border animate-in fade-in slide-in-from-top-4 duration-200 ${toastMessage.startsWith("Error")
            ? "bg-rose-600 text-white border-rose-400"
            : "bg-[#111c80] text-white border-sky-400"
            }`}
        >
          <svg className="w-5 h-5 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            {toastMessage.startsWith("Error") ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            )}
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error banner */}
      {fetchError && (
        <div className="mb-2 p-4 bg-rose-100 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold flex items-center justify-between">
          <span>⚠️ {fetchError} — Database values could not be loaded.</span>
          <button onClick={fetchFareSettings} className="px-4 py-1.5 bg-rose-200 hover:bg-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#000C7D] tracking-tight">Adjust Fare Pricing</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">Manage standard TODA tariff rates and statutory passenger discounts.</p>
      </div>

      {/* Informational Callout for Special Trips */}
      { /* <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 bg-sky-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="text-sm text-slate-700 leading-relaxed">
          <span className="font-extrabold text-[#000C7D] block mb-1">Unified Fare Calculation for One-Way & Special Trips</span>
          This standard tariff serves as the single source of truth across all rides. For <strong>One-Way Trips</strong>, the standard base fare and included kilometer coverage apply. For <strong>Special Trips (Multi-Stop)</strong>, the base fare and included distance scale directly with the number of selected stops (up to 8 stops), with excess distance charged per succeeding kilometer.
        </div> 
      </div> */}

      {/* Unified Tariff Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-8 flex-1">
          {/* <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-[#000C7D]">Adjust Fare Settings</h2>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-extrabold">Active Tariff</span>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-[#000C7D] tracking-wider uppercase">Display Label</label>
              <input
                type="text"
                value={fareConfig.displayLabel}
                onChange={(e) => setFareConfig({ ...fareConfig, displayLabel: e.target.value })}
                className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-[#000C7D] tracking-wider uppercase">Base Fare (₱)</label>
              <input
                type="number"
                value={fareConfig.baseFare}
                onChange={(e) => setFareConfig({ ...fareConfig, baseFare: Number(e.target.value) })}
                className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-[#000C7D] tracking-wider uppercase">Included KM per Stop</label>
              <input
                type="number"
                step="0.5"
                value={fareConfig.includedKm}
                onChange={(e) => setFareConfig({ ...fareConfig, includedKm: Number(e.target.value) })}
                className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-[#000C7D] tracking-wider uppercase">Succeeding KM Fare (₱ / KM)</label>
              <input
                type="number"
                step="0.5"
                value={fareConfig.succeedingKmFare}
                onChange={(e) => setFareConfig({ ...fareConfig, succeedingKmFare: Number(e.target.value) })}
                className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-[#000C7D] tracking-wider uppercase">Student Discount (%)</label>
              <input
                type="number"
                value={fareConfig.studentDiscount}
                onChange={(e) => setFareConfig({ ...fareConfig, studentDiscount: Number(e.target.value) })}
                className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-[#000C7D] tracking-wider uppercase">PWD Discount (%)</label>
              <input
                type="number"
                value={fareConfig.pwdDiscount}
                onChange={(e) => setFareConfig({ ...fareConfig, pwdDiscount: Number(e.target.value) })}
                className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-extrabold text-[#000C7D] tracking-wider uppercase">Senior Citizen Discount (%)</label>
              <input
                type="number"
                value={fareConfig.seniorCitizenDiscount}
                onChange={(e) => setFareConfig({ ...fareConfig, seniorCitizenDiscount: Number(e.target.value) })}
                className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-extrabold text-[#000C7D] tracking-wider uppercase">Fare Change Notice Message</label>
              <textarea
                value={fareChangeMessage}
                onChange={(e) => setFareChangeMessage(e.target.value)}
                rows={3}
                placeholder="Explain the reason for this tariff adjustment. This explanation will be broadcast to all passenger and driver notifications."
                className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#f5f9ff] px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Last updated: {fareConfig.lastUpdated}</span>
          <button
            onClick={handleSaveFare}
            disabled={savingFare}
            className="px-6 py-2.5 bg-[#111c80] hover:bg-[#1a28a3] disabled:bg-[#111c80]/70 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-2"
          >
            {savingFare ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Broadcasting Updates...</span>
              </>
            ) : (
              "Save Tariff Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
