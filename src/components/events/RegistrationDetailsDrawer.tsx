"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { EventRegistration } from "./EventRegistrationsList";

interface RegistrationDetailsDrawerProps {
  registration: EventRegistration | null;
  onClose: () => void;
}

const formatDateTime = (dateTimeString?: string) => {
  if (!dateTimeString) return "Not available";
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return dateTimeString;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const toDisplayPairs = (data?: Record<string, unknown>) => {
  if (!data || typeof data !== "object") return [];
  return Object.entries(data).map(([key, value]) => ({
    key,
    value:
      typeof value === "string"
        ? value
        : value === null || value === undefined
          ? ""
          : JSON.stringify(value),
  }));
};

export default function RegistrationDetailsDrawer({
  registration,
  onClose,
}: RegistrationDetailsDrawerProps) {
  if (!registration) return null;

  const dynamicFields = toDisplayPairs(registration.registrationData);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registration Details</h2>
            <p className="text-sm text-gray-600">Registration ID: {registration.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close registration details"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">User</h3>
            <dl className="grid grid-cols-1 gap-3">
              <div>
                <dt className="text-xs text-gray-500 uppercase">Name</dt>
                <dd className="text-sm text-gray-900">{registration.user?.profile?.name || "Unknown User"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Email</dt>
                <dd className="text-sm text-gray-900">{registration.user?.profile?.email || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Phone</dt>
                <dd className="text-sm text-gray-900">{registration.user?.phoneNumber || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">User ID</dt>
                <dd className="text-sm text-gray-900">{registration.userId || registration.user?.id || "N/A"}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Registration</h3>
            <dl className="grid grid-cols-1 gap-3">
              <div>
                <dt className="text-xs text-gray-500 uppercase">Status</dt>
                <dd className="text-sm text-gray-900">{registration.status || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Payment Status</dt>
                <dd className="text-sm text-gray-900">{registration.paymentStatus || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Amount Paid</dt>
                <dd className="text-sm text-gray-900">
                  ₹{typeof registration.amountPaid === "number" ? registration.amountPaid : 0}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Transaction ID</dt>
                <dd className="text-sm text-gray-900">{registration.transactionId || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Created At</dt>
                <dd className="text-sm text-gray-900">{formatDateTime(registration.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Updated At</dt>
                <dd className="text-sm text-gray-900">{formatDateTime(registration.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Submitted Registration Data</h3>
            {dynamicFields.length === 0 ? (
              <p className="text-sm text-gray-600">No additional registration fields submitted.</p>
            ) : (
              <dl className="grid grid-cols-1 gap-3">
                {dynamicFields.map((field) => (
                  <div key={field.key}>
                    <dt className="text-xs text-gray-500 uppercase">{field.key}</dt>
                    <dd className="text-sm text-gray-900 break-words">
                      {field.value || "Not provided"}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
