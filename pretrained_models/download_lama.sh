# !/bin/bash
if [ ! -d "/app/pretrained_models/big-lama/" ]; then
  echo "Downloading lama model..."
  curl -LJO https://huggingface.co/smartywu/big-lama/resolve/main/big-lama.zip
  unzip big-lama.zip

else
  echo "Lama model already exists. Skipping download."
fi

