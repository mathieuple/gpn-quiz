# Vérification de la V1 — 9 septembre 2026

## Tests exécutés

`node --test tests/*.test.js` : **17 tests réussis, 0 échec**. La vérification PWA a été relancée après l'isolation des caches par sous-chemin : réussite. Contrôle de syntaxe de tous les modules JavaScript : réussite.

La banque chargée contient 150 notions valides ; 41 références de distracteurs absents sont signalées en avertissement, conformément au comportement prévu. Le fichier importé est une copie de la banque JavaScript fournie.

## Parcours réellement vérifiés dans le navigateur

- Ouverture de l'accueil et démarrage de session ; aucune erreur JavaScript bloquante observée dans les journaux.
- QCM de 5 questions jusqu'au résultat : exact, +10 XP, révélation des réponses et révision des erreurs.
- Saisie de 5 questions jusqu'au résultat ; `FAUNE` validé avec Entrée et +15 XP.
- Session mixte jusqu'au résultat ; `stenoxibionte` accepté comme presque, orthographe corrigée, +10 XP.
- Examen de 20 questions terminé : pas de correction immédiate ni indice/XP/combo affiché ; bilan avec 10 QCM et 10 saisies.
- Survie terminée après trois « Je ne sais pas » ; écran de fin et reprise disponibles.
- Recherche `stenoxybionte` sans accent : une fiche trouvée, détail consultable et révision ciblée lancée.
- Thème clair conservé après rechargement ; XP et notions vues également conservés.
- Rendu à 320 px ; correction du débordement des raccourcis de durée. Bouton principal et navigation accessibles. Thème sombre observé au premier lancement automatique.
- Application ouverte sous `/gpn-quiz/` avec chemins relatifs fonctionnels.
- Serveur local réellement arrêté, page rechargée puis nouvelle session lancée : application fonctionnelle grâce au cache. Serveur redémarré ensuite.

## Couverture automatisée complémentaire

Toutes les variantes officielles ; chaque autre terme connu face à chaque réponse attendue ; 3 000 QCM ; maîtrise bornée ; données corrompues ; défauts et import ; formats et quotas d'examen ; score différé ; vies, indice et combo ; répétition différée ; arrêt infini. Le test PWA simule install/activate/fetch hors ligne, vérifie tous les imports, les ressources et les tailles d'icônes PNG.

## Limites de cette vérification

- Installation native sur téléphone physique (iOS/Android) non réalisée. Manifest, icônes, cache et fonctionnement hors ligne sont vérifiés ; l'interface d'installation dépend du navigateur.
- Aucune publication GitHub Pages effectuée. Le sous-chemin est testé localement.
- Import/export validés côté logique ; pas d'aller-retour par sélecteur de fichier dans le navigateur.
- Pas d'audit exhaustif de lecteur d'écran, de clavier virtuel sur téléphone réel ou de tous les navigateurs.
- La plausibilité pédagogique des distracteurs dépend de la banque officielle ; les termes absents ne sont pas inventés.
