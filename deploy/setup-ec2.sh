#!/usr/bin/env bash
#
# One-time setup for a fresh EC2 instance.
#
# Copy this whole deploy/ folder to the server and run it once as root:
#
#   scp -i mykey.pem -r deploy ubuntu@<PUBLIC-IP>:~
#   ssh -i mykey.pem ubuntu@<PUBLIC-IP>
#
# (On Amazon Linux the login user is ec2-user instead of ubuntu.)
#   sudo bash deploy/setup-ec2.sh
#
# It installs Node.js and nginx, creates the service account and directories,
# and registers the app with systemd so it starts on boot. After this, use
# deploy/deploy.sh from your laptop to push code.
#
# Works on Amazon Linux 2023 and on Ubuntu 22.04/24.04.

# Bash "strict mode": stop on the first error (-e), stop on an undefined
# variable (-u), and make a failing command inside a pipeline fail the whole
# pipeline (-o pipefail). Without these a script happily keeps going after a
# step fails and leaves you with a half configured server.
set -euo pipefail

APP_NAME="canvas-desk"
APP_DIR="/opt/canvas-desk"
APP_USER="desk-user"
NODE_MAJOR="22"

# The directory this script lives in, so it can find the files next to it no
# matter where it was called from.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# The human who ran `sudo`. They get write access to APP_DIR so that rsync from
# a laptop works without sudo on the far end.
DEPLOY_USER="${SUDO_USER:-root}" 

# --- helpers ----------------------------------------------------------------

# Print a step heading so the output is easy to follow.
say() {
    printf '\n==> %s\n' "$1"
}

die() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}

# --- checks -----------------------------------------------------------------

[ "$(id -u)" -eq 0 ] || die "run this with sudo: sudo bash $0"

# /etc/os-release exists on every modern Linux and tells us which distro we are
# on. We need to know because Amazon Linux uses dnf and Ubuntu uses apt.
[ -r /etc/os-release ] || die "cannot read /etc/os-release; unsupported system"
# shellcheck disable=SC1091
. /etc/os-release

case "${ID:-}" in
    amzn|rhel|centos|fedora)
        PKG="dnf"
        ;;
    ubuntu|debian)
        PKG="apt"
        export DEBIAN_FRONTEND=noninteractive
        ;;
    *)
        die "unsupported distribution '${ID:-unknown}'; expected Amazon Linux or Ubuntu"
        ;;
esac

say "Detected ${PRETTY_NAME:-$ID} (package manager: $PKG)"

# --- packages ---------------------------------------------------------------

say "Installing Node.js ${NODE_MAJOR} and nginx"

if [ "$PKG" = "dnf" ]; then
    dnf -y update
    # NodeSource publishes newer Node versions than the distro repositories do.
    curl -fsSL "https://rpm.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    dnf -y install nodejs nginx rsync
else
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg rsync
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    apt-get install -y nodejs nginx
fi

say "Node $(node --version), npm $(npm --version)"

# --- service account and directories ----------------------------------------

say "Creating the '$APP_USER' service account"

# id fails when the user does not exist, which is how we test for it. The app
# never needs to log in, so it gets no shell and no home directory.
if ! id "$APP_USER" >/dev/null 2>&1; then
    useradd --system --no-create-home --shell /usr/sbin/nologin "$APP_USER"
else
    echo "user '$APP_USER' already exists, leaving it alone"
fi

say "Creating $APP_DIR"

mkdir -p "$APP_DIR"

# The person deploying owns the code directory so they can rsync into it.
chown -R "$DEPLOY_USER:$APP_USER" "$APP_DIR"
chmod 750 "$APP_DIR"

# --- environment variables --------------------------------------------------

say "Configuring .env file"

ENV_FILE="$APP_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    # Prompt interactively for the MongoDB connection string during setup (Once database can be connected)
    # read -rp "Enter your production MONGO_URI: " INPUT_MONGO_URI

#     cat <<EOF > "$ENV_FILE"
# PORT=3000
# MONGO_URI=${INPUT_MONGO_URI}
# EOF

    cat <<EOF > "$ENV_FILE"
PORT=3000
EOF

    # Restrict permissions so only the deployment user and app group can read secrets
    chown "$DEPLOY_USER:$APP_USER" "$ENV_FILE"
    chmod 640 "$ENV_FILE"

    say "Successfully created $ENV_FILE"
else
    echo "$ENV_FILE already exists, skipping creation."
fi

# --- systemd ----------------------------------------------------------------

say "Installing the $APP_NAME systemd service"

install -m 644 "$SCRIPT_DIR/canvas-desk.service" "/etc/systemd/system/${APP_NAME}.service"
systemctl daemon-reload
systemctl enable "$APP_NAME"

# --- nginx ------------------------------------------------------------------

say "Configuring nginx as a reverse proxy on port 80"

install -m 644 "$SCRIPT_DIR/nginx-desk.conf" "/etc/nginx/conf.d/${APP_NAME}.conf"

# Ubuntu ships a default site that also claims port 80. Two default servers on
# one port is an error, so remove theirs.
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm -f /etc/nginx/sites-enabled/default
fi

# On SELinux systems nginx is not allowed to open network connections (and so
# cannot proxy to Node) until this switch is flipped.
if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" != "Disabled" ]; then
    setsebool -P httpd_can_network_connect 1 || true
fi

# Always check the config before restarting: a typo here takes the site down.
nginx -t
systemctl enable nginx
systemctl restart nginx

# --- firewall ---------------------------------------------------------------

# EC2 security groups are the firewall that matters, but Ubuntu images sometimes
# have ufw switched on as well.
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
    say "Opening ports 80 and 22 in ufw"
    ufw allow 80/tcp
    ufw allow 22/tcp
fi

# --- done -------------------------------------------------------------------

cat <<EOF

==> Server setup is complete.

The app is registered but not running yet, because no code has been deployed.
From your laptop, in the project folder, run:

    ./deploy/deploy.sh -h <PUBLIC-IP-OR-DNS> -i ~/path/to/key.pem

Then open http://<PUBLIC-IP> in a browser.

Make sure your EC2 security group allows inbound TCP port 80 from 0.0.0.0/0
and port 22 from your own IP address.

Handy commands on this server:
    sudo systemctl status $APP_NAME
    journalctl -u $APP_NAME -f
    sudo systemctl restart $APP_NAME

EOF
