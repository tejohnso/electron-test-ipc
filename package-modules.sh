cd modules
for d in `find . -mindepth 1 -type d`
do
  asar p $d $d.asar
done
cd ..
cd builds/electron-test-player-as-submodule-linux-x64/
rm -rf resources/modules
mkdir -p resources/modules
mv ../../modules/*.asar resources/modules
