#!/usr/bin/env bash
#
# Start the todo app on your own machine.
#
# Checks that everything the app needs is in place before starting it, so a
# missing tool or a skipped install gives you a sentence to read instead of a
# stack trace.
#
#   ./start.sh                              start the app on http://localhost:3000
#   ./start.sh --mongodb-uri '<ATLAS_URI>'  provide a MongoDB Atlas connection string to use in .env
#   ./start.sh --dev                        restart automatically when you save a file
#   ./start.sh --port 4000                  listen somewhere other than port 3000
#   ./start.sh --help                       show this message
#
# This is for development. On a server, systemd starts the app instead --
# see deploy/setup-ec2.sh and deploy/todo-app.service.
#
# Works on macOS and Linux.

# Bash "strict mode": stop on the first error (-e), stop on an undefined
# variable (-u), and let a failure anywhere in a pipeline fail the whole
# pipeline (-o pipefail). Without these, a script keeps going after a step
# fails and leaves you guessing about what went wrong.
set -euo pipefail

# The package.json "engines" field asks for this too. Keep the two in step.
REQUIRED_NODE_MAJOR=20

DEV_MODE="false"
PORT_OVERRIDE=""
MONGODB_URI_OVERRIDE=""

# --- helpers ----------------------------------------------------------------

say() {
    printf '==> %s\n' "$1"
}

die() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}

usage() {
    # Print this file's own comment block as the help text, so the help and the
    # documentation can never drift apart.
    awk 'NR>1 { if (/^#/) { sub(/^# ?/, ""); print } else { exit } }' "$0"
    exit 0
}

# --- options ----------------------------------------------------------------

# getopts (the shell builtin) only handles single-letter flags, so the long
# options are parsed by hand. Do NOT reach for the `getopt` command instead:
# macOS ships an old BSD version that does not support them either.
while [ $# -gt 0 ]; do
    case "$1" in
        -d|--dev)
            DEV_MODE="true"
            shift
            ;;
        -p|--port)
            [ $# -ge 2 ] || die "--port needs a number, for example: --port 4000"
            # Check it here, before the script does any real work. Failing on
            # bad input after a two-minute npm install is just rude.
            case "$2" in
                ''|*[!0-9]*) die "--port needs a number, got '$2'" ;;
            esac
            PORT_OVERRIDE="$2"
            shift 2
            ;;
        -m|--mongodb-uri)
            [ $# -ge 2 ] || die "--mongodb-uri needs a URI, for example: --mongodb-uri mongodb+srv://user:password@host:port/database"
            case "$2" in
                ''|*[![:print:]]*) die "--mongodb-uri needs a valid URI, got '$2'" ;;
            esac
            MONGODB_URI_OVERRIDE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            die "unknown option '$1' (try --help)"
            ;;
    esac
done

# Run from the project root no matter where this script was called from.
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# --- checks -----------------------------------------------------------------

command -v node >/dev/null 2>&1 \
    || die "Node.js is not installed. Get it from https://nodejs.org (version ${REQUIRED_NODE_MAJOR} or newer)."

# Let Node compare its own version rather than parsing version strings in bash.
if ! node -e "process.exit(Number(process.versions.node.split('.')[0]) >= ${REQUIRED_NODE_MAJOR} ? 0 : 1)"; then
    die "Node $(node --version) is too old. This app needs version ${REQUIRED_NODE_MAJOR} or newer."
fi

command -v npm >/dev/null 2>&1 || die "npm is not installed, but Node.js is. Reinstall Node from https://nodejs.org."

[ -f package.json ] || die "no package.json here. Run this script from inside the project folder."

# --- generate env -----------------------------------------------------------

if [ ! -f .env ]; then
    say "Creating .env file from template..."
    cp .env.example .env

    say ".env file initialized successfully."
else
    say "Existing .env file detected. Skipping baseline template generation."
fi
    
# Swap the template placeholder for the resolved MONGO_URI_OVERRIDE variable.
# (Using | as a separator instead of / so the slashes in the URI don't break sed)
if [ -n "$MONGODB_URI_OVERRIDE" ]; then

    if grep -q "<ATLAS_URI>" .env; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|<ATLAS_URI>|$MONGODB_URI_OVERRIDE|g" .env
        else
            sed -i "s|<ATLAS_URI>|$MONGODB_URI_OVERRIDE|g" .env
        fi
    elif grep -q "^MONGODB_URI=" .env; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^MONGODB_URI=.*|MONGODB_URI=$MONGODB_URI_OVERRIDE|g" .env
        else
            sed -i "s|^MONGODB_URI=.*|MONGODB_URI=$MONGODB_URI_OVERRIDE|g" .env
        fi
    else
        printf '\nMONGODB_URI="%s"\n' $MONGODB_URI_OVERRIDE >> .env
    fi

    say "Configured .env MongoDB URI"
else
    if grep -q "<ATLAS_URI>" .env; then
        say "WARNING: No MongoDB URI override provided. Please edit the .env file to set MONGODB_URI. THE SERVER START WILL FAIL UNTIL A CONNECTION STRING IS PROVIDED."
    fi
fi

# If an explicit port override was provided by the user, inject it too
if [ ! -z "$PORT_OVERRIDE" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^PORT=.*|PORT=$PORT_OVERRIDE|g" .env
    else
        sed -i "s|^PORT=.*|PORT=$PORT_OVERRIDE|g" .env
    fi
    say "Configured .env server port to: $PORT_OVERRIDE"
fi

# Install dependencies on the first run, and again when they change (which is
# what happens right after a git pull).
#
# The marker to compare against is node_modules/.package-lock.json, which npm
# writes at the end of every install. Comparing against the node_modules
# directory itself does not work: npm often leaves its timestamp alone, so the
# check would fire on every single run.
#
# MERN stack separates client and server, so we have to install dependencies
# in both.

install_dependencies() {
    local dir="$1"
    local install_marker="${dir}/node_modules/.package-lock.json"

    if [ ! -d "${dir}/node_modules" ]; then
        say "Installing dependencies (this happens once, and takes a moment)"
        (cd "$dir" && npm install)
    elif [ ! -f "$install_marker" ] || [ "${dir}/package-lock.json" -nt "$install_marker" ]; then
        say "Dependencies changed since your last install, updating them"
        (cd "$dir" && npm install)
    fi
}

install_dependencies "."
[ -d "client" ] && install_dependencies "client"
[ -d "server" ] && install_dependencies "server"

# --- start ------------------------------------------------------------------

# PORT is read by server/server.js. Exporting it here is the same mechanism
# systemd uses on the EC2 server, just with a different value.
if [ -n "$PORT_OVERRIDE" ]; then
    export PORT="$PORT_OVERRIDE"
fi

PORT_IN_USE="${PORT_OVERRIDE:-3000}"
say "Starting on http://localhost:${PORT_IN_USE} -- press Ctrl+C to stop"

if [ "$DEV_MODE" = "true" ]; then
    say "Dev mode: the server restarts when you save a file"
    # exec replaces this shell with node, so Ctrl+C reaches node directly
    # instead of killing this wrapper and orphaning the server.
    exec npm run dev
else
    say "Building client..."
    npm run build --prefix client

    exec node server/server.js
fi