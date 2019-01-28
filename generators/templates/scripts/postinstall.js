const fs = require("fs");
const path = require("path");

const pfelementPackage = require("../package.json");
const elementName = pfelementPackage.pfelement.elementName;
const elementPath = path.join("node_modules", elementName);
const elementFileName = `${elementName}.js`;

if (!fs.existsSync(elementPath)) {
  fs.mkdirSync(elementPath);
  fs.symlinkSync(
    path.join("..", "..", elementFileName),
    path.join(elementPath, elementFileName)
  );
}
