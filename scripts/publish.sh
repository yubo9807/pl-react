npm run build:lib
# npm run build:online &&

REGISTRY="https://registry.npmjs.org/"

# 发布前先校验凭证：npm 对无写权限的 PUT 会返回误导性的 404
if ! npm whoami --registry="$REGISTRY" >/dev/null 2>&1; then
  echo "npmjs 凭证无效，请先更新 token："
  echo "  npm config set //registry.npmjs.org/:_authToken=<新token>"
  exit 1
fi

cd lib
# 只对本次 publish 指定官方源，不改动全局 registry（npmmirror 只读，不能发布）
npm publish --registry="$REGISTRY" "$@"

VERSION="v$(npm view ./ version)"
cd ..

git add .
git commit -m "chore: version $VERSION"
git tag $VERSION
git push origin $VERSION
