# Contributing

Thanks for helping with Profile Browser MCP. Bug reports, fixes and improvements are welcome.

This is a local-use fork of [BrowserMCP/mcp](https://github.com/BrowserMCP/mcp). Build its extension and server together as described in [the profile guide](docs/profiles.md). This fork does not publish the official npm package or Chrome Web Store extension.

## Before you start

- **Bugs**: open an issue with the versions of the locally built server (`node packages/mcp/dist/index.js --version`) and the extension, your browser and operating system, and the steps to reproduce it. For a security problem, follow [SECURITY.md](SECURITY.md) instead.
- **Features and larger changes**: open an issue first so we can agree on the approach. Browser MCP gives AI apps control of someone's own signed-in browser, so changes to what they can reach, to pairing or to the protocol get a careful look, and some won't fit.
- **Upstream builds**: the original project's Chrome Web Store build adds its own popup, analytics and review prompt through `packages/extension-core` hooks. Changes in this fork are not automatically merged or shipped upstream.

## Setting up

You need Node.js 24 or later and pnpm (`corepack enable`).

```sh
pnpm install
pnpm --filter @browsermcp/mcp exec playwright-core install chromium  # once, for the server's tests
pnpm build
```

The [README](README.md) explains how to load the extension and run the server you built, and [AGENTS.md](AGENTS.md) how the packages fit together and the rules each follows (also useful if an AI assistant is helping you).

## Checks

Run these before opening a pull request. They are what CI runs:

```sh
pnpm lint          # Oxlint
pnpm format        # Oxfmt (pnpm format:fix fixes it)
pnpm typecheck
pnpm test
pnpm build
```

After changing browser control, the protocol or the daemon, also run the end-to-end smoke test, which drives a built extension through the server in headless Chromium:

```sh
pnpm smoke
```

It uses random ports and a temporary `BROWSER_MCP_HOME`, so it never touches your own Browser MCP.

## Pull requests

- Keep each one to a single change, with a title that says what it does (`fix: …`, `feat: …`). The title becomes the commit message.
- Add or update tests next to the code (Vitest). Fix bugs with a test that fails without the fix.
- Protocol changes go into both sides at once: the daemon (`packages/mcp/src/relay/`) and `packages/extension-core`. Nothing may send data anywhere on its own: analytics and the like belong in the closed store build, not here.
- Don't import anything but `@browsermcp/*` packages and npm packages, and don't add dependencies without a reason.
- For pull requests submitted to `BrowserMCP/mcp` upstream, a maintainer doesn't merge the pull request on GitHub. Upstream's other builds are made from the same source, so the change is copied there, reviewed and merged, and comes back to this repo as a commit that credits you as a co-author. Your pull request is then closed with a link to that commit.

## License

By contributing, you agree that your contribution is licensed under the [Apache License 2.0](LICENSE), as the rest of the project is, and that the maintainers may also include it in the Chrome Web Store build of Browser MCP. You keep the copyright to what you wrote.
