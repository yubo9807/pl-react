npm run build:lib
# npm run build:online &&

cd lib
npm config set registry https://registry.npmjs.org/
npm publish
npm config set registry https://registry.npmmirror.com/

VERSION="v$(npm view ./ version)"
cd ..

git add .
git commit -m "chore: version $VERSION"
git tag $VERSION
git push origin $VERSION
