import React, { useState, useEffect, Fragment } from "react";
import { Driver, Passenger, RideRequest } from "../../types";
import { supabase } from "../../lib/supabase";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingUser: any;
  viewingUserType: "driver" | "passenger" | null;
  onDeactivatePassengerToggle: (id: string) => void;
  onIncrementCanceledTrips: (id: string) => void;
  onResetCanceledTrips: (id: string) => void;
  onRefreshData?: () => void;
  rideRequests?: RideRequest[];
}

export default function ViewUserModal({
  isOpen,
  onClose,
  viewingUser,
  viewingUserType,
  onDeactivatePassengerToggle,
  onIncrementCanceledTrips,
  onResetCanceledTrips,
  onRefreshData,
  rideRequests = [],
}: ViewUserModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [zoomType, setZoomType] = useState<"front" | "back" | "franchise" | "discount" | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);
  const [discountReviewReason, setDiscountReviewReason] = useState("");
  const [isReviewingDiscount, setIsReviewingDiscount] = useState(false);

  // Edit info fields
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editToda, setEditToda] = useState("");
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Admin Action Restrictions
  const [activeAdminAction, setActiveAdminAction] = useState<"suspend" | "delete" | "clear" | null>(null);
  const [adminReasonInput, setAdminReasonInput] = useState("");
  const [isExecutingAdminAction, setIsExecutingAdminAction] = useState(false);



  const [licenseNo, setLicenseNo] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseFrontFile, setLicenseFrontFile] = useState<File | null>(null);
  const [licenseBackFile, setLicenseBackFile] = useState<File | null>(null);

  const [franchiseNo, setFranchiseNo] = useState("");
  const [franchiseExpiry, setFranchiseExpiry] = useState("");
  const [franchiseFile, setFranchiseFile] = useState<File | null>(null);
  const [franchisePlateNo, setFranchisePlateNo] = useState("");

  const [isSavingDocs, setIsSavingDocs] = useState(false);

  // Initialize fields when user changes
  useEffect(() => {
    if (viewingUser && viewingUserType === "driver") {
      setLicenseNo(viewingUser.license || "");
      setLicenseExpiry(viewingUser.licenseExpiryDate || "");
      setFranchiseNo(viewingUser.franchiseNumber || "");
      setFranchiseExpiry(viewingUser.franchiseExpiryDate || "");
      setFranchisePlateNo(viewingUser.plateNumber || "");
      
      setEditName(viewingUser.name || "");
      setEditPhone(viewingUser.phone || "");
      setEditToda(viewingUser.toda || "LHITC-TODA");

      // Reset uploads
      setLicenseFrontFile(null);
      setLicenseBackFile(null);
      setFranchiseFile(null);
      setIsEditingInfo(false);
      setActiveAdminAction(null);
      setAdminReasonInput("");
      setIsExecutingAdminAction(false);
      setDiscountReviewReason("");
      setIsReviewingDiscount(false);
    }
  }, [viewingUser, viewingUserType, isOpen]);

  // Handle Close-up document zoom
  const handleZoomClick = async (type: "front" | "back" | "franchise" | "discount") => {
    let url = "";
    if (type === "front") url = viewingUser?.licenseFrontUrl || viewingUser?.licensePhotoUrl || "";
    if (type === "back") url = viewingUser?.licenseBackUrl || "";
    if (type === "franchise") url = viewingUser?.franchiseUrl || "";
    if (type === "discount") url = viewingUser?.discountDocumentUrl || "";

    if (!url) return;

    setZoomType(type);
    setLoadingSignedUrl(true);
    try {
      let path = url;
      if (url.includes('/discount-ids/')) {
        const parts = url.split('/discount-ids/');
        path = parts[parts.length - 1];
      } else if (url.includes('/driver-documents/')) {
        const parts = url.split('/driver-documents/');
        path = parts[parts.length - 1];
      } else if (url.includes('/licenses/')) {
        const parts = url.split('/licenses/');
        path = parts[parts.length - 1];
      } else if (type === "discount") {
        path = url;
      } else {
        path = url.split('/').pop() || '';
      }
      path = decodeURIComponent(path);

      const bucketName = type === "discount" ? "discount-ids" : url.includes('/licenses/') ? 'licenses' : 'driver-documents';

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(path, 300);

      if (error) {
        console.error("Error creating signed URL:", error);
        setSignedUrl(url);
      } else if (data?.signedUrl) {
        setSignedUrl(data.signedUrl);
      }
    } catch (err) {
      console.error("Failed to generate signed URL:", err);
      setSignedUrl(url);
    } finally {
      setLoadingSignedUrl(false);
    }
  };

  const handleReviewDiscount = async (status: "VERIFIED" | "REJECTED") => {
    if (!viewingUser?.id || isReviewingDiscount) return;
    if (status === "REJECTED" && !discountReviewReason.trim()) {
      alert("Please add a rejection reason.");
      return;
    }

    setIsReviewingDiscount(true);
    try {
      const { error } = await supabase.rpc("review_passenger_discount_document", {
        p_passenger_id: viewingUser.id,
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

  // Helper to upload a file to Supabase storage bucket
  const uploadDocFile = async (userId: string, file: File, label: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${userId}-${label}-${Date.now()}.${fileExt}`;
    const bucketName = 'driver-documents';

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error(`Upload error for ${label}:`, error);
      throw new Error(`Failed to upload ${label}: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Save driver document uploads and text details
  const handleSaveDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingUser) return;
    setIsSavingDocs(true);

    try {
      const userId = viewingUser.id;
      const updates: any = {};

      if (licenseNo) updates.license_number = licenseNo;
      if (licenseExpiry) updates.license_expiry_date = licenseExpiry;
      if (franchiseNo) updates.franchise_number = franchiseNo;
      if (franchiseExpiry) updates.franchise_expiry_date = franchiseExpiry;

      // Update Plate Number in vehicles table
      if (franchisePlateNo) {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ plate_number: franchisePlateNo })
          .eq('driver_id', userId);
        if (vehicleError) throw vehicleError;
      }

      // Upload files if selected
      if (licenseFrontFile) {
        const frontUrl = await uploadDocFile(userId, licenseFrontFile, 'front');
        if (frontUrl) {
          updates.license_front_url = frontUrl;
          // Sync with older fallback column if appropriate
          updates.license_photo_url = frontUrl;
        }
      }

      if (licenseBackFile) {
        const backUrl = await uploadDocFile(userId, licenseBackFile, 'back');
        if (backUrl) updates.license_back_url = backUrl;
      }

      if (franchiseFile) {
        const franchiseUrl = await uploadDocFile(userId, franchiseFile, 'franchise');
        if (franchiseUrl) updates.franchise_url = franchiseUrl;
      }

      // NOTE: document_status is intentionally NOT written here.
      // The database trigger (fn_update_driver_status) automatically recalculates
      // document_status, status, account_status, and is_online whenever any
      // license or franchise field is updated.

      console.log("[Supabase Query] Updating driver documents/info...", updates);
      const { error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      alert("Driver documents and details updated successfully!");
      setLicenseFrontFile(null);
      setLicenseBackFile(null);
      setFranchiseFile(null);

      if (onRefreshData) onRefreshData();
      onClose();
    } catch (err: any) {
      console.error("Error saving documents:", err);
      alert(`Failed to save documents: ${err.message || err}`);
    } finally {
      setIsSavingDocs(false);
    }
  };

  // Save edited personal and vehicle info
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingUser) return;
    setIsSavingInfo(true);

    try {
      const nameParts = editName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // 1. Update profiles
      let profileId = viewingUser.profileId || viewingUser.profile_id;
      if (!profileId) {
        console.log("Profile ID missing in viewingUser state. Fetching from database...");
        const { data: dRec, error: dError } = await supabase
          .from('drivers')
          .select('profile_id')
          .eq('id', viewingUser.id)
          .maybeSingle();
        if (dError) throw dError;
        if (dRec?.profile_id) {
          profileId = dRec.profile_id;
        }
      }
      if (!profileId) {
        console.error("DEBUG: viewingUser details:", viewingUser);
        throw new Error("Profile ID is missing for this driver.");
      }
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone_number: editPhone
        })
        .eq('id', profileId);

      if (profileError) throw profileError;

      // 2. Update drivers
      const { error: driverError } = await supabase
        .from('drivers')
        .update({
          toda_association: editToda
        })
        .eq('id', viewingUser.id);

      if (driverError) throw driverError;



      alert("Driver information updated successfully!");
      setIsEditingInfo(false);
      if (onRefreshData) onRefreshData();
      onClose();
    } catch (err: any) {
      console.error("Error saving driver info:", err);
      alert(`Failed to save driver info: ${err.message || err}`);
    } finally {
      setIsSavingInfo(false);
    }
  };



  const handleExecuteAdminAction = async () => {
    if (!viewingUser || !activeAdminAction) return;

    if (activeAdminAction !== "clear" && !adminReasonInput.trim()) {
      alert("Please enter a reason for this action.");
      return;
    }

    setIsExecutingAdminAction(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminUserId = session?.user?.id || null;

      if (activeAdminAction === "delete") {
        const confirm = window.confirm(`Are you sure you want to request deletion of ${viewingUser.name}'s account?\n\nReason: "${adminReasonInput}"`);
        if (!confirm) {
          setIsExecutingAdminAction(false);
          return;
        }

        // 1. Update status to deleted requested, store reason
        const { error } = await supabase
          .from('drivers')
          .update({
            admin_action_type: 'deleted_requested',
            admin_action_reason: adminReasonInput.trim(),
            admin_action_date: new Date().toISOString(),
            admin_action_by: adminUserId
          })
          .eq('id', viewingUser.id);

        if (error) throw error;

        // 2. Simulate/send notification (log)
        console.log(`Notification sent: Your driver account has been requested for deletion. Reason: ${adminReasonInput}`);

        alert("Driver account deletion requested successfully.");
      } else if (activeAdminAction === "clear") {
        // Clear restriction
        const { error } = await supabase
          .from('drivers')
          .update({
            admin_action_type: null,
            admin_action_reason: null,
            admin_action_date: null,
            admin_action_by: null
          })
          .eq('id', viewingUser.id);

        if (error) throw error;

        alert("Driver restriction removed successfully.");
      } else {
        // Suspend
        const actionType = "suspended";
        const { error } = await supabase
          .from('drivers')
          .update({
            admin_action_type: actionType,
            admin_action_reason: adminReasonInput.trim(),
            admin_action_date: new Date().toISOString(),
            admin_action_by: adminUserId
          })
          .eq('id', viewingUser.id);

        if (error) throw error;

        // Simulate/send notification
        const msg = `Your driver account has been temporarily ${actionType} due to a restriction. Reason: ${adminReasonInput}. Please contact the administrator.`;
        console.log("Notification sent:", msg);

        alert(`Driver ${actionType} successfully!`);
      }

      if (onRefreshData) onRefreshData();
      onClose();
    } catch (err: any) {
      console.error("Error executing admin action:", err);
      alert(`Failed to perform action: ${err.message || err}`);
    } finally {
      setIsExecutingAdminAction(false);
      setActiveAdminAction(null);
      setAdminReasonInput("");
    }
  };



  if (!isOpen || !viewingUser) return null;

  const docStatus = viewingUser.documentStatus || "INCOMPLETE";



  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 max-h-[90vh]">
        <div className="bg-[#000C7D] text-white px-6 py-5 flex items-center justify-between">
          <div className="text-left">
            {viewingUserType !== "driver" && (
              <>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                  Passenger Account Audit
                </span>
                <h3 className="font-bold text-lg">{viewingUser.name}</h3>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-white/85 hover:text-white transition-colors cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 text-left overflow-y-auto">
          {/* Driver document restriction warning banner */}
          {viewingUserType === "driver" && docStatus === "PENDING" && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col gap-2 animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
                <span>⚠️ Driver Access Restricted</span>
              </div>
              <p className="text-xs text-rose-700 font-semibold leading-relaxed">
                <span className="font-bold">Reason:</span> {viewingUser.documentIssueReason || "Required documents missing"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-rose-100 pt-2 mt-1">
                <span className="font-bold text-[#000C7D]">Action Required:</span> Please coordinate with your TODA President to submit updated and valid documents. Your TODA President must provide the updated documents before your account can be activated again.
              </p>
            </div>
          )}

          {/* DRIVER INFO SECTION */}
          {viewingUserType === "driver" && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Driver Details</h4>
                <button
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>{isEditingInfo ? "Cancel Editing" : "Edit Details"}</span>
                </button>
              </div>

              {isEditingInfo ? (
                <form onSubmit={handleSaveInfo} className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#000C7D] bg-white outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#000C7D] bg-white outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">TODA Association</label>
                    <select
                      value={editToda}
                      onChange={(e) => setEditToda(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#000C7D] bg-white outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      <option value="LHITC-TODA">LHITC-TODA</option>
                      <option value="BYPASS ILAYANG BAGUIO-TODA">BYPASS ILAYANG BAGUIO-TODA</option>
                      <option value="CHOT-TODA">CHOT-TODA</option>
                    </select>
                  </div>

                  <div className="col-span-2 flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingInfo}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      {isSavingInfo ? "Saving..." : "Save Details"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Driver Name</p>
                      <p className="font-bold text-slate-700 mt-0.5">{viewingUser.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                      <p className="font-bold text-slate-700 mt-0.5">{viewingUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                      <p className="font-bold text-slate-700 mt-0.5">{viewingUser.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">TODA Association</p>
                      <p className="font-bold text-slate-700 mt-0.5">{viewingUser.toda}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Plate Number</p>
                      <p className="font-bold text-slate-700 mt-0.5 font-mono">{viewingUser.plateNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Document Status</p>
                      <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        docStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>{docStatus}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Activity Status</p>
                      <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        (viewingUser as Driver).activityStatus === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>{(viewingUser as Driver).activityStatus}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Last Online</p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {(viewingUser as Driver).lastOnlineAt ? new Date((viewingUser as Driver).lastOnlineAt!).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total Online Time</p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {(viewingUser as Driver).totalOnlineMinutes !== undefined ? `${(viewingUser as Driver).totalOnlineMinutes} mins` : "0 mins"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Last Completed Ride</p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {(viewingUser as Driver).lastCompletedRideAt ? new Date((viewingUser as Driver).lastCompletedRideAt!).toLocaleString() : "Never"}
                      </p>
                    </div>
                  </div>


                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS SECTION */}
          {viewingUserType === "driver" && (
            <div className="flex flex-col gap-4 border border-slate-100 p-4 rounded-2xl bg-slate-50/20">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Driver Documents</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Driver License Details */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-[#000C7D] uppercase">Driver License</span>
                  <div className="text-xs">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">License Number</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{viewingUser.license || "N/A"}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Expiry Date</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{viewingUser.licenseExpiryDate || "N/A"}</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {viewingUser.licenseFrontUrl && (
                      <button
                        type="button"
                        onClick={() => handleZoomClick("front")}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Front Image
                      </button>
                    )}
                    {viewingUser.licenseBackUrl && (
                      <button
                        type="button"
                        onClick={() => handleZoomClick("back")}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Back Image
                      </button>
                    )}
                  </div>
                </div>

                {/* Franchise Permit Details */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/60 flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-[#000C7D] uppercase">Franchise / Permit</span>
                  <div className="text-xs">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Franchise Number</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{viewingUser.franchiseNumber || "N/A"}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Expiry Date</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{viewingUser.franchiseExpiryDate || "N/A"}</p>
                  </div>
                  {viewingUser.franchiseUrl && (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => handleZoomClick("franchise")}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Permit Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* EDIT/UPLOAD DOCUMENTS FORM FOR DRIVERS */}
          {viewingUserType === "driver" && (
            <form onSubmit={handleSaveDocuments} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase text-[#000C7D] tracking-wider border-b border-slate-200 pb-2">
                Upload & Edit Document Fields
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* License Inputs */}
                <div className="flex flex-col gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-[#000C7D] uppercase">License Input</span>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">License Number</label>
                    <input
                      type="text"
                      placeholder="e.g. D12-34-567890"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">License Expiry Date</label>
                    <input
                      type="date"
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D] cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Front Photo</label>
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setLicenseFrontFile(file); }
                      }}
                      className="text-[10px] text-slate-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Back Photo</label>
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setLicenseBackFile(file); }
                      }}
                      className="text-[10px] text-slate-500"
                    />
                  </div>
                </div>

                {/* Franchise Inputs */}
                <div className="flex flex-col gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-[#000C7D] uppercase">Franchise Input</span>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Franchise Number</label>
                    <input
                      type="text"
                      placeholder="e.g. F-2026-987"
                      value={franchiseNo}
                      onChange={(e) => setFranchiseNo(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D]"
                    />
                  </div>
                   <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Franchise Expiry Date</label>
                    <input
                      type="date"
                      value={franchiseExpiry}
                      onChange={(e) => setFranchiseExpiry(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D] cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Plate Number</label>
                    <input
                      type="text"
                      placeholder="e.g. AA 1234 / 123 ABC"
                      value={franchisePlateNo}
                      onChange={(e) => setFranchisePlateNo(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000C7D]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Permit Image</label>
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setFranchiseFile(file); }
                      }}
                      className="text-[10px] text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSavingDocs}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-[#000C7D] text-white hover:from-blue-700 hover:to-blue-900 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSavingDocs ? "Saving Documents..." : "Upload & Save Documents"}
                </button>
              </div>
            </form>
          )}

          {/* PASSENGER DETAILS */}
          {viewingUserType === "passenger" && (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact Number</p>
                  <p className="font-bold text-slate-700 mt-0.5">{(viewingUser as Passenger).contact}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="font-bold text-slate-700 mt-0.5">{(viewingUser as Passenger).email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Joined Date</p>
                  <p className="font-bold text-slate-500 mt-0.5">{(viewingUser as Passenger).joinedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Rides Taken</p>
                  <p className="font-extrabold text-[#000C7D] mt-0.5">{(viewingUser as Passenger).ridesTaken} Rides</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Canceled Trips</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`font-extrabold text-sm px-2 py-0.5 rounded-md ${
                        (viewingUser as Passenger).canceledTrips >= 3 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {(viewingUser as Passenger).canceledTrips} Cancelled
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Warning Status</p>
                  <div className="mt-0.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        (viewingUser as Passenger).warningStatus
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-slate-50 text-slate-500 border-slate-150"
                      }`}
                    >
                      {(viewingUser as Passenger).warningStatus ? "Active Warning" : "No Warning"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Last Cancel Date</p>
                  <p className="font-bold text-slate-700 mt-0.5">
                    {(viewingUser as Passenger).lastCancelDate
                      ? new Date((viewingUser as Passenger).lastCancelDate!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : "Never"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Booking Restriction Until</p>
                  <p className="font-bold mt-0.5">
                    {(viewingUser as Passenger).bookingRestrictionUntil ? (
                      <span className="text-rose-600 font-extrabold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                        Restricted until {new Date((viewingUser as Passenger).bookingRestrictionUntil!).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-bold">No Restriction</span>
                    )}
                  </p>
                </div>
                <div className="col-span-2 border border-slate-100 rounded-xl p-4 bg-slate-50/70">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Discount Verification</p>
                      <p className="font-extrabold text-[#000C7D] mt-1">
                        {(viewingUser as Passenger).accountPassengerType || "Regular"} · {(viewingUser as Passenger).discountDocumentStatus || "NOT_REQUIRED"}
                      </p>
                      {(viewingUser as Passenger).discountDocumentSubmittedAt && (
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          Submitted {new Date((viewingUser as Passenger).discountDocumentSubmittedAt!).toLocaleString()}
                        </p>
                      )}
                      {(viewingUser as Passenger).discountDocumentRejectionReason && (
                        <p className="text-xs text-rose-600 font-semibold mt-2">
                          Reason: {(viewingUser as Passenger).discountDocumentRejectionReason}
                        </p>
                      )}
                    </div>
                    {(viewingUser as Passenger).discountDocumentUrl && (
                      <button
                        onClick={() => handleZoomClick("discount")}
                        className="px-4 py-2 bg-white border border-blue-100 text-[#000C7D] rounded-lg text-xs font-bold hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        View Uploaded ID
                      </button>
                    )}
                  </div>
                  {(viewingUser as Passenger).discountDocumentStatus === "PENDING" && (
                    <div className="mt-4 flex flex-col gap-3">
                      <textarea
                        value={discountReviewReason}
                        onChange={(e) => setDiscountReviewReason(e.target.value)}
                        rows={2}
                        placeholder="Rejection reason, required only when rejecting."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 resize-none"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleReviewDiscount("VERIFIED")}
                          disabled={isReviewingDiscount}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-60 cursor-pointer"
                        >
                          Approve ID
                        </button>
                        <button
                          onClick={() => handleReviewDiscount("REJECTED")}
                          disabled={isReviewingDiscount}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold disabled:opacity-60 cursor-pointer"
                        >
                          Reject ID
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Passenger Ride History List */}
              <div className="border-b border-slate-100 pb-5">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Ride History</h4>
                {rideRequests.filter(r => r.passengerId === viewingUser.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No bookings found for this passenger.</p>
                ) : (
                  <div className="overflow-x-auto max-h-60 border border-slate-100 rounded-xl">
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
                        {rideRequests
                          .filter(r => r.passengerId === viewingUser.id)
                          .map((r) => (
                            <Fragment key={r.id}>
                              <tr className="hover:bg-slate-50/50">
                                <td className="p-2.5 font-bold text-[#000C7D]">{r.driver}</td>
                                <td className="p-2.5">
                                  <p className="font-bold text-slate-700">{r.location}</p>
                                  <p className="text-[10px] text-slate-400 font-normal">→ {r.destination}</p>
                                </td>
                                <td className="p-2.5 font-bold text-[#000C7D]">₱{r.fare}</td>
                                <td className="p-2.5 text-slate-500">{r.time}</td>
                                <td className="p-2.5">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                      r.status === "Completed"
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                        : r.status === "In Transit"
                                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                                        : r.status === "Pending"
                                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                                        : "bg-rose-50 text-rose-600 border border-rose-100"
                                    }`}
                                  >
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                              {r.status === "Cancelled" && (
                                <tr>
                                  <td colSpan={5} className="bg-rose-50/20 px-3 py-2 text-[10px] border-b border-slate-100">
                                    <div className="grid grid-cols-3 gap-2 text-slate-500">
                                      <div>
                                        <span className="font-bold uppercase text-slate-400 text-[8px] block">Cancelled By</span>
                                        <span className="font-semibold text-rose-600">{r.cancelled_by || "Unknown"}</span>
                                      </div>
                                      <div>
                                        <span className="font-bold uppercase text-slate-400 text-[8px] block">Cancelled At</span>
                                        <span className="font-semibold">
                                          {r.cancelled_at ? new Date(r.cancelled_at).toLocaleString() : "N/A"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="font-bold uppercase text-slate-400 text-[8px] block">Cancellation Reason</span>
                                        <span className="font-semibold">{r.cancellation_reason || "None provided"}</span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ACTION CONTROLS SECTION */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Administrative Actions</h4>

            {/* CONDITIONAL ACTION BUTTONS ACCORDING TO STATUS */}
            {viewingUserType === "driver" && (
              <div className="flex flex-col gap-3.5 border border-slate-100 p-4 rounded-2xl bg-slate-50/20">
                
                {/* If there is an active restriction, show it prominently */}
                {(viewingUser as Driver).adminActionType && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col gap-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs uppercase">
                      <span>⚠️ Restricted: {(viewingUser as Driver).adminActionType}</span>
                    </div>
                    <p className="text-xs text-rose-600 font-semibold">
                      Reason: "{(viewingUser as Driver).adminActionReason || "No reason specified"}"
                    </p>
                    <div className="flex justify-start mt-1">
                      <button
                        onClick={() => {
                          setActiveAdminAction("clear");
                          setAdminReasonInput("Clear Restriction");
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                      >
                        Remove Restriction
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setActiveAdminAction("suspend");
                      setAdminReasonInput("");
                    }}
                    disabled={isExecutingAdminAction}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeAdminAction === "suspend"
                        ? "bg-[#000C7D] text-white border-[#000C7D]"
                        : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/80"
                    }`}
                  >
                    Suspend Driver
                  </button>
                  <button
                    onClick={() => {
                      setActiveAdminAction("delete");
                      setAdminReasonInput("");
                    }}
                    disabled={isExecutingAdminAction}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeAdminAction === "delete"
                        ? "bg-[#000C7D] text-white border-[#000C7D]"
                        : "bg-rose-600 text-white border-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    Remove Driver Account
                  </button>
                </div>

                {/* Inline Reason Form */}
                {activeAdminAction && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[#000C7D] font-bold uppercase">
                        Reason for {activeAdminAction === "clear" ? "Removal" : activeAdminAction === "delete" ? "Account Deletion" : `${activeAdminAction} action`} (Required)
                      </label>
                      {activeAdminAction !== "clear" ? (
                        <textarea
                          rows={2}
                          placeholder='e.g., "Expired franchise/prangkisa", "Passenger complaint", "Violation report"...'
                          value={adminReasonInput}
                          onChange={(e) => setAdminReasonInput(e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-[#000C7D] outline-hidden focus:border-blue-400 resize-none"
                        />
                      ) : (
                        <p className="text-xs text-slate-500 font-semibold italic">Confirm clearing the restriction for this driver.</p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setActiveAdminAction(null); setAdminReasonInput(""); }}
                        className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteAdminAction}
                        disabled={isExecutingAdminAction || (activeAdminAction !== "clear" && !adminReasonInput.trim())}
                        className="px-4 py-1.5 bg-[#000C7D] hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
                      >
                        {isExecutingAdminAction ? "Processing..." : "Confirm Action"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewingUserType === "passenger" && (
              <div className="flex gap-2 items-center flex-wrap">
                <button
                  onClick={() => onDeactivatePassengerToggle(viewingUser.id)}
                  disabled={(viewingUser as Passenger).canceledTrips >= 3 && viewingUser.status === "Inactive"}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-30 disabled:cursor-not-allowed ${
                    viewingUser.status === "Active" ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  {viewingUser.status === "Active" ? "Deactivate Passenger" : "Activate Passenger"}
                </button>

                <button
                  onClick={() => onIncrementCanceledTrips(viewingUser.id)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Simulate Canceled Trip
                </button>

                {(viewingUser as Passenger).canceledTrips > 0 && (
                  <button
                    onClick={() => onResetCanceledTrips(viewingUser.id)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset & Reactivate
                  </button>
                )}
              </div>
            )}

            {viewingUserType === "passenger" && (viewingUser as Passenger).canceledTrips >= 3 && (
              <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl border border-rose-100 text-xs font-semibold flex items-center gap-2 mt-1">
                <span className="text-lg">⚠️</span>
                <span>Passenger is deactivated. Canceled trip threshold (3) has been reached! Reset canceled trips to reactivate.</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#000C7D] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-xs hover:shadow"
            >
              Close Profile Audit
            </button>
          </div>
        </div>
      </div>

      {/* SECURE ZOOM MODAL */}
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
          <div 
            className="max-w-3xl max-h-[85vh] bg-white p-3 rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95" 
            onClick={(e) => e.stopPropagation()}
          >
            {loadingSignedUrl ? (
              <div className="p-12 text-center text-slate-600 font-bold">Generating signed preview...</div>
            ) : (
              <img
                src={signedUrl}
                alt="Zoomed Document"
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
              />
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
