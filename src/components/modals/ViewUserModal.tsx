import React, { useEffect, useMemo, useState } from "react";
import { Driver, DriverProfileChangeRequest, Passenger, RideRequest } from "../../types";
import { supabase } from "../../lib/supabase";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingUser: Driver | Passenger | null;
  viewingUserType: "driver" | "passenger" | null;
  onDeactivatePassengerToggle: (id: string) => void;
  onResetCanceledTrips: (id: string) => void;
  onDeleteDriver: (driver: Driver) => void;
  onDeletePassenger: (passenger: Passenger) => void;
  onRefreshData?: () => void;
  rideRequests?: RideRequest[];
  driverChangeRequests?: DriverProfileChangeRequest[];
}

const statusBadge = (status: string) => {
  if (status === "Active" || status === "ACTIVE" || status === "VERIFIED") return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (status === "Warning" || status === "PENDING") return "bg-amber-50 text-amber-600 border-amber-100";
  return "bg-rose-50 text-rose-600 border-rose-100";
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
    <div className="font-bold text-slate-700 mt-0.5 break-words">{value}</div>
  </div>
);

const formatMinutes = (minutes: number) => {
  const safeMinutes = Math.max(0, Math.floor(minutes || 0));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  if (hours === 0) return `${mins} min`;
  return `${hours}h ${mins}m`;
};

const FilePicker = ({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) => {
  const inputId = React.useId();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-slate-400 font-bold uppercase">{label}</label>
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="px-3 py-1.5 bg-[#000C7D] text-white rounded-lg text-[10px] font-bold cursor-pointer hover:bg-blue-900"
        >
          Browse
        </label>
        <span className="text-[10px] text-slate-500 font-semibold truncate">{file?.name || "No file selected"}</span>
      </div>
      <input
        id={inputId}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
        className="hidden"
      />
    </div>
  );
};

export default function ViewUserModal({
  isOpen,
  onClose,
  viewingUser,
  viewingUserType,
  onDeactivatePassengerToggle,
  onResetCanceledTrips,
  onDeleteDriver,
  onDeletePassenger,
  onRefreshData,
  rideRequests = [],
  driverChangeRequests = [],
}: ViewUserModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [zoomType, setZoomType] = useState<"front" | "back" | "franchise" | "discount" | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);
  const [discountReviewReason, setDiscountReviewReason] = useState("");
  const [isReviewingDiscount, setIsReviewingDiscount] = useState(false);
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseFrontFile, setLicenseFrontFile] = useState<File | null>(null);
  const [licenseBackFile, setLicenseBackFile] = useState<File | null>(null);
  const [franchiseNo, setFranchiseNo] = useState("");
  const [franchiseExpiry, setFranchiseExpiry] = useState("");
  const [franchiseFile, setFranchiseFile] = useState<File | null>(null);
  const [franchisePlateNo, setFranchisePlateNo] = useState("");
  const [isSavingDocs, setIsSavingDocs] = useState(false);
  const [activeDriverAction, setActiveDriverAction] = useState<"suspend" | "clear" | null>(null);
  const [driverActionReason, setDriverActionReason] = useState("");
  const [isExecutingDriverAction, setIsExecutingDriverAction] = useState(false);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [changeRequestReason, setChangeRequestReason] = useState("");
  const [ridePage, setRidePage] = useState(1);

  useEffect(() => {
    if (viewingUser && viewingUserType === "driver") {
      const driver = viewingUser as Driver;
      setLicenseNo(driver.license || "");
      setLicenseExpiry(driver.licenseExpiryDate || "");
      setFranchiseNo(driver.franchiseNumber || "");
      setFranchiseExpiry(driver.franchiseExpiryDate || "");
      setFranchisePlateNo(driver.plateNumber || "");
      setLicenseFrontFile(null);
      setLicenseBackFile(null);
      setFranchiseFile(null);
      setActiveDriverAction(null);
      setDriverActionReason("");
    }
    setDiscountReviewReason("");
    setRidePage(1);
  }, [viewingUser, viewingUserType, isOpen]);

  const passengerRideHistory = useMemo(() => {
    if (!viewingUser || viewingUserType !== "passenger") return [];
    return rideRequests.filter((request) => request.passengerId === viewingUser.id);
  }, [rideRequests, viewingUser, viewingUserType]);

  const ridePageCount = Math.max(1, Math.ceil(passengerRideHistory.length / 3));
  const visibleRideHistory = passengerRideHistory.slice((ridePage - 1) * 3, ridePage * 3);

  if (!isOpen || !viewingUser) return null;

  const driver = viewingUserType === "driver" ? viewingUser as Driver : null;
  const passenger = viewingUserType === "passenger" ? viewingUser as Passenger : null;
  const visibleDriverChangeRequests = driver
    ? driverChangeRequests.filter((request) => request.driverId === driver.id)
    : [];

  const handleZoomClick = async (type: "front" | "back" | "franchise" | "discount") => {
    const url =
      type === "front" ? driver?.licenseFrontUrl || driver?.licensePhotoUrl || "" :
      type === "back" ? driver?.licenseBackUrl || "" :
      type === "franchise" ? driver?.franchiseUrl || "" :
      passenger?.discountDocumentUrl || "";

    if (!url) return;
    setZoomType(type);
    setLoadingSignedUrl(true);

    try {
      let path = url;
      if (url.includes("/discount-ids/")) path = url.split("/discount-ids/").pop() || url;
      else if (url.includes("/driver-documents/")) path = url.split("/driver-documents/").pop() || url;
      else if (url.includes("/licenses/")) path = url.split("/licenses/").pop() || url;
      else path = url.split("/").pop() || url;

      const bucketName = type === "discount" ? "discount-ids" : url.includes("/licenses/") ? "licenses" : "driver-documents";
      const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(decodeURIComponent(path), 300);
      setSignedUrl(error ? url : data?.signedUrl || url);
    } catch (err) {
      console.error("Failed to generate signed URL:", err);
      setSignedUrl(url);
    } finally {
      setLoadingSignedUrl(false);
    }
  };

  const uploadDocFile = async (userId: string, file: File, label: string) => {
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${userId}-${label}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("driver-documents").upload(fileName, file, { upsert: true });
    if (error) throw new Error(`Failed to upload ${label}: ${error.message}`);
    return supabase.storage.from("driver-documents").getPublicUrl(fileName).data.publicUrl;
  };

  const handleSaveDocuments = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!driver) return;
    setIsSavingDocs(true);

    try {
      const updates: Record<string, string | null> = {};
      if (licenseNo) updates.license_number = licenseNo;
      if (licenseExpiry) updates.license_expiry_date = licenseExpiry;
      if (franchiseNo) updates.franchise_number = franchiseNo;
      if (franchiseExpiry) updates.franchise_expiry_date = franchiseExpiry;

      if (franchisePlateNo) {
        const { error } = await supabase.from("vehicles").update({ plate_number: franchisePlateNo }).eq("driver_id", driver.id);
        if (error) throw error;
      }

      if (licenseFrontFile) {
        const frontUrl = await uploadDocFile(driver.id, licenseFrontFile, "front");
        updates.license_front_url = frontUrl;
        updates.license_photo_url = frontUrl;
      }
      if (licenseBackFile) updates.license_back_url = await uploadDocFile(driver.id, licenseBackFile, "back");
      if (franchiseFile) updates.franchise_url = await uploadDocFile(driver.id, franchiseFile, "franchise");

      const { error } = await supabase.from("drivers").update(updates).eq("id", driver.id);
      if (error) throw error;

      alert("Driver documents saved.");
      onRefreshData?.();
      onClose();
    } catch (err: any) {
      console.error("Error saving documents:", err);
      alert(`Failed to save documents: ${err.message || err}`);
    } finally {
      setIsSavingDocs(false);
    }
  };

  const handleReviewDiscount = async (status: "VERIFIED" | "REJECTED") => {
    if (!passenger || isReviewingDiscount) return;
    if (status === "REJECTED" && !discountReviewReason.trim()) {
      alert("Please add a rejection reason.");
      return;
    }

    setIsReviewingDiscount(true);
    try {
      const { error } = await supabase.rpc("review_passenger_discount_document", {
        p_passenger_id: passenger.id,
        p_status: status,
        p_reason: status === "REJECTED" ? discountReviewReason.trim() : null,
      });
      if (error) throw error;
      alert(status === "VERIFIED" ? "Passenger discount ID approved." : "Passenger discount ID rejected.");
      onRefreshData?.();
    } catch (err: any) {
      console.error("Discount review failed:", err);
      alert(err.message || "Failed to review discount ID.");
    } finally {
      setIsReviewingDiscount(false);
    }
  };

  const handleDriverAction = async () => {
    if (!driver || !activeDriverAction) return;
    if (activeDriverAction === "suspend" && !driverActionReason.trim()) {
      alert("Please enter a suspension reason.");
      return;
    }

    setIsExecutingDriverAction(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const update = activeDriverAction === "clear"
        ? { admin_action_type: null, admin_action_reason: null, admin_action_date: null, admin_action_by: null }
        : {
            admin_action_type: "suspended",
            admin_action_reason: driverActionReason.trim(),
            admin_action_date: new Date().toISOString(),
            admin_action_by: session?.user?.id || null,
          };
      const { error } = await supabase.from("drivers").update(update).eq("id", driver.id);
      if (error) throw error;
      alert(activeDriverAction === "clear" ? "Driver restriction removed." : "Driver suspended.");
      onRefreshData?.();
      onClose();
    } catch (err: any) {
      console.error("Driver action failed:", err);
      alert(err.message || "Failed to update driver.");
    } finally {
      setIsExecutingDriverAction(false);
    }
  };

  const fieldLabel = (fieldName: string) => {
    const labels: Record<string, string> = {
      full_name: "Full Name",
      toda_association: "TODA Association",
      license_number: "License Number",
      plate_number: "Plate Number",
      phone_number: "Phone Number",
      email: "Email",
      address: "Address",
    };
    return labels[fieldName] || fieldName.replace(/_/g, " ");
  };

  const handleReviewChangeRequest = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !changeRequestReason.trim()) {
      alert("Please add a rejection reason.");
      return;
    }
    setReviewingRequestId(requestId);
    try {
      const { error } = await supabase.rpc("review_driver_profile_change_request", {
        p_request_id: requestId,
        p_status: status,
        p_reason: status === "REJECTED" ? changeRequestReason.trim() : null,
      });
      if (error) throw error;
      setChangeRequestReason("");
      await onRefreshData?.();
    } catch (err: any) {
      alert(err.message || "Failed to review driver change request.");
    } finally {
      setReviewingRequestId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 max-h-[90vh]">
        <div className="bg-[#000C7D] text-white px-6 py-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
              {driver ? "Driver Account" : "Passenger Account"}
            </span>
            <h3 className="font-bold text-lg">Details</h3>
          </div>
          <button onClick={onClose} className="text-white/85 hover:text-white transition-colors cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 text-left overflow-y-auto">
          {driver && (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                <Field label="Driver Name" value={driver.name} />
                <Field label="Phone Number" value={driver.phone} />
                <Field label="Email" value={driver.email || "N/A"} />
                <Field label="TODA Association" value={driver.toda} />
                <Field label="Plate Number" value={<span className="font-mono">{driver.plateNumber || "N/A"}</span>} />
                <Field
                  label="Document Status"
                  value={<span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(driver.documentStatus || "PENDING")}`}>{driver.documentStatus || "PENDING"}</span>}
                />
                <Field
                  label="Activity Status"
                  value={<span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(driver.activityStatus)}`}>{driver.activityStatus}</span>}
                />
                <Field
                  label="Online State"
                  value={driver.isOnline ? "Online" : "Offline"}
                />
                <Field
                  label="Total Online Time"
                  value={formatMinutes((driver.totalOnlineMinutes || 0) + (driver.liveOnlineMinutes || 0))}
                />
                <Field
                  label="Current Session"
                  value={driver.isOnline ? formatMinutes(driver.liveOnlineMinutes || 0) : "Not active"}
                />
                <Field
                  label="Last Completed Ride"
                  value={driver.lastCompletedRideAt ? new Date(driver.lastCompletedRideAt).toLocaleString() : "Never"}
                />
              </div>

              <div className="flex flex-col gap-4 border border-slate-100 p-4 rounded-2xl bg-slate-50/20">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Driver Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-[#000C7D] uppercase">Driver License</span>
                    <Field label="License Number" value={driver.license || "N/A"} />
                    <Field label="Expiry Date" value={driver.licenseExpiryDate || "N/A"} />
                    <div className="flex gap-2 mt-1">
                      {driver.licenseFrontUrl && <button type="button" onClick={() => handleZoomClick("front")} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg cursor-pointer">Front Image</button>}
                      {driver.licenseBackUrl && <button type="button" onClick={() => handleZoomClick("back")} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg cursor-pointer">Back Image</button>}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-[#000C7D] uppercase">Franchise / Permit</span>
                    <Field label="Franchise Number" value={driver.franchiseNumber || "N/A"} />
                    <Field label="Expiry Date" value={driver.franchiseExpiryDate || "N/A"} />
                    {driver.franchiseUrl && <button type="button" onClick={() => handleZoomClick("franchise")} className="self-start px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg cursor-pointer">Permit Image</button>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border border-slate-100 p-4 rounded-2xl bg-slate-50/20">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Driver Change Requests</h4>
                {visibleDriverChangeRequests.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-500">No submitted change requests.</p>
                ) : (
                  visibleDriverChangeRequests.map((request) => (
                    <div key={request.id} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <Field label="Field" value={fieldLabel(request.fieldName)} />
                        <Field label="Current" value={request.currentValue || "N/A"} />
                        <Field label="Requested" value={request.requestedValue} />
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                        <span className={`self-start inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(request.status)}`}>
                          {request.status}
                        </span>
                        {request.status === "PENDING" && (
                          <div className="flex flex-col md:flex-row gap-2 md:items-center">
                            <input
                              value={changeRequestReason}
                              onChange={(event) => setChangeRequestReason(event.target.value)}
                              placeholder="Rejection reason"
                              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700"
                            />
                            <button
                              type="button"
                              onClick={() => handleReviewChangeRequest(request.id, "APPROVED")}
                              disabled={reviewingRequestId === request.id}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewChangeRequest(request.id, "REJECTED")}
                              disabled={reviewingRequestId === request.id}
                              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSaveDocuments} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase text-[#000C7D] tracking-wider border-b border-slate-200 pb-2">
                  Upload & Edit Document Fields
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-[#000C7D] uppercase">License Input</span>
                    <input type="text" value={licenseNo} onChange={(event) => setLicenseNo(event.target.value)} placeholder="License number" className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D]" />
                    <input type="date" value={licenseExpiry} onChange={(event) => setLicenseExpiry(event.target.value)} className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D] cursor-pointer" />
                    <FilePicker label="Front Photo" file={licenseFrontFile} onChange={setLicenseFrontFile} />
                    <FilePicker label="Back Photo" file={licenseBackFile} onChange={setLicenseBackFile} />
                  </div>
                  <div className="flex flex-col gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-[#000C7D] uppercase">Franchise Input</span>
                    <input type="text" value={franchiseNo} onChange={(event) => setFranchiseNo(event.target.value)} placeholder="Franchise number" className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D]" />
                    <input type="date" value={franchiseExpiry} onChange={(event) => setFranchiseExpiry(event.target.value)} className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D] cursor-pointer" />
                    <input type="text" value={franchisePlateNo} onChange={(event) => setFranchisePlateNo(event.target.value)} placeholder="Plate number" className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D]" />
                    <FilePicker label="Permit Image" file={franchiseFile} onChange={setFranchiseFile} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button type="submit" disabled={isSavingDocs} className="px-5 py-2 bg-[#000C7D] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60">
                    {isSavingDocs ? "Saving Documents..." : "Upload & Save Documents"}
                  </button>
                </div>
              </form>

              <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/20 flex flex-col gap-3">
                {driver.adminActionType && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                    <p className="text-xs text-rose-800 font-bold uppercase">Restricted: {driver.adminActionType}</p>
                    <p className="text-xs text-rose-600 font-semibold mt-1">Reason: {driver.adminActionReason || "No reason specified"}</p>
                    <button onClick={() => setActiveDriverAction("clear")} className="mt-3 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer">
                      Remove Restriction
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setActiveDriverAction("suspend")} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 cursor-pointer">
                    Suspend Driver
                  </button>
                  <button onClick={() => onDeleteDriver(driver)} className="px-4 py-2 bg-rose-600 text-white border border-rose-600 rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer">
                    Remove Driver
                  </button>
                </div>
                {activeDriverAction && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3">
                    {activeDriverAction === "suspend" ? (
                      <textarea
                        rows={2}
                        placeholder="Reason for suspension"
                        value={driverActionReason}
                        onChange={(event) => setDriverActionReason(event.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-[#000C7D] outline-hidden focus:border-blue-400 resize-none"
                      />
                    ) : (
                      <p className="text-xs text-slate-500 font-semibold">Confirm clearing this driver's restriction.</p>
                    )}
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setActiveDriverAction(null)} className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                      <button type="button" onClick={handleDriverAction} disabled={isExecutingDriverAction} className="px-4 py-1.5 bg-[#000C7D] hover:bg-blue-900 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60">
                        {isExecutingDriverAction ? "Processing..." : "Confirm"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {passenger && (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <Field label="Passenger Name" value={passenger.name} />
                <Field label="Contact Number" value={passenger.contact} />
                <Field label="Email" value={passenger.email || "N/A"} />
                <Field label="Joined Date" value={passenger.joinedDate} />
                <Field label="Type" value={passenger.accountPassengerType || "Regular"} />
                <Field label="Total Rides Taken" value={`${passenger.ridesTaken} Rides`} />
                <Field label="Canceled Trips" value={`${passenger.canceledTrips} Cancelled`} />
                <Field label="Warning Status" value={passenger.warningStatus ? "Active Warning" : "No Warning"} />
                <div className="col-span-2">
                  <Field
                    label="Booking Restriction Until"
                    value={passenger.bookingRestrictionUntil ? new Date(passenger.bookingRestrictionUntil).toLocaleString() : "No Restriction"}
                  />
                </div>
                {passenger.discountDocumentUrl && (
                  <div className="col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="font-bold text-[#000C7D]">{passenger.accountPassengerType || "Regular"}</p>
                      <p className="text-xs text-slate-500 font-semibold">{passenger.discountDocumentStatus || "NOT_REQUIRED"}</p>
                    </div>
                    <button onClick={() => handleZoomClick("discount")} className="px-4 py-2 bg-white border border-blue-100 text-[#000C7D] rounded-lg text-xs font-bold hover:bg-blue-50 transition-all cursor-pointer">
                      View Uploaded ID
                    </button>
                  </div>
                )}
                {passenger.discountDocumentStatus === "PENDING" && (
                  <div className="col-span-2 flex flex-col gap-3">
                    <textarea value={discountReviewReason} onChange={(event) => setDiscountReviewReason(event.target.value)} rows={2} placeholder="Rejection reason, required only when rejecting." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 resize-none" />
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleReviewDiscount("VERIFIED")} disabled={isReviewingDiscount} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-60 cursor-pointer">Approve ID</button>
                      <button onClick={() => handleReviewDiscount("REJECTED")} disabled={isReviewingDiscount} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold disabled:opacity-60 cursor-pointer">Reject ID</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-slate-100 pb-5">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Ride History</h4>
                {passengerRideHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No bookings found for this passenger.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase">
                            <th className="p-2.5">Driver</th>
                            <th className="p-2.5">Route</th>
                            <th className="p-2.5">Fare</th>
                            <th className="p-2.5">Time</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {visibleRideHistory.map((request) => (
                            <tr key={request.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-bold text-[#000C7D]">{request.driver}</td>
                              <td className="p-2.5">
                                <p className="font-bold text-slate-700">{request.location}</p>
                                <p className="text-[10px] text-slate-400 font-normal">{request.destination}</p>
                              </td>
                              <td className="p-2.5 font-bold text-[#000C7D]">₱{request.fare.toLocaleString()}</td>
                              <td className="p-2.5 text-slate-500">{request.time}</td>
                              <td className="p-2.5">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusBadge(request.status)}`}>
                                  {request.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {passengerRideHistory.length > 3 && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-semibold">Page {ridePage} of {ridePageCount}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setRidePage((current) => Math.max(1, current - 1))} disabled={ridePage === 1} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">Previous</button>
                          <button onClick={() => setRidePage((current) => Math.min(ridePageCount, current + 1))} disabled={ridePage === ridePageCount} className="px-3 py-1.5 bg-[#000C7D] text-white rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">Next</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <button onClick={() => onDeactivatePassengerToggle(passenger.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${passenger.status === "Active" ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                  {passenger.status === "Active" ? "Deactivate Passenger" : "Activate Passenger"}
                </button>
                {passenger.canceledTrips > 0 && (
                  <button onClick={() => onResetCanceledTrips(passenger.id)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    Reset & Reactivate
                  </button>
                )}
                <button onClick={() => onDeletePassenger(passenger)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                  Delete Passenger
                </button>
              </div>
            </>
          )}

          <div className="border-t border-slate-100 pt-4 flex items-center justify-end">
            <button onClick={onClose} className="px-6 py-2.5 bg-[#000C7D] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-xs hover:shadow">
              Close
            </button>
          </div>
        </div>
      </div>

      {zoomType && signedUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[150] p-4 transition-all animate-in fade-in duration-200"
          onClick={() => {
            setZoomType(null);
            setSignedUrl(null);
          }}
        >
          <button
            onClick={() => {
              setZoomType(null);
              setSignedUrl(null);
            }}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all border border-white/20 cursor-pointer shadow-md"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="max-w-3xl max-h-[85vh] bg-white p-3 rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95" onClick={(event) => event.stopPropagation()}>
            {loadingSignedUrl ? (
              <div className="p-12 text-center text-slate-600 font-bold">Generating signed preview...</div>
            ) : (
              <img src={signedUrl} alt="Zoomed Document" className="max-h-[70vh] max-w-full object-contain rounded-lg" />
            )}
            <div className="mt-3 text-center text-[#000C7D] font-extrabold text-sm uppercase">
              {zoomType === "front" ? "License Front Copy" : zoomType === "back" ? "License Back Copy" : zoomType === "discount" ? "Passenger Discount ID" : "Franchise Permit Copy"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
