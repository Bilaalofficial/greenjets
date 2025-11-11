import React from "react"
import "./Home.css";

function Home() {

    return (
        <div className="background">
            <header className="header">
                <h1 className="heading">.</h1>
            </header>
            <div className="buttons">
                <div className="row">
                    <div className="button-row">
                        <button className="button" onClick={() => { window.location.href = '/login' }}>User Login</button>
                    </div>
                    <div className="button-row">
                        <button className="button" onClick={() => { window.location.href = '/signup' }}>User Signup</button>
                    </div>
                    <div className="button-row">
                        <button className="button" onClick={() => { window.location.href = '/admin' }}> Admin Login</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home