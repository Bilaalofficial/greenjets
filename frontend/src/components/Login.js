import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import backendBaseUrl from "./config";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function submit(e) {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendBaseUrl}/login`, {
                email,
                password
            });

            if (response.data.status === "exist") {
                const { name } = response.data;
                sessionStorage.setItem('user', JSON.stringify({ name, email })); 
                navigate("/welcome", { state: { name, email } });
            } else if (response.data.status === "notexist") {
                alert("User has not signed up");
            } else {
                alert("Invalid credentials");
            }
        } catch (error) {
            console.error("Error logging in", error);
            alert("Wrong details");
        }
    }

    return (
        <div className="login-container">
            <nav className="navbar">
                <div className="logo">LOGO</div>
                <ul className="nav-links">
                    <li><a href="/">Home</a></li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/services">Services</a></li>
                    <li><a href="/about">About</a></li>
                </ul>
                <div className="auth-buttons">
                    <button className="nav-button signup-button" onClick={() => { window.location.href = '/signup' }}>Sign Up</button>
                </div>
            </nav>
            <div className="loginParentDiv">
                <h1 className="login-heading">Login</h1>
                <form onSubmit={submit}>
                    <input
                        className="input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Username or Email"
                        required
                    />
                    <input
                        className="input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button type="submit" className="login-button">Sign In</button>
                </form>
                <div className="login-options">
                    <label className="remember-me">
                        <input type="checkbox" /> Remember Me
                    </label>
                    <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                </div>
                <p>Don't have an account? <Link to="/signup" className="login-signup-link">Sign Up</Link></p>
            </div>
        </div>
    );
}

export default Login;
