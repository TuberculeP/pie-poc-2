# Configuration Cloudflare R2 pour les Samples Audio

Ce document décrit les étapes à effectuer sur Cloudflare **après** l'implémentation du code.

---

## 1. Créer un bucket R2

1. Aller sur [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Sélectionner le compte
3. **R2 Object Storage** > **Create bucket**
4. Nom du bucket : `bloop-samples`
5. Location : **Automatic** (ou Europe si tu veux)

---

## 2. Configurer l'accès public

### Option A : Domaine personnalisé (recommandé)

1. Dans le bucket R2, onglet **Settings**
2. **Custom Domains** > **Connect Domain**
3. Entrer : `samples.bloop.app` (ou ton domaine)
4. Cloudflare configure automatiquement le DNS et SSL

### Option B : URL R2.dev (rapide pour tests)

1. Dans le bucket R2, onglet **Settings**
2. **Public Access** > **Allow Access**
3. Noter l'URL : `https://pub-xxxxx.r2.dev`

---

## 3. Structure des fichiers à uploader

```
bloop-samples/
├── get-busy-yeat/
│   ├── cover.jpg
│   ├── 808/
│   │   ├── bangin.wav          # Full quality
│   │   └── ...
│   ├── clap/
│   │   └── ...
│   └── preview/                # Previews opus (à générer)
│       ├── 808/
│       │   ├── bangin.opus
│       │   └── ...
│       └── clap/
│           └── ...
├── autre-pack/
│   └── ...
```

---

## 4. Générer les previews opus

Script bash pour convertir les WAV en opus légers :

```bash
#!/bin/bash
# generate-previews.sh

PACK_DIR="$1"
OUTPUT_DIR="$PACK_DIR/preview"

mkdir -p "$OUTPUT_DIR"

find "$PACK_DIR" -name "*.wav" -not -path "*/preview/*" | while read wav; do
    relative="${wav#$PACK_DIR/}"
    opus_path="$OUTPUT_DIR/${relative%.wav}.opus"

    mkdir -p "$(dirname "$opus_path")"

    # Convertir en opus 64kbps mono
    ffmpeg -i "$wav" -c:a libopus -b:a 64k -ac 1 "$opus_path" -y

    echo "Created: $opus_path"
done
```

Usage :

```bash
chmod +x generate-previews.sh
./generate-previews.sh ./webapp/public/samples/packs/get-busy-yeat
```

---

## 5. Upload vers R2

### Via Wrangler CLI (recommandé)

```bash
# Installer wrangler
npm install -g wrangler

# Login
wrangler login

# Upload récursif
wrangler r2 object put bloop-samples/get-busy-yeat --file ./webapp/public/samples/packs/get-busy-yeat --recursive

# Ou fichier par fichier
wrangler r2 object put bloop-samples/get-busy-yeat/cover.jpg --file ./cover.jpg
```

### Via rclone (pour gros volumes)

```bash
# Configurer rclone
rclone config
# Type: s3
# Provider: Cloudflare
# Access Key: (depuis R2 > Manage API tokens)
# Secret Key: (depuis R2 > Manage API tokens)
# Endpoint: https://<account_id>.r2.cloudflarestorage.com

# Sync
rclone sync ./webapp/public/samples/packs/ r2:bloop-samples/
```

---

## 6. Configurer les headers CORS

Dans Cloudflare Dashboard > R2 > bucket > Settings > CORS Policy :

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://bloop.app",
      "https://*.bloop.app"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

---

## 7. Variables d'environnement

### Backend (server/.env)

```bash
CDN_BASE_URL=https://samples.bloop.app
# ou https://pub-xxxxx.r2.dev si pas de domaine custom
```

### Frontend (webapp/.env)

```bash
VITE_CDN_BASE_URL=https://samples.bloop.app
```

---

## 8. Script d'import complet

Après avoir uploadé les fichiers sur R2, exécuter le script d'import pour peupler la DB :

```bash
cd server

# Définir l'URL CDN
export CDN_BASE_URL=https://samples.bloop.app

# Exécuter l'import
npx ts-node scripts/importSamples.ts
```

---

## 9. Calcul des waveforms (optionnel mais recommandé)

Script pour pré-calculer les waveforms côté serveur :

```bash
#!/bin/bash
# generate-waveforms.sh

# Requiert: ffmpeg, jq

PACK_DIR="$1"
OUTPUT_JSON="waveforms.json"

echo "{" > "$OUTPUT_JSON"
first=true

find "$PACK_DIR" -name "*.wav" -not -path "*/preview/*" | while read wav; do
    filename=$(basename "$wav" .wav)

    # Extraire 128 peaks RMS
    waveform=$(ffmpeg -i "$wav" -af "aresample=8000,asetnsamples=n=128" -f null - 2>&1 | \
        grep "RMS" | awk '{print $NF}' | tr '\n' ',' | sed 's/,$//')

    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "$OUTPUT_JSON"
    fi

    echo "  \"$filename\": [$waveform]" >> "$OUTPUT_JSON"
done

echo "}" >> "$OUTPUT_JSON"
echo "Waveforms saved to $OUTPUT_JSON"
```

Puis mettre à jour la DB avec ces waveforms.

---

## 10. Monitoring et coûts

### R2 Pricing (approximatif)

- Storage : $0.015/GB/mois
- Class A ops (PUT) : $4.50/million
- Class B ops (GET) : $0.36/million
- Egress : **GRATUIT** (via custom domain ou r2.dev)

### Estimation pour 1000 packs × 50 samples

- ~50GB storage = ~$0.75/mois
- ~1M downloads/mois = ~$0.36/mois

---

## Checklist finale

- [ ] Bucket R2 créé
- [ ] Domaine custom configuré (ou URL r2.dev notée)
- [ ] CORS configuré
- [ ] Samples WAV uploadés
- [ ] Previews opus générés et uploadés
- [ ] Covers uploadées
- [ ] Variables d'environnement configurées
- [ ] Script d'import exécuté
- [ ] Test preview dans l'app
- [ ] Test drag & drop (chargement WAV)
- [ ] Vérifier cache IndexedDB fonctionne
