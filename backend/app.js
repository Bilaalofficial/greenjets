const express = require("express");
const client = require("./mongo"); // Assuming you have your Postgres client setup here
const cors = require("cors");
const app = express();
const { exec } = require('child_process');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static('static'));
app.use('/Images', express.static('Images'));

const initializeDatabase = async () => {
    const createUserTable = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL
        );
    `;

    const createAdminSettingsTable = `
        CREATE TABLE IF NOT EXISTS admin_settings (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            script1_enabled BOOLEAN DEFAULT TRUE,
            script2_enabled BOOLEAN DEFAULT TRUE,
            script3_enabled BOOLEAN DEFAULT TRUE,
            script4_enabled BOOLEAN DEFAULT TRUE
        );
    `;

    const insertDefaultAdmin = `
        INSERT INTO admin_settings (username, email, password)
        VALUES ('admin', 'admin@example.com', 'admin@123')
        ON CONFLICT (username) DO NOTHING;
    `;

    const createUserPermissionsTable = `
        CREATE TABLE IF NOT EXISTS user_permissions (
            user_id INT REFERENCES users(id),
            script1_enabled BOOLEAN DEFAULT FALSE,
            script2_enabled BOOLEAN DEFAULT FALSE,
            script3_enabled BOOLEAN DEFAULT FALSE,
            simplePlot_enabled BOOLEAN DEFAULT FALSE,
            browserPlot_enabled BOOLEAN DEFAULT FALSE,
            script4_enabled BOOLEAN DEFAULT FALSE,
            PRIMARY KEY (user_id)
        );
    `;

    try {
        await client.query(createUserTable);
        await client.query(createAdminSettingsTable);
        await client.query(insertDefaultAdmin);
        await client.query(createUserPermissionsTable);
        console.log("Database initialized successfully");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};

initializeDatabase();

const authenticateAdmin = async (username, password) => {
    const result = await client.query('SELECT * FROM admin_settings WHERE username = $1 AND password = $2', [username, password]);
    return result.rows.length > 0;
};

const runScript = (scriptPath, res, name, xplot, yplot, jsondata) => {
    const command = `${scriptPath} '${xplot}' '${yplot}' '${name}' '${jsondata}'`;
    console.log(`Executing command: ${command}`);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return res.status(500).json({ error: "Error executing script" });
        }
        if (stderr) {
            console.error(`Script error: ${stderr}`);
            return res.status(500).json({ error: "Script error" });
        }
        console.log(`Script output: ${stdout}`);
        res.json({ output: stdout.trim() });
    });
};

app.get("/permissions/:name", async (req, res) => {
    const name = req.params.name;

    try {
        const userResult = await client.query('SELECT id FROM users WHERE name = $1', [name]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].id;

        const permissionsResult = await client.query('SELECT * FROM user_permissions WHERE user_id = $1', [userId]);
        if (permissionsResult.rows.length > 0) {
            console.log("Fetched user permissions:", permissionsResult.rows[0]);
            res.json({ permissions: permissionsResult.rows[0] });
        } else {
            res.json({ permissions: {} });
        }
    } catch (err) {
        console.error('Error fetching permissions', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/run-script/:script", async (req, res) => {
    const { script } = req.params;
    const { name, xplot, yplot, jsondata } = req.query;

    const scriptMap = {
        "script1": path.join(__dirname, 'GraphFiles/PythonFiles/script1.sh'),
        "script2": path.join(__dirname, 'GraphFiles/PythonFiles/script2.sh'),
        "script3": path.join(__dirname, 'GraphFiles/PythonFiles/script3.sh'),
        "simpleplot": path.join(__dirname, 'GraphFiles/PythonFiles/simplePlot.sh'),
        "browserplot": path.join(__dirname, 'GraphFiles/PythonFiles/browserPlot.sh'),
        "script4": path.join(__dirname, 'GraphFiles/PythonFiles/script4.sh') 
    };
    const scriptPath = scriptMap[script];
    
    if (!scriptPath) {
        return res.status(400).json({ error: "Invalid script name" });
    }

    try {
        const userResult = await client.query('SELECT id FROM users WHERE name = $1', [name]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].id;

        const permissionsResult = await client.query('SELECT * FROM user_permissions WHERE user_id = $1', [userId]);
        const permissions = permissionsResult.rows[0];

        if (!permissions || !permissions[`${script}_enabled`]) {
            return res.status(403).json({ error: "You do not have permission to run this script" });
        }

        runScript(scriptPath, res, name, xplot, yplot, jsondata);
    } catch (err) {
        console.error('Error checking permissions or executing script', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/", cors(), (req, res) => {
    res.send('Server is running');
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await client.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.json({ status: "exist", name: user.name });
        } else {
            res.json("notexist");
        }
    } catch (err) {
        console.error('Error executing query', err);
        res.json("fail");
    }
});

app.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;
    console.log("backend invoked");

    try {
        const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            res.json("exist");
        } else {
            await client.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3)', [email, password, name]);
            const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);
            const userId = userResult.rows[0].id;
            await client.query('INSERT INTO user_permissions (user_id) VALUES ($1)', [userId]);
            res.json("notexist");
        }
    } catch (err) {
        console.error('Error executing query', err);
        res.json("fail");
    }
});

app.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;
    const isAdmin = await authenticateAdmin(username, password);

    if (isAdmin) {
        res.json({ status: "success" });
    } else {
        res.json({ status: "fail" });
    }
});

app.get("/admin/users", async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users', err);
        res.status(500).json("fail");
    }
});

app.post("/admin/set-permissions", async (req, res) => {
    const { userId, script1Enabled, script2Enabled, script3Enabled, simplePlotEnabled, browserPlotEnabled, script4Enabled } = req.body;
    try {
        console.log(`Updating permissions for userId ${userId}: script1: ${script1Enabled}, script2: ${script2Enabled}, script3: ${script3Enabled}, simple_plot: ${simplePlotEnabled}, browser_plot: ${browserPlotEnabled}, script4: ${script4Enabled}`);
        const result = await client.query(
            'UPDATE user_permissions SET script1_enabled = $1, script2_enabled = $2, script3_enabled = $3, simplePlot_enabled = $4, browserPlot_enabled = $5, script4_enabled = $6 WHERE user_id = $7',
            [script1Enabled, script2Enabled, script3Enabled, simplePlotEnabled, browserPlotEnabled, script4Enabled, userId]
        );
        console.log('Update result:', result);
        res.json({ status: "success" });
    } catch (err) {
        console.error('Error setting permissions', err);
        res.status(500).json({ status: "fail" });
    }
});

app.delete("/admin/users/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        await client.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM users WHERE id = $1', [userId]);
        res.json({ status: "success" });
    } catch (err) {
        console.error('Error deleting user', err);
        res.status(500).json({ status: "fail" });
    }
});

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
