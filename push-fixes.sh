#!/bin/bash
echo "=== PassionSpark - Push des corrections de bugs ==="
echo ""

cd "$(dirname "$0")"

echo "Branche:"
git branch --show-current
echo ""

echo "Commit actuel:"
git log --oneline -3
echo ""

echo "Pushing vers GitHub..."
git push origin security/hardening-2

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push réussi ! Vercel va déployer automatiquement."
    echo "   Surveille : https://vercel.com/ghandidevops-projects/passionspark"
else
    echo ""
    echo "❌ Erreur lors du push. Vérifie ta connexion GitHub."
fi
