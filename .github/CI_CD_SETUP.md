# CI/CD Setup Guide

This project uses GitHub Actions to automatically build and push Docker images to Docker Hub.

## 🚀 Setup Instructions

### 1. Create Docker Hub Account

If you don't have one, create an account at [Docker Hub](https://hub.docker.com/)

### 2. Create Docker Hub Access Token

1. Go to Docker Hub → Account Settings → Security
2. Click "New Access Token"
3. Give it a name (e.g., "github-actions")
4. Copy the token (you won't see it again!)

### 3. Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

   - **Name**: `DOCKER_HUB_USERNAME`
     - **Value**: Your Docker Hub username

   - **Name**: `DOCKER_HUB_TOKEN`
     - **Value**: The access token you created in step 2

### 4. Push to GitHub

The workflow will automatically trigger on:
- **Push to `main` or `master` branch** → Builds and pushes images
- **Pull requests** → Builds images only (doesn't push)
- **Tags starting with `v`** (e.g., `v1.0.0`) → Builds and pushes with version tags
- **Manual trigger** → Via GitHub Actions UI

## 📦 Image Tags

Images are pushed with the following tags:

- `latest` - Latest build from main/master branch
- `main` or `master` - Branch name tag
- `v1.0.0` - Semantic version (from git tags)
- `v1.0` - Major.minor version
- `v1` - Major version
- `main-abc1234` - Branch name + commit SHA

## 🏷️ Image Names

Images are pushed to Docker Hub as:
- `your-username/gostream-backend`
- `your-username/gostream-frontend`
- `your-username/gostream-nginx-rtmp`

## 🔄 Workflow Behavior

### On Push to Main/Master
- Builds all 3 images (backend, frontend, nginx-rtmp)
- Pushes to Docker Hub with `latest` and branch tags
- Uses GitHub Actions cache for faster builds

### On Pull Request
- Builds all 3 images
- **Does NOT push** to Docker Hub (security)
- Useful for testing builds

### On Version Tag (v*.*.*)
- Builds all 3 images
- Pushes with semantic version tags
- Example: `git tag v1.0.0 && git push --tags`

### Manual Trigger
- Go to Actions tab → "Build and Push Docker Images" → "Run workflow"
- Useful for testing or rebuilding images

## 🐳 Using the Images

After images are pushed, you can pull them:

```bash
# Pull latest images
docker pull your-username/gostream-backend:latest
docker pull your-username/gostream-frontend:latest
docker pull your-username/gostream-nginx-rtmp:latest

# Or use specific version
docker pull your-username/gostream-backend:v1.0.0
```

## 🔍 Troubleshooting

### Workflow fails with "authentication required"
- Check that `DOCKER_HUB_USERNAME` and `DOCKER_HUB_TOKEN` secrets are set correctly
- Verify the token hasn't expired (regenerate if needed)

### Build fails
- Check the Actions logs for specific error messages
- Ensure Dockerfiles are correct
- Verify all dependencies are properly specified

### Images not appearing on Docker Hub
- Wait a few minutes (Docker Hub can be slow)
- Check that the workflow completed successfully
- Verify you're looking at the correct repository

## 📝 Notes

- The workflow builds for both `linux/amd64` and `linux/arm64` platforms
- Build cache is used to speed up subsequent builds
- Only pushes on main/master branch or tags (not on PRs)

