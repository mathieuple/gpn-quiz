# Configuration du classement GPN Quiz

Le classement utilise seulement une identité Supabase anonyme, un pseudo, le meilleur combo et la date du record. Les XP, réponses, notions, cours, réglages et données de progression restent dans le navigateur.

## Mise en service

1. Ouvrir [Supabase](https://supabase.com/dashboard), cliquer **New project**, choisir l’organisation, saisir un nom et un mot de passe de base, puis attendre la création.
2. Dans le projet, cliquer **Connect** pour copier la **Project URL** et la **Publishable key** (`sb_publishable_...`). Pour afficher toutes les clés : **Settings → API Keys**. Ne jamais copier une Secret key ou `service_role`.
3. Ouvrir **Authentication → Sign In / Providers**, activer **Allow anonymous sign-ins**, puis enregistrer.
4. Ouvrir **SQL Editor → New query**. Copier tout le contenu de `supabase/migrations/001_combo_leaderboard.sql`, cliquer **Run**, et vérifier que la requête se termine sans erreur.
5. Dans le repository, ouvrir `js/config/supabase-config.js` et remplacer exactement :
   - `https://YOUR_PROJECT_REF.supabase.co` par la Project URL ;
   - `sb_publishable_YOUR_KEY` par la Publishable key.
6. Committer et pousser ces fichiers vers GitHub.
7. Dans Vercel, ouvrir le projet GPN Quiz → **Deployments**. Le push doit lancer un déploiement. Sinon, ouvrir le dernier déploiement et cliquer **Redeploy**.
8. Ouvrir l’URL Vercel dans une fenêtre privée. Saisir un pseudo : l’application doit s’ouvrir et la ligne doit apparaître dans **Table Editor → leaderboard_entries**.
9. Dans Supabase, ouvrir **Database → Tables → leaderboard_entries → RLS policies**. Vérifier que RLS est activé et que les trois policies `SELECT`, `INSERT`, `UPDATE` de la migration sont présentes.

Les résultats du classement sont dynamiques et ne sont pas ajoutés au cache PWA. Si Supabase est indisponible, le quiz et toute la progression locale continuent de fonctionner. La session anonyme reste liée aux données du navigateur : supprimer les données Safari ou changer d’appareil peut créer une nouvelle identité.

## Test manuel avec deux utilisateurs

1. Navigateur A : choisir `Mathieu`, obtenir un meilleur combo de 10.
2. Navigateur B ou fenêtre privée : choisir `Léa`, obtenir un meilleur combo de 15.
3. Vérifier sur l’accueil : Léa 15 puis Mathieu 10.
4. Faire passer Mathieu à 20 et recharger le classement : Mathieu 20 puis Léa 15.
5. Tester une égalité : le record atteint en premier doit être placé avant.
6. Couper le réseau, battre un record, relancer l’app, puis rétablir le réseau : le record local doit rester visible et se synchroniser ensuite.
7. Recharger chaque navigateur : le pseudo doit être conservé et aucune nouvelle identité ne doit être créée.

## Vérification RLS à deux sessions

Avec deux navigateurs authentifiés anonymement, l’utilisateur A doit pouvoir lire le classement, insérer et modifier sa ligne. Une tentative de mise à jour de la ligne B, de changement de `user_id` ou d’insertion avec l’UUID de B doit être refusée ou ne modifier aucune ligne. Ces contrôles nécessitent un projet Supabase actif ; les tests locaux du repository vérifient seulement la présence des protections SQL.

## Limites assumées

Le combo est calculé dans le navigateur. RLS empêche un joueur de modifier la ligne d’un autre et le SQL empêche la baisse d’un record, mais un utilisateur techniquement compétent peut falsifier son propre score. La modération des pseudos et la récupération d’identité entre appareils ne font pas partie de cette version.
