#!/usr/bin/env python3
"""Generate an ED25519 SSH keypair in OpenSSH format without ssh-keygen."""
import base64
import struct
import os
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization

KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_fusionia")
PUB_PATH = KEY_PATH + ".pub"
COMMENT = "fusionia-deploy@z.ai"

os.makedirs(os.path.dirname(KEY_PATH), exist_ok=True)

# Generate ED25519 key
private_key = Ed25519PrivateKey.generate()
public_key = private_key.public_key()

# Get raw 32-byte public key
pub_bytes = public_key.public_bytes(
    encoding=serialization.Encoding.Raw,
    format=serialization.PublicFormat.Raw,
)

# Get raw 32-byte private seed
priv_bytes = private_key.private_bytes(
    encoding=serialization.Encoding.Raw,
    format=serialization.PrivateFormat.Raw,
    encryption_algorithm=serialization.NoEncryption(),
)

# Build OpenSSH public key format:
# ssh-ed25519 base64( string("ssh-ed25519") + string(pubkey) )
def ssh_string(b: bytes) -> bytes:
    return struct.pack(">I", len(b)) + b

pub_blob = ssh_string(b"ssh-ed25519") + ssh_string(pub_bytes)
pub_b64 = base64.b64encode(pub_blob).decode("ascii")
pub_line = f"ssh-ed25519 {pub_b64} {COMMENT}"

# Build OpenSSH private key format (unencrypted, OpenSSH v1)
# This is the modern format used by recent OpenSSH versions.
def build_openssh_private_key(priv_seed: bytes, pub_bytes: bytes, comment: str) -> bytes:
    """Build an OpenSSH v1 format ED25519 private key."""
    import struct
    
    # Inner structure (private + public)
    # For ED25519: private key is the 32-byte seed, public key is 32 bytes
    inner = ssh_string(priv_seed) + ssh_string(pub_bytes)
    
    # Pad inner to block size of 8
    block_size = 8
    padding_len = block_size - (len(inner) % block_size)
    if padding_len == block_size:
        padding_len = 0
    padding = bytes(range(1, padding_len + 1))
    inner_padded = inner + padding
    
    # Public key blob (same as in the .pub file)
    pub_blob = ssh_string(b"ssh-ed25519") + ssh_string(pub_bytes)
    
    # Build the full unencrypted payload
    checkint = struct.unpack(">I", os.urandom(4))[0]
    payload = (
        struct.pack(">I", checkint)  # checkint (repeated)
        + struct.pack(">I", checkint)  # checkint (repeated)
        + ssh_string(b"ssh-ed25519")  # key type
        + ssh_string(pub_blob)         # public key blob
        + ssh_string(inner_padded)    # private key (padded)
        + ssh_string(comment.encode("utf-8"))  # comment
    )
    
    # Pad payload to block size
    pad_len = block_size - (len(payload) % block_size)
    if pad_len == block_size:
        pad_len = 0
    payload += bytes(range(1, pad_len + 1))
    
    # Encrypt with none cipher (no encryption)
    encrypted_payload = payload
    
    # Build the OpenSSH v1 file
    auth_magic = b"openssh-key-v1\x00"
    cipher_name = ssh_string(b"none")
    kdf_name = ssh_string(b"none")
    kdf = ssh_string(b"")
    num_keys = struct.pack(">I", 1)
    pub_section = ssh_string(pub_blob)
    priv_section = ssh_string(encrypted_payload)
    
    file_content = (
        auth_magic
        + cipher_name
        + kdf_name
        + kdf
        + num_keys
        + pub_section
        + priv_section
    )
    
    # PEM-encode
    b64 = base64.b64encode(file_content).decode("ascii")
    lines = [b64[i:i+70] for i in range(0, len(b64), 70)]
    pem = "-----BEGIN OPENSSH PRIVATE KEY-----\n" + "\n".join(lines) + "\n-----END OPENSSH PRIVATE KEY-----\n"
    return pem.encode("utf-8")

priv_pem = build_openssh_private_key(priv_bytes, pub_bytes, COMMENT)

# Write files with correct permissions
with open(KEY_PATH, "wb") as f:
    f.write(priv_pem)
os.chmod(KEY_PATH, 0o600)

with open(PUB_PATH, "w") as f:
    f.write(pub_line + "\n")
os.chmod(PUB_PATH, 0o644)

print("=" * 60)
print("✓ SSH ED25519 keypair generated successfully")
print("=" * 60)
print(f"\nPrivate key: {KEY_PATH}")
print(f"Public key:  {PUB_PATH}")
print(f"\nPublic key (copy this to GitHub):")
print("-" * 60)
print(pub_line)
print("-" * 60)
