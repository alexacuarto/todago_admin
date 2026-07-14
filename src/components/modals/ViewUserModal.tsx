import { useState, useEffect } from "react";
import { Passenger } from "../../types";
import { supabase } from "../../lib/supabase";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingUser: any;
  viewingUserType: "driver" | "passenger" | null;
  onDeactivateDriverToggle: (id: string) => void;
  onDeactivatePassengerToggle: (id: string) => void;
  onIncrementCanceledTrips: (id: string) => void;
  onResetCanceledTrips: (id: string) => void;
  onRefreshData?: () => void;
}

export default function ViewUserModal({
  isOpen,
  onClose,
  viewingUser,
  viewingUserType,
  onDeactivateDriverToggle,
  onDeactivatePassengerToggle,
  onIncrementCanceledTrips,
  onResetCanceledTrips,
  onRefreshData,
}: ViewUserModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [zoomType, setZoomType] = useState<"front" | "back" | "franchise" | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);

  // Edit info fields
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editToda, setEditToda] = useState("");
  const [editPlate, setEditPlate] = useState("");
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Approval workflow
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Document fields
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseFrontFile, setLicenseFrontFile] = useState<File | null>(null);
  const [licenseFrontName, setLicenseFrontName] = useState("");
  const [licenseBackFile, setLicenseBackFile] = useState<File | null>(null);
  const [licenseBackName, setLicenseBackName] = useState("");

  const [franchiseNo, setFranchiseNo] = useState("");
  const [franchiseExpiry, setFranchiseExpiry] = useState("");
  const [franchiseFile, setFranchiseFile] = useState<File | null>(null);
  const [franchiseFileName, setFranchiseFileName] = useState("");

  const [isSavingDocs, setIsSavingDocs] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize fields when user changes
  useEffect(() => {
    if (viewingUser && viewingUserType === "driver") {
      setLicenseNo(viewingUser.license || "");
      setLicenseExpiry(viewingUser.licenseExpiryDate || "");
      setFranchiseNo(viewingUser.franchiseNumber || "");
      setFranchiseExpiry(viewingUser.franchiseExpiryDate || "");
      
      setEditName(viewingUser.name || "");
      setEditPhone(viewingUser.phone || "");
      setEditToda(viewingUser.toda || "LHITC-TODA");
      setEditPlate(viewingUser.plateNumber || "");
      setShowRejectForm(false);
      setRejectionReason("");

      // Reset uploads
      setLicenseFrontFile(null);
      setLicenseFrontName("");
      setLicenseBackFile(null);
      setLicenseBackName("");
      setFranchiseFile(null);
      setFranchiseFileName("");
      setIsEditingInfo(false);
    }
  }, [viewingUser, viewingUserType, isOpen]);

  // Handle Close-up document zoom
  const handleZoomClick = async (type: "front" | "back" | "franchise") => {
    let url = "";
    if (type === "front") url = viewingUser?.licenseFrontUrl || viewingUser?.licensePhotoUrl || "";
    if (type === "back") url = viewingUser?.licenseBackUrl || "";
    if (type === "franchise") url = viewingUser?.franchiseUrl || "";

    if (!url) return;

    setZoomType(type);
    setLoadingSignedUrl(true);
    try {
      let path = url;
      if (url.includes('/driver-documents/')) {
        const parts = url.split('/driver-documents/');
        path = parts[parts.length - 1];
      } else if (url.includes('/licenses/')) {
        const parts = url.split('/licenses/');
        path = parts[parts.length - 1];
      } else {
        path = url.split('/').pop() || '';
      }
      path = decodeURIComponent(path);

      const bucketName = url.includes('/licenses/') ? 'licenses' : 'driver-documents';

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

      console.log("[Supabase Query] Updating driver documents/info...", updates);
      const { error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('profile_id', userId);

      if (error) throw error;

      alert("Driver documents and details updated successfully!");
      setLicenseFrontFile(null);
      setLicenseFrontName("");
      setLicenseBackFile(null);
      setLicenseBackName("");
      setFranchiseFile(null);
      setFranchiseFileName("");

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
      const userId = viewingUser.id;
      const nameParts = editName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // 1. Update profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone_number: editPhone
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 2. Update drivers
      const { error: driverError } = await supabase
        .from('drivers')
        .update({
          toda_association: editToda
        })
        .eq('profile_id', userId);

      if (driverError) throw driverError;

      // 3. Update vehicles
      const { data: driverRec } = await supabase
        .from('drivers')
        .select('id')
        .eq('profile_id', viewingUser.id)
        .maybeSingle();

      if (driverRec) {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ plate_number: editPlate })
          .eq('driver_id', driverRec.id);

        if (vehicleError) {
          console.warn("Vehicle update error (ignoring if vehicle wasn't created yet):", vehicleError);
        }
      }

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

  // Delete pending driver account
  const handleDeleteDriverAccount = async () => {
    if (!viewingUser) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this pending driver account?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_driver_account', {
        p_user_id: viewingUser.id
      });

      if (error) throw error;
      if (data?.success === false) throw new Error(data?.error || "Failed to delete.");

      alert("Driver account and all associated records deleted successfully.");
      if (onRefreshData) onRefreshData();
      onClose();
    } catch (err: any) {
      console.error("Error deleting driver:", err);
      alert(`Failed to delete driver: ${err.message || err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Approve driver
  const handleApproveDriver = async () => {
    if (!viewingUser) return;
    const confirm = window.confirm("Are you sure you want to approve this driver? They will become ACTIVE and can go online.");
    if (!confirm) return;

    setIsApproving(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          account_status: 'ACTIVE DRIVER',
          document_status: 'VERIFIED',
          rejection_reason: null
        })
        .eq('profile_id', viewingUser.id);

      if (error) throw error;

      // Also set driver status to approved so they show as Active
      await supabase
        .from('drivers')
        .update({ status: 'approved' })
        .eq('profile_id', viewingUser.id);

      alert("Driver approved successfully! They can now go online.");
      if (onRefreshData) onRefreshData();
      onClose();
    } catch (err: any) {
      console.error("Error approving driver:", err);
      alert(`Failed to approve driver: ${err.message || err}`);
    } finally {
      setIsApproving(false);
    }
  };

  // Reject driver documents
  const handleRejectDocuments = async () => {
    if (!viewingUser || !rejectionReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    setIsRejecting(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          account_status: 'PENDING DOCUMENT',
          document_status: 'DOCUMENT REJECTED',
          rejection_reason: rejectionReason.trim()
        })
        .eq('profile_id', viewingUser.id);

      if (error) throw error;

      alert("Documents rejected. The driver has been notified.");
      setShowRejectForm(false);
      setRejectionReason("");
      if (onRefreshData) onRefreshData();
      onClose();
    } catch (err: any) {
      console.error("Error rejecting documents:", err);
      alert(`Failed to reject documents: ${err.message || err}`);
    } finally {
      setIsRejecting(false);
    }
  };

  if (!isOpen || !viewingUser) return null;

  const isPendingDoc = viewingUser.accountStatus === "PENDING DOCUMENT";
  const isReadyForVerification = viewingUser.documentStatus === "READY FOR VERIFICATION";
  const isDocRejected = viewingUser.documentStatus === "DOCUMENT REJECTED";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 max-h-[90vh]">
        <div className="bg-[#0b1b6e] text-white px-6 py-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
              {viewingUserType === "driver" ? "Driver Profile Audit" : "Passenger Account Audit"}
            </span>
            <h3 className="font-bold text-lg">{viewingUser.name}</h3>
          </div>
          <button onClick={onClose} className="text-white/85 hover:text-white transition-colors cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 text-left overflow-y-auto">
          {/* Account Overview Cards */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0 font-extrabold text-xl">
              {viewingUser.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#091b6f] text-md">{viewingUser.name}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">
                {viewingUserType === "driver" ? "Tricycle Operator / Driver" : "Passenger Client"}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${
                  viewingUserType === "driver"
                    ? (viewingUser.accountStatus === "ACTIVE DRIVER"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : viewingUser.accountStatus === "DOCUMENT EXPIRED"
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : "bg-amber-50 text-amber-600 border-amber-100")
                    : (viewingUser.status === "Active"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-rose-50 text-rose-600 border-rose-100")
                }`}
              >
                {viewingUserType === "driver" ? viewingUser.accountStatus : viewingUser.status}
              </span>
              {viewingUserType === "driver" && (
                <div className="flex flex-col gap-1 items-end mt-1">
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${viewingUser.isOnline ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {viewingUser.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DRIVER INFO & EDIT WORKFLOW */}
          {viewingUserType === "driver" && (
            <div className="flex flex-col gap-4">
              {/* Tabs / Toggle for Info Edit */}
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
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#091b6f] bg-white outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#091b6f] bg-white outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">TODA Association</label>
                    <select
                      value={editToda}
                      onChange={(e) => setEditToda(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#091b6f] bg-white outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      <option value="LHITC-TODA">LHITC-TODA</option>
                      <option value="BYPASS ILAYANG BAGUIO-TODA">BYPASS ILAYANG BAGUIO-TODA</option>
                      <option value="CHOT-TODA">CHOT-TODA</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Plate Number</label>
                    <input
                      type="text"
                      required
                      value={editPlate}
                      onChange={(e) => setEditPlate(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#091b6f] bg-white outline-hidden focus:border-blue-500"
                    />
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
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs border border-slate-100 p-4 rounded-2xl">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">TODA Association</p>
                      <p className="font-bold text-slate-700 mt-0.5">{viewingUser.toda}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                      <p className="font-bold text-slate-700 mt-0.5">{viewingUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Plate Number</p>
                      <p className="font-bold text-slate-700 mt-0.5 font-mono">{viewingUser.plateNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                      <p className="font-bold text-slate-700 mt-0.5">{viewingUser.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Document Status</p>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                        viewingUser.documentStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        viewingUser.documentStatus === "READY FOR VERIFICATION" ? "bg-blue-50 text-blue-600 border-blue-100" :
                        viewingUser.documentStatus === "DOCUMENT REJECTED" ? "bg-rose-50 text-rose-600 border-rose-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>{viewingUser.documentStatus || "INCOMPLETE"}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Joined</p>
                      <p className="font-bold text-slate-500 mt-0.5">{viewingUser.joinedDate}</p>
                    </div>
                  </div>

                  {/* Rejection reason display */}
                  {isDocRejected && viewingUser.rejectionReason && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                      <span className="text-rose-500 shrink-0 mt-0.5">⚠️</span>
                      <div>
                        <p className="text-[10px] font-bold text-rose-700 uppercase">Rejection Reason</p>
                        <p className="text-xs text-rose-600 font-semibold mt-0.5">{viewingUser.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DOCUMENT MANAGEMENT SECTION */}
          {viewingUserType === "driver" && (
            <form onSubmit={handleSaveDocuments} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase text-[#091b6f] tracking-wider border-b border-slate-200 pb-2">
                Document Status & Upload Manager
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ── DRIVER'S LICENSE SECTION ── */}
                <div className="flex flex-col gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-[#091b6f] uppercase">Driver's License details</span>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">License Number</label>
                    <input
                      type="text"
                      placeholder="e.g. D12-34-567890"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#091b6f]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">License Expiry Date</label>
                    <input
                      type="date"
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#091b6f] cursor-pointer"
                    />
                  </div>

                  {/* Front Photo Upload/Preview */}
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Front Photo</label>
                    {viewingUser.licenseFrontUrl || viewingUser.licensePhotoUrl ? (
                      <div className="flex items-center gap-2 border border-slate-100 p-1.5 rounded-lg bg-slate-50">
                        <span className="text-[10px] text-emerald-600 font-bold">✓ Uploaded</span>
                        <button
                          type="button"
                          onClick={() => handleZoomClick("front")}
                          className="text-[9px] font-bold text-blue-600 hover:underline ml-auto"
                        >
                          Preview
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] text-rose-500 font-bold uppercase">Not Uploaded</span>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLicenseFrontFile(file);
                          setLicenseFrontName(file.name);
                        }
                      }}
                      className="text-[10px] text-slate-500 mt-0.5"
                    />
                    {licenseFrontName && <p className="text-[8px] text-[#091b6f] font-semibold">{licenseFrontName}</p>}
                  </div>

                  {/* Back Photo Upload/Preview */}
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Back Photo</label>
                    {viewingUser.licenseBackUrl ? (
                      <div className="flex items-center gap-2 border border-slate-100 p-1.5 rounded-lg bg-slate-50">
                        <span className="text-[10px] text-emerald-600 font-bold">✓ Uploaded</span>
                        <button
                          type="button"
                          onClick={() => handleZoomClick("back")}
                          className="text-[9px] font-bold text-blue-600 hover:underline ml-auto"
                        >
                          Preview
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] text-rose-500 font-bold uppercase">Not Uploaded</span>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLicenseBackFile(file);
                          setLicenseBackName(file.name);
                        }
                      }}
                      className="text-[10px] text-slate-500 mt-0.5"
                    />
                    {licenseBackName && <p className="text-[8px] text-[#091b6f] font-semibold">{licenseBackName}</p>}
                  </div>
                </div>

                {/* ── FRANCHISE / PERMIT SECTION ── */}
                <div className="flex flex-col gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-[#091b6f] uppercase">Franchise Permit details</span>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Franchise Number</label>
                    <input
                      type="text"
                      placeholder="e.g. F-2026-987"
                      value={franchiseNo}
                      onChange={(e) => setFranchiseNo(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#091b6f]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Franchise Expiry Date</label>
                    <input
                      type="date"
                      value={franchiseExpiry}
                      onChange={(e) => setFranchiseExpiry(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#091b6f] cursor-pointer"
                    />
                  </div>

                  {/* Franchise Image Upload/Preview */}
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Franchise Image</label>
                    {viewingUser.franchiseUrl ? (
                      <div className="flex items-center gap-2 border border-slate-100 p-1.5 rounded-lg bg-slate-50">
                        <span className="text-[10px] text-emerald-600 font-bold">✓ Uploaded</span>
                        <button
                          type="button"
                          onClick={() => handleZoomClick("franchise")}
                          className="text-[9px] font-bold text-blue-600 hover:underline ml-auto"
                        >
                          Preview
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] text-rose-500 font-bold uppercase">Not Uploaded</span>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFranchiseFile(file);
                          setFranchiseFileName(file.name);
                        }
                      }}
                      className="text-[10px] text-slate-500 mt-0.5"
                    />
                    {franchiseFileName && <p className="text-[8px] text-[#091b6f] font-semibold">{franchiseFileName}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 mt-1">
                <button
                  type="submit"
                  disabled={isSavingDocs}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-[#0b1b6e] text-white hover:from-blue-700 hover:to-blue-900 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingDocs ? "Updating Documents..." : "Update Documents & Info"}
                </button>
              </div>
            </form>
          )}

          {/* PASSENGER DETAILS */}
          {viewingUserType === "passenger" && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact Number</p>
                <p className="font-bold text-slate-700 mt-0.5">{(viewingUser as Passenger).contact}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Joined Date</p>
                <p className="font-bold text-slate-500 mt-0.5">{(viewingUser as Passenger).joinedDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Rides Taken</p>
                <p className="font-extrabold text-[#091b6f] mt-0.5">{(viewingUser as Passenger).ridesTaken} Rides</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Canceled Trips</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`font-extrabold text-sm px-2 py-0.5 rounded-md ${
                      (viewingUser as Passenger).canceledTrips >= 3 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {(viewingUser as Passenger).canceledTrips} / 3 Cancelled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Administrative Controls</h4>

            {/* ADMIN APPROVAL WORKFLOW */}
            {viewingUserType === "driver" && isReadyForVerification && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-800">Documents Ready for Verification</p>
                    <p className="text-[10px] text-blue-600 font-semibold">Review documents above, then approve or reject.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleApproveDriver}
                    disabled={isApproving}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {isApproving ? (
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                    {isApproving ? "Approving..." : "Approve Driver"}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Reject Documents
                  </button>
                </div>

                {showRejectForm && (
                  <div className="bg-white border border-rose-200 rounded-xl p-3 flex flex-col gap-2">
                    <label className="text-[10px] text-rose-600 font-bold uppercase">Rejection Reason (Required)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Invalid license image, expired franchise, incorrect information..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="border border-rose-200 rounded-lg px-3 py-2 text-xs font-semibold text-[#091b6f] outline-hidden focus:border-rose-400 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowRejectForm(false); setRejectionReason(""); }}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectDocuments}
                        disabled={isRejecting || !rejectionReason.trim()}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {/* Status Toggle (Deactivate / Activate) */}
              {viewingUserType === "driver" ? (
                <>
                  {viewingUser.accountStatus === "ACTIVE DRIVER" && (
                    <button
                      onClick={() => onDeactivateDriverToggle(viewingUser.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        viewingUser.status === "Active" ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {viewingUser.status === "Active" ? "Suspend Driver" : "Reactivate Driver"}
                    </button>
                  )}

                  {/* Permanent Delete Option ONLY for PENDING DOCUMENT status */}
                  {isPendingDoc && (
                    <button
                      onClick={handleDeleteDriverAccount}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isDeleting ? "Deleting..." : "Delete Driver Account"}
                    </button>
                  )}
                </>
              ) : (
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
            </div>

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
              className="px-6 py-2.5 bg-[#091b6f] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-xs hover:shadow"
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
            <div className="mt-3 text-center text-[#091b6f] font-extrabold text-sm uppercase">
              {zoomType === "front" ? "License Front Copy" : zoomType === "back" ? "License Back Copy" : "Franchise Permit Copy"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
