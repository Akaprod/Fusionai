#!/usr/bin/env python3
import json

def update_messages(path, admin):
    with open(path, 'r', encoding='utf-8') as f:
        d = json.load(f)
    d['Admin'] = admin
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    print(f"{path} updated")

# === FRENCH ===
fr_admin = {
    "metaTitle": "Administration — Fusionia",
    "metaDesc": "Dashboard administrateur protégé.",
    "adminBadge": "Admin",
    "title": "Panneau d'administration",
    "subtitle": "Gestion des utilisateurs, crédits et configuration du site.",
    "tabStats": "Statistiques",
    "tabUsers": "Utilisateurs",
    "tabSettings": "Configuration",
    "kpiUsers": "Utilisateurs",
    "kpiMerges": "Fusions",
    "kpiCredits": "Crédits achetés",
    "kpiRevenue": "Revenus estimés",
    "active": "actifs",
    "admins": "admins",
    "recent": "récents",
    "spent": "dépensés",
    "transactions": "transactions",
    "credits": "crédits",
    "recentUsers": "Inscriptions récentes",
    "recentMerges": "Fusions récentes",
    "searchPlaceholder": "Rechercher par email ou nom…",
    "search": "Rechercher",
    "usersFound": "utilisateurs trouvés",
    "colUser": "Utilisateur",
    "colPlan": "Plan",
    "colCredits": "Crédits",
    "colActivity": "Activité",
    "colStatus": "Statut",
    "colActions": "Actions",
    "merges": "fusions",
    "txns": "transactions",
    "suspended": "Suspendu",
    "active": "Actif",
    "demoteUser": "Rétrograder en utilisateur",
    "promoteAdmin": "Promouvoir admin",
    "suspend": "Suspendre",
    "unsuspend": "Réactiver",
    "setCredits": "Modifier les crédits",
    "setCreditsPrompt": "Nouveau solde de crédits (actuel : {current}) :",
    "invalidNumber": "Nombre invalide.",
    "page": "Page",
    "settingsHint": "Modifie les valeurs ci-dessous. Elles remplacent les valeurs par défaut du code.",
    "save": "Enregistrer",
    "settingsSaved": "Configuration enregistrée.",
    "loadError": "Erreur de chargement.",
    "actionError": "Action échouée.",
    "category": {
        "general": "Général",
        "credits": "Crédits",
        "pricing": "Tarification",
        "merge": "Fusion",
        "stats": "Statistiques affichées"
    },
    "actionSuccess": {
        "suspend": "Utilisateur suspendu.",
        "unsuspend": "Utilisateur réactivé.",
        "setAdmin": "Utilisateur promu admin.",
        "setUser": "Utilisateur rétrogradé.",
        "setCredits": "Crédits mis à jour."
    }
}
update_messages("/home/z/my-project/src/messages/fr.json", fr_admin)

# === ENGLISH ===
en_admin = {
    "metaTitle": "Administration — Fusionia",
    "metaDesc": "Protected admin dashboard.",
    "adminBadge": "Admin",
    "title": "Admin panel",
    "subtitle": "Manage users, credits, and site configuration.",
    "tabStats": "Stats",
    "tabUsers": "Users",
    "tabSettings": "Settings",
    "kpiUsers": "Users",
    "kpiMerges": "Merges",
    "kpiCredits": "Credits bought",
    "kpiRevenue": "Estimated revenue",
    "active": "active",
    "admins": "admins",
    "recent": "recent",
    "spent": "spent",
    "transactions": "transactions",
    "credits": "credits",
    "recentUsers": "Recent signups",
    "recentMerges": "Recent merges",
    "searchPlaceholder": "Search by email or name…",
    "search": "Search",
    "usersFound": "users found",
    "colUser": "User",
    "colPlan": "Plan",
    "colCredits": "Credits",
    "colActivity": "Activity",
    "colStatus": "Status",
    "colActions": "Actions",
    "merges": "merges",
    "txns": "transactions",
    "suspended": "Suspended",
    "active": "Active",
    "demoteUser": "Demote to user",
    "promoteAdmin": "Promote to admin",
    "suspend": "Suspend",
    "unsuspend": "Reactivate",
    "setCredits": "Edit credits",
    "setCreditsPrompt": "New credit balance (current: {current}):",
    "invalidNumber": "Invalid number.",
    "page": "Page",
    "settingsHint": "Edit values below. They override code defaults.",
    "save": "Save",
    "settingsSaved": "Settings saved.",
    "loadError": "Load failed.",
    "actionError": "Action failed.",
    "category": {
        "general": "General",
        "credits": "Credits",
        "pricing": "Pricing",
        "merge": "Merge",
        "stats": "Display stats"
    },
    "actionSuccess": {
        "suspend": "User suspended.",
        "unsuspend": "User reactivated.",
        "setAdmin": "User promoted to admin.",
        "setUser": "User demoted.",
        "setCredits": "Credits updated."
    }
}
update_messages("/home/z/my-project/src/messages/en.json", en_admin)

# === SPANISH ===
es_admin = {
    "metaTitle": "Administración — Fusionia",
    "metaDesc": "Panel de administración protegido.",
    "adminBadge": "Admin",
    "title": "Panel de administración",
    "subtitle": "Gestiona usuarios, créditos y configuración del sitio.",
    "tabStats": "Estadísticas",
    "tabUsers": "Usuarios",
    "tabSettings": "Configuración",
    "kpiUsers": "Usuarios",
    "kpiMerges": "Fusiones",
    "kpiCredits": "Créditos comprados",
    "kpiRevenue": "Ingresos estimados",
    "active": "activos",
    "admins": "admins",
    "recent": "recientes",
    "spent": "gastados",
    "transactions": "transacciones",
    "credits": "créditos",
    "recentUsers": "Registros recientes",
    "recentMerges": "Fusiones recientes",
    "searchPlaceholder": "Buscar por email o nombre…",
    "search": "Buscar",
    "usersFound": "usuarios encontrados",
    "colUser": "Usuario",
    "colPlan": "Plan",
    "colCredits": "Créditos",
    "colActivity": "Actividad",
    "colStatus": "Estado",
    "colActions": "Acciones",
    "merges": "fusiones",
    "txns": "transacciones",
    "suspended": "Suspendido",
    "active": "Activo",
    "demoteUser": "Degradar a usuario",
    "promoteAdmin": "Promover a admin",
    "suspend": "Suspender",
    "unsuspend": "Reactivar",
    "setCredits": "Editar créditos",
    "setCreditsPrompt": "Nuevo saldo de créditos (actual: {current}):",
    "invalidNumber": "Número inválido.",
    "page": "Página",
    "settingsHint": "Edita los valores abajo. Sobrescriben los valores por defecto del código.",
    "save": "Guardar",
    "settingsSaved": "Configuración guardada.",
    "loadError": "Error al cargar.",
    "actionError": "Acción fallida.",
    "category": {
        "general": "General",
        "credits": "Créditos",
        "pricing": "Precios",
        "merge": "Fusión",
        "stats": "Estadísticas mostradas"
    },
    "actionSuccess": {
        "suspend": "Usuario suspendido.",
        "unsuspend": "Usuario reactivado.",
        "setAdmin": "Usuario promovido a admin.",
        "setUser": "Usuario degradado.",
        "setCredits": "Créditos actualizados."
    }
}
update_messages("/home/z/my-project/src/messages/es.json", es_admin)
print("All 3 locales updated with Admin translations")
