@echo off

echo =========================
echo 1z10 Upload Script
echo =========================

echo.

set /p repo=Enter your GitHub repo URL: 

echo.
echo Initializing git...

git init
git add .
git commit -m "auto upload"

git branch -M main
git remote remove origin 2>nul
git remote add origin %repo%

echo.
echo Pushing to GitHub...

git push -u origin main

echo.
echo =========================
echo DONE!
echo =========================

pause