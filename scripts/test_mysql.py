#!/usr/bin/env python3
"""Test MySQL connection to Hostinger DB."""
import pymysql
import sys

# Try common Hostinger MySQL hosts
HOSTS_TO_TRY = [
    ("localhost", 3306),
    ("127.0.0.1", 3306),
    # Hostinger often uses remote MySQL hosts like:
    ("u398373271_fusionai", 3306),  # sometimes the user prefix is the host
]

# Hostinger typical remote host pattern:
# Usually the host is something like: mysql-XXXX.hostinger.com.ar or similar
# We'll also try the main domain's mysql subdomain
for host_extra in [
    "mysql.hostinger.com",
    "mysql1.hostinger.com",
    "mysql2.hostinger.com",
    "u398373271.mysql.db.hostinger.com",
]:
    HOSTS_TO_TRY.append((host_extra, 3306))

DB = "u398373271_fusionai"
USER = "u398373271_fusionai"
PASSWORD = "Locmane@2027"

results = []
for host, port in HOSTS_TO_TRY:
    print(f"Trying {host}:{port}...", end=" ", flush=True)
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user=USER,
            password=PASSWORD,
            database=DB,
            connect_timeout=5,
        )
        cursor = conn.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()[0]
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"✓ SUCCESS — MySQL {version}, {len(tables)} tables")
        print(f"  Connection string: mysql://{USER}:***@{host}:{port}/{DB}")
        results.append((host, port, "OK", version))
        conn.close()
        break
    except Exception as e:
        msg = str(e)[:80]
        print(f"✗ {msg}")
        results.append((host, port, "FAIL", msg))

print("\n=== RÉSUMÉ ===")
for host, port, status, info in results:
    print(f"{host}:{port} → {status} ({info[:60]})")

ok = [r for r in results if r[2] == "OK"]
if ok:
    h, p, _, v = ok[0]
    print(f"\n✅ CONNEXION RÉUSSIE via {h}:{p}")
    print(f"   MySQL version: {v}")
    print(f"   DATABASE_URL complète pour Hostinger:")
    print(f"   mysql://{USER}:Locmane@2027@{h}:{p}/{DB}")
    # Note: le mot de passe contient @, il faut l'encoder
    from urllib.parse import quote
    pwd_encoded = quote(PASSWORD, safe="")
    print(f"\n   DATABASE_URL encodée (recommandée):")
    print(f"   mysql://{USER}:{pwd_encoded}@{h}:{p}/{DB}")
else:
    print("\n❌ Aucune connexion n'a réussi.")
    print("C'est normal : Hostinger bloque souvent l'accès MySQL distant.")
    print("Le build sur Hostinger utilisera 'localhost' depuis le serveur lui-même.")
    print("\nDATABASE_URL à configurer sur Hostinger:")
    print(f"mysql://{USER}:Locmane%402027@localhost:3306/{DB}")
