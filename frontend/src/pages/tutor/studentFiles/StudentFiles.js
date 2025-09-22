import React from "react";
import "./studentFiles.css";
import StudentFileCard from "./studentFileCard";
import StudentImage from "../../reusableAssets/user.png";
/* import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';*/
import { MagnifyingGlassIcon } from "@phosphor-icons/react"; 
function StudentFiles() {
    return (
        <>
            <div className="blue-page-background">
                <div className="pt-2 text-center">
                    <h1 className="blue-page-title">Student Files</h1>  
                </div>
                <div className="search-bar rounded-lg border border-[#ffe998] p-2 w-1/4 inside-shadow flex items-center cursor-pointer m-auto mb-10">
                        <MagnifyingGlassIcon className='inline text-[#ffe998]' size={28} weight="light" />
                        <input className='w-full h-full pl-2 bg-transparent text-lg outline-none text-[#fff]' placeholder='Search by name' />
                </div>

                <div className="student-files-container">
                    <div className="student-row">
                    <StudentFileCard image={StudentImage} name = "Kenzi Solo" grade ="11" status = "active"/>
                    <StudentFileCard image={StudentImage} name = "Dyson Faegin" grade = "9" status = "inactive"/>
                    <StudentFileCard image={StudentImage} name = "Bo Fin Arvin" grade = "12" staus = "active"/>
                    <StudentFileCard image={StudentImage} name = "Nadia Athena" grade = "5" status = "deceased"/>
                    <StudentFileCard image={StudentImage} name = "Bo Fin Arvin" grade = "12" staus = "active"/>
                </div>
                <div className="student-row">
                    <StudentFileCard image={StudentImage} name = "Kenzi Solo" grade ="11" status = "active"/>
                    <StudentFileCard image={StudentImage} name = "Dyson Faegin" grade = "9" status = "inactive"/>
                    <StudentFileCard image={StudentImage} name = "Bo Fin Arvin" grade = "12" staus = "active"/>
                    <StudentFileCard image={StudentImage} name = "Nadia Athena" grade = "5" status = "deceased"/>
                    <StudentFileCard image={StudentImage} name = "Bo Fin Arvin" grade = "12" staus = "active"/>
                </div>
                <div className="student-row">
                    <StudentFileCard image={StudentImage} name = "Kenzi Solo" grade ="11" status = "active"/>
                    <StudentFileCard image={StudentImage} name = "Dyson Faegin" grade = "9" status = "inactive"/>
                    <StudentFileCard image={StudentImage} name = "Bo Fin Arvin" grade = "12" staus = "active"/>
                    <StudentFileCard image={StudentImage} name = "Nadia Athena" grade = "5" status = "deceased"/>
                    <StudentFileCard image={StudentImage} name = "Bo Fin Arvin" grade = "12" staus = "active"/>
                </div>
                <div className="student-row">
                    <StudentFileCard image={StudentImage} name = "Kenzi Solo" grade ="11" status = "active"/>
                    <StudentFileCard image={StudentImage} name = "Dyson Faegin" grade = "9" status = "inactive"/>
                    <StudentFileCard image={StudentImage} name = "Bo Fin Arvin" grade = "12" staus = "active"/>
                    <StudentFileCard image={StudentImage} name = "Nadia Athena" grade = "5" status = "deceased"/>
                    <StudentFileCard image={StudentImage} name = "Bo Fin Arvin" grade = "12" staus = "active"/>
                </div>
                </div>
            </div>
        </>
        
    );
}
export default StudentFiles;