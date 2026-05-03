# ProtoForge CAD Service

This Python service runs CadQuery to generate actual STL files from enclosure parameters.

## Setup on Mac Mini

### Prerequisites
- Python 3.10 or 3.11 (CadQuery doesn't support 3.12+ yet)
- Homebrew (for dependencies)

### Installation

```bash
# Install Python 3.11 if needed
brew install python@3.11

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install CadQuery (may take a few minutes)
pip install --upgrade pip
pip install cadquery

# Install other dependencies
pip install -r requirements.txt

# Run the server
python server.py
```

### Exposing via Cloudflare Tunnel

To access from the web app:

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Login to Cloudflare
cloudflared login

# Create a tunnel
cloudflared tunnel create protoforge-cad

# Run the tunnel
cloudflared tunnel run --url http://localhost:5001 protoforge-cad
```

This gives you a URL like `https://protoforge-cad.your-domain.com` that you can set as `CAD_SERVICE_URL` in the web app.

## Setup on Raspberry Pi

### Prerequisites
- Raspberry Pi 4 with 4GB+ RAM recommended
- Raspberry Pi OS (64-bit)

### Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install -y python3-pip python3-venv libgl1-mesa-glx

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install CadQuery (may take 10-20 minutes on Pi)
pip install cadquery

# Install other dependencies
pip install -r requirements.txt

# Run the server
python server.py
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and CadQuery availability.

### Generate Enclosure
```
POST /generate
Content-Type: application/json

{
  "modelId": "optional-id",
  "innerDimensions": {"length": 80, "width": 50, "height": 30},
  "wallThickness": 2.5,
  "cornerRadius": 3,
  "lidType": "snap",
  "mountingHoles": [...],
  "portCutouts": [...],
  "ventilation": {...}
}
```

### Download STL
```
GET /download/{modelId}/base
GET /download/{modelId}/lid
```

### Get Preview Data
```
GET /preview/{modelId}
```
Returns base64-encoded STL data for the 3D viewer.

## Environment Variables

Set these in the v0 web app:

- `CAD_SERVICE_URL` - URL to this service (e.g., `http://192.168.1.100:5001` or Cloudflare tunnel URL)
