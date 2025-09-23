import React from "react";
import "./progressNotes.css";
import PdfCard from "./PdfCard";

function ProgressNotes() {
    return (
        <>
            <div className="blue-page-background">
                <div className="pt-2 text-center">
                    <h1 className="blue-page-title">Progress Notes</h1>  
                </div>
                <div className = "heading-row" >
                    <div>Name</div>
                    <div>Date</div>
                    <div>Size</div>
                    <div>Actions</div>
                    <div></div>
                </div>
                <div className="pdf-cards-container">
                    <PdfCard title="Math Progress" date="2023-03-15" size="1.2MB" />
                    <PdfCard title="Science Progress" date="2023-03-16" size="1.5MB" />
                    <PdfCard title="English Progress" date="2023-03-17" size="1.0MB" />
                </div>
            </div>
        </>
    );
}

export default ProgressNotes;
