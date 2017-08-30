cd modules
for d in `find . -mindepth 1 -maxdepth 1 -type d`
do
  echo "packing $d into $d.asar"
  asar p $d $d.asar
done
cd ..
cd builds/electron-test-player-as-submodule-linux-x64/
rm -rf resources/modules
mkdir -p resources/modules
cp ../../modules/*.asar resources/modules
