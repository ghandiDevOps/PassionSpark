@echo off
echo === PassionSpark - Push des corrections de bugs ===
echo.

REM Se placer dans le dossier du projet (adapter le chemin si besoin)
cd /d "%~dp0"

echo Verification de la branche...
git branch --show-current
echo.

echo Commit actuel:
git log --oneline -3
echo.

echo Pushing vers GitHub...
git push origin security/hardening-2

if %ERRORLEVEL% == 0 (
    echo.
    echo ✅ Push réussi ! Vercel va déployer automatiquement.
    echo    Surveille : https://vercel.com/ghandidevops-projects/passionspark
) else (
    echo.
    echo ❌ Erreur lors du push. Vérifie ta connexion GitHub.
)

pause
