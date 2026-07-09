import React, { useState } from "react";
import { AdminAccount } from "../../types";

interface AdminManagementViewProps {
  adminAccounts: AdminAccount[];
  newAdminForm: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  setNewAdminForm: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    phone: string;
    password: string;
  }>>;
  isCreatingAdmin: boolean;
  activeAdminActionId: string;
  onCreateAdmin: (event: React.FormEvent) => void;
  onToggleAdminStatus: (account: AdminAccount) => void;
  onResetAdminPassword: (account: AdminAccount, password: string) => void;
}

export default function AdminManagementView({
  adminAccounts,
  newAdminForm,
  setNewAdminForm,
  isCreatingAdmin,
  activeAdminActionId,
  onCreateAdmin,
  onToggleAdminStatus,
  onResetAdminPassword,
}: AdminManagementViewProps) {
  const [passwordResetAdminId, setPasswordResetAdminId] = useState("");
  const [passwordResetValue, setPasswordResetValue] = useState("");

  const regularAdminCount = adminAccounts.filter((account) => !account.isPrimaryAdmin).length;
  const activeAdminCount = adminAccounts.filter((account) => account.status === "Active").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-[#091b6f] sm:text-2xl">Admin Management</h1>
          <p className="break-anywhere mt-1 text-sm font-semibold text-slate-500">
            Configure dashboard access without opening Supabase.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 text-left min-[420px]:grid-cols-2 sm:text-right">
          <div className="rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-extrabold uppercase text-slate-400">Active Admins</p>
            <p className="text-2xl font-extrabold text-[#091b6f]">{activeAdminCount}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-extrabold uppercase text-slate-400">Regular Admins</p>
            <p className="text-2xl font-extrabold text-[#091b6f]">{regularAdminCount}</p>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-extrabold text-[#091b6f]">Create Admin Account</h2>
        <form onSubmit={onCreateAdmin} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs font-extrabold uppercase text-slate-500">Full Name</span>
            <input
              type="text"
              required
              value={newAdminForm.name}
              onChange={(event) => setNewAdminForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-[#091b6f] outline-none focus:border-[#091b6f]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-extrabold uppercase text-slate-500">Email</span>
            <input
              type="email"
              required
              value={newAdminForm.email}
              onChange={(event) => setNewAdminForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-[#091b6f] outline-none focus:border-[#091b6f]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-extrabold uppercase text-slate-500">Phone</span>
            <input
              type="tel"
              value={newAdminForm.phone}
              onChange={(event) => setNewAdminForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-[#091b6f] outline-none focus:border-[#091b6f]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-extrabold uppercase text-slate-500">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={newAdminForm.password}
              onChange={(event) => setNewAdminForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-[#091b6f] outline-none focus:border-[#091b6f]"
            />
          </label>

          <div className="lg:col-span-4">
            <button
              type="submit"
              disabled={isCreatingAdmin}
              className="w-full rounded-md bg-[#091b6f] px-5 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#142a8f] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
              {isCreatingAdmin ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-extrabold text-[#091b6f]">Administrator Accounts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[920px] divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50 whitespace-nowrap">
              <tr>
                <th className="px-6 py-3 text-xs font-extrabold uppercase text-slate-500">Name</th>
                <th className="px-6 py-3 text-xs font-extrabold uppercase text-slate-500">Contact</th>
                <th className="px-6 py-3 text-xs font-extrabold uppercase text-slate-500">Role</th>
                <th className="px-6 py-3 text-xs font-extrabold uppercase text-slate-500">Status</th>
                <th className="px-6 py-3 text-xs font-extrabold uppercase text-slate-500">Created</th>
                <th className="px-6 py-3 text-right text-xs font-extrabold uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
              {adminAccounts.map((account) => {
                const isBusy = activeAdminActionId === account.id;
                const isResetting = passwordResetAdminId === account.id;
                return (
                  <tr key={account.id} className="align-top whitespace-nowrap">
                    <td className="px-6 py-4">
                      <p className="max-w-[170px] truncate font-extrabold text-[#091b6f]" title={account.name}>{account.name}</p>
                      <p className="mt-1 max-w-[170px] truncate text-xs font-semibold text-slate-400" title={account.id}>{account.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-[220px] truncate text-sm font-semibold text-slate-700" title={account.email || "-"}>{account.email || "-"}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">{account.phone || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                        account.isPrimaryAdmin
                          ? "bg-[#091b6f] text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                      >
                        {account.isPrimaryAdmin ? "Primary Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                        account.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                      >
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{account.createdAt || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleAdminStatus(account)}
                          disabled={account.isPrimaryAdmin || isBusy}
                          className={`rounded-md px-3 py-2 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-300 ${
                            account.status === "Active"
                              ? "bg-rose-600 hover:bg-rose-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {isBusy ? "Saving..." : account.status === "Active" ? "Deactivate" : "Activate"}
                        </button>

                        {isResetting ? (
                          <form
                            className="flex flex-col items-end gap-2 sm:flex-row"
                            onSubmit={(event) => {
                              event.preventDefault();
                              onResetAdminPassword(account, passwordResetValue);
                              setPasswordResetValue("");
                              setPasswordResetAdminId("");
                            }}
                          >
                            <input
                              type="password"
                              minLength={8}
                              required
                              autoFocus
                              value={passwordResetValue}
                              onChange={(event) => setPasswordResetValue(event.target.value)}
                              className="w-44 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-[#091b6f] outline-none focus:border-[#091b6f]"
                            />
                            <button
                              type="submit"
                              disabled={isBusy}
                              className="rounded-md bg-[#091b6f] px-3 py-2 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordResetAdminId("");
                                setPasswordResetValue("");
                              }}
                              className="rounded-md border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPasswordResetAdminId(account.id)}
                            disabled={isBusy}
                            className="rounded-md border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Reset Password
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
