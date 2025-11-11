import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import backendBaseUrl from "./config";

function Signup() {
    const history = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        if (name === '' || email === '' || password === '') {
            alert("Please enter all values");
            return;
        }

        try {
            await axios.post(`${backendBaseUrl}/signup`, {
                name,
                email,
                password
            })
            .then(res => {
                if (res.data === "exist") {
                    alert("User already exists");
                } else if (res.data === "notexist") {
                    history("/login", { state: { id: email } });
                }
            })
            .catch(e => {
                alert("Wrong details");
                console.log(e);
            });
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="login-container">
            <div className="loginParentDiv">
                <h1 className="login-heading">Signup</h1>
                <form onSubmit={submit}>
                    <label className="label">Name</label>
                    <input
                        className="input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        required
                    />
                    <label className="label">Email</label>
                    <input
                        className="input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <label className="label">Password</label>
                    <input
                        className="input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button type="submit" className="signup-button">Signup</button>
                </form>
            </div>
        </div>
    );
}

export default Signup;
