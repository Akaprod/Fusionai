#!/usr/bin/env python3
"""Test MySQL connection to Hostinger DB with the real host."""
import pymysql
from urllib.parse import quote

# Real Hostinger MySQL host extracted from phpMyAdmin URL
HOST = "auth-db657.hstgr.io"
PORT = 3306
DB = "u398373271_fusionai"
USER = "u398373271_fusionai"
PASSWORD = "Locmane@2027"

print(f"Testing connection to {HOST}:{PORT}/{DB} as {USER}...")
try:
    conn = pymysql.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        database=DB,
        connect_timeout=10,
    )
    cursor = conn.cursor()
    cursor.execute("SELECT VERSION()")
    version = cursor.fetchone()[0]
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"\n✅ CONNEXION RÉUSSIE !")
    print(f"   MySQL version: {version}")
    print(f"   Tables existantes: {len(tables)}")
    for t in tables:
        print(f"     - {t[0]}")
    
    # URL-encode the password (it contains @ which is a URL separator)
    pwd_encoded = quote(PASSWORD, safe="")
    print(f"\n📋 DATABASE_URL pour Hostinger (mot de passe encodé):")
    print(f"   mysql://{USER}:{pwd_encoded}@{HOST}:{PORT}/{DB}")
    conn.close()
except Exception as e:
    print(f"\n❌ Échec de connexion: {e}")
    # Even if we can't connect from here, give the user the right URL
    # (Hostinger blocks remote MySQL from non-whitelisted IPs by default)
    pwd_encoded = quote(PASSWORD, safe="")
    print(f"\n💡 Hostinger bloque souvent l'accès MySQL distant.")
    print(f"   Le serveur Hostinger lui-même peut se connecter en localhost.")
    print(f"\n📋 DATABASE_URL à configurer sur Hostinger (localhost depuis le serveur):")
    print(f"   mysql://{USER}:{pwd_encoded}@localhost:{PORT}/{DB}")
    print(f"\n📋 DATABASE_URL alternative (host distant, au cas où):")
    print(f"   mysql://{USER}:{pwd_encoded}@{HOST}:{PORT}/{DB}")
