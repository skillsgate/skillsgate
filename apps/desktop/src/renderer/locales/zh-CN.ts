/**
 * Simplified Chinese dictionary.
 *
 * Keys are the English source strings, so adding an entry means copying the
 * literal UI text as the key. Anything not listed here falls back to English —
 * brand and agent names (SkillsGate, Cursor, GitHub Copilot, Droid CLI, ...)
 * are deliberately left out so they render untranslated.
 */

export const zhCN: Record<string, string> = {
  // Navigation and tabs
  Installed: "已安装",
  Discover: "发现",
  Favorites: "收藏",
  Servers: "服务器",
  Settings: "设置",
  Library: "技能库",
  "Local Library": "本地技能库",
  "All Skills": "全部技能",
  "Remote Servers": "远程服务器",
  Collections: "合集",
  Collection: "合集",
  Tools: "工具",
  Targets: "安装目标",
  About: "关于",
  Privacy: "隐私",
  Telemetry: "遥测",
  Updates: "更新",
  Update: "更新",
  Theme: "主题",
  GitHub: "GitHub",

  // Common actions
  Add: "添加",
  Cancel: "取消",
  Create: "新建",
  Delete: "删除",
  Done: "完成",
  Edit: "编辑",
  Install: "安装",
  Later: "稍后",
  Preview: "预览",
  Remove: "移除",
  Saved: "已保存",
  Search: "搜索",
  View: "查看",
  Browse: "浏览",
  Dismiss: "关闭",
  "Add Root": "添加根目录",
  "Add Server": "添加服务器",
  "New Skill": "新建技能",
  "Remove all": "全部移除",
  "Remove from all": "从所有目标移除",
  "Remove selected": "移除所选",
  "Remove skill": "移除技能",
  "Delete server": "删除服务器",
  "Delete collection": "删除合集",
  "Rename collection": "重命名合集",
  "Create collection": "新建合集",
  "Edit server": "编辑服务器",
  "Manage this server": "管理此服务器",
  "Test connection": "测试连接",
  "Show in Finder": "在访达中显示",
  "Clear filters": "清除筛选",
  "Browse skills": "浏览技能",
  "Add your first server": "添加第一台服务器",
  "Back to Servers": "返回服务器列表",

  // Sync and push
  "Push to remote": "推送到远程",
  "Mirror to remote": "镜像到远程",
  "Refresh from remote": "从远程刷新",
  "Mirror installs to additional targets": "把安装镜像到其他目标",
  "Sync Rules": "同步规则",
  "Pull the latest list of skills on this server.": "拉取此服务器上最新的技能列表。",
  "Try syncing the server to discover skills.": "试试同步该服务器来发现技能。",

  // Loading states
  "Installing...": "安装中…",
  "Loading catalog...": "正在加载目录…",
  "Loading content...": "正在加载内容…",
  "Loading popular skills...": "正在加载热门技能…",
  "Loading servers...": "正在加载服务器…",
  "Loading skills...": "正在加载技能…",
  "Loading view...": "正在加载视图…",
  "Scanning for installed skills...": "正在扫描已安装的技能…",
  "Downloading update": "正在下载更新",
  "Restart & Update": "重启并更新",
  "Restart to install": "重启以完成安装",

  // Empty states
  "No collections yet.": "还没有合集。",
  "No custom scan paths configured.": "尚未配置自定义扫描路径。",
  "No favorites yet.": "还没有收藏。",
  "No more results": "没有更多结果",
  "No servers configured.": "尚未配置服务器。",
  "No skills found on this server.": "此服务器上没有找到技能。",
  "No skills installed yet.": "还没有安装任何技能。",
  "No skills match your search.": "没有技能匹配你的搜索。",
  "None configured": "未配置",
  "None yet": "暂无",
  "Head to Discover to find skills.": "去「发现」页找技能。",
  "Click the star on any skill to save it here.": "点击技能上的星标即可收藏到这里。",
  "Select a skill to view details": "选择一个技能查看详情",
  "Skill content not available.": "技能内容不可用。",
  "Skill content not available. This skill may not have a SKILL.md file.":
    "技能内容不可用。该技能可能没有 SKILL.md 文件。",
  "Skill content not cached. Sync the server to fetch content.":
    "技能内容未缓存。同步该服务器以获取内容。",

  // Forms and fields
  Host: "主机",
  Port: "端口",
  Username: "用户名",
  Label: "标签",
  Installation: "安装",
  "Install method": "安装方式",
  "Install targets": "安装目标",
  "Default Targets": "默认目标",
  "Default scope": "默认范围",
  "Search preference": "搜索偏好",
  "Skill name": "技能名称",
  "Short description": "简短描述",
  "Collection name": "合集名称",
  "SSH Key Path": "SSH 私钥路径",
  "Skills Base Path": "技能根路径",
  "Scan Paths": "扫描路径",
  "Scan Sources": "扫描来源",
  "Custom Roots": "自定义根目录",
  "Custom scan directories": "自定义扫描目录",
  "Supporting Files": "附属文件",
  "Current Coverage": "当前覆盖范围",
  "Desktop app updates": "桌面应用更新",
  "Official only": "仅官方",
  Official: "官方",
  "Search skills...": "搜索技能…",
  "Search by name or keyword... (Enter to search)": "按名称或关键词搜索…（回车搜索）",
  "Auto-discover (id_ed25519, id_rsa, ...)": "自动探测（id_ed25519、id_rsa 等）",

  // Descriptions and help text
  "Manage AI agent skills from your desktop.": "在桌面端统一管理 AI agent 技能。",
  "Configure your SkillsGate Desktop preferences.": "配置 SkillsGate 桌面端偏好设置。",
  "Configure an SSH connection to discover remote skills.": "配置 SSH 连接以发现远程技能。",
  "Connect to remote machines via SSH to discover and sync skills.":
    "通过 SSH 连接远程机器，发现并同步技能。",
  "Add a server to discover skills from remote machines.": "添加服务器，从远程机器发现技能。",
  "Add and remove folders to include in local skill discovery.":
    "增删纳入本地技能发现的文件夹。",
  "Bring Your Own Skill Folders": "接入你自己的技能目录",
  "Create a local skill and install it into one or more targets.":
    "新建一个本地技能，并安装到一个或多个目标。",
  "Global installs still scanned automatically": "全局安装仍会自动扫描",
  "Project-local paths discovered under each root": "在每个根目录下发现的项目级路径",
  "Skill by a verified organization": "由已验证组织发布的技能",

  // My Tools (curated agent visibility)
  "My Tools": "我的工具",
  "Add tool": "添加工具",
  "Add tools": "添加工具",
  "Hide tool": "隐藏工具",
  "All tools added": "所有工具都已添加",
  "Manage tools...": "管理工具…",
  "All my tools": "我的全部工具",
  "Reset to detected": "重置为已检测",
  "Select all": "全选",
  "No tools selected": "未选择任何工具",
  "No tools selected.": "未选择任何工具。",
  "Hidden tool — enable in Settings": "已隐藏的工具 — 可在设置中启用",
  "Showing the {n} tools you use.": "仅显示你在用的 {n} 个工具。",
  Adjust: "调整",
  detected: "已检测",
  "tool selected": "个工具已选择",
  "tools selected": "个工具已选择",
  "These are the tools SkillsGate shows and installs to. Scanning always covers every detected tool.":
    "SkillsGate 只会显示这些工具并向其安装技能。扫描始终覆盖所有已检测到的工具。",
  "Shared store at ~/.agents/skills. Every skill lives here. Enable only if your agent reads this directory directly.":
    "位于 ~/.agents/skills 的共享存储，所有技能都保存在这里。仅当你的 agent 直接读取该目录时才需要启用。",

  // Layout
  "Resize tools pane": "调整工具面板宽度",
  "Resize library pane": "调整技能库面板宽度",

  // Language
  Language: "语言",
  "Display language": "界面语言",
  "Applies immediately. Untranslated text stays in English.":
    "立即生效。未翻译的文本将显示英文。",

  // Status messages
  "Save failed": "保存失败",
}
