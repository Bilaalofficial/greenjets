import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Welcome.css";
import backendBaseUrl from "./config";

function Welcome() {
    const location = useLocation();
    const navigate = useNavigate();
    const { name } = location.state || { name: "Guest" };
    const [output, setOutput] = useState("");
    const [permissions, setPermissions] = useState({});
    const [showInputSide, setShowInputSide] = useState(false);
    const [showGraphInput, setShowGraphInput] = useState(false);
    const [showScatterInput, setShowScatterInput] = useState(false);
    const [GraphType, setGraphType] = useState("");
    const [xplot, setXplot] = useState("");
    const [yplot, setYplot] = useState("");
    const [Slope, setSlope] = useState(0);
    const [Intercept, setIntercept] = useState(0);
    const [Xmin, setXmin] = useState(0);
    const [Xmax, setXmax] = useState(0);
    const [coordinates, setCoordinates] = useState([]);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get(`${backendBaseUrl}/permissions/${name}`);
                const fetchedPermissions = response.data.permissions || {};
                setPermissions(fetchedPermissions);
            } catch (error) {
                console.error("Error fetching permissions:", error);
            }
        };
        fetchPermissions();
    }, [name]);

    const fetchScriptOutput = async (script) => {
        let ApiQuery = "";

        if (script === "GraphScript") {
            let coordinateString = dataChanger();
            ApiQuery = `script3?name=${name}&xplot=${coordinateString[0]}&yplot=${coordinateString[1]}`;
        } else if (script === "CustomScript") {
            let PassScript = "script3";
            if (GraphType === "Simple Plot") PassScript = "simpleplot";
            else if (GraphType === "Browser Plot") PassScript = "browserplot";
            let JsonData = {
                name: name,
                slope: Slope,
                intercept: Intercept,
                xmin: Xmin,
                xmax: Xmax
            };
            ApiQuery = `${PassScript}?name=${name}&jsondata=${JSON.stringify(JsonData)}`;
        } else if (script === "ScatterPlot") {
            ApiQuery = `script4?name=${name}&xplot=${xplot}&yplot=${yplot}`;
        } else {
            ApiQuery = `${script}?name=${name}`;
        }

        try {
            const response = await axios.get(`${backendBaseUrl}/run-script/${ApiQuery}`);
            if (response.data.output && response.data.output.includes(".html")) {
                window.open(`${backendBaseUrl}/Images/${response.data.output}`, "_blank");
            } else {
                setOutput(response.data.output);
            }
            resetUI();
        } catch (error) {
            console.error("Error fetching script output:", error);
            setOutput("Error fetching script output");
        }
    };

    const resetUI = () => {
        setShowInputSide(false);
        setShowGraphInput(false);
        setShowScatterInput(false);
    };

    const addDataToFunction = () => {
        if (xplot && yplot) {
            setCoordinates((prevCoordinates) => [...prevCoordinates, [xplot, yplot]]);
            setXplot("");
            setYplot("");
        }
    };

    const dataChanger = () => {
        const xvalues = coordinates.map(coord => coord[0]);
        const yvalues = coordinates.map(coord => coord[1]);
        setCoordinates([]);
        return [xvalues.join(":"), yvalues.join(":")];
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        navigate("/");
    };

    const hasPermissions =
        permissions.script1_enabled ||
        permissions.script2_enabled ||
        permissions.script3_enabled ||
        permissions.simpleplot_enabled ||
        permissions.browserplot_enabled ||
        permissions.script4_enabled;

    return (
        <div className="welcome-container">
            <div className="welcome-header">
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <div className="message-box">
                <h1>Welcome {name}</h1>
            </div>
            {hasPermissions && (
                <div className="button-box">
                    {permissions.script1_enabled && (
                        <button onClick={() => fetchScriptOutput("script1")}>Script 1</button>
                    )}
                    {permissions.script2_enabled && (
                        <button onClick={() => fetchScriptOutput("script2")}>Script 2</button>
                    )}
                    {permissions.script3_enabled && (
                        <button onClick={() => { resetUI(); setShowInputSide(true); }}>
                            Script 3
                        </button>
                    )}
                    {permissions.simpleplot_enabled && (
                        <button
                            onClick={() => { resetUI(); setShowGraphInput(true); setGraphType("Simple Plot"); }}
                        >
                            Simple Plot
                        </button>
                    )}
                    {permissions.browserplot_enabled && (
                        <button
                            onClick={() => { resetUI(); setShowGraphInput(true); setGraphType("Browser Plot"); }}
                        >
                            Browser Plot
                        </button>
                    )}
                    {permissions.script4_enabled && (
                        <button
                            onClick={() => { resetUI(); setShowScatterInput(true); }}
                        >
                            Script 4
                        </button>
                    )}
                </div>
            )}

            {coordinates.length > 0 && (
                <div className="coordinate-display">
                    {coordinates.map((data, index) => (
                        <div key={index}>
                            ({data[0]}:{data[1]})
                        </div>
                    ))}
                </div>
            )}

            {showInputSide && (
                <div className="input-container">
                    <label>
                        X :
                        <input
                            type="number"
                            value={xplot}
                            onChange={(e) => setXplot(e.target.value)}
                        />
                    </label>
                    <label>
                        Y :
                        <input
                            type="number"
                            value={yplot}
                            onChange={(e) => setYplot(e.target.value)}
                        />
                    </label>
                    <button onClick={addDataToFunction}>Submit</button>
                    <button
                        onClick={() => fetchScriptOutput("GraphScript")}
                        disabled={coordinates.length < 2}
                    >
                        Generate graph
                    </button>
                    {coordinates.length < 2 && (
                        <div className="alert-message">
                            Enter at least two coordinates for generating a graph.
                        </div>
                    )}
                </div>
            )}

            {showGraphInput && (
                <div className="input-container">
                    <div className="alert-message">{GraphType}</div>

                    <label>
                        Slope :
                        <input
                            type="number"
                            value={Slope}
                            onChange={(e) => setSlope(Number(e.target.value))}
                        />
                    </label>
                    <label>
                        Intercept :
                        <input
                            type="number"
                            value={Intercept}
                            onChange={(e) => setIntercept(Number(e.target.value))}
                        />
                    </label>
                    <label>
                        Xmin :
                        <input
                            type="number"
                            value={Xmin}
                            onChange={(e) => setXmin(Number(e.target.value))}
                        />
                    </label>
                    <label>
                        Xmax :
                        <input
                            type="number"
                            value={Xmax}
                            onChange={(e) => setXmax(Number(e.target.value))}
                        />
                    </label>
                    <button onClick={() => fetchScriptOutput("CustomScript")}>
                        Generate graph
                    </button>
                </div>
            )}

            {showScatterInput && (
                <div className="input-container">
                    <label className="input-label">
                        Enter the X-axis points separated by spaces:
                        <input
                            type="text"
                            value={xplot}
                            onChange={(e) => setXplot(e.target.value)}
                        />
                    </label>
                    <label className="input-label">
                        Enter the Y-axis points separated by spaces:
                        <input
                            type="text"
                            value={yplot}
                            onChange={(e) => setYplot(e.target.value)}
                        />
                    </label>
                    <button onClick={() => fetchScriptOutput("ScatterPlot")}>
                        Generate Scatter Plot
                    </button>
                </div>
            )}

            {!showInputSide && !showGraphInput && !showScatterInput && output && (
                output.includes(".png") ? (
                    <div className="graphImg">
                        <img
                            src={`${backendBaseUrl}/Images/${output}`}
                            alt="Generated Plot"
                            style={{ width: "400px" }}
                        />
                    </div>
                ) : output.includes(".html") ? (
                    <div className="pre-output">
                        <pre>The image is opened in a new tab</pre>
                    </div>
                ) : (
                    <div className="pre-output">
                        <pre>{output}</pre>
                    </div>
                )
            )}
        </div>
    );
}

export default Welcome;
