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

const DEFAULT_ROUND_TRIP: Omit<FareConfig, "id"> = {
  tripType: "round_trip",
  displayLabel: "Round Trip",
  baseFare: 40,
  includedKm: 2,
  succeedingKmFare: 2,
  studentDiscount: 20,
  pwdDiscount: 20,
  seniorCitizenDiscount: 20,
  lastUpdated: new Date().toLocaleString(),
};

function mapDbRow(row: any): FareConfig {
  return {
    id: row.id,
    tripType: row.trip_type ?? "one_way",
    displayLabel: row.display_label ?? "One Way Trip",
    baseFare: Number(row.base_fare ?? 25),
    includedKm: Number(row.included_km ?? 1),
    succeedingKmFare: Number(row.succeeding_km_fare ?? 2),
    studentDiscount: Number(row.student_discount ?? 20),
    pwdDiscount: Number(row.pwd_discount ?? 20),
    seniorCitizenDiscount: Number(row.senior_citizen_discount ?? 20),
    lastUpdated: row.updated_at
      ? new Date(row.updated_at).toLocaleString()
      : new Date().toLocaleString(),
  };
}

export default function FareSettingsView() {
  const [oneWay, setOneWay] = useState<FareConfig>({ id: "", ...DEFAULT_ONE_WAY });
  const [roundTrip, setRoundTrip] = useState<FareConfig>({ id: "", ...DEFAULT_ROUND_TRIP });

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [savingOneWay, setSavingOneWay] = useState(false);
  const [savingRoundTrip, setSavingRoundTrip] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load fare settings from Supabase on mount
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

      if (data && data.length > 0) {
        for (const row of data) {
          const config = mapDbRow(row);
          if (config.tripType === "one_way") {
            setOneWay(config);
            localStorage.setItem("toda_go_fare_oneway", JSON.stringify(config));
          } else if (config.tripType === "round_trip") {
            setRoundTrip(config);
            localStorage.setItem("toda_go_fare_roundtrip", JSON.stringify(config));
          }
        }
      } else {
        // Fallback: try localStorage cache
        const cachedOneWay = localStorage.getItem("toda_go_fare_oneway");
        const cachedRoundTrip = localStorage.getItem("toda_go_fare_roundtrip");
        if (cachedOneWay) setOneWay(JSON.parse(cachedOneWay));
        if (cachedRoundTrip) setRoundTrip(JSON.parse(cachedRoundTrip));
      }
    } catch (err: any) {
      console.error("Error fetching fare settings:", err);
      setFetchError(err.message || "Failed to load fare settings");
      // Fallback to localStorage on error
      const cachedOneWay = localStorage.getItem("toda_go_fare_oneway");
      const cachedRoundTrip = localStorage.getItem("toda_go_fare_roundtrip");
      if (cachedOneWay) setOneWay(JSON.parse(cachedOneWay));
      if (cachedRoundTrip) setRoundTrip(JSON.parse(cachedRoundTrip));
    } finally {
      setIsLoadingData(false);
    }
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveToSupabase = async (config: FareConfig, setLoading: (v: boolean) => void, setter: (v: FareConfig) => void, cacheKey: string) => {
    setLoading(true);
    try {
      const updatePayload = {
        display_label: config.displayLabel,
        base_fare: config.baseFare,
        included_km: config.includedKm,
        succeeding_km_fare: config.succeedingKmFare,
        student_discount: config.studentDiscount,
        pwd_discount: config.pwdDiscount,
        senior_citizen_discount: config.seniorCitizenDiscount,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("fare_configurations")
        .update(updatePayload)
        .eq("trip_type", config.tripType);

      if (error) throw error;

      const nowStr = new Date().toLocaleString();
      const updated = { ...config, lastUpdated: nowStr };
      setter(updated);
      localStorage.setItem(cacheKey, JSON.stringify(updated));
      triggerToast(`${config.displayLabel} pricing updated successfully!`);
    } catch (err: any) {
      console.error("Error saving fare settings:", err);
      triggerToast(`Error: ${err.message || "Failed to save"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOneWay = () =>
    saveToSupabase(oneWay, setSavingOneWay, setOneWay, "toda_go_fare_oneway");

  const handleSaveRoundTrip = () =>
    saveToSupabase(roundTrip, setSavingRoundTrip, setRoundTrip, "toda_go_fare_roundtrip");

  // Loading state
  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider">Loading Fare Settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-3.5 rounded-xl shadow-xl font-bold flex items-center gap-3 border animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.startsWith("Error")
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
          <span>⚠️ {fetchError} — Showing cached values.</span>
          <button onClick={fetchFareSettings} className="px-4 py-1.5 bg-rose-200 hover:bg-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#091b6f] tracking-tight">Adjust Fare Pricing</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">Manage pricing and passenger discounts.</p>
      </div>

      {/* Main Pricing Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* CARD 1: One Way Trip */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-8 flex-1">
            <h2 className="text-xl font-extrabold text-[#091b6f] mb-6">One Way Trip</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Display Label</label>
                <input type="text" value={oneWay.displayLabel}
                  onChange={(e) => setOneWay({ ...oneWay, displayLabel: e.target.value })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Base Fare</label>
                <input type="number" value={oneWay.baseFare}
                  onChange={(e) => setOneWay({ ...oneWay, baseFare: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Included KM</label>
                <input type="number" value={oneWay.includedKm}
                  onChange={(e) => setOneWay({ ...oneWay, includedKm: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Succeeding KM Fare</label>
                <input type="number" value={oneWay.succeedingKmFare}
                  onChange={(e) => setOneWay({ ...oneWay, succeedingKmFare: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Student Discount (%)</label>
                <input type="number" value={oneWay.studentDiscount}
                  onChange={(e) => setOneWay({ ...oneWay, studentDiscount: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">PWD Discount (%)</label>
                <input type="number" value={oneWay.pwdDiscount}
                  onChange={(e) => setOneWay({ ...oneWay, pwdDiscount: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Senior Citizen Discount (%)</label>
                <input type="number" value={oneWay.seniorCitizenDiscount}
                  onChange={(e) => setOneWay({ ...oneWay, seniorCitizenDiscount: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
            </div>
          </div>
          <div className="bg-[#f5f9ff] px-8 py-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Last updated: {oneWay.lastUpdated}</span>
            <button onClick={handleSaveOneWay} disabled={savingOneWay}
              className="px-6 py-2.5 bg-[#111c80] hover:bg-[#1a28a3] disabled:bg-[#111c80]/70 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-2">
              {savingOneWay ? (
                <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Saving...</span></>
              ) : ("Save Changes")}
            </button>
          </div>
        </div>

        {/* CARD 2: Round Trip */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-8 flex-1">
            <h2 className="text-xl font-extrabold text-[#091b6f] mb-6">Round Trip</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Display Label</label>
                <input type="text" value={roundTrip.displayLabel}
                  onChange={(e) => setRoundTrip({ ...roundTrip, displayLabel: e.target.value })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Base Fare</label>
                <input type="number" value={roundTrip.baseFare}
                  onChange={(e) => setRoundTrip({ ...roundTrip, baseFare: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Included KM</label>
                <input type="number" value={roundTrip.includedKm}
                  onChange={(e) => setRoundTrip({ ...roundTrip, includedKm: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Succeeding KM Fare</label>
                <input type="number" value={roundTrip.succeedingKmFare}
                  onChange={(e) => setRoundTrip({ ...roundTrip, succeedingKmFare: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Student Discount (%)</label>
                <input type="number" value={roundTrip.studentDiscount}
                  onChange={(e) => setRoundTrip({ ...roundTrip, studentDiscount: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">PWD Discount (%)</label>
                <input type="number" value={roundTrip.pwdDiscount}
                  onChange={(e) => setRoundTrip({ ...roundTrip, pwdDiscount: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">Senior Citizen Discount (%)</label>
                <input type="number" value={roundTrip.seniorCitizenDiscount}
                  onChange={(e) => setRoundTrip({ ...roundTrip, seniorCitizenDiscount: Number(e.target.value) })}
                  className="w-full bg-white border border-[#c7dfff] hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm font-bold text-[#172554] transition-all" />
              </div>
            </div>
          </div>
          <div className="bg-[#f5f9ff] px-8 py-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Last updated: {roundTrip.lastUpdated}</span>
            <button onClick={handleSaveRoundTrip} disabled={savingRoundTrip}
              className="px-6 py-2.5 bg-[#111c80] hover:bg-[#1a28a3] disabled:bg-[#111c80]/70 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-2">
              {savingRoundTrip ? (
                <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Saving...</span></>
              ) : ("Save Changes")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
