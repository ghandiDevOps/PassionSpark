@echo off
cd /d "C:\Users\ghand\OneDrive\Documents\Claude\Projects\PassionSpark\passionspark"

echo === Suppression des lock files ===
del /f /q ".git\index.lock" 2>nul
del /f /q ".git\HEAD.lock" 2>nul
del /f /q ".git\refs\heads\security\hardening-2.lock" 2>nul

echo === Git add ===
git add src/app/(coach)/sessions/[id]/page.tsx
git add src/hooks/use-session-form.ts
git add "src/app/(coach)/dashboard/page.tsx"
git add src/components/coach/stripe-connect-button.tsx

echo === Git commit ===
git commit -m "feat(coach): Stripe activation flow — banner + redirect + dashboard cache fix"

echo === Git push vers master ===
git push origin security/hardening-2:master

if %ERRORLEVEL% == 0 (
    echo.
    echo === SUCCES ! Vercel va deployer automatiquement. ===
) else (
    echo.
    echo === ERREUR lors du push. ===
)
pause
