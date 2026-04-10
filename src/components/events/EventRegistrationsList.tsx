"use client";

export interface EventRegistration {
  id: string;
  status?: string;
  userId?: string;
  eventId?: string;
  createdAt?: string;
  updatedAt?: string;
  amountPaid?: number;
  paymentStatus?: string;
  transactionId?: string | null;
  registrationData?: Record<string, unknown>;
  user?: {
    id?: string;
    phoneNumber?: string;
    profile?: {
      name?: string;
      email?: string;
    };
  };
}

interface EventRegistrationsListProps {
  registrations: EventRegistration[];
  selectedRegistrationId?: string;
  onSelectRegistration: (registration: EventRegistration) => void;
}

const formatDateTime = (dateTimeString?: string) => {
  if (!dateTimeString) return "Not available";
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return dateTimeString;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function EventRegistrationsList({
  registrations,
  selectedRegistrationId,
  onSelectRegistration,
}: EventRegistrationsListProps) {

  const exportToCSV = () => {
    if (!registrations.length) return;

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Status",
      "Payment Status",
      "Registered At",
    ];

    const rows = registrations.map((r) => [
      r.user?.profile?.name || "Unknown User",
      r.user?.profile?.email || "Not available",
      r.user?.phoneNumber || "Not available",
      r.status || "N/A",
      r.paymentStatus || "N/A",
      formatDateTime(r.createdAt),
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row
            .map((field) =>
              `"${String(field).replace(/"/g, '""')}"`
            )
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "event-registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-10 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Registered Users
        </h2>

        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            {registrations.length} total
          </p>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {registrations.length === 0 ? (
        <p className="text-gray-600">
          No users have registered for this event yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((registration) => {
                const isSelected =
                  selectedRegistrationId === registration.id;
                return (
                  <tr
                    key={registration.id}
                    onClick={() =>
                      onSelectRegistration(registration)
                    }
                    className={`cursor-pointer hover:bg-blue-50 ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {registration.user?.profile?.name ||
                        "Unknown User"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {registration.user?.profile?.email ||
                        "Not available"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {registration.user?.phoneNumber ||
                        "Not available"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {registration.status || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {registration.paymentStatus || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDateTime(registration.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}