#!/bin/bash

# GitHub Pages Local Testing Script
# This script mimics the GitHub Actions workflow for local testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Please run this script from the root of the monorepo"
    exit 1
fi

# Parse command line arguments
SERVE=false
CLEAN=false
BUILD_ONLY=""
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --serve|-s)
            SERVE=true
            shift
            ;;
        --clean|-c)
            CLEAN=true
            shift
            ;;
        --only)
            BUILD_ONLY="$2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --serve, -s     Serve the built apps after building"
            echo "  --clean, -c     Clean previous builds before starting"
            echo "  --only APP      Build only specific app (gh-pages, mui-host-dev, mui-ewi, storybook)"
            echo "  --verbose, -v   Show verbose build output"
            echo "  --help, -h      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Build all apps"
            echo "  $0 --serve            # Build all apps and serve locally"
            echo "  $0 --only gh-pages    # Build only the GitHub Pages index"
            echo "  $0 --clean --serve    # Clean, build all, and serve"
            echo ""
            echo "Note: Storybook build is slow. To skip it, build specific apps:"
            echo "  $0 --only gh-pages --serve    # Skip storybook, build only index"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Clean previous builds if requested
if [ "$CLEAN" = true ]; then
    print_step "Cleaning previous builds..."
    rm -rf local-deploy
    rm -rf apps/gh-pages/dist
    rm -rf apps/mui-host-dev/dist
    rm -rf apps/mui-ewi/dist
    rm -rf apps/mui-storybook/dist
    print_success "Cleaned previous builds"
fi

# Create deployment directory
print_step "Creating deployment directory..."
mkdir -p local-deploy

# Function to build individual apps
build_gh_pages() {
    print_step "Building GitHub Pages Index..."
    cd apps/gh-pages
    # Use root path for local testing
    if [ "$VERBOSE" = true ]; then
        npm run build
    else
        npm run build > /dev/null 2>&1 || {
            print_error "GitHub Pages build failed. Run with --verbose to see details."
            exit 1
        }
    fi
    cd ../..
    cp -r apps/gh-pages/dist/* local-deploy/
    print_success "GitHub Pages Index built and copied"
}

build_mui_host_dev() {
    print_step "Building MUI Host Dev..."
    cd apps/mui-host-dev
    # Use relative path for local testing
    if [ "$VERBOSE" = true ]; then
        VITE_BASE_PATH="/mui-host-dev/" npm run build
    else
        VITE_BASE_PATH="/mui-host-dev/" npm run build > /dev/null 2>&1 || {
            print_error "MUI Host Dev build failed. Run with --verbose to see details."
            exit 1
        }
    fi
    cd ../..
    mkdir -p local-deploy/mui-host-dev
    cp -r apps/mui-host-dev/dist/* local-deploy/mui-host-dev/
    print_success "MUI Host Dev built and copied"
}

build_mui_ewi() {
    print_step "Building EWI App..."
    cd apps/mui-ewi
    # Use relative path for local testing
    if [ "$VERBOSE" = true ]; then
        VITE_BASE_PATH="/ewi/" VITE_USE_MOCKS="true" npm run build -- --mode development
    else
        VITE_BASE_PATH="/ewi/" VITE_USE_MOCKS="true" npm run build -- --mode development > /dev/null 2>&1 || {
            print_error "EWI App build failed. Run with --verbose to see details."
            exit 1
        }
    fi
    cd ../..
    mkdir -p local-deploy/ewi
    cp -r apps/mui-ewi/dist/* local-deploy/ewi/
    print_success "EWI App built and copied"
}

build_storybook() {
    print_step "Building Storybook..."
    cd apps/mui-storybook
    # Storybook handles base path differently
    if [ "$VERBOSE" = true ]; then
        npm run build-storybook -- --output-dir dist
    else
        npm run build-storybook -- --output-dir dist > /dev/null 2>&1 || {
            print_error "Storybook build failed. Run with --verbose to see details."
            exit 1
        }
    fi
    cd ../..
    mkdir -p local-deploy/storybook
    cp -r apps/mui-storybook/dist/* local-deploy/storybook/
    print_success "Storybook built and copied"
}

# Build packages first (unless building only a specific app)
if [ -z "$BUILD_ONLY" ]; then
    print_step "Building UI Core package..."
    if [ "$VERBOSE" = true ]; then
        npm run build --workspace=@smbc/ui-core
    else
        npm run build --workspace=@smbc/ui-core > /dev/null 2>&1 || {
            print_error "UI Core build failed. Run with --verbose to see details."
            exit 1
        }
    fi
    print_success "UI Core package built"

    print_step "Building workspace packages..."
    if [ "$VERBOSE" = true ]; then
        npx turbo run build \
            --filter="!@smbc/mui-storybook" \
            --filter="!@smbc/mui-storybook-old" \
            --continue
    else
        npx turbo run build \
            --filter="!@smbc/mui-storybook" \
            --filter="!@smbc/mui-storybook-old" \
            --continue > /dev/null 2>&1 || {
            print_error "Workspace packages build failed. Run with --verbose to see details."
            exit 1
        }
    fi
    print_success "Workspace packages built"
fi

# Build apps based on options
case "$BUILD_ONLY" in
    "gh-pages")
        build_gh_pages
        ;;
    "mui-host-dev")
        build_mui_host_dev
        ;;
    "mui-ewi")
        build_mui_ewi
        ;;
    "storybook")
        build_storybook
        ;;
    "")
        # Build all apps
        build_gh_pages
        build_mui_host_dev
        build_mui_ewi
        build_storybook
        ;;
    *)
        print_error "Unknown app: $BUILD_ONLY"
        print_warning "Available apps: gh-pages, mui-host-dev, mui-ewi, storybook"
        exit 1
        ;;
esac

print_success "All builds completed successfully!"

# Create a summary
echo ""
print_step "Deployment structure:"
echo "📁 local-deploy/"
echo "├── 📄 index.html (GitHub Pages Index)"
echo "├── 📁 mui-host-dev/ (MUI Host Dev App)"
echo "├── 📁 ewi/ (EWI App)"
echo "└── 📁 storybook/ (Component Library)"

# Serve if requested
if [ "$SERVE" = true ]; then
    echo ""
    print_step "Starting local server..."

    # Check if serve is available
    if ! command -v npx &> /dev/null; then
        print_error "npx is not available. Please install Node.js and npm."
        exit 1
    fi

    print_success "Server starting at http://localhost:3000"
    echo "Press Ctrl+C to stop the server"

    npx serve local-deploy -p 3000
else
    echo ""
    print_success "Build complete! To serve locally, run:"
    echo "  npx serve local-deploy -p 3000"
    echo ""
    echo "Or run this script with --serve flag:"
    echo "  ./scripts/test-gh-pages.sh --serve"
fi