import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

/**
 * Restricted OS Tools for Synthia 3.0
 * All commands are logged and intercepted by the observability layer.
 */
export const osTools = {
    /**
     * Executes a shell command in the project root.
     */
    async executeCommand(command: string) {
        // Simple security filter for YOLO mode
        if (command.includes('rm -rf /') || command.includes(':(){ :|:& };:')) {
            throw new Error("Malicious command blocked by ACIP v1.3");
        }

        try {
            const { stdout, stderr } = await execPromise(command, {
                cwd: process.cwd(),
                timeout: 30000 // 30s timeout
            });

            return {
                stdout: stdout,
                stderr: stderr
            };
        } catch (error: any) {
            return {
                stdout: '',
                stderr: error.message
            };
        }
    },

    /**
     * Writes or modifies a file in the workspace.
     */
    async writeFile(filePath: string, content: string) {
        // Ensure path remains within the project
        const resolvedPath = path.resolve(process.cwd(), filePath);
        if (!resolvedPath.startsWith(process.cwd())) {
            throw new Error("Access Denied: Path is outside of project scope.");
        }

        fs.writeFileSync(resolvedPath, content);
        return { success: true, path: resolvedPath };
    }
};
