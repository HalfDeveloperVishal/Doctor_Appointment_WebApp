import React, { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://localhost:8000/doctor/booking-info/", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch booking info");

        const data = await response.json();

        // Format data for table display
        const formatted = data.map((item) => ({
          patient_full_name: item.patient_info.full_name || "N/A",
          date: item.date,
          slot_time: `${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}`,
          reason_to_visit: item.patient_info?.reason_to_visit || "N/A",
        }));

        setAppointments(formatted);
      } catch (error) {
        console.error("Error fetching booking info:", error);
      }
    };

    fetchAppointments();
  }, []);
  
  const columns = [
    { header: "Patient", accessorKey: "patient_full_name" },
    { header: "Date", accessorKey: "date" },
    { header: "Slot", accessorKey: "slot_time" },
    { header: "Reason to Visit", accessorKey: "reason_to_visit" },
  ];

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 rounded-xl shadow-sm mt-10 bg-white">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        All Appointments
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white rounded-lg shadow-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-gray-600 text-sm">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left font-medium border-b border-gray-200"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-3 text-sm text-gray-700 border-b border-gray-100"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-gray-500 py-4"
                >
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
