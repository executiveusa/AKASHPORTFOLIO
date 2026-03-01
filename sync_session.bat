@echo off
SETLOCAL EnableDelayedExpansion

echo [1/3] Cleaning sensitive and temporary files...
:: Remove node_modules and builds if they somehow got staged
git rm -r --cached . >nul 2>&1

echo [2/3] Adding files to staging...
:: Add everything that isn't ignored by .gitignore
git add .

echo [3/3] Committing and Pushing to remote...
:: Generate a timestamped commit message
set timestamp=%date% %time%
git commit -m "Session Sync: %timestamp%"

:: Push to origin main
git push origin main

echo Done. Your session is synced and clean.
pause
