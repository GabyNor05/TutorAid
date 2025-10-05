import React, { useEffect, useState } from "react";
import axios from "axios";
import { DotsThreeVertical, X} from "@phosphor-icons/react";


const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Escalated: "bg-red-100 text-red-800",
  Ignored: "bg-gray-100 text-gray-800",
  
};


function ManageReports() {
  const [reports, setReports] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [ignoreModalOpen, setIgnoreModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [escalateMessage, setEscalateMessage] = useState("");
  const [ignoreMessage, setIgnoreMessage] = useState("");
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/lessonReports");
        setReports(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  const handleEscalate = async () => {
    if (!selectedReport) return;
    try {
      const res = await axios.post("http://localhost:5000/api/lessonReports/escalate", {
        lessonReportID: selectedReport.lessonReportID,
        adminPassword
      });
      if (res.data.success) {
        setEscalateMessage("Report status updated to Escalated!");
        setReports(prev =>
          prev.map(r =>
            r.lessonReportID === selectedReport.lessonReportID
              ? { ...r, status: "Escalated" }
              : r
          )
        );
        setTimeout(() => {
          setEscalateModalOpen(false);
          setEscalateMessage("");
        }, 1200);
      } else {
        setEscalateMessage(res.data.message || "Failed to update status.");
      }
    } catch (err) {
      setEscalateMessage("Error updating status.");
    }
    setAdminPassword("");
  };

  const handleIgnore = async () => {
    if (!selectedReport) return;
    try {
      const res = await axios.post("http://localhost:5000/api/lessonReports/ignore", {
        lessonReportID: selectedReport.lessonReportID,
        adminPassword
      });
      if (res.data.success) {
        setIgnoreMessage("Report status updated to Ignored!");
        setReports(prev =>
          prev.map(r =>
            r.lessonReportID === selectedReport.lessonReportID
              ? { ...r, status: "Ignored" }
              : r
          )
        );
        setTimeout(() => {
          setIgnoreModalOpen(false);
          setIgnoreMessage("");
        }, 1200);
      } else {
        setIgnoreMessage(res.data.message || "Failed to update status.");
      }
    } catch (err) {
      setIgnoreMessage("Error updating status.");
    }
    setAdminPassword("");
  };

  return (
    <div className="blue-page-background">
      <div className="bg-white max-w-4xl mx-auto rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-cyan-800">Manage Reports</h1>
          
        </div>
        <div className="divide-y mt-6">
          {reports.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No reports found.</div>
          ) : (
            reports.map(report => (
              <div key={report.lessonReportID} className="flex items-center justify-between py-4 hover:bg-gray-50 hover:rounded-lg transition pl-2 relative">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">
                     {report.subject}
                  </span>
                  <span className="text-sm text-gray-500">
                    {report.reportDate}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Student ID: {report.studentID}
                </div>
                
                <span
                  className={`mt-2 px-3 py-1 text-sm rounded-full font-medium inline-block ${statusColors[report.status] || statusColors.Default}`}
                >
                  {report.status || "Pending"}
                </span>
                <div className="dropdown-menu">
                  <button
                    onClick={() =>
                      setDropdownOpen(dropdownOpen === report.lessonReportID ? null : report.lessonReportID)
                    }
                    className="focus:outline-none"
                  >
                    <DotsThreeVertical size={24} className="cursor-pointer" />
                  </button>
                  {dropdownOpen === report.lessonReportID && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setSelectedReport(report);
                            setViewModalOpen(true);
                            setDropdownOpen(null);
                          }}
                        >
                          View Report
                        </button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedReport(report);
                          setEscalateModalOpen(true);
                          setDropdownOpen(null);
                        }}
                      >
                        Escalate
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedReport(report);
                          setIgnoreModalOpen(true);
                          setDropdownOpen(null);
                        }}
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {escalateModalOpen && selectedReport && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <form
      className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col gap-4"
      onSubmit={e => {
        e.preventDefault();
        handleEscalate();
      }}
    >
      <h3 className="text-lg font-semibold mb-2">Escalate Report</h3>
      <p className="text-sm mb-2">Enter admin password to change status to "Escalated".</p>
      <input
        type="password"
        placeholder="Admin Password"
        value={adminPassword}
        onChange={e => setAdminPassword(e.target.value)}
        className="border rounded p-2 w-full"
        required
      />
      {escalateMessage && (
        <div className="text-center text-sm text-red-600">{escalateMessage}</div>
      )}
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Submit
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          onClick={() => {
            setEscalateModalOpen(false);
            setEscalateMessage("");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}

{ignoreModalOpen && selectedReport && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <form
      className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col gap-4"
      onSubmit={e => {
        e.preventDefault();
        handleIgnore();
      }}
    >
      <h3 className="text-lg font-semibold mb-2">Ignore Report</h3>
      <p className="text-sm mb-2">Enter admin password to change status to "Ignored".</p>
      <input
        type="password"
        placeholder="Admin Password"
        value={adminPassword}
        onChange={e => setAdminPassword(e.target.value)}
        className="border rounded p-2 w-full"
        required
      />
      {ignoreMessage && (
        <div className="text-center text-sm text-red-600">{ignoreMessage}</div>
      )}
      <div className="flex gap-2 items-center mt-2">
        <button
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Submit
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 h-[50px]"
          onClick={() => {
            setIgnoreModalOpen(false);
            setIgnoreMessage("");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}

{viewModalOpen && selectedReport && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
      <div className="modal-header flex flex-row items-center mb-4 justify-between">
        <h3 className="text-lg font-semibold">Report Details</h3>
        <button onClick={() => setViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
          <X size={24} weight="bold" />
        </button>
      </div>
      <div className="space-y-2">
        <p><span className="font-semibold">Student ID:</span> {selectedReport.studentID}</p>
        <p><span className="font-semibold">Subject:</span> {selectedReport.subject}</p>
        <p><span className="font-semibold">Date:</span> {selectedReport.reportDate}</p>
        <p><span className="font-semibold">Status:</span>
          <span className={`ml-2 px-3 py-1 text-sm rounded-full font-medium inline-block ${statusColors[selectedReport.status] || statusColors.Pending}`}>
            {selectedReport.status}
          </span>
        </p>
        {selectedReport.comments && (
          <p><span className="font-semibold">Comments:</span> {selectedReport.comments}</p>
        )}
      </div>
      <button
        className="mt-6 w-full bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500  transition"
        onClick={() => setViewModalOpen(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default ManageReports;