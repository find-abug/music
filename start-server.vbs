' 古典音乐网站 — 后台静默启动脚本
' 每次开机自动运行，无窗口、无干扰

Dim WshShell
Set WshShell = CreateObject("WScript.Shell")

' 切换到后端目录并启动 Node.js 服务（窗口隐藏）
WshShell.CurrentDirectory = "C:\Users\ASUS\classical-music\backend"
WshShell.Run "node server.js", 0, False

Set WshShell = Nothing
