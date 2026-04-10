▶️ Lancer le BACKEND

Aller dans le dossier backend :
cd backend

Installer les dépendances (premier lancement uniquement) :
npm install

Lancer le serveur :
node index.js

Accéder au backend :

👉 http://localhost:3000

Endpoints disponibles :
  GET  /api/bracelet               → liste des bracelets en alerte
  POST /api/bracelet               → mise à jour depuis la simulation Python
  GET  /api/design-test/bracelets  → données simulées pour le dashboard


▶️ Lancer le FRONTEND --> changer de terminal c'est mieux

Aller dans le dossier Angular :
cd frontend/frontend

Installer les dépendances (premier lancement uniquement) :
npm install

Lancer le serveur Angular :
ng serve

Accéder au frontend :

👉 http://localhost:4200/

Pages disponibles :
  /                    → Tableau de bord supervision
  /design-test         → Dashboard simulation bracelets
  /formulaire-malaise  → Signalement d'un malaise
  /liste-malaise       → Liste des malaises enregistrés


▶️ Lancer la Simulation de Bracelet --> changer de terminal c'est mieux

Aller dans le dossier Algo_sante :
cd Algo_sante

Premier lancement — installer les dépendances Python :
py -m pip install -r requirements.txt

Lancer la simulation :
py python_service.py

Si tout fonctionne bien vous devriez voir les alertes dans la console du node.js

Accéder à la simulation :

👉 http://127.0.0.1:5000
