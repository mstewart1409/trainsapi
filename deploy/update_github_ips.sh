#!/bin/bash

# Fetch GitHub webhook IPs and update the Nginx config
curl -s https://api.github.com/meta | jq -r '.hooks[]' | sed 's/^/allow /; s/$/;/' | sudo tee /etc/nginx/github_ips.conf > /dev/null

# Reload Nginx to apply changes
sudo systemctl reload nginx
