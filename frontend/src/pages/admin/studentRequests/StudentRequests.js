import React, { useEffect, useState } from "react";
import axios from "axios";
import { DotsThreeVertical, X} from "@phosphor-icons/react";

function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [userImages, setUserImages] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [progressNotesModalOpen, setProgressNotesModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [postponeMessage, setPostponeMessage] = useState("");
  const [progressNotes, setProgressNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [responseSubject, setResponseSubject] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [responseStatus, setResponseStatus] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  // Add state for the Appeal Block modal
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealActionMessage, setAppealActionMessage] = useState("");

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    const initials = names.map(n => n.charAt(0).toUpperCase()).join("");
    return initials.slice(0, 2);
  }

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Completed: "bg-green-100 text-green-800",
    Postponed: "bg-blue-100 text-gray-700",
    Rejected: "bg-red-100 text-red-800",
    Default: "bg-gray-100 text-gray-800",
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/studentRequests");
        setRequests(res.data);

        // Fetch user images for all studentIDs
        const studentIDs = res.data.map(r => r.studentID);
        if (studentIDs.length) {
          const avatarRes = await axios.post("http://localhost:5000/api/users/user-avatars", { studentIDs });
          setUserImages(avatarRes.data);
        }
      } catch (err) {
        console.error("Error fetching requests or images:", err);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    console.log("User Images:", userImages);
  }, [userImages]);

  const filteredRequests = filter
    ? requests.filter(r => r.requestType === filter)
    : requests;

  // Grouped and ordered requests
  const statusOrder = ["Pending", "Completed", "Postponed", "Rejected"]; // Order you want to display

  const groupedRequests = statusOrder.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {});

  filteredRequests.forEach(req => {
    const status = req.status || "Pending";
    if (groupedRequests[status]) {
      groupedRequests[status].push(req);
    }
  });

  // Handle Postpone action
  const handlePostpone = async () => {
    if (!selectedRequest) return;
    try {
      const res = await axios.post("http://localhost:5000/api/studentRequests/postpone", {
        studentRequestID: selectedRequest.studentRequestID,
        adminPassword
      });
      if (res.data.success) {
        setPostponeMessage("Request status updated to Postponed!");
        // Update local state
        setRequests(prev =>
          prev.map(r =>
            r.studentRequestID === selectedRequest.studentRequestID
              ? { ...r, status: "Postponed" }
              : r
          )
        );
        setTimeout(() => {
          setPostponeModalOpen(false);
          setPostponeMessage("");
        }, 1200);
      } else {
        setPostponeMessage(res.data.message || "Failed to update status.");
      }
    } catch (err) {
      setPostponeMessage("Error updating status.");
    }
    setAdminPassword("");
  };

  // Fetch progress notes for a specific request
  const fetchProgressNotes = async (requestID) => {
    setLoadingNotes(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/progressNotes/${requestID}`);
      setProgressNotes(res.data);
    } catch (err) {
      console.error("Error fetching progress notes:", err);
    }
    setLoadingNotes(false);
  };

  const handleShowProgressNotes = async () => {
    if (!selectedRequest) return;
    setLoadingNotes(true);
    setProgressNotes([]);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/progressNotes/student/${selectedRequest.studentID}/lesson-notes`
      );
      setProgressNotes(res.data);
      setProgressNotesModalOpen(true);
    } catch (err) {
      setProgressNotes([]);
    }
    setLoadingNotes(false);
  };

  // Handle Reject action
  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      const res = await axios.post("http://localhost:5000/api/studentRequests/reject", {
        studentRequestID: selectedRequest.studentRequestID,
        adminPassword
      });
      if (res.data.success) {
        setRejectMessage("Request status updated to Rejected!");
        setRequests(prev =>
          prev.map(r =>
            r.studentRequestID === selectedRequest.studentRequestID
              ? { ...r, status: "Rejected" }
              : r
          )
        );
        setTimeout(() => {
          setRejectModalOpen(false);
          setRejectMessage("");
        }, 1200);
      } else {
        setRejectMessage(res.data.message || "Failed to update status.");
      }
    } catch (err) {
      setRejectMessage("Error updating status.");
    }
    setAdminPassword("");
  };

  const handlePublishNote = async (noteID) => {
    try {
      await axios.post("http://localhost:5000/api/progressNotes/publish", {
        noteID: noteID
      });
      setProgressNotes(prev =>
        prev.map(n =>
          n.noteID === noteID
            ? { ...n, published: true }
            : n
        )
      );
    } catch (err) {
      alert("Failed to publish note.");
    }
  };

  return (
    <div className="blue-page-background">
      <div className="bg-white max-w-4xl mx-auto rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-cyan-800">Student Requests</h1>
          <div>
            <select
              className="bg-white h-10 p-2 rounded-lg border-2 border-gray-300 shadow-inner w-48"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Progress_Note">Request Progress Note</option>
              <option value="New_Subject">Request New Subject</option>
              <option value="General_Query">General Query</option>
              <option value="Appeal_Block">Appeal Block</option>
            </select>
          </div>
        </div>

        <div className="">
          {statusOrder.map(status => (
            groupedRequests[status].length > 0 && (
              <div key={status}>
                <div className="">
                  <h3 className="text-xl text-left text-gray-700 mt-8 mb-2">{status}</h3>
                  <div className="border-b-2 border-gray-200"></div>
                </div>

                <div className="divide-y divide-gray-200">
                  {groupedRequests[status].map((req) => {
                    const userInfo = userImages[req.studentID] || {};
                    return (
                      <div
                        key={req.studentRequestID}
                        className="flex items-center justify-between py-4 hover:bg-gray-50 hover:rounded-lg transition pl-2 relative"
                      >
                        {/* Left: User image or initials */}
                        <div className="flex items-center gap-3 w-1/3">
                          {userInfo.image ? (
                            <img
                              src={userInfo.image}
                              alt={userInfo.name || "User"}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                              {getInitials(userInfo.name)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {req.requestType.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>

                        {/* Middle: Student ID */}
                        <div className="w-1/5 text-gray-600 text-sm">
                          Student: {req.studentID}
                        </div>

                        {/* Status (from DB) */}
                        <div className="w-1/5">
                          <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusColors[req.status] || statusColors.Default}`}>
                            {req.status}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="w-1/6 text-sm text-gray-500">
                          {req.createdAt?.slice(0, 10)}
                        </div>

                        {/* Actions: Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === req.studentRequestID ? null : req.studentRequestID)}
                            className="focus:outline-none"
                          >
                            <DotsThreeVertical size={24} weight="bold" />
                          </button>
                          {dropdownOpen === req.studentRequestID && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setViewModalOpen(true);
                                  setDropdownOpen(null);
                                }}
                              >
                                View Request
                              </button>
                              {/* In your dropdown menu, add a button to open the Appeal Block modal for Appeal_Block requests */}
                              {req.requestType === "Appeal_Block" && (
                                <button
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                  onClick={() => {
                                    setSelectedRequest(req);
                                    setAppealModalOpen(true);
                                    setDropdownOpen(null);
                                  }}
                                >
                                  Manage Appeal
                                </button>
                              )}
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setPostponeModalOpen(true);
                                  setDropdownOpen(null);
                                }}
                              >
                                Postpone
                              </button>
                              <button
                                className="block w-full text-red-500 text-left px-4 py-2 hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setRejectModalOpen(true);
                                  setDropdownOpen(null);
                                }}
                              >
                                Reject
                              </button>
                              
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* View Request Modal */}
      {viewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="modal-header flex flex-row items-center mb-4 justify-between">
              <h3 className="text-lg font-semibold">Request Details</h3>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} weight="bold" />
              </button>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Type:</span> {selectedRequest.requestType.replace(/_/g, " ")}</p>
              <p><span className="font-semibold">Student ID:</span> {selectedRequest.studentID}</p>
              <p><span className="font-semibold">Status:</span> {selectedRequest.status}</p>
              <p><span className="font-semibold">Date:</span> {selectedRequest.createdAt?.slice(0, 10)}</p>
              {selectedRequest.newSubjectName && (
                <p><span className="font-semibold">New Subject:</span> {selectedRequest.newSubjectName}</p>
              )}
              {selectedRequest.newSubjectDescription && (
                <p><span className="font-semibold">Description:</span> {selectedRequest.newSubjectDescription}</p>
              )}
              {selectedRequest.query && (
                <p><span className="font-semibold">Query:</span> {selectedRequest.query}</p>
              )}
            </div>
            {/* In your View Request Modal */}
            {selectedRequest.requestType === "Progress_Note" && (
              <button
                className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={handleShowProgressNotes}
              >
                Publish Progress Note
              </button>
            )}

            {selectedRequest.requestType === "New_Subject" && (
              <button
                className="mt-6 w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                onClick={async () => {
                  // Store in NewSubjectRequests table (implement backend endpoint)
                  try {
                    await axios.post("http://localhost:5000/api/newSubjectRequests", {
                      subjectName: selectedRequest.newSubjectName,
                      subjectDescription: selectedRequest.newSubjectDescription,
                      dateRequested: selectedRequest.createdAt,
                    });
                    alert("New subject request stored!");
                  } catch (err) {
                    alert("Failed to store new subject request.");
                  }
                }}
              >
                Store New Subject Request
              </button>
            )}

            {selectedRequest.requestType === "General_Query" && (
              <button
                className="mt-6 w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                onClick={() => setRespondModalOpen(true)}
              >
                Respond
              </button>
            )}
          </div>
        </div>
      )}

      {/* Postpone Modal */}
      {postponeModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <form
            className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col gap-4"
            onSubmit={e => {
              e.preventDefault();
              handlePostpone();
            }}
          >
            <h3 className="text-lg font-semibold mb-2">Postpone Request</h3>
            <p className="text-sm mb-2">Enter admin password to change status to "Postponed".</p>
            <input
              type="password"
              placeholder="Admin Password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
            {postponeMessage && (
              <div className="text-center text-sm text-red-600">{postponeMessage}</div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => {
                  setPostponeModalOpen(false);
                  setPostponeMessage("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Progress Notes Modal */}
      {progressNotesModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="modal-header flex flex-row items-center mb-4 justify-between">
              <h3 className="text-lg font-semibold">Progress Notes</h3>
              <button onClick={() => setProgressNotesModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} weight="bold" />
              </button>
            </div>
            <div className="space-y-2">
              {loadingNotes ? (
                <div>Loading...</div>
              ) : progressNotes.length === 0 ? (
                <div>No progress notes found for this student.</div>
              ) : (
                progressNotes.map((note, idx) => {
                  const match = note.file_name.match(/lesson-feedback-(\d{4}-\d{2}-\d{2})\.pdf/);
                  const lessonDate = match ? match[1] : "Unknown";
                  return (
                    <div key={note.progressNoteID || idx} className="border rounded p-2 mb-2 flex flex-col">
                      <span className="font-semibold">{note.file_name}</span>
                      <span className="text-sm text-gray-600">Lesson Date: {lessonDate}</span>
                      {note.published ? (
                        <span className="text-green-600 font-semibold mt-1">Published</span>
                      ) : (
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded mt-1 hover:bg-blue-700"
                          onClick={() => handlePublishNote(note.noteID)}
                        >
                          Publish PDF
                        </button>
                      )}
                      <a
                        href={note.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mt-1"
                      >
                        Download PDF
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {respondModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <form
            className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col gap-4"
            onSubmit={async e => {
              e.preventDefault();
              try {
                await axios.post("http://localhost:5000/api/studentRequests/respond", {
                  toUserID: selectedRequest.studentID,
                  subject: responseSubject,
                  message: responseMessage,
                  studentRequestID: selectedRequest.studentRequestID
                });
                setResponseStatus("Response sent!");
                setRequests(prev =>
                  prev.map(r =>
                    r.studentRequestID === selectedRequest.studentRequestID
                      ? { ...r, status: "Completed" }
                      : r
                  )
                );
                setTimeout(() => {
                  setRespondModalOpen(false);
                  setResponseStatus("");
                  setResponseSubject("");
                  setResponseMessage("");
                }, 1200);
              } catch (err) {
                setResponseStatus("Failed to send response.");
              }
            }}
          >
            <h3 className="text-lg font-semibold mb-2">Respond to Query</h3>
            <input
              type="text"
              placeholder="Subject"
              value={responseSubject}
              onChange={e => setResponseSubject(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
            <textarea
              placeholder="Message"
              value={responseMessage}
              onChange={e => setResponseMessage(e.target.value)}
              className="border rounded p-2 w-full"
              rows={4}
              required
            />
            {responseStatus && (
              <div className="text-center text-sm text-green-600">{responseStatus}</div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Send Email
              </button>
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => {
                  setRespondModalOpen(false);
                  setResponseStatus("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <form
            className="bg-white rounded-lg shadow-lg p-6 w-96 flex flex-col gap-4"
            onSubmit={e => {
              e.preventDefault();
              handleReject();
            }}
          >
            <h3 className="text-lg font-semibold mb-2">Reject Request</h3>
            <p className="text-sm mb-2">Enter admin password to change status to "Rejected".</p>
            <input
              type="password"
              placeholder="Admin Password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="border rounded p-2 w-full"
              required
            />
            {rejectMessage && (
              <div className="text-center text-sm text-red-600">{rejectMessage}</div>
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
                  setRejectModalOpen(false);
                  setRejectMessage("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appeal Block Modal */}
      {appealModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="modal-header flex flex-row items-center mb-4 justify-between">
              <h3 className="text-lg font-semibold">Appeal Block Details</h3>
              <button onClick={() => setAppealModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} weight="bold" />
              </button>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Type:</span> {selectedRequest.requestType.replace(/_/g, " ")}</p>
              <p><span className="font-semibold">Student ID:</span> {selectedRequest.studentID}</p>
              <p><span className="font-semibold">Status:</span> {selectedRequest.status}</p>
              <p><span className="font-semibold">Date:</span> {selectedRequest.createdAt?.slice(0, 10)}</p>
              {selectedRequest.query && (
                <p><span className="font-semibold">Appeal Query:</span> {selectedRequest.query}</p>
              )}
            </div>
            {appealActionMessage && (
              <div className="text-center text-sm text-green-600 my-2">{appealActionMessage}</div>
            )}
            <div className="flex gap-2 mt-6">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={async () => {
                  // Revoke: set student status to Blocked and mark request as Completed/Revoked
                  try {
                    await axios.post("http://localhost:5000/api/studentRequests/revoke-appeal", {
                      studentRequestID: selectedRequest.studentRequestID,
                      studentID: selectedRequest.studentID
                    });
                    setAppealActionMessage("Block has been revoked and student is unblocked.");
                    setRequests(prev =>
                      prev.map(r =>
                        r.studentRequestID === selectedRequest.studentRequestID
                          ? { ...r, status: "Completed" }
                          : r
                      )
                    );
                    setTimeout(() => {
                      setAppealModalOpen(false);
                      setAppealActionMessage("");
                    }, 1200);
                  } catch (err) {
                    setAppealActionMessage("Failed to revoke block.");
                  }
                }}
              >
                Revoke
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  setAppealModalOpen(false);
                  setSelectedRequest(selectedRequest);
                  setRespondModalOpen(true);
                }}
              >
                Respond
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentRequests;