SCRIPT_DIR=$(dirname "$0")

cd "$SCRIPT_DIR/.." || exit

if [ ! -d "volumes" ]; then
  mkdir "volumes"
fi

cd volumes || exit

if [ ! -d "uploads" ]; then
  mkdir "uploads"
fi

if [ ! -d "note-buckets" ]; then
  mkdir "note-buckets"
fi
