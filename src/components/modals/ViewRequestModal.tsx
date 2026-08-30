import { RideRequest } from "../../types";

interface ViewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingRequest: RideRequest | null;
  onDeleteRequest: (id: string) => void;
}

export default function ViewRequestModal({
  isOpen,
  onClose,
  viewingRequest,
  onDeleteRequest,
}: ViewRequestModalProps) {
  if (!isOpen || !viewingRequest) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col">
        <div className="bg-[#000C7D] text-white px-6 py-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Ride Booking</span>
            <h3 className="font-bold text-lg">Details</h3>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6 text-left">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passenger</p>
              <p className="font-bold text-[#000C7D] text-base mt-0.5">{viewingRequest.passenger}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assigned Driver</p>
              <p className="font-bold text-slate-700 text-base mt-0.5">{viewingRequest.driver}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pickup Location</p>
              <p className="font-bold text-slate-700 mt-0.5">{viewingRequest.location}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Destination</p>
              <p className="font-bold text-slate-700 mt-0.5">{viewingRequest.destination || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fare Value</p>
              <p className="font-extrabold text-[#000C7D] text-lg mt-0.5">₱{viewingRequest.fare}</p>
            </div>
            {viewingRequest.discountReviewStatus && (
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Discount Review</p>
                <p className="font-bold text-slate-700 mt-0.5">{viewingRequest.discountReviewStatus}</p>
              </div>
            )}
            <div className="col-span-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passenger Type</p>
              <p className="font-bold text-slate-700 mt-0.5">
                {viewingRequest.bookingDiscountRequests && viewingRequest.bookingDiscountRequests.length > 0
                  ? viewingRequest.bookingDiscountRequests.map((request) => request.discountType).join(", ")
                  : "Regular"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Booking Time</p>
              <p className="font-bold text-slate-500 mt-0.5">{viewingRequest.time}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TODA Association</p>
              <p className="font-bold text-slate-600 mt-0.5">{viewingRequest.toda}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ride Status</p>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                    viewingRequest.status === "Completed"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : viewingRequest.status === "In Transit"
                      ? "bg-emerald-500 text-white border border-emerald-600"
                      : viewingRequest.status === "Pending"
                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                      : viewingRequest.status === "Scheduled"
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}
                >
                  {viewingRequest.status}
                </span>
              </div>
            </div>
            {viewingRequest.status === "Cancelled" && (
              <>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cancelled By</p>
                  <p className="font-bold text-rose-700 mt-0.5">{viewingRequest.cancelled_by || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cancelled At</p>
                  <p className="font-bold text-slate-600 mt-0.5">
                    {viewingRequest.cancelled_at
                      ? new Date(viewingRequest.cancelled_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div className="col-span-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100/50 flex flex-col gap-2">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cancellation Reason</p>
                    <p className="font-bold text-slate-700 mt-0.5">{viewingRequest.cancel_reason || "None provided"}</p>
                  </div>
                  {viewingRequest.cancel_details && (
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cancellation Details</p>
                      <p className="font-bold text-slate-700 mt-0.5">{viewingRequest.cancel_details}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {viewingRequest.bookingDiscountRequests && viewingRequest.bookingDiscountRequests.length > 0 && (
            <div className="border border-amber-100 bg-amber-50/40 rounded-2xl p-4">
              <p className="text-xs text-amber-700 font-extrabold uppercase tracking-wider mb-3">
                Companion Discount IDs
              </p>
              <div className="flex flex-col gap-3">
                {viewingRequest.bookingDiscountRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-amber-100 rounded-xl p-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#000C7D] text-sm">
                        {request.discountType} Companion {request.companionIndex}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {request.reviewedAt ? `Reviewed ${new Date(request.reviewedAt).toLocaleString()}` : "Pending driver review"}
                      </p>
                      {request.rejectionReason && (
                        <p className="text-xs font-semibold text-rose-600 mt-1">Reason: {request.rejectionReason}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                        request.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : request.status === "REJECTED"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-5 mt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => onDeleteRequest(viewingRequest.id)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm hover:shadow"
            >
              Delete Ride Request
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#000C7D] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm hover:shadow"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
