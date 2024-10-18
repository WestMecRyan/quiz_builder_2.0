import simpleGit from 'simple-git';
const git = simpleGit();

// Define various Git commands that you want to expose in the REPL
export const gitCommands = {
    // Check the status of the current repository
    status: async () => {
        try {
            const status = await git.status();
            console.log(status);
        } catch (err) {
            console.error('Error checking git status:', err);
        }
    },

    // Checkout a branch
    checkout: async (branch) => {
        try {
            await git.checkout(branch);
            console.log(`Checked out branch ${branch}`);
        } catch (err) {
            console.error(`Error checking out branch ${branch}:`, err);
        }
    },

    // Pull latest changes from a remote branch
    pull: async (remote = 'origin', branch = 'main') => {
        try {
            await git.pull(remote, branch);
            console.log(`Pulled from ${remote}/${branch}`);
        } catch (err) {
            console.error(`Error pulling from ${remote}/${branch}:`, err);
        }
    },

    // List branches
    branch: async () => {
        try {
            const branches = await git.branch();
            console.log(branches);
        } catch (err) {
            console.error('Error listing branches:', err);
        }
    },

    // Add a file to staging
    add: async (file) => {
        try {
            await git.add(file);
            console.log(`Added file ${file}`);
        } catch (err) {
            console.error(`Error adding file ${file}:`, err);
        }
    },

    // Commit with a message
    commit: async (message) => {
        try {
            const result = await git.commit(message);
            console.log(`Committed with message: ${message}`);
            console.log(result);
        } catch (err) {
            console.error('Error committing changes:', err);
        }
    },

    // Push changes to the remote
    push: async () => {
        try {
            await git.push();
            console.log('Pushed changes');
        } catch (err) {
            console.error('Error pushing changes:', err);
        }
    },

    // Initialize a new Git repository
    init: async () => {
        try {
            await git.init();
            console.log('Initialized a new Git repository');
        } catch (err) {
            console.error('Error initializing repository:', err);
        }
    }
};

