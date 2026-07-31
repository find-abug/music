@echo off
chcp 65001 >nul
title 古典音乐演出网站 - 服务器

cd /d "C:\Users\ASUS\classical-music\backend"

echo.
echo   🎵  古典音乐演出排期网站
echo   ════════════════════════
echo.
echo   正在启动服务器...
echo.

node server.js

pause
