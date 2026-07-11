import { FareSetting } from "../../types";

interface FareSettingsViewProps {
  fareSettings: FareSetting[];
  fareSettingsError: string;
  isLoadingFareSettings: boolean;
  isSavingFareSetting: string;
  onFareSettingChange: (tripType: FareSetting["tripType"], updates: Partial<FareSetting>) => void;
  onSaveFareSetting: (setting: FareSetting) => void;
}

export default function FareSettingsView({
  fareSettings,
  fareSettingsError,
  isLoadingFareSettings,
  isSavingFareSetting,
  onFareSettingChange,
  onSaveFareSetting,
}: FareSettingsViewProps) {
  return (
    <div className="flex w-full max-w-7xl flex-col gap-4 mx-auto sm:gap-6">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-[#091b6f] text-xl font-extrabold tracking-wide sm:text-2xl">Adjust Fare Pricing</h1>
          <p className="break-anywhere text-xs text-slate-400 font-medium mt-1">
            Manage pricing and passenger discounts.
          </p>
        </div>
      </div>

      {isLoadingFareSettings && (
        <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#091b6f]">
          Loading fare settings...
        </div>
      )}

      {fareSettingsError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {fareSettingsError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {fareSettings.map((setting) => {
          const isSaving = isSavingFareSetting === setting.tripType;
          return (
            <section key={setting.tripType} className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <h2 className="break-anywhere text-lg font-extrabold text-[#091b6f]">{setting.label}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <label className="space-y-1">
                  <span className="text-xs font-extrabold uppercase text-slate-500">Display Label</span>
                  <input
                    value={setting.label}
                    onChange={(event) =>
                      onFareSettingChange(setting.tripType, { label: event.target.value })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#091b6f]"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-extrabold uppercase text-slate-500">Base Fare</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={setting.baseFare}
                    onChange={(event) =>
                      onFareSettingChange(setting.tripType, {
                        baseFare: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#091b6f]"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-extrabold uppercase text-slate-500">Included KM</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={setting.includedKm}
                    onChange={(event) =>
                      onFareSettingChange(setting.tripType, {
                        includedKm: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#091b6f]"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-extrabold uppercase text-slate-500">Succeeding KM Fare</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={setting.perSucceedingKm}
                    onChange={(event) =>
                      onFareSettingChange(setting.tripType, {
                        perSucceedingKm: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#091b6f]"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-extrabold uppercase text-slate-500">Student Discount (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={setting.studentDiscountPercent}
                    onChange={(event) =>
                      onFareSettingChange(setting.tripType, {
                        studentDiscountPercent: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#091b6f]"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-extrabold uppercase text-slate-500">PWD Discount (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={setting.pwdDiscountPercent}
                    onChange={(event) =>
                      onFareSettingChange(setting.tripType, {
                        pwdDiscountPercent: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#091b6f]"
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <span className="text-xs font-extrabold uppercase text-slate-500">Senior Citizen Discount (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={setting.seniorDiscountPercent}
                    onChange={(event) =>
                      onFareSettingChange(setting.tripType, {
                        seniorDiscountPercent: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#091b6f]"
                  />
                </label>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
                <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="break-anywhere text-xs font-semibold text-slate-500">
                    Last updated: {setting.updatedAt ? new Date(setting.updatedAt).toLocaleString() : "Not yet saved"}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSaveFareSetting(setting)}
                    disabled={isSaving}
                    className="rounded-md bg-[#091b6f] px-5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#132b91] disabled:cursor-wait disabled:bg-slate-400"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
