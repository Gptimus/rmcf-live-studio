# Plan d'implémentation de la Refonte Navigation & Template Anniversaire

**Objectif :** Simplifier la navigation via des menus déroulants et ajouter un template "Anniversaire/Légende" haut de gamme.

**Architecture :**

1. Navigation : Regroupement des boutons de tabs dans des conteneurs `.nav-dropdown`.
2. Template : Nouveau workspace `#ws-birthday` avec rendu dynamique (Mode Age vs Mode Dates).

**Stack technique :** HTML5, CSS3 (Vanilla), JavaScript (Vanilla).

---

### Tâche 1 : Mise à jour du CSS pour la Navigation Dropdown

**Fichiers :**

- Modifier : `/Users/guerth/Documents/DEV/rmfc-live-studio/style.css`

**Étape 1 : Ajouter les styles de base pour les dropdowns**

```css
/* Navigation Dropdowns */
.nav-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--panel);
  min-width: 200px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border);
  border-radius: 8px;
  z-index: 1001;
  padding: 8px 0;
}

.nav-dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--off);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: rgba(201, 162, 39, 0.1);
  color: var(--gold);
}

.dropdown-item.active {
  color: var(--gold);
  font-weight: 700;
  background: rgba(201, 162, 39, 0.05);
}

.nav-category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
}

.nav-category-btn:hover {
  color: var(--white);
  background: rgba(255, 255, 255, 0.05);
}
```

**Étape 2 : Vérifier le rendu visuel (manuel)**
Ouvrir le studio et vérifier que les styles sont injectés (sans impact encore sur le HTML).

**Étape 3 : Commiter**

```bash
git add style.css
git commit -m "style(nav): add dropdown navigation base styles"
```

---

### Tâche 2 : Refonte du HTML de la Navigation

**Fichiers :**

- Modifier : `/Users/guerth/Documents/DEV/rmfc-live-studio/index.html:82-150`

**Étape 1 : Remplacer les boutons individuels par des dropdowns**
Regrouper les outils selon le plan de design (MATCH DAY, JOUEURS, ANALYSE, MÉDIA).

**Étape 2 : Mettre à jour la fonction switchTab dans script.js**
S'assurer que `switchTab` gère aussi la classe `.dropdown-item`.

**Étape 3 : Tester la navigation**
Vérifier que le clic sur un item de menu change bien le workspace et l'état actif.

**Étape 4 : Commiter**

```bash
git add index.html script.js
git commit -m "feat(nav): implement categorized dropdown navigation"
```

---

### Tâche 3 : Création du Template Anniversaire (HTML & CSS)

**Fichiers :**

- Modifier : `/Users/guerth/Documents/DEV/rmfc-live-studio/index.html`
- Modifier : `/Users/guerth/Documents/DEV/rmfc-live-studio/style.css`

**Étape 1 : Ajouter les styles CSS pour le template Anniversaire**

```css
#tpl-birthday {
  background: radial-gradient(circle at center, #001f3f 0%, #000 100%);
  overflow: hidden;
}
.birth-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(
    circle,
    rgba(201, 162, 39, 0.2) 0%,
    transparent 70%
  );
  z-index: 1;
}
.birth-big-txt {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: "Bebas Neue";
  font-size: 300px;
  color: rgba(201, 162, 39, 0.15);
  line-height: 0.8;
  z-index: 2;
}
```

**Étape 2 : Ajouter le workspace HTML et le formulaire**
Insérer le bloc `#ws-birthday` avec les champs : Nom, Mode (Anniversaire/Légende), Âge/Dates, Message.

**Étape 3 : Commiter**

```bash
git add index.html style.css
git commit -m "feat(birthday): add birthday template structure and styles"
```

---

### Tâche 4 : Implémentation de la Logique JS pour Anniversaire

**Fichiers :**

- Modifier : `/Users/guerth/Documents/DEV/rmfc-live-studio/script.js`

**Étape 1 : Ajouter la fonction renderBirthday()**
Gérer l'affichage conditionnel (Age vs Dates) et la mise à jour des textes.

**Étape 2 : Ajouter la gestion de l'image joueur pour ce template**
Utiliser `loadPlayerImg` avec les bons IDs.

**Étape 3 : Intégrer dans init()**
Assurer la persistance au rechargement.

**Étape 4 : Tester et Commiter**

```bash
git add script.js
git commit -m "feat(birthday): implement template logic and persistence"
```
