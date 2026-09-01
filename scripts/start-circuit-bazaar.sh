#!/bin/bash
echo "🚀 Starting Circuit Bazaar stack..."
cd /home/$(whoami)/second-year-poo
docker compose up -d
echo "✅ Services started! Access via LAN at:"
echo "   Customer: http://192.168.100.101:3000"
echo "   Admin:    http://192.168.100.101:3001"
echo "   Vendor:   http://192.168.100.101:3002"
echo "   API:      http://192.168.100.101:8000"