#!/bin/bash
. ~/.bashrc
. ~/anaconda3/etc/profile.d/conda.sh
conda activate test
host_name=$(hostname)
RED='\033[0;31m' # Red
NC='\033[0m' # No Color
GREEN='\033[0;32m' # Green
tabs='\t  '
echo -e "${GREEN}$(hostname)${NC}:${tabs}Read .env..."
PORT=$(cat ./app/.env | grep -Po '^PORT=.*' | cut -d '=' -f 2)
HOST=$(cat ./app/.env | grep -Po '^HOST=.*' | cut -d '=' -f 2)
DEBUG=$(cat ./app/.env | grep -Po '^DEBUG=.*' | cut -d '=' -f 2)
MAIN_RUN=$(cat ./app/.env | grep -Po '^MAIN=.*' | cut -d '=' -f 2 | cut -d '.' -f 1)
echo -e "${GREEN}PORT${NC}:${tabs}$PORT"
echo -e "${GREEN}HOST${NC}:${tabs}$HOST"
echo -e "${GREEN}MAIN${NC}:${tabs}$MAIN_RUN"
echo -e "${GREEN}DEBUG${NC}:${tabs}$DEBUG"
echo -e "${GREEN}$(hostname)${NC}:${tabs}Read .env...${GREEN}OK${NC}"
echo -e "${GREEN}$(hostname)${NC}:${tabs}Starting server..."
if [ -z "$PORT" ]
then
    PORT=8000
fi
if [ -z "$HOST" ]
then
    HOST=127.0.0.1
fi
if [ -z "$MAIN_RUN" ]
then
    MAIN_RUN=main
fi
if [ -z "$DEBUG" ]
then
    DEBUG=True
fi
uvicorn $MAIN_RUN:app --reload --host $HOST --port $PORT
# uvicorn $MAIN_RUN:app --reload --host $HOST --port $PORT &

# Đợi 5 giây để đảm bảo uvicorn khởi chạy
# sleep 5

# echo -e "${GREEN}$(hostname)${NC}:${tabs}Switching to web-demo folder..."
# cd web-demo

# # Khởi chạy npm start
# echo -e "${GREEN}$(hostname)${NC}:${tabs}Starting npm..."
# npm start