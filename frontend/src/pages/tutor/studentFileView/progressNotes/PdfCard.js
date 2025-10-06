import React from "react";
import pdfIcon from "../../../reusableAssets/pdf.png";
import "./progressNotes.css";

function PdfCard({ title, date, size, filePath }) {
    // Build the correct file URL for local or cloud files
    const fileUrl = filePath.startsWith("http")
        ? filePath
        : `http://localhost:5000${filePath.startsWith('/') ? filePath : '/' + filePath}`;

    // Convert size from KB to MB
    let displaySize = "";
    if (size) {
        const sizeNum = parseInt(size, 10);
        if (sizeNum < 1024) {
            displaySize = `${sizeNum} bytes`;
        } else if (sizeNum < 1024 * 1024) {
            displaySize = `${Math.max(1, Math.round(sizeNum / 1024))} KB`;
        } else {
            displaySize = `${(sizeNum / (1024 * 1024)).toFixed(2)} MB`;
        }
    }
    console.log("size prop:", size);

    const sizeMB = size ? (parseInt(size, 10) / (1024 * 1024)).toFixed(2) : "";

    return (
        <div className="pdf-card">
            <div className="pdf-card-content">
                <div className="pdf-name">
                    <img src={pdfIcon} alt="PDF Icon" />
                    <h3>{title}</h3>
                </div>
                <div className="pdf-modified">
                    <p>{date}</p>
                </div>
                <div className="pdf-size w-12">
                    <h3>{displaySize ? `${displaySize}` : ""}</h3>
                </div>
                <div className="pdf-actions flex flex-row gap-2">
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-button"
                    >
                        View
                    </a>
                    <a
                        href={fileUrl}
                        download={title}
                        className="download-button"
                    >
                        Download
                    </a>
                    
                </div>
                <div></div>
            </div>
        </div>
    );
}

export default PdfCard;