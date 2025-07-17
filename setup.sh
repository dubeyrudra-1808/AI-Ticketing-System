#!/usr/bin/env bash
# Backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt &
# Frontend
cd Frontend/frontend && npm install &
wait