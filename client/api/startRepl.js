import repl from 'repl';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Change to the root directory before running any Git commands
const projectRoot = path.resolve(__dirname, '../'); // Go one level up from /api

// Change the working directory to the project root
process.chdir(projectRoot);
console.log(`Changed working directory to: ${projectRoot}`);

// List of scripts to watch and load
const scripts = ['./gitSwitch.js'];  // Relative path to the file

// Function to load and expose module exports to the REPL context
const loadFunctions = async (context) => {
    for (const script of scripts) {
        const scriptPath = path.resolve(__dirname, script);
        const fileUrl = pathToFileURL(scriptPath).href;  // Convert to file:// URL
        try {
            // Dynamically import the updated module using the file:// URL
            const moduleExports = await import(fileUrl);

            // Add each exported function to the REPL context
            Object.keys(moduleExports).forEach(fnName => {
                context[fnName] = moduleExports[fnName];
            });

            console.log(`Loaded functions from ${script}`);
        } catch (error) {
            console.error(`Error loading ${script}:`, error);
        }
    }
};

// Start the REPL and get the server instance
const replServer = repl.start({ prompt: '> ' });

// Initially load functions into the REPL context
loadFunctions(replServer.context);

// Watch scripts for changes and reload functions when they change
scripts.forEach(script => {
    const scriptPath = path.resolve(__dirname, script);
    fs.watchFile(scriptPath, (curr, prev) => {
        console.log(`${script} has changed, reloading functions...`);
        loadFunctions(replServer.context);  // Reload functions into REPL context
    });
});
