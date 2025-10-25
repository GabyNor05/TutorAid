import React from "react";
import pdfIcon from "../../../reusableAssets/pdf.png";
import "./progressNotes.css";

function PdfCard({ title, date, size, filePath }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const fileUrl = filePath?.startsWith("http")
        ? filePath
        : `${API_URL}${filePath?.startsWith('/') ? filePath : '/' + (filePath || '')}`;

    // Compute human-readable size from bytes
    let displaySize = "";
    if (typeof size === "number") {
        if (size < 1024) displaySize = `${size} bytes`;
        else if (size < 1024 * 1024) displaySize = `${Math.max(1, Math.round(size / 1024))} KB`;
        else displaySize = `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }

    return (
        <div className="pdf-card bg-white/95 rounded-lg shadow">
            <div className="pdf-card-content grid grid-cols-1 sm:grid-cols-12 items-center gap-3 sm:gap-4 p-3">
                {/* Name */}
                <div className="pdf-name sm:col-span-6 flex items-center gap-3 min-w-0">
                    <img src={pdfIcon} alt="PDF" className="w-8 h-8 shrink-0" />
                    <h3 className="font-semibold text-[#2B5561] truncate" title={title}>{title}</h3>
                </div>

                {/* Date */}
                <div className="pdf-modified sm:col-span-3 text-gray-700">
                    <p className="sm:text-base text-sm">
                        <span className="sm:hidden inline text-gray-500">Date: </span>{date}
                    </p>
                </div>

                {/* Size */}
                <div className="pdf-size sm:col-span-2 text-gray-700">
                    <h3 className="sm:text-base text-sm">
                        <span className="sm:hidden inline text-gray-500">Size: </span>{displaySize}
                    </h3>
                </div>

                {/* Actions */}
                <div className="pdf-actions sm:col-span-1 flex flex-wrap sm:flex-nowrap gap-2 justify-start sm:justify-end">
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-button inline-flex items-center justify-center px-3 py-1.5 rounded bg-[#2B5561] text-white hover:bg-[#2B5561]/80 text-sm"
                    >
                        View
                    </a>
                    <a
                        href={fileUrl}
                        download={title}
                        className="download-button inline-flex items-center justify-center px-3 py-1.5 rounded border border-[#2B5561] text-[#2B5561] hover:bg-[#2B5561]/10 text-sm"
                    >
                        Download
                    </a>
                </div>
            </div>
        </div>
    );
}

export default PdfCard;