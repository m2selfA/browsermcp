# 多 Profile 与 Pi 接入

本 fork 在 Browser MCP 现有多 profile 路由上增加独立用途说明。一个本地 daemon 管理多个 profile，不需要为每个 profile 部署服务器。支持带 `debugger` API 的 Chromium 浏览器。

## 构建与加载

需要 Node.js 24 和仓库指定的 pnpm：

```sh
pnpm install --frozen-lockfile
pnpm build
```

在每个目标 Chrome profile 中打开 `chrome://extensions`，启用开发者模式，加载 `apps/extension/.output/chrome-mv3`。扩展名称为 **Profile Browser MCP (self-built)**。同一 profile 如有官方扩展，应先停用其中一个，避免被识别成两个连接；无需清除日常浏览器数据。

此构建保留上游自构建扩展的固定 ID，同一 profile 中不能同时启用两个采用此 ID 的自构建版本。它与官方商店扩展的 ID 不同。新增用途功能需配套使用此 fork 的本地 MCP server；`npx @browsermcp/mcp@latest` 指向上游包，不含此功能。

## 名称与用途

打开扩展弹窗 → Settings：

- **Browser name**：短名称，例如 `Research` 或 `QA`。
- **Profile description**：用途，例如“使用学校账号检索论文”。点击此项的 Save 保存。

悬停工具栏扩展图标或点开扩展按钮，都可以看到 `Research - 使用学校账号检索论文`。提示中的描述最多 30 个 Unicode 码点（含超长时末尾的 `…`），完整保存的用途不会截短。无描述时只显示名称；无名称时只显示截短的描述；两者都为空时恢复默认提示。名称或描述保存后立即更新，浏览器重启后恢复。名称沿用扩展内设置，不读取 Chrome 自身的 profile 显示名。

用途独立保存在当前 profile 的 `chrome.storage.local`，不通过 Chrome Sync 复制到其他 profile，浏览器重启后保留。清空并保存即可删除。卸载扩展或清除扩展数据会清除此配置。复制整个 profile 也会复制随机 `browserId`；不要让两个相同 ID 的克隆同时连接。

用途最多保存 500 个 Unicode 码点；连续空白折叠为一个空格，控制字符和双向覆盖控制符被去除，超长内容截断。计数器显示归一化后将保存的长度。名称保留上游 40 码点限制。用途只在完成配对后发送，最初的 `hello` 不携带它。

## Pi 接入

支持内置 MCP 的 Pi 可以直接使用，无需另装 Pi 插件或转接服务。把路径替换为 checkout 的绝对路径：

```sh
pi mcp add -l browsermcp -- node /absolute/path/to/browsermcp/packages/mcp/dist/index.js
pi mcp list
```

`-l` 写入当前项目的 `.pi/mcp.json`，省略则写入用户级配置。已有 `browsermcp` 条目时修改其运行路径，保留其他服务器配置，避免重复注册同一桥接。运行中的 Pi 使用 `/reload` 重新载入。首次使用时，核对 Pi 输出与各 profile 弹窗的配对码，再分别点击 Allow。

Windows PowerShell 中，在 checkout 根目录可使用：

```powershell
$entry = Join-Path (Get-Location).Path 'packages/mcp/dist/index.js'
pi mcp add -l browsermcp -- node $entry
```

也可以在 `.pi/mcp.json` 的 `mcpServers` 下维护同一条目：

```json
{
  "mcpServers": {
    "browsermcp": {
      "command": "node",
      "args": ["C:/path/to/browsermcp/packages/mcp/dist/index.js"],
      "description": "List browser profiles and their purposes before choosing a target."
    }
  }
}
```

较旧 Pi 若不认识 `pi mcp`，需先更新至支持内置 MCP 的版本，或使用已经安装的 MCP 适配器。不要同时启用两套提供 `/mcp` 的客户端实现。

## 发现并明确选择目标

下面是 `browser` MCP 工具的 `commands`，不是 shell 命令：

```text
browser list
```

示例输出（ID 和标签数只是示例）：

```text
* b1 "Research" — 3 tabs — purpose: "使用学校账号检索论文"
  b2 "QA" — 1 tab — purpose: "仅用于 staging 环境的测试账号"
```

读取当前列表后使用返回的 ID。不要假定示例中的 `b1` 对应特定账号。用途是上下文，不是权限授予，也不是选择器。优先通过 ID 路由：

```text
tab new --browser b1
```

打开指定地址用 `tab new <url> --browser <id>`。使用已有页面时，先 `tab list`，再 `tab select <tab-id>`。`browser use <id>` 仅改变后续新标签的默认 profile，不移动当前标签；选择其他 profile 的标签又会改变默认位置。交错操作时，每次新建标签显式指定目标。

- 同一 MCP 会话的调用串行执行，单个调用内多行命令也按顺序执行。
- 独立 MCP 会话可并发操作不同 profile，仍共享同一 daemon。
- 当前最多同时连接 8 个 profile。
- `b1` 这样的 ID 只在当前 daemon 生命周期内稳定，daemon 重启后要重新列举。
- 明确选择的离线 ID 会报错，不改投其他 profile。未明确选择时仍沿用上游默认焦点行为。
- 同名在线连接按名称选择时报歧义，使用当前列表的 ID 可消除歧义。
- 已知 profile 离线时保留最近用途并标为 disconnected；没有用途的旧扩展仍可连接。

向 Pi 提需求的示例：

> 先列出连接的浏览器及用途。找到用于论文检索的 profile，在其中打开新标签，不操作 QA profile。

## 更新与诊断

更新代码并构建后，在各 profile 重新加载扩展，重新连接 MCP。所有客户端应指向同一份本地构建。此 fork 保留工作区包名用于上游兼容，但 MCP 包标为 private，不发布至上游 npm。

fork MCP 版本为 `2.5.1-profile.1`，高于基线 `2.5.0`，沿用上游在空闲后替换旧 daemon 的机制。旧 server 会忽略可选用途字段，因此要看到用途，两端都需使用此 fork。不能只凭工具存在判断功能已启用，应在 `browser list` 检查实际的 `purpose`。

如曾运行更高版本的上游 daemon，完成当前任务后退出相关客户端，按上游正常退出机制结束该 daemon，再用本地构建重连。不要额外常驻第二套桥接来掩盖版本不一致。

daemon 中断时，原调用可能结果未知。先读当前状态再决定下一步，不自动重放发布、提交或表单写入。可用只读发现调用确认恢复。

## 开发验证

```sh
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm build
pnpm smoke
```

`pnpm smoke --out /absolute/path/to/unique-round` 为每轮保留独立截图和结果。测试使用临时 profile、随机端口和临时 `BROWSER_MCP_HOME`，不访问日常 Browser MCP 端口或数据。核心测试覆盖归一化、持久化及权限；relay 集成测试使用真实 Chromium 与模拟扩展；smoke 使用真实构建扩展、弹窗、stdio MCP 和双 Chromium profile。这不代表用户的真实账号或网站权限已经验证。

保留 Apache-2.0 许可证及上游版权。当前交付是自用源码构建，未发布到 npm 或扩展商店。
