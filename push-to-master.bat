@echo off
echo === PassionSpark - Deploiement vers MASTER (production) ===
echo.

cd /d "C:\Users\ghand\OneDrive\Documents\Claude\Projects\PassionSpark\passionspark"

echo Branche locale:
git branch --show-current
echo.

echo Commits recents:
git log --oneline -3
echo.

echo Pushing security/hardening-2 vers master...
git push origin security/hardening-2:master

if %ERRORLEVEL% == 0 (
    echo.
    echo OK ! Vercel va deployer en production automatiquement.
) else (
    echo.
    echo ERREUR lors du push.
)

pause
