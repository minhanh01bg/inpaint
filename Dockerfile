# Dockerfile

# Base image with Python 3.10.6
FROM python:3.10.6

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install CUDA (if you're using GPU)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files for BiRefNet and LAMA
COPY requirements_birefnet.txt /app/requirements_birefnet.txt
COPY lama/requirements.txt /app/lama/requirements.txt

# Install PyTorch and related packages for GPU with CUDA 12.1
RUN pip install torch==2.1.1 torchvision==0.16.1 torchaudio==2.1.1 --index-url https://download.pytorch.org/whl/cu121

# Install BiRefNet dependencies
RUN pip install -r requirements_birefnet.txt

# Install SAM2 from GitHub
RUN pip install -e git+https://github.com/facebookresearch/segment-anything-2.git#egg=SAM_2

# Install LAMA dependencies
RUN pip install -r lama/requirements.txt

# Install additional Python packages for diffusers, ultralytics, and FastAPI
RUN pip install diffusers["torch"] transformers xformers ultralytics uvicorn

# Copy the rest of the app files
COPY . /app

# Run download scripts for SAM2 and LAMA models
RUN chmod +x /app/sam2/checkpoints/download_ckpts.sh && /app/sam2/checkpoints/download_ckpts.sh
RUN chmod +x /app/pretrained_models/download_lama.sh && /app/pretrained_models/download_lama.sh

# Expose the FastAPI default port
EXPOSE 7000

# Run the FastAPI app with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7000"]
