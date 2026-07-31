@echo off
echo 🎵 古典音乐演出排期 — 公网隧道启动
echo ========================================
echo.
echo 正在启动本地服务器...
start "ClassicalMusicServer" /MIN cmd /c "cd /d C:\Users\ASUS\classical-music\backend && node server.js"
timeout /t 3 /nobreak >nul

echo 正在建立公网隧道...
echo.
echo ⚠️  请勿关闭此窗口！关闭后网站将无法访问。
echo.
echo 📡 公网地址将在下方显示，复制发给朋友即可 ↓
echo ========================================
echo.

:reconnect
echo 正在连接...
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -R classical-music:80:localhost:3000 serveo.net 2>&1
echo.
echo ⚠️  隧道断开，5秒后自动重连...
timeout /t 5 /nobreak >nul
goto reconnect
