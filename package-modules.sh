cd modules
for d in `find . -mindepth 1 -maxdepth 1 -type d`
do
  echo "packing $d into $d.asar"
  cd $d
  npm install
  cd ..
  asar p $d $d.asar
done
cd ..
cd builds/electron-test-ipc-linux-x64/
rm -rf resources/modules
mkdir -p resources/modules
cp ../../modules/*.asar resources/modules
