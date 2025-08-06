import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
            <div classname = "logo-placeholder" style={{color: "white"}}></div>
            <div className="nav-links">
                <Link to="/">Dashboard</Link>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
            </div>
        </nav>
    )
}

export default Navbar;