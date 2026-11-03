# philippecloutier.net

Site de Philippe Cloutier, courtier immobilier résidentiel affilié à RE/MAX CRYSTAL (Saint-Eustache). Site statique servi par GitHub Pages.

## Inscriptions

Les propriétés viennent de la page courtier RE/MAX Québec :

https://www.remax-quebec.com/fr/courtiers-immobiliers/philippe.cloutier

`scripts/sync-listings.mjs` lit la configuration publique de cette page, interroge l'API inscriptions (`BrokerId` du courtier, y compris le filtre `Sold`), enregistre `data/listings.json`, puis régénère la sélection de l'accueil, `/proprietes/` et une page par inscription. Les photos restent sur le CDN RE/MAX. Chaque fiche renvoie vers l'annonce officielle.

Si la source ne répond pas, ou si elle renvoie une liste vide alors qu'un instantané existe, le script ne touche pas aux fichiers. L'instantané committé continue de s'afficher.

La synchronisation automatique est le workflow `.github/workflows/sync-listings.yml` : deux fois par jour (12 h 30 et 22 h 30 UTC) et au besoin avec « Run workflow ». Aucun secret n'est requis. Le jeton `GITHUB_TOKEN` du dépôt doit pouvoir pousser sur la branche par défaut. Si une protection de branche bloque le compte `github-actions[bot]`, il faut l'autoriser, sinon l'instantané ne se met pas à jour tout seul.

Pour lancer une synchro à la main :

```bash
node scripts/sync-listings.mjs
```

Les pages vendues sont retirées du `sitemap.xml` (et marquées `noindex`). Une inscription qui disparaît de RE/MAX est aussi retirée du dossier `proprietes/` et du sitemap à la synchro suivante. `robots.txt` pointe vers le sitemap. Les adresses inconnues servent `404.html`.

Pour reconstruire le HTML à partir de l'instantané, sans rappel réseau :

```bash
node scripts/sync-listings.mjs --offline
```
