# TeamFinder AI & CUDA Acceleration Service

This is the optional standalone Python / PyTorch / CUDA microservice for **Students Team Finder (TeamFinder)**.

## Architecture

- **Framework**: FastAPI + Uvicorn
- **Acceleration**: PyTorch with NVIDIA CUDA GPU support
- **Fallback**: Automatically falls back to high-performance CPU tensor operations if an NVIDIA GPU is not detected
- **Ports**: Runs on `http://localhost:8000`

## Endpoints

- `GET /health` & `GET /api/device`: Detects host hardware, CUDA device availability, GPU model, and allocated VRAM.
- `POST /api/match`: Computes vector cosine similarity and weighted compatibility for candidates against required skills.
- `POST /api/team-builder`: Analyzes natural language prompts (e.g. *"Autonomous rescue drone with thermal imaging"*), extracts multidisciplinary roles (Hardware, Computer Vision, Frontend, Product), and generates optimal team compositions.

## Running Locally

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. For NVIDIA GPU with CUDA 12.1+ (Optional)
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

### 3. Start the service
```bash
python main.py
```
Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```
