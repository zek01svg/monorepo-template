#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Registry URL
REGISTRY="registry.127.0.0.1.nip.io"

# Get the root directory of the monorepo
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_DIR="$ROOT_DIR/docker"

echo -e "${YELLOW}Building and pushing Docker images from $DOCKER_DIR${NC}"

# Check if docker directory exists
if [ ! -d "$DOCKER_DIR" ]; then
    echo -e "${RED}Error: Docker directory not found at $DOCKER_DIR${NC}"
    exit 1
fi

# Counter for tracking builds
total_images=0
successful_builds=0

# Loop through each subdirectory in docker/
for dir in "$DOCKER_DIR"/*; do
    if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        dockerfile_path="$dir/Dockerfile"
        
        # Check if Dockerfile exists
        if [ -f "$dockerfile_path" ]; then
            echo -e "${YELLOW}Processing $dirname...${NC}"
            
            # Build image
            image_tag="$REGISTRY/$dirname:latest"
            echo -e "Building image: $image_tag"
            
            if docker build -t "$image_tag" -f "$dockerfile_path" "$dir"; then
                echo -e "${GREEN}✓ Successfully built $image_tag${NC}"
                
                # Push image
                echo -e "Pushing image: $image_tag"
                if docker image push "$image_tag"; then
                    echo -e "${GREEN}✓ Successfully pushed $image_tag${NC}"
                    ((successful_builds++))
                else
                    echo -e "${RED}✗ Failed to push $image_tag${NC}"
                fi
            else
                echo -e "${RED}✗ Failed to build $image_tag${NC}"
            fi
            
            ((total_images++))
            echo ""
        else
            echo -e "${YELLOW}Skipping $dirname - no Dockerfile found${NC}"
        fi
    fi
done

# Summary
echo -e "${YELLOW}=== Build Summary ===${NC}"
echo -e "Total images processed: $total_images"
echo -e "Successful builds: $successful_builds"

if [ $successful_builds -eq $total_images ] && [ $total_images -gt 0 ]; then
    echo -e "${GREEN}All images built and pushed successfully!${NC}"
    exit 0
elif [ $total_images -eq 0 ]; then
    echo -e "${YELLOW}No Docker images found to build${NC}"
    exit 0
else
    echo -e "${RED}Some builds failed. Check the output above for details.${NC}"
    exit 1
fi
