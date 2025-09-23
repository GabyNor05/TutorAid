import React from "react";
import pdfIcon from "../../../reusableAssets/pdf.png";
import "./progressNotes.css";

function PdfCard({ title, date, size }) {
    return (
        <div className="pdf-card">
            <div className="pdf-card-content">
                <div className ="pdf-name">
                    <img src={pdfIcon} alt="PDF Icon" />
                    <h3>{title}</h3>
                </div>
                <div className="pdf-modified">
                    <p>{date}</p>
                </div>
                <div className="pdf-size">
                    <h3>{size}</h3>
                </div>
                <div className="pdf-actions">
                    <button className="view-button">View</button>
                    <button className="download-button">Download</button>
                </div>
                <div></div>
            </div>
        </div>
    );
}
export default PdfCard;