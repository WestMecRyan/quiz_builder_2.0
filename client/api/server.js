import express from 'express';
import simpleGit from 'simple-git';

const git = simpleGit();
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the Git admin page with buttons
app.get('/git-admin', async (req, res) => {
    try {
        // Ensure we fetch the latest remote branches before listing them
        await git.fetch();

        const branchSummary = await git.branch();
        const branches = branchSummary.all; // Array of all branches
        let html = '<h1>Git Branches</h1><ul>';

        // Create an HTML response listing all branches with buttons to checkout
        branches.forEach(branch => {
            html += `
                <li>
                    ${branch} 
                    <button onclick="checkoutBranch('${branch}')">Checkout</button>
                </li>`;
        });
        html += '</ul>';

        // Input box and button for committing
        html += `
        <div>
            <h2>Commit Changes</h2>
            <input type="text" id="commitMessage" placeholder="Enter commit message" />
            <button onclick="commitChanges()">Commit</button>
        </div>`;

        // Push, pull, and fetch all buttons
        html += `
        <div>
            <h2>Git Operations</h2>
            <button onclick="pushChanges()">Push</button>
            <button onclick="pullChanges()">Pull</button>
            <button onclick="fetchAll()">Fetch All</button>
        </div>`;

        // Button to show the Git log
        html += `
        <div>
            <h2>Commit Log</h2>
            <button onclick="showCommitLog()">Show Commit Log</button>
            <pre id="commitLog"></pre>
        </div>`;

        // Add script to handle the button clicks
        html += `
        <script>
            async function checkoutBranch(branch) {
                const response = await fetch('/git-admin/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ branch })
                });
                const result = await response.json();
                alert(result.message);
            }

            async function commitChanges() {
                const commitMessage = document.getElementById('commitMessage').value;
                if (commitMessage.trim() === '') {
                    alert('Commit message cannot be empty');
                    return;
                }
                const response = await fetch('/git-admin/commit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: commitMessage })
                });
                const result = await response.json();
                alert(result.message);
            }

            async function pushChanges() {
                const response = await fetch('/git-admin/push', { method: 'POST' });
                const result = await response.json();
                alert(result.message);
            }

            async function pullChanges() {
                const response = await fetch('/git-admin/pull', { method: 'POST' });
                const result = await response.json();
                alert(result.message);
            }

            async function fetchAll() {
                const response = await fetch('/git-admin/fetch', { method: 'POST' });
                const result = await response.json();
                alert(result.message);
                // Optionally reload the page to reflect the updated branch list
                location.reload();
            }

            async function showCommitLog() {
                const response = await fetch('/git-admin/log');
                const log = await response.text();
                document.getElementById('commitLog').textContent = log;
            }
        </script>`;

        res.send(html); // Send the HTML response
    } catch (err) {
        console.error('Error rendering git admin page:', err);
        res.status(500).send('Error rendering git admin page');
    }
});

// API to checkout a branch (same as before)
app.post('/git-admin/checkout', async (req, res) => {
    const { branch } = req.body;
    try {
        if (branch.startsWith('remotes/origin/')) {
            const localBranch = branch.replace('remotes/origin/', '');
            await git.checkoutBranch(localBranch, branch);
            res.json({ message: `Checked out and created local branch: ${localBranch} from ${branch}` });
        } else {
            await git.checkout(branch);
            res.json({ message: `Checked out branch: ${branch}` });
        }
    } catch (err) {
        console.error('Error checking out branch:', err);
        res.status(500).json({ message: 'Error checking out branch' });
    }
});

// API to commit changes (same as before)
app.post('/git-admin/commit', async (req, res) => {
    const { message } = req.body;
    try {
        await git.add('.');
        await git.commit(message);
        res.json({ message: `Committed with message: "${message}"` });
    } catch (err) {
        console.error('Error committing changes:', err);
        res.status(500).json({ message: 'Error committing changes' });
    }
});

// API to push changes (same as before)
app.post('/git-admin/push', async (req, res) => {
    try {
        await git.push();
        res.json({ message: 'Pushed changes to the remote' });
    } catch (err) {
        console.error('Error pushing changes:', err);
        res.status(500).json({ message: 'Error pushing changes' });
    }
});

// API to pull changes (same as before)
app.post('/git-admin/pull', async (req, res) => {
    try {
        await git.pull();
        res.json({ message: 'Pulled changes from the remote' });
    } catch (err) {
        console.error('Error pulling changes:', err);
        res.status(500).json({ message: 'Error pulling changes' });
    }
});

// API to fetch all changes from all remotes
app.post('/git-admin/fetch', async (req, res) => {
    try {
        await git.fetch('--all');
        res.json({ message: 'Fetched all updates from all remotes' });
    } catch (err) {
        console.error('Error fetching all remotes:', err);
        res.status(500).json({ message: 'Error fetching all remotes' });
    }
});

// API to show the commit log (same as before)
app.get('/git-admin/log', async (req, res) => {
    try {
        const log = await git.log(['--oneline', '--graph', '--decorate', '--all']);
        let logOutput = '';
        log.all.forEach(commit => {
            logOutput += `${commit.hash} ${commit.message}\n`;
        });
        res.send(logOutput);
    } catch (err) {
        console.error('Error fetching commit log:', err);
        res.status(500).send('Error fetching commit log');
    }
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
