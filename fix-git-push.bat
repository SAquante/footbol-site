@echo off
echo ================================================
echo Fixing Git repository - removing large files
echo ================================================
echo.

echo Step 1: Removing node_modules from Git index...
git rm -r --cached node_modules
if %errorlevel% neq 0 (
    echo Warning: node_modules may not be in repository
)

echo.
echo Step 2: Removing .next from Git index...
git rm -r --cached .next
if %errorlevel% neq 0 (
    echo Warning: .next may not be in repository
)

echo.
echo Step 3: Adding .gitignore...
git add .gitignore

echo.
echo Step 4: Committing changes...
git commit -m "🔧 Fix: Remove node_modules and build files from repository"

echo.
echo Step 5: Pushing to GitHub...
git push origin main

echo.
echo ================================================
echo Done! Check the output above for any errors.
echo ================================================
pause
