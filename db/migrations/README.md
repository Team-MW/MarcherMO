# 🗂️ Migrations PlanetScale

Ce dossier contient les fichiers SQL séparés pour exécuter dans la console PlanetScale **un par un**.

## ⚠️ Problème : "Expected a single statement"

PlanetScale n'accepte qu'**une seule requête SQL à la fois** dans leur console web.

---

## 📋 Instructions : Exécuter dans l'ordre

### Méthode 1 : Console PlanetScale (Recommandé)

1. **Allez sur [PlanetScale](https://planetscale.com/)**
2. **Sélectionnez votre base `marche-mo`**
3. **Cliquez sur l'onglet "Console"**
4. **Exécutez les fichiers dans l'ordre** :

#### ✅ Ordre d'exécution :

```
1️⃣  01_create_clients.sql
    └─ Copiez-collez le contenu → Exécutez

2️⃣  02_create_daily_stats.sql
    └─ Copiez-collez le contenu → Exécutez

3️⃣  03_create_admin_users.sql
    └─ Copiez-collez le contenu → Exécutez

4️⃣  04_insert_default_admin.sql
    └─ Copiez-collez le contenu → Exécutez

5️⃣  05_create_sms_logs.sql
    └─ Copiez-collez le contenu → Exécutez

6️⃣  06_create_view_waiting_queue.sql
    └─ Copiez-collez le contenu → Exécutez

7️⃣  07_create_view_today_stats.sql
    └─ Copiez-collez le contenu → Exécutez
```

---

### Méthode 2 : CLI PlanetScale (Avancé)

```bash
# 1. Installer le CLI
brew install planetscale/tap/pscale

# 2. Se connecter
pscale auth login

# 3. Se connecter à la base
pscale shell marche-mo main

# 4. Exécuter les fichiers un par un
# Copiez-collez le contenu de chaque fichier dans l'ordre
```

---

## ✅ Vérification

Après avoir exécuté tous les fichiers, vérifiez :

```sql
SHOW TABLES;
```

Vous devriez voir :
```
+---------------------+
| Tables_in_marche-mo |
+---------------------+
| admin_users         |
| clients             |
| daily_stats         |
| sms_logs            |
| v_today_stats       |
| v_waiting_queue     |
+---------------------+
```

---

## 🧪 Test Rapide

```sql
-- Vérifier que le compte admin existe
SELECT * FROM admin_users;

-- Devrait retourner :
-- id | username | pin_code | role  | is_active
-- 1  | admin    | 000000   | owner | 1
```

---

## 🆘 En cas d'erreur

### Erreur : "Table already exists"

```sql
-- Supprimer la table et recommencer
DROP TABLE IF EXISTS nom_table;
-- Puis réexécutez le fichier SQL
```

### Erreur : "CHECK constraint failed"

PlanetScale ne supporte pas toujours les contraintes CHECK. Si vous avez cette erreur, utilisez `schema_without_constraints.sql` à la place.

---

## 📁 Contenu des fichiers

| Fichier | Description |
|---------|-------------|
| `01_create_clients.sql` | Table principale (file d'attente) |
| `02_create_daily_stats.sql` | Statistiques quotidiennes |
| `03_create_admin_users.sql` | Comptes administrateurs |
| `04_insert_default_admin.sql` | Compte admin par défaut |
| `05_create_sms_logs.sql` | Logs SMS |
| `06_create_view_waiting_queue.sql` | Vue file d'attente |
| `07_create_view_today_stats.sql` | Vue stats du jour |

---

**Temps estimé : 2-3 minutes** ⏱️

Après l'exécution, retournez au **[QUICKSTART_PLANETSCALE.md](../../QUICKSTART_PLANETSCALE.md)** pour continuer !
