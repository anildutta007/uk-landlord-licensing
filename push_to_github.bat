@echo off
title Push UK Landlord Licensing Hub to GitHub
cd /d "%~dp0"
echo ========================================================
echo     Pushing uk-landlord-licensing to GitHub
echo ========================================================
echo.
echo Remote target: https://github.com/anildutta007/uk-landlord-licensing.git
echo.

:: Initialize git if not already done
if not exist ".git" (
    echo Initializing local git repository...
    git init -b main
    git remote add origin https://github.com/anildutta007/uk-landlord-licensing.git
)

:: Stage and commit
git add .
git commit -m "feat: complete UK Landlord Licensing & Compliance Hub with 35 conditions and official PDF generator"

:: Push
echo.
echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    echo.
    echo [NOTE] If you haven't created the repository on GitHub yet:
    echo 1. Go to https://github.com/new
    echo 2. Repository name: uk-landlord-licensing
    echo 3. Keep it Public or Private
    echo 4. Leave "Add a README", .gitignore and license UNCHECKED (empty repo)
    echo 5. Click "Create repository"
    echo 6. Run this script again!
) else (
    echo.
    echo ========================================================
    echo  SUCCESS! Repository successfully pushed to GitHub.
    echo  Vercel will automatically build and deploy if linked!
    echo ========================================================
)
pause
