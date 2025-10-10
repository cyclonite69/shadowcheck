#!/bin/bash
# ShadowCheck System Optimization for Parrot OS + Ryzen 5 + 16GB RAM
# Optimizes kernel parameters and Docker for database performance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should NOT be run as root for security reasons."
        echo "Run as regular user - sudo will be used when needed."
        exit 1
    fi
}

# Optimize kernel parameters for database performance
optimize_kernel() {
    log "Optimizing kernel parameters for database performance..."

    # Create sysctl configuration for PostgreSQL
    sudo tee /etc/sysctl.d/99-shadowcheck-postgresql.conf > /dev/null << 'EOF'
# ShadowCheck PostgreSQL Optimization for Ryzen 5 + 16GB RAM

# Memory Management
vm.swappiness = 1                    # Minimize swapping (prefer RAM)
vm.dirty_ratio = 5                   # Start writeback at 5% dirty pages
vm.dirty_background_ratio = 2        # Background writeback at 2%
vm.dirty_expire_centisecs = 500      # Dirty pages expire after 5s
vm.dirty_writeback_centisecs = 100   # Check for dirty pages every 1s
vm.overcommit_memory = 2             # Don't overcommit memory
vm.overcommit_ratio = 80             # Allow 80% memory overcommit

# Shared Memory (for PostgreSQL)
kernel.shmmax = 8589934592           # 8GB max shared memory segment
kernel.shmall = 2097152              # Total shared memory pages (8GB)
kernel.shmmni = 4096                 # Max shared memory segments

# Network optimizations
net.core.rmem_max = 134217728        # 128MB socket receive buffer
net.core.wmem_max = 134217728        # 128MB socket send buffer
net.core.netdev_max_backlog = 5000   # Network device backlog
net.ipv4.tcp_rmem = 4096 65536 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.ipv4.tcp_congestion_control = bbr # Better congestion control

# File system optimizations
fs.file-max = 2097152                # Max open files
fs.aio-max-nr = 1048576              # Async I/O requests

# CPU scheduling for database workloads
kernel.sched_latency_ns = 6000000    # 6ms latency for better database response
kernel.sched_min_granularity_ns = 750000  # 0.75ms minimum granularity

# Security (maintain while optimizing)
kernel.randomize_va_space = 2        # Full ASLR
kernel.kptr_restrict = 1             # Restrict kernel pointers
EOF

    # Apply sysctl settings immediately
    sudo sysctl -p /etc/sysctl.d/99-shadowcheck-postgresql.conf

    success "Kernel parameters optimized"
}

# Optimize Docker daemon for database workloads
optimize_docker() {
    log "Optimizing Docker daemon configuration..."

    # Create Docker daemon configuration
    sudo mkdir -p /etc/docker

    sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65536,
      "Soft": 65536
    },
    "memlock": {
      "Name": "memlock",
      "Hard": -1,
      "Soft": -1
    }
  },
  "default-shm-size": "2g",
  "dns": ["127.0.0.1", "8.8.8.8", "8.8.4.4"],
  "experimental": false,
  "features": {
    "buildkit": true
  },
  "live-restore": true
}
EOF

    success "Docker daemon configuration updated"
}

# Create systemd user limits for PostgreSQL
setup_user_limits() {
    log "Setting up user limits for database operations..."

    # Create limits configuration
    sudo tee /etc/security/limits.d/99-shadowcheck.conf > /dev/null << EOF
# ShadowCheck user limits for database performance
$(whoami) soft nofile 65536
$(whoami) hard nofile 65536
$(whoami) soft memlock unlimited
$(whoami) hard memlock unlimited
$(whoami) soft nproc 32768
$(whoami) hard nproc 32768
EOF

    success "User limits configured"
}

# Optimize I/O scheduler for SSD performance
optimize_io_scheduler() {
    log "Optimizing I/O scheduler for SSD performance..."

    # Detect storage devices and optimize
    for device in $(lsblk -nd -o NAME | grep -E '^(sd|nvme)'); do
        device_path="/sys/block/$device/queue"

        if [ -d "$device_path" ]; then
            log "Optimizing I/O for device: $device"

            # Set scheduler to none/noop for SSDs
            if [ -f "$device_path/scheduler" ]; then
                echo 'none' | sudo tee "$device_path/scheduler" > /dev/null 2>&1 || \
                echo 'noop' | sudo tee "$device_path/scheduler" > /dev/null 2>&1 || true
            fi

            # Optimize queue depth and read-ahead
            [ -f "$device_path/nr_requests" ] && echo '1024' | sudo tee "$device_path/nr_requests" > /dev/null
            [ -f "$device_path/read_ahead_kb" ] && echo '4096' | sudo tee "$device_path/read_ahead_kb" > /dev/null

            success "Optimized I/O for $device"
        fi
    done
}

# Create performance monitoring script
create_monitoring_script() {
    log "Creating performance monitoring script..."

    cat > monitor_performance.sh << 'EOF'
#!/bin/bash
# ShadowCheck Performance Monitor

echo "=== ShadowCheck System Performance ==="
echo "Timestamp: $(date)"
echo

echo "=== CPU Usage (Ryzen 5) ==="
grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$3+$4+$5)} {print "CPU Usage: " usage "%"}'
echo "CPU Frequency: $(cat /proc/cpuinfo | grep "cpu MHz" | head -1 | awk '{print $4}') MHz"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo

echo "=== Memory Usage (16GB Total) ==="
free -h | grep -E "(Mem|Swap)"
echo

echo "=== Docker Container Resources ==="
docker stats shadowcheck_postgres --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
echo

echo "=== PostgreSQL Performance ==="
if docker exec shadowcheck_postgres pg_isready -U shadowcheck -d shadowcheck >/dev/null 2>&1; then
    echo "PostgreSQL Status: RUNNING"
    echo "Active Connections:"
    docker exec shadowcheck_postgres psql -U shadowcheck -d shadowcheck -t -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' '
    echo "Database Size:"
    docker exec shadowcheck_postgres psql -U shadowcheck -d shadowcheck -t -c "SELECT pg_size_pretty(pg_database_size('shadowcheck'));" 2>/dev/null | tr -d ' '
else
    echo "PostgreSQL Status: NOT RUNNING"
fi
echo

echo "=== Storage I/O ==="
iostat -x 1 1 | grep -E "(Device|sd|nvme)" | head -10
echo

echo "=== Network Usage ==="
ss -tuln | grep :5432
echo
EOF

    chmod +x monitor_performance.sh
    success "Performance monitoring script created: ./monitor_performance.sh"
}

# Setup hugepages for better memory performance
setup_hugepages() {
    log "Setting up hugepages for PostgreSQL performance..."

    # Calculate hugepages needed (for 4GB shared_buffers)
    hugepage_size=$(grep Hugepagesize /proc/meminfo | awk '{print $2}')
    if [ "$hugepage_size" -eq 2048 ]; then
        # 2MB hugepages: need 2048 pages for 4GB
        hugepages_needed=2048
        echo "vm.nr_hugepages = $hugepages_needed" | sudo tee -a /etc/sysctl.d/99-shadowcheck-postgresql.conf
        sudo sysctl vm.nr_hugepages=$hugepages_needed
        success "Hugepages configured: $hugepages_needed pages of 2MB"
    else
        warn "Hugepage size not 2MB, skipping hugepage optimization"
    fi
}

# Create backup directory with proper permissions
setup_backup_directory() {
    log "Setting up backup directory..."

    mkdir -p backups
    chmod 750 backups

    # Create backup rotation script
    cat > backup_rotate.sh << 'EOF'
#!/bin/bash
# Backup rotation for ShadowCheck

BACKUP_DIR="./backups"
KEEP_DAYS=30

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "*.sql" -type f -mtime +$KEEP_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$KEEP_DAYS -delete

echo "Backup rotation completed. Removed files older than $KEEP_DAYS days."
EOF

    chmod +x backup_rotate.sh
    success "Backup directory and rotation script created"
}

# Restart required services
restart_services() {
    log "Restarting Docker service..."

    sudo systemctl restart docker
    sleep 5

    if sudo systemctl is-active docker >/dev/null; then
        success "Docker service restarted successfully"
    else
        error "Failed to restart Docker service"
        exit 1
    fi
}

# Verify optimizations
verify_optimizations() {
    log "Verifying system optimizations..."

    echo "=== Current System Configuration ==="
    echo "Kernel Parameters:"
    sysctl vm.swappiness vm.dirty_ratio kernel.shmmax | head -3
    echo

    echo "Docker Status:"
    sudo systemctl is-active docker
    echo

    echo "Available Memory:"
    free -h | grep Mem
    echo

    echo "CPU Information:"
    lscpu | grep -E "(Model name|CPU\(s\)|Thread|MHz)"
    echo

    echo "Storage Information:"
    lsblk -f | grep -E "(NAME|sd|nvme)"
    echo

    success "System optimization verification completed"
}

# Main optimization function
main() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "  ShadowCheck System Optimization"
    echo "  Ryzen 5 + 16GB RAM + Parrot OS Bare Metal"
    echo "=================================================="
    echo -e "${NC}"

    check_root
    optimize_kernel
    optimize_docker
    setup_user_limits
    optimize_io_scheduler
    setup_hugepages
    create_monitoring_script
    setup_backup_directory
    restart_services
    verify_optimizations

    echo
    success "System optimization completed!"
    echo
    warn "IMPORTANT: Please reboot your system to ensure all optimizations take effect."
    echo
    log "After reboot, you can:"
    echo "1. Run './monitor_performance.sh' to check system performance"
    echo "2. Deploy ShadowCheck database: './deploy_secure.sh'"
    echo "3. Monitor database performance with Docker stats"
    echo
    log "Optimization summary:"
    echo "✓ Kernel parameters tuned for database workload"
    echo "✓ Docker daemon optimized for PostgreSQL"
    echo "✓ I/O scheduler optimized for SSD performance"
    echo "✓ Memory management improved (hugepages, swappiness)"
    echo "✓ Network stack optimized"
    echo "✓ User limits increased for database operations"
    echo
}

# Handle script arguments
case "${1:-}" in
    "verify")
        verify_optimizations
        ;;
    "monitor")
        if [ -f "./monitor_performance.sh" ]; then
            ./monitor_performance.sh
        else
            error "Performance monitoring script not found. Run optimization first."
        fi
        ;;
    *)
        main
        ;;
esac