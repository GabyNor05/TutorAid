import React from "react";

function ManageReports() {
  return (
    <div className="blue-page-background">
      <div className="bg-white max-w-4xl mx-auto rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-cyan-800">Manage Reports</h1>
          <div>
            <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg">
              Create Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageReports;