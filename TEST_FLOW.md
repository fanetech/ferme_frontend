# Guide de Test — Farm Management Admin

## Prérequis
- Backend en marche sur `localhost:8081` (branche koumbem)
- Frontend en marche sur `localhost:3000`
- Compte test : téléphone `22670000001`, mot de passe `Admin@1234`

---

## 1. Authentification

**Connexion**
1. Aller sur `http://localhost:3000/dashboard/login/v2`
2. Saisir le téléphone : `22670000001`, mot de passe : `Admin@1234`
3. Vérifier : toast vert "Connexion réussie", redirection vers `/dashboard/default`
4. Vérifier : le menu latéral affiche toutes les sections (Dashboard, Exploitation, Production Végétale, etc.)

**Persistance de session**
5. Rafraîchir la page (F5)
6. Vérifier : reste sur le tableau de bord, PAS de redirection vers login
7. Ouvrir DevTools > Application > Local Storage > chercher `farm_auth_session`
8. Vérifier : contient user, token, permissions, roles, expiresAt

**Déconnexion**
9. Se déconnecter (ou supprimer les cookies manuellement)
10. Vérifier : redirection vers la page de connexion, localStorage vidé

---

## 2. Tableau de bord (`/dashboard/default`)

11. Vérifier : 4 cartes statistiques (Organisations, Fermes, Utilisateurs, Commandes)
12. Vérifier : liste "Fermes récentes" affiche les fermes (ou état vide si aucune)
13. Vérifier : panneau "Accès rapide" avec 7 liens de navigation
14. Cliquer "Fermes" dans accès rapide → navigation vers `/dashboard/farms`

---

## 3. Organisations (`/dashboard/organizations`)

**Liste**
15. Cliquer "Organisations" dans le menu
16. Vérifier : DataTable chargé avec les organisations (ou état vide)
17. Tester la recherche : saisir un nom → la table se filtre

**Création**
18. Cliquer "Nouvelle organisation"
19. Remplir : Code=`ORG-TEST`, Type=Coopérative, Nom=`Test Coop`, Province=`Kadiogo`
20. Soumettre → vérifier toast "Organisation créée avec succès"
21. Vérifier : la nouvelle organisation apparaît dans la table

**Voir / Modifier / Supprimer**
22. Cliquer actions (⋯) → "Voir" → vérifier la modale de détails
23. Cliquer actions → "Modifier" → changer le nom → enregistrer → vérifier toast
24. Cliquer actions → "Supprimer" → confirmer → vérifier la suppression

---

## 4. Fermes (`/dashboard/farms`)

**Liste**
25. Cliquer "Fermes" dans le menu
26. Tester le filtre par statut (Actif/Inactif/Abandonné)
27. Tester le filtre par type (Culture/Élevage/Mixte/Aquaculture)

**Création**
28. Cliquer "Nouvelle ferme"
29. Remplir : Code=`FARM-TEST` (vérifier la conversion automatique en majuscules), Type=Mixte, Nom=`Ferme Test`, Propriétaire=`Jean`, Téléphone=`+22670000002`, Superficie=`10.5`
30. Sélectionner une organisation dans la liste déroulante
31. Sélectionner le type de sol et la source d'eau
32. Soumettre → vérifier toast + apparition dans la table
33. Tester la validation : saisir un code invalide → vérifier que l'erreur du backend s'affiche à côté du champ

**Détail**
34. Cliquer actions → "Statistiques" ou cliquer sur la ligne
35. Vérifier : cartes info (Propriétaire, Caractéristiques)
36. Vérifier : grille de statistiques (parcelles, animaux, employés, inventaire, etc.)

---

## 5. Utilisateurs (`/dashboard/users`)

**Liste**
37. Cliquer "Utilisateurs" dans le menu
38. Vérifier : table avec colonnes (Code, Nom, Téléphone, Email, Statut)
39. Tester le filtre par statut

**Création**
40. Cliquer "Nouvel utilisateur"
41. Remplir : Code=`USR-TEST`, Prénom=`Test`, Nom=`Utilisateur`, Téléphone=`+22670000003`, Mot de passe=`Test@1234`
42. Soumettre → vérifier toast

**Gestion du statut**
43. Cliquer actions → "Désactiver" → vérifier que le statut passe à Inactif
44. Cliquer actions → "Activer" → vérifier le retour à Actif

**Détail**
45. Cliquer actions → "Voir" → vérifier la modale de détails
46. Cliquer sur la ligne utilisateur → vérifier la page détail avec cartes info + boutons de statut

---

## 6. Rôles (`/dashboard/roles`)

**Liste**
47. Cliquer "Rôles" dans le menu
48. Vérifier : table des rôles avec nombre de permissions
49. Vérifier : les rôles système ont le badge "Système" et pas de modification/suppression

**Création**
50. Cliquer "Nouveau rôle"
51. Remplir : Code=`TEST_ROLE` (vérifier le format A-Z0-9_), Nom=`Rôle Test`, Niveau=5
52. Soumettre → vérifier toast

**Attribution des permissions**
53. Cliquer actions → "Voir les permissions" → navigation vers la page détail
54. Vérifier : permissions actuelles affichées en badges
55. Descendre vers "Ajouter des permissions"
56. Cocher plusieurs permissions → cliquer "Ajouter (N)" → vérifier toast

---

## 7. Permissions (`/dashboard/permissions`)

57. Cliquer "Permissions" dans le menu
58. Vérifier : permissions regroupées par module (FARMS, USERS, CROPS, etc.)
59. Tester la recherche : saisir "FARM" → seul le module FARMS s'affiche
60. Vérifier : chaque permission affiche code + nom

---

## 8. Cultures (`/dashboard/crops`)

61. Cliquer "Parcelles & Cultures" dans le menu
62. Sélectionner une ferme dans la liste déroulante
63. Vérifier : 2 onglets (Parcelles, Cultures)

**Parcelles**
64. Cliquer "Nouvelle parcelle"
65. Remplir : Code=`PARC-01`, Nom=`Parcelle Nord`, Superficie=`2.5`, Irrigation=Pluviale
66. Soumettre → vérifier l'apparition de la carte
67. Cliquer "Détails" sur la parcelle → vérifier la page détail

**Cultures**
68. Sur la carte parcelle, cliquer le bouton "Culture"
69. Sélectionner type de culture, année, saison → soumettre
70. Basculer vers l'onglet "Cultures" → vérifier la culture dans la table
71. Cliquer sur une culture → vérifier la page détail avec dates, chronologie, activités

---

## 9. Élevage (`/dashboard/livestock`)

72. Cliquer "Animaux" dans le menu
73. Sélectionner une ferme
74. Tester le filtre par statut (Tous/Actifs/Malades/Vendus)

**Création**
75. Cliquer "Nouvel animal"
76. Sélectionner type d'animal, genre=Mâle, tag=`TAG-001`, poids=45
77. Soumettre → vérifier l'apparition de la carte avec infos santé/poids

**Détail**
78. Cliquer sur la carte animal → vérifier la page détail
79. Vérifier : 3 cartes info (Identité, Santé, Acquisition)
80. Vérifier : 2 onglets (Soins vétérinaires, Production)

---

## 10. Inventaire (`/dashboard/inventory`)

81. Cliquer "Inventaire" dans le menu
82. Sélectionner une ferme
83. Tester le filtre par catégorie (Semence/Engrais/Pesticide/etc.)

**Créer un article**
84. Cliquer "Nouvel article"
85. Remplir : Code=`INV-01`, Catégorie=Engrais, Nom=`NPK 15-15-15`, Unité=`kg`, Stock=100, Minimum=20, Prix=500
86. Activer "Périssable"
87. Soumettre → vérifier l'article dans la table avec statut "OK"

**Détail + Mouvement**
88. Cliquer sur la ligne article → vérifier la page détail avec cartes stock/valeur/détails
89. Cliquer "Mouvement" → sélectionner Type=Achat, Quantité=50, Prix=500
90. Soumettre → vérifier le mouvement dans l'historique avec flèche verte ↑
91. Vérifier : stock mis à jour

**Alerte stock bas**
92. Si un article a un stock sous le minimum → vérifier la bannière rouge d'alerte en haut

---

## 11. Ressources Humaines (`/dashboard/hr`)

93. Cliquer "Employés" dans le menu
94. Sélectionner une ferme

**Employés**
95. Cliquer le bouton "Employé"
96. Remplir : Code=`EMP-01`, Prénom, Nom, Contrat=Permanent, Salaire=75000
97. Soumettre → vérifier dans la table

**Tâches**
98. Cliquer le bouton "Tâche"
99. Remplir : Titre=`Arroser la parcelle`, Priorité=Haute, assigner à un employé, date limite
100. Soumettre → basculer vers l'onglet "Tâches" → vérifier la tâche listée

**Détail employé**
101. Cliquer sur la ligne employé → vérifier le détail avec 3 cartes info
102. Vérifier : onglet Tâches affiche les tâches assignées
103. Vérifier : onglet Présences (vide au début)

**Alerte tâches en retard**
104. Si une tâche est en retard → vérifier la bannière rouge d'alerte en haut de la page RH

---

## 12. Marché (`/dashboard/marketplace`)

105. Cliquer "Produits" dans le menu
106. Sélectionner une ferme

**Client**
107. Cliquer "Client" → remplir : Code=`CLI-01`, Type=Particulier, Nom, Téléphone → soumettre

**Produit**
108. Cliquer "Produit" → remplir : Code=`PROD-01`, Type=Culture, Nom=`Maïs`, Unité=`kg`, Prix=250, Quantité=500 → soumettre
109. Vérifier : carte produit avec prix et disponibilité

**Commande**
110. Cliquer "Commande" → sélectionner un client, ajouter une ligne produit (sélectionner produit, quantité=100)
111. Cliquer "Ajouter" pour ajouter une deuxième ligne produit
112. Définir la date de livraison → soumettre
113. Vérifier : commande dans la table avec statut "En attente"

**Détail commande**
114. Cliquer sur la ligne commande → vérifier la page détail
115. Vérifier : table des lignes de commande avec produit/quantité/prix/total
116. Vérifier : résumé des montants (brut/remise/taxe/net)
117. Cliquer le bouton "Confirmé" → vérifier que le statut avance
118. Cliquer "Marquer payé" → vérifier que le statut de paiement passe à "Payé"

---

## 13. Finance (`/dashboard/finance`)

119. Cliquer "Revenus & Finances" dans le menu
120. Sélectionner une ferme
121. Vérifier : 4 cartes résumé (Revenus, Dépenses, En attente de paiement, Commandes payées)
122. Vérifier : section bilan mensuel (si des données existent)
123. Vérifier : table des dernières commandes

---

## 14. Capteurs IoT (`/dashboard/iot`)

124. Cliquer "Capteurs IoT" dans le menu
125. Sélectionner une ferme → vérifier la table des capteurs (ou état vide)

**Création**
126. Cliquer "Nouveau capteur"
127. Remplir : Code=`SENS-01`, Type=Température, Nom=`Serre A`, Unité=`°C`, Intervalle=15min
128. Soumettre → vérifier dans la table

**Détail**
129. Cliquer actions → "Voir les lectures" → vérifier la page détail
130. Vérifier : carte info + carte statistiques (si des lectures existent)
131. Vérifier : table des lectures avec indicateurs d'anomalie

---

## 15. Notifications (`/dashboard/notifications`)

132. Cliquer "Notifications" dans le menu
133. Vérifier : barre de statistiques (Total, Non lues, Envoyées, Échouées, 24h, 7j)
134. Tester les badges de filtre par type (Alerte/Avertissement/Info/etc.)

**Envoi**
135. Cliquer "Envoyer" → remplir : Type=Info, Priorité=Moyenne, Sujet, Message → soumettre
136. Vérifier : la notification apparaît dans la liste

**Marquer comme lu**
137. Cliquer sur une notification non lue → vérifier que le point bleu disparaît
138. Cliquer "Tout marquer lu" → vérifier que tout est lu

**Règles d'alerte**
139. Basculer vers l'onglet "Règles d'alerte"
140. Sélectionner une ferme → vérifier la liste des règles (ou état vide)
141. Activer/désactiver une règle → vérifier le changement de l'interrupteur

---

## 16. Météo (`/dashboard/weather`)

142. Cliquer "Météo" dans le menu
143. Sélectionner une ferme
144. Vérifier : bannière de condition météo actuelle (si données disponibles)
145. Vérifier : 5 cartes météo (Température, Humidité, Vent, Précipitations, Pression)
146. Vérifier : alerte d'anomalies (si présentes)
147. Basculer vers l'onglet "Prévisions" → vérifier les cartes de prévision
148. Basculer vers l'onglet "Historique" → vérifier la table historique

---

## 17. Paramètres (`/dashboard/settings`)

**Page d'accueil**
149. Cliquer "Paramètres" dans le menu
150. Vérifier : carte résumé utilisateur avec initiales, nom, rôles, nombre de permissions
151. Vérifier : 4 cartes de navigation

**Profil**
152. Cliquer "Profil" → vérifier les infos personnelles + affichage rôles/permissions

**Changement de mot de passe**
153. Cliquer "Changer le mot de passe"
154. Saisir un ancien mot de passe incorrect → soumettre → vérifier l'erreur
155. Saisir correctement → soumettre → vérifier toast "Mot de passe modifié"

**Code PIN**
156. Cliquer "Code PIN" → "Définir un PIN"
157. Saisir mot de passe + code PIN à 4 chiffres → soumettre → vérifier toast

---

## 18. Navigation et Permissions

158. Vérifier : les sections du menu s'affichent/masquent selon les permissions de l'utilisateur
159. Vérifier : les boutons de création sont masqués si l'utilisateur n'a pas les droits
160. Vérifier : cliquer sur un lien du menu navigue correctement
161. Vérifier : les flèches retour fonctionnent sur toutes les pages de détail

---

## 19. Gestion des Erreurs

**Expiration du token**
162. Attendre l'expiration du token (ou supprimer manuellement le cookie)
163. Vérifier : le prochain appel API déclenche la déconnexion + redirection vers login + toast "Session expirée"

**Erreurs API**
164. Essayer de créer une ferme avec un code en doublon
165. Vérifier : le message d'erreur du backend s'affiche à côté du champ concerné

**États vides**
166. Sélectionner une ferme sans données dans chaque module
167. Vérifier : chaque module affiche un état vide approprié (icône + message)

---

## 20. Responsive

168. Réduire la largeur du navigateur en mode mobile
169. Vérifier : le menu latéral se réduit en mode icône
170. Vérifier : les tables défilent horizontalement
171. Vérifier : les modales de formulaire sont défilables sur petits écrans
