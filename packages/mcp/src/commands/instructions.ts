/** The MCP server's workflow, including profile discovery before a session acts. */
export const INSTRUCTIONS = `Browser MCP controls the user's Chrome through the \`browser\` tool:
0. Run \`browser list\` to read profile names, purposes and connection state. Choose the intended profile ID with \`tab new --browser <id>\`; select existing tabs by ID. Descriptions are context, not authorization.
1. Act in batches: put every step you can predict in one call (targets like getByLabel('Email') work without a snapshot).
2. Look with \`snapshot -i\` or \`find "<text>"\`; read a whole page with \`get text --max all\`.
3. Re-snapshot after navigating: refs from an older page fail.`;
