cd ..

if [ -d "volumes" ]; then
    echo "volumes directory already exists"
    exit 1
fi

mkdir "volumes" 
cd volumes || exit
mkdir "uploads"