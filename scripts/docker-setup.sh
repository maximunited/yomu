#!/bin/bash

# YomU Docker/Podman Setup Script
# This script helps with common Docker and Podman operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker or Podman is available
check_container_runtime() {
    if command -v docker &> /dev/null; then
        CONTAINER_RUNTIME="docker"
        COMPOSE_CMD="docker-compose"
        print_success "Docker found"
    elif command -v podman &> /dev/null; then
        CONTAINER_RUNTIME="podman"
        COMPOSE_CMD="podman-compose"
        print_success "Podman found"
    else
        print_error "Neither Docker nor Podman is installed"
        exit 1
    fi
}

# Check if compose is available
check_compose() {
    if ! command -v $COMPOSE_CMD &> /dev/null; then
        print_error "$COMPOSE_CMD is not installed"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from template"
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success ".env file created"
        else
            print_warning "No .env.example found, creating basic .env"
            cat > .env << EOF
# Database
DATABASE_URL="file:/data/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Node Environment
NODE_ENV="production"
EOF
            print_success ".env file created"
        fi
    else
        print_status ".env file already exists"
    fi
}

# Build images
build_images() {
    print_status "Building Docker images..."
    $COMPOSE_CMD build
    print_success "Images built successfully"
}

# Start services
start_services() {
    local profile=$1
    if [ "$profile" = "dev" ]; then
        print_status "Starting development services..."
        $COMPOSE_CMD --profile dev up -d
        print_success "Development services started"
        print_status "Access the application at: http://localhost:3001"
    else
        print_status "Starting production services..."
        $COMPOSE_CMD up -d
        print_success "Production services started"
        print_status "Access the application at: http://localhost:3000"
    fi
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    $COMPOSE_CMD down
    print_success "Services stopped"
}

# Initialize database
init_database() {
    print_status "Initializing database..."
    $COMPOSE_CMD exec app npx prisma migrate deploy
    $COMPOSE_CMD exec app node scripts/seed.js
    print_success "Database initialized"
}

# View logs
view_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_status "Showing all logs..."
        $COMPOSE_CMD logs -f
    else
        print_status "Showing logs for $service..."
        $COMPOSE_CMD logs -f $service
    fi
}

# Clean up
cleanup() {
    print_status "Cleaning up containers and volumes..."
    $COMPOSE_CMD down -v
    print_success "Cleanup completed"
}

# Show status
show_status() {
    print_status "Service status:"
    $COMPOSE_CMD ps
}

# Backup database
backup_database() {
    local backup_dir="./backups"
    mkdir -p $backup_dir
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/backup_$timestamp.db"
    
    print_status "Creating database backup..."
    $COMPOSE_CMD exec db sqlite3 /data/dev.db ".backup /data/backup_$timestamp.db"
    docker cp yomu-db:/data/backup_$timestamp.db $backup_file
    print_success "Database backed up to: $backup_file"
}

# Restore database
restore_database() {
    local backup_file=$1
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file path"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_status "Restoring database from: $backup_file"
    docker cp $backup_file yomu-db:/data/dev.db
    print_success "Database restored"
}

# Show help
show_help() {
    echo "YomU Docker/Podman Setup Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup           Setup environment and build images"
    echo "  start           Start production services"
    echo "  start-dev       Start development services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  logs [SERVICE]  View logs (all services or specific service)"
    echo "  status          Show service status"
    echo "  init-db         Initialize database (migrations + seed)"
    echo "  backup          Backup database"
    echo "  restore FILE    Restore database from backup file"
    echo "  cleanup         Stop services and remove volumes"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 start-dev"
    echo "  $0 logs app"
    echo "  $0 backup"
    echo "  $0 restore ./backups/backup_20240101_120000.db"
}

# Main script logic
main() {
    local command=$1
    local option=$2
    
    # Check container runtime
    check_container_runtime
    check_compose
    
    case $command in
        "setup")
            setup_env
            build_images
            print_success "Setup completed"
            ;;
        "start")
            start_services
            ;;
        "start-dev")
            start_services "dev"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            start_services
            ;;
        "logs")
            view_logs $option
            ;;
        "status")
            show_status
            ;;
        "init-db")
            init_database
            ;;
        "backup")
            backup_database
            ;;
        "restore")
            restore_database $option
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 