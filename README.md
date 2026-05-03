# Pescalune

Pescalune est une application web conçue pour gérer les ventes et les clients d'un service de type hôtellerie/restauration. Elle offre des fonctionnalités pour les opérations de point de vente, la gestion des clients, l'historique des commandes et un tableau de bord pour les indicateurs clés de l'activité.

## Fonctionnalités

*   **Point de Vente (POS) :** Créer et gérer les additions clients (commandes) avec une liste de produits catégorisée.
*   **Gestion des Clients :** Ajouter, visualiser, mettre à jour et supprimer les informations des clients.
*   **Historique des Commandes :** Consulter les additions passées avec leurs détails et informations client.
*   **Tableau de Bord :** Vue d'ensemble des métriques clés comme le chiffre d'affaires total, le nombre d'additions et le nombre de clients.
*   **Gestion des Services/Produits :** Ajouter, modifier et supprimer les services/produits proposés, y compris les catégories et les prix.
*   **Gestion des Erreurs de Base :** Amélioration du reporting des erreurs pour les appels API et les problèmes serveur.
*   **Export/Partage PDF :** Possibilité d'exporter et de partager les additions au format PDF.

## Technologies Utilisées

*   **Frontend :**
    *   React
    *   Vite
    *   Tailwind CSS
    *   Lucide React (Icônes)
    *   React Router DOM
    *   `html2canvas` & `jspdf` pour la génération de PDF
*   **Backend :**
    *   Node.js
    *   Express
    *   TypeScript
    *   Better SQLite3 (Base de données)
*   **Base de Données :**
    *   SQLite
*   **Outils de Développement :**
    *   Vite (Outil de build frontend)
    *   Nodemon & ts-node (Serveur de développement backend)

## Configuration et Installation

1.  **Cloner le dépôt :**
    ```bash
    git clone <url-du-dépôt>
    cd pescalune
    ```
2.  **Installer Node.js :** Assurez-vous d'avoir Node.js (v18 ou supérieur recommandé) et npm installés.
3.  **Installer les Dépendances Backend :**
    Naviguez vers le répertoire `server/` et installez les dépendances :
    ```bash
    cd server
    npm install
    cd ..
    ```
4.  **Installer les Dépendances Frontend :**
    Installez les dépendances pour le projet principal :
    ```bash
    npm install
    ```

## Lancement de l'Application

1.  **Démarrer le Serveur Backend :**
    Ouvrez votre terminal, naviguez vers la racine du projet et exécutez :
    ```bash
    npm run dev
    ```
    *(Note : Cette commande suppose que le script `dev` dans `server/package.json` est configuré pour démarrer le serveur. Sinon, vous pourriez avoir besoin d'utiliser `npm run server:dev` depuis la racine ou `npm run dev` depuis le répertoire `server/` après y être entré avec `cd`.)*
    Le serveur devrait démarrer sur `http://localhost:3001`.

2.  **Démarrer le Serveur de Développement Frontend :**
    Ouvrez un autre terminal, naviguez vers la racine du projet et exécutez :
    ```bash
    npm run dev
    ```
    L'application frontend tournera généralement sur `http://localhost:5173` (ou un autre port si le 5173 est déjà utilisé).

## Structure du Projet

```
pescalune/
├── .gitignore
├── index.html
├── package-lock.json
├── package.json           # Dépendances et scripts frontend
├── postcss.config.js
├── tailwind.config.js
├── vite.config.ts         # Configuration de build frontend
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.server.json   # Configuration TypeScript backend
├── vercel.json            # Configuration de déploiement (Vercel)
├── server/                # Application backend
│   ├── src/
│   │   ├── db.ts          # Initialisation de la base de données
│   │   └── index.ts       # Point d'entrée du serveur Express
│   ├── package.json       # Dépendances et scripts backend
│   └── ...
└── src/                   # Application frontend
    ├── App.tsx            # Composant principal de l'application React
    ├── main.tsx           # Point d'entrée frontend
    ├── index.css
    ├── vite-env.d.ts
    ├── api/               # Fonctions du client API
    ├── components/        # Composants UI réutilisables
    ├── layouts/           # Composants de mise en page des pages
    └── pages/             # Composants spécifiques aux pages
```

## Fonctionnalités Futures / En Cours

*   **Graphique du Chiffre d'Affaires :** Une représentation graphique du chiffre d'affaires de l'entreprise au fil du temps sera ajoutée au tableau de bord.
*   **Créneaux de Réservation :** Une fonctionnalité pour gérer les créneaux de réservation ou les rendez-vous sera implémentée. (Détails à clarifier avec l'utilisateur).

## Licence

Ce projet n'est actuellement pas sous licence.
