#!/usr/bin/env python3
import json

def update_messages(path, auth, dashboard):
    with open(path, 'r', encoding='utf-8') as f:
        d = json.load(f)
    d['Auth'] = auth
    d['Dashboard'] = dashboard
    d['Nav']['dashboard'] = auth.pop('_navDashboard')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    print(f"{path} updated")

# === FRENCH ===
fr_auth = {
    "signinTitle": "Connexion",
    "signinSubtitle": "Acc\u00e8de \u00e0 ton atelier de fusion et \u00e0 tes cr\u00e9dits.",
    "signupTitle": "Cr\u00e9er un compte",
    "signupSubtitle": "5 cr\u00e9dits offerts \u00e0 l\u2019inscription. Aucune carte requise.",
    "nameLabel": "Nom",
    "namePlaceholder": "Ton nom",
    "emailLabel": "Email",
    "passwordLabel": "Mot de passe",
    "passwordHint": "Au moins 6 caract\u00e8res.",
    "signinButton": "Se connecter",
    "signupButton": "Cr\u00e9er mon compte",
    "loading": "Chargement\u2026",
    "haveAccount": "D\u00e9j\u00e0 un compte ?",
    "noAccount": "Pas encore de compte ?",
    "signinLink": "Se connecter",
    "signupLink": "S\u2019inscrire",
    "bonusOffer": "5 cr\u00e9dits offerts \u00e0 l\u2019inscription",
    "signinSuccess": "Connexion r\u00e9ussie.",
    "signupError": "Inscription \u00e9chou\u00e9e.",
    "signinError": "Email ou mot de passe incorrect.",
    "genericError": "Une erreur est survenue. R\u00e9essaie.",
    "welcomeBonus": "Bienvenue ! 5 cr\u00e9dits offerts.",
    "signinMetaTitle": "Connexion \u2014 Fusionia",
    "signinMetaDesc": "Connecte-toi \u00e0 ton atelier de fusion d\u2019images.",
    "signupMetaTitle": "Inscription \u2014 Fusionia",
    "signupMetaDesc": "Cr\u00e9e ton compte et obtiens 5 cr\u00e9dits offerts.",
    "_navDashboard": "Dashboard"
}

fr_dashboard = {
    "metaTitle": "Dashboard \u2014 Fusionia",
    "metaDesc": "Tes cr\u00e9dits, ton historique et tes fusions.",
    "welcomeEyebrow": "Espace de travail",
    "welcomeTitle": "Bonjour, {name}",
    "welcomeSubtitle": "Voici ton atelier de fusion d\u2019images.",
    "newMerge": "Nouvelle fusion",
    "signOut": "D\u00e9connexion",
    "creditsUnit": "cr\u00e9dits",
    "balance": "Solde",
    "planFree": "Gratuit",
    "statCredits": "Cr\u00e9dits",
    "statMerges": "Fusions",
    "statPlan": "Plan",
    "statMember": "Membre depuis",
    "buyTitle": "Recharger des cr\u00e9dits",
    "buySubtitle": "Un cr\u00e9dit = une fusion. Les cr\u00e9dits n\u2019expirent pas \u2014 tu peux les utiliser quand tu veux.",
    "buyButton": "Acheter",
    "buyError": "Achat \u00e9chou\u00e9. R\u00e9essaie.",
    "buySuccess": "{count} cr\u00e9dits ajout\u00e9s \u00e0 ton compte.",
    "buyNote": "D\u00e9mo : aucun paiement r\u00e9el n\u2019est trait\u00e9. Les cr\u00e9dits sont ajout\u00e9s imm\u00e9diatement.",
    "bestValue": "Meilleur prix",
    "packStarter": "Pack d\u00e9couverte",
    "packMedium": "Pack standard",
    "packLarge": "Pack pro",
    "transactionsTitle": "Historique des cr\u00e9dits",
    "transactionsEmpty": "Aucune transaction pour l\u2019instant.",
    "mergesTitle": "Fusions r\u00e9centes",
    "mergesEmpty": "Aucune fusion pour l\u2019instant.",
    "mergesEmptyHint": "Lance ta premi\u00e8re fusion depuis l\u2019atelier.",
    "loadError": "Impossible de charger tes donn\u00e9es. R\u00e9essaie.",
    "reasons": {
        "welcome_bonus": "Bonus de bienvenue",
        "merge": "Fusion d\u2019images",
        "purchase_starter": "Achat \u2014 Pack d\u00e9couverte",
        "purchase_medium": "Achat \u2014 Pack standard",
        "purchase_large": "Achat \u2014 Pack pro",
        "purchase_custom": "Achat de cr\u00e9dits"
    }
}

update_messages("/home/z/my-project/src/messages/fr.json", fr_auth, fr_dashboard)

# === ENGLISH ===
en_auth = {
    "signinTitle": "Sign in",
    "signinSubtitle": "Access your merge studio and your credits.",
    "signupTitle": "Create account",
    "signupSubtitle": "5 free credits on signup. No card required.",
    "nameLabel": "Name",
    "namePlaceholder": "Your name",
    "emailLabel": "Email",
    "passwordLabel": "Password",
    "passwordHint": "At least 6 characters.",
    "signinButton": "Sign in",
    "signupButton": "Create account",
    "loading": "Loading\u2026",
    "haveAccount": "Already have an account?",
    "noAccount": "No account yet?",
    "signinLink": "Sign in",
    "signupLink": "Sign up",
    "bonusOffer": "5 free credits on signup",
    "signinSuccess": "Signed in successfully.",
    "signupError": "Sign up failed.",
    "signinError": "Email or password incorrect.",
    "genericError": "An error occurred. Please try again.",
    "welcomeBonus": "Welcome! 5 free credits added.",
    "signinMetaTitle": "Sign in \u2014 Fusionia",
    "signinMetaDesc": "Sign in to your image merge studio.",
    "signupMetaTitle": "Sign up \u2014 Fusionia",
    "signupMetaDesc": "Create your account and get 5 free credits.",
    "_navDashboard": "Dashboard"
}

en_dashboard = {
    "metaTitle": "Dashboard \u2014 Fusionia",
    "metaDesc": "Your credits, history, and merges.",
    "welcomeEyebrow": "Workspace",
    "welcomeTitle": "Hi, {name}",
    "welcomeSubtitle": "Here is your image merge studio.",
    "newMerge": "New merge",
    "signOut": "Sign out",
    "creditsUnit": "credits",
    "balance": "Balance",
    "planFree": "Free",
    "statCredits": "Credits",
    "statMerges": "Merges",
    "statPlan": "Plan",
    "statMember": "Member since",
    "buyTitle": "Top up credits",
    "buySubtitle": "One credit = one merge. Credits don\u2019t expire \u2014 use them whenever you want.",
    "buyButton": "Buy",
    "buyError": "Purchase failed. Try again.",
    "buySuccess": "{count} credits added to your account.",
    "buyNote": "Demo: no real payment is processed. Credits are added instantly.",
    "bestValue": "Best value",
    "packStarter": "Starter pack",
    "packMedium": "Standard pack",
    "packLarge": "Pro pack",
    "transactionsTitle": "Credit history",
    "transactionsEmpty": "No transactions yet.",
    "mergesTitle": "Recent merges",
    "mergesEmpty": "No merges yet.",
    "mergesEmptyHint": "Launch your first merge from the studio.",
    "loadError": "Couldn\u2019t load your data. Try again.",
    "reasons": {
        "welcome_bonus": "Welcome bonus",
        "merge": "Image merge",
        "purchase_starter": "Purchase \u2014 Starter pack",
        "purchase_medium": "Purchase \u2014 Standard pack",
        "purchase_large": "Purchase \u2014 Pro pack",
        "purchase_custom": "Credit purchase"
    }
}

update_messages("/home/z/my-project/src/messages/en.json", en_auth, en_dashboard)

# === SPANISH ===
es_auth = {
    "signinTitle": "Iniciar sesi\u00f3n",
    "signinSubtitle": "Accede a tu estudio de fusi\u00f3n y a tus cr\u00e9ditos.",
    "signupTitle": "Crear cuenta",
    "signupSubtitle": "5 cr\u00e9ditos gratis al registrarte. Sin tarjeta.",
    "nameLabel": "Nombre",
    "namePlaceholder": "Tu nombre",
    "emailLabel": "Email",
    "passwordLabel": "Contrase\u00f1a",
    "passwordHint": "Al menos 6 caracteres.",
    "signinButton": "Iniciar sesi\u00f3n",
    "signupButton": "Crear cuenta",
    "loading": "Cargando\u2026",
    "haveAccount": "\u00bfYa tienes cuenta?",
    "noAccount": "\u00bfA\u00fan sin cuenta?",
    "signinLink": "Iniciar sesi\u00f3n",
    "signupLink": "Reg\u00edstrate",
    "bonusOffer": "5 cr\u00e9ditos gratis al registrarte",
    "signinSuccess": "Sesi\u00f3n iniciada.",
    "signupError": "Registro fallido.",
    "signinError": "Email o contrase\u00f1a incorrecta.",
    "genericError": "Ocurri\u00f3 un error. Int\u00e9ntalo de nuevo.",
    "welcomeBonus": "\aBienvenido! 5 cr\u00e9ditos gratis.",
    "signinMetaTitle": "Iniciar sesi\u00f3n \u2014 Fusionia",
    "signinMetaDesc": "Inicia sesi\u00f3n en tu estudio de fusi\u00f3n de im\u00e1genes.",
    "signupMetaTitle": "Registro \u2014 Fusionia",
    "signupMetaDesc": "Crea tu cuenta y obt\u00e9n 5 cr\u00e9ditos gratis.",
    "_navDashboard": "Panel"
}

es_dashboard = {
    "metaTitle": "Panel \u2014 Fusionia",
    "metaDesc": "Tus cr\u00e9ditos, historial y fusiones.",
    "welcomeEyebrow": "Espacio de trabajo",
    "welcomeTitle": "Hola, {name}",
    "welcomeSubtitle": "Aqu\u00ed est\u00e1 tu estudio de fusi\u00f3n de im\u00e1genes.",
    "newMerge": "Nueva fusi\u00f3n",
    "signOut": "Cerrar sesi\u00f3n",
    "creditsUnit": "cr\u00e9ditos",
    "balance": "Saldo",
    "planFree": "Gratis",
    "statCredits": "Cr\u00e9ditos",
    "statMerges": "Fusiones",
    "statPlan": "Plan",
    "statMember": "Miembro desde",
    "buyTitle": "Recargar cr\u00e9ditos",
    "buySubtitle": "Un cr\u00e9dito = una fusi\u00f3n. Los cr\u00e9ditos no caducan \u2014 \u00fasalos cuando quieras.",
    "buyButton": "Comprar",
    "buyError": "Compra fallida. Int\u00e9ntalo de nuevo.",
    "buySuccess": "{count} cr\u00e9ditos a\u00f1adidos a tu cuenta.",
    "buyNote": "Demo: no se procesa ning\u00fan pago real. Los cr\u00e9ditos se a\u00f1aden al instante.",
    "bestValue": "Mejor precio",
    "packStarter": "Pack inicio",
    "packMedium": "Pack est\u00e1ndar",
    "packLarge": "Pack pro",
    "transactionsTitle": "Historial de cr\u00e9ditos",
    "transactionsEmpty": "Sin transacciones por ahora.",
    "mergesTitle": "Fusiones recientes",
    "mergesEmpty": "Sin fusiones por ahora.",
    "mergesEmptyHint": "Lanza tu primera fusi\u00f3n desde el estudio.",
    "loadError": "No se pudieron cargar tus datos. Int\u00e9ntalo de nuevo.",
    "reasons": {
        "welcome_bonus": "Bonus de bienvenida",
        "merge": "Fusi\u00f3n de im\u00e1genes",
        "purchase_starter": "Compra \u2014 Pack inicio",
        "purchase_medium": "Compra \u2014 Pack est\u00e1ndar",
        "purchase_large": "Compra \u2014 Pack pro",
        "purchase_custom": "Compra de cr\u00e9ditos"
    }
}

update_messages("/home/z/my-project/src/messages/es.json", es_auth, es_dashboard)
print("All 3 locales updated")
