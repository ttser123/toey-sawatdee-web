#!/bin/bash
dnf update -y
dnf install -y docker aws-cli
systemctl enable docker
systemctl start docker

# Log user-data output for troubleshooting
exec > /var/log/user-data.log 2>&1

echo "=== Fetching GHCR token from SSM Parameter Store ==="
# Retry loop to wait for networking and IAM role initialization
for i in {1..30}; do
  TOKEN=$(aws ssm get-parameter --name /toey-sawatdee/prod/ghcr-token --with-decryption --query Parameter.Value --output text --region ap-southeast-2)
  if [ -n "$TOKEN" ]; then
    break
  fi
  echo "Waiting for SSM Parameter..."
  sleep 5
done

if [ -n "$TOKEN" ]; then
  echo "=== Logging into GitHub Container Registry (GHCR) ==="
  echo "$TOKEN" | docker login ghcr.io -u ttser123 --password-stdin
  
  echo "=== Pulling latest Docker image ==="
  docker pull ghcr.io/ttser123/toey-sawatdee/toey-sawatdee:latest
  
  echo "=== Running Next.js application container ==="
  docker stop toey-sawatdee || true
  docker rm toey-sawatdee || true
  docker run -d -p 80:3000 --name toey-sawatdee --restart unless-stopped ghcr.io/ttser123/toey-sawatdee/toey-sawatdee:latest
  echo "=== Startup sequence completed successfully ==="
else
  echo "ERROR: Failed to fetch GHCR token after retries. Container auto-start aborted."
fi
