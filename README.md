# Festara

Plateforme de gestion d'événements et d'invitations digitales pour le Sénégal et la diaspora.

## Comment démarrer le projet en local

### Prérequis
- Node.js installé sur votre machine
- Les variables d'environnement configurées dans un fichier `.env.local` (voir `.env.example`)

### Installation
Pour installer les dépendances du projet, exécutez la commande suivante à la racine du projet :

```bash
npm install
```

### Lancement du serveur de développement
Pour démarrer le projet en mode développement :

```bash
npm run dev
```

Une fois la commande lancée, ouvrez votre navigateur et allez sur [http://localhost:3000](http://localhost:3000) pour voir l'application.

### Autres commandes utiles
- `npm run build` : Construit l'application pour la production.
- `npm run start` : Démarre le serveur de production (après avoir lancé le build).
- `npm run lint` : Vérifie les erreurs de syntaxe et de formatage du code.
