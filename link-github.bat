@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo === H2 Server - Link to GitHub ===
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo Git is not installed.
  echo Install from https://git-scm.com/download/win
  pause
  exit /b 1
)

if not exist ".git" (
  echo Initializing git repo...
  git init -b main
  if errorlevel 1 (
    git init
    git branch -M main
  )
)

echo.
set /p GH_USER=Enter your GitHub username: 
if "%GH_USER%"=="" (
  echo Username is required.
  pause
  exit /b 1
)

set /p REPO_NAME=Enter repo name [h2server]: 
if "%REPO_NAME%"=="" set REPO_NAME=h2server

echo.
echo Staging files...
git add -A

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Initial site for h2server.online"
) else (
  echo No new changes to commit (or nothing staged).
)

git branch -M main

git remote remove origin 2>nul
git remote add origin "https://github.com/%GH_USER%/%REPO_NAME%.git"

echo.
echo Remote set to: https://github.com/%GH_USER%/%REPO_NAME%.git
echo.
echo NEXT STEPS:
echo  1. Create the empty repo on GitHub if it does not exist:
echo     https://github.com/new
echo     Name: %REPO_NAME%  (Public, no README)
echo  2. Then press any key here to push...
echo.
pause

git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. Common fixes:
  echo  - Create the repo on GitHub first (empty, no README)
  echo  - Sign in when Git asks for credentials
  echo  - Or use a Personal Access Token as the password
  echo.
  pause
  exit /b 1
)

echo.
echo SUCCESS. Enable GitHub Pages:
echo  Repo -^> Settings -^> Pages -^> Branch: main / root -^> Save
echo.
echo Site will be at:
echo  https://%GH_USER%.github.io/%REPO_NAME%/
echo  (and later https://h2server.online if DNS is set)
echo.
pause
endlocal
