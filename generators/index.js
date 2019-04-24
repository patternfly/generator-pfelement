const Generator = require("yeoman-generator");

const _ = require("lodash");

const mkdirp = require("mkdirp");
const fs = require("fs");
const path = require("path");
const process = require("process");
const config = require('better-config');

const util = require("util");
const chalk = require("chalk");
const yosay = require("yosay");
const asciify = require("asciify");

const packageJson = require("../package.json");

let isPfelement = false;
let demoTemplatePath;
let readmePath;

// Check for a config file to look for defaults
if(fs.existsSync("../project.config.json")) {
  config.set("../project.config.json");
}

module.exports = class extends Generator {
  constructor(args, opts) {
      super(args, opts);

      this.option("type", {
          desc: "The element type, either 'standalone' or 'pfelement'.  Standalone elements will have all build tooling included, whereas 'pfelement' elements will expect to get their build tooling from the PatternFly Elements monorepo.",
          type: (val) => {
              if (!["standalone", "pfelement"].includes(val)) {
                  throw new Error("Type must be either 'standalone' or 'pfelement'");
              }
              return val;
          },
          alias: "t",
          default: "standalone"
      });
  }

  async prompting() {
    const done = this.async();
    // @TODO this is not rendering in the right order
    // asciify("PatternFly Elements", { font: "standard", color: "gray" }, (err, res) => this.log("\n" + res + "\n\n"));
    this.log( yosay(`Welcome to the ${ chalk.red( "PatternFly Elements" ) } generator!`) );

    this.prompt([
      {
        type: "list",
        name: "type",
        message: "What would you like to create?",
        choices: [
          {
            name: "A new PFElement in the core PatternFly Elements library",
            value: "pfelement"
          },
          {
            name: "A standalone web component that extends PFElement",
            value: "standalone"
          }
        ],
        default: this.options.type,
        when: () => !this.options.type
      },
      {
        type: "list",
        name: "template_type",
        message: "What would you like to create?",
        choices: [ "component", "container", "combo" ],
        default: "component"
      },
      {
        type: "input",
        name: "name",
        message: "Element name (i.e. pfe-card)",
        validate: function(answer) {
            let parts = _.words(answer);
            if (answer.length < 1) {
                return "I get it, naming is hard; but it must have a name. You can always change it later.";
            } else if (parts.length < 2) {
              return "Elements should always have at least two parts. Check that you included the prefix for the name; for example, pfe-cta.";
            } else {
              return true;
            }
        },
        filter: function(response) {
          // Ensure it is passed to the results in kebab case
          return _.kebabCase(response);
        }
      },
      {
        type: "input",
        name: "author",
        message: "Author name",
        when: function(answers) {
          // Check that it doesn't exist in the default config first
          return typeof config.author === "undefined";
        }
      },
      {
        type: "confirm",
        name: "useSass",
        message: "Do you want to use Sass with this element?",
        when: function(answers) {
          // Check that it doesn't exist in the default config first
          return typeof config.useSass === "undefined";
        }
      },
      {
        type: "list",
        name: "sassLibrary",
        when: answers => {
          return answers.useSass; // && !config.has("sassLibrary")
        },
        message: "Do want to use existing Sass dependencies?",
        choices: [
          {
            name: "pfe-sass",
            value: {
              pkg: "@patternfly/pfe-sass",
              path: "pfe-sass/pfe-sass"
            }
          },
          {
            name: "No thanks. I'll provide my own.",
            value: null
          }
        ]
      },
      {
        type: "input",
        name: "description",
        message: "Describe the element's purpose or goal."
      },
      {
        type: "input",
        name: "attributes",
        message: "List any attributes for the element, separated by commas (i.e., color, priority)",
        // validate: function(answer) {},
        filter: function(response) {
          return _.split(response.replace(" ", ""), ",");
        }
      },
      {
        type: "input",
        name: "slots",
        message: "List any slot names for the element, separated by commas (i.e., header, footer)",
        // validate: function(answer) {},
        filter: function(response) {
          return _.split(response.replace(" ", ""), ",");
        }
      }
    ]).then(answers => {
      let name = "";
      // Trim prefixing of the name
      answers.name.split("-").forEach(part => {
        if (part !== "pfe") {
          name += part + " ";
        }
      });
      // Trim the whitespace
      name = name.trim();

      const { version: pfelementVersion } = fs.existsSync(
        this.destinationPath("pfelement/package.json")
      )
        ? require(this.destinationPath("pfelement/package.json"))
        : "";
      const { version: pfeSassVersion } = fs.existsSync(
        this.destinationPath("pfe-sass/package.json")
      )
        ? require(this.destinationPath("pfe-sass/package.json"))
        : "";

      isPfelement = answers.type === "pfelement";
      demoTemplatePath = isPfelement
        ? "demo/pfelement-index.html"
        : "demo/standalone-index.html";
      readmePath = isPfelement
        ? "./pfelement-README.md"
        : "./standalone-README.md";
      const pfeElementLocation = isPfelement
        ? "../pfelement/pfelement.js"
        : "../@patternfly/pfelement/pfelement.js";
      const packageName = isPfelement
        ? `@patternfly/${answers.name}`
        : `${answers.name}`;
      const gulpFactoryLocation = isPfelement
        ? "../../scripts/gulpfile.factory.js"
        : "./scripts/gulpfile.factory.js";
      const rollupConfigLocation = isPfelement
        ? "../../scripts/rollup.config.factory.js"
        : "./scripts/rollup.config.factory.js";
      const testFileLocation = isPfelement
        ? `../${answers.name}.js`
        : `../node_modules/${answers.name}/${answers.name}.js`;

      this.props = {
        _: _,
        author: answers.author,
        template_type: answers.template_type,
        name: answers.name,
        elementName: answers.name,
        elementClassName: _
          .chain(answers.name)
          .camelCase()
          .upperFirst()
          .value(),
        readmeName: _.upperFirst(name),
        lowerCaseName: name,
        camelCaseName: _.camelCase(answers.name),
        useSass: answers.useSass,
        sassLibraryPkg: false,
        sassLibraryLocation: false,
        generatorPfelementVersion: packageJson.version,
        pfelementVersion,
        pfeSassVersion,
        pfeElementLocation: pfeElementLocation,
        isPfelement: isPfelement,
        packageName: packageName,
        gulpFactoryLocation: gulpFactoryLocation,
        rollupConfigLocation: rollupConfigLocation,
        attributes: answers.attributes,
        slots: answers.slots,
        testFileLocation: testFileLocation
      };

      if (answers.useSass) {
        if (answers.sassLibrary && answers.sassLibrary.pkg) {
          this.props.sassLibraryPkg = answers.sassLibrary.pkg;
        }

        if (answers.sassLibrary && answers.sassLibrary.path) {
          this.props.sassLibraryLocation = isPfelement
            ? "../../pfe-sass/pfe-sass"
            : "../node_modules/@patternfly/pfe-sass/pfe-sass";
        }
      }

      mkdirp.sync(this.props.elementName);
      done();
    });
  }

  writing() {
    try {
      if (fs.existsSync(this.templatePath("package.json"))) {
        this.fs.copyTpl(
          this.templatePath("package.json"),
          this.destinationPath(`${this.props.elementName}/package.json`),
          this.props
        );
      }

      if (fs.existsSync(this.templatePath("src/element.js"))) {
        this.fs.copyTpl(
          this.templatePath("src/element.js"),
          this.destinationPath(
            `${this.props.elementName}/src/${this.props.elementName}.js`
          ),
          this.props
        );
      }

    if (fs.existsSync(this.templatePath(readmePath))) {
      this.fs.copyTpl(
        this.templatePath(readmePath),
        this.destinationPath(`${this.props.elementName}/README.md`),
        this.props
      );
    }

      if (fs.existsSync(this.templatePath("gulpfile.js"))) {
        this.fs.copyTpl(
          this.templatePath("gulpfile.js"),
          this.destinationPath(`${this.props.elementName}/gulpfile.js`),
          this.props
        );
      }

      if (fs.existsSync(this.templatePath("rollup.config.js"))) {
        this.fs.copyTpl(
          this.templatePath("rollup.config.js"),
          this.destinationPath(`${this.props.elementName}/rollup.config.js`),
          this.props
        );
      }

    if (fs.existsSync(this.templatePath(demoTemplatePath))) {
      this.fs.copyTpl(
        this.templatePath(demoTemplatePath),
        this.destinationPath(`${this.props.elementName}/demo/index.html`),
        this.props
      );
    }

      if (fs.existsSync(this.templatePath("test/element_test.html"))) {
        this.fs.copyTpl(
          this.templatePath("test/element_test.html"),
          this.destinationPath(
            `${this.props.elementName}/test/${this.props.elementName}_test.html`
          ),
          this.props
        );
      }

      if (fs.existsSync(this.templatePath("test/index.html"))) {
        this.fs.copyTpl(
          this.templatePath("test/index.html"),
          this.destinationPath(`${this.props.elementName}/test/index.html`),
          this.props
        );
      }

    if (isPfelement) {
      if (fs.existsSync(this.templatePath("src/element.story.js"))) {
        this.fs.copyTpl(
          this.templatePath("src/element.story.js"),
          this.destinationPath(
            `${this.props.elementName}/src/${this.props.elementName}.story.js`
          ),
          this.props
        );
      }
    }

      this.fs.copy(
        this.templatePath(".*"),
        this.destinationPath(`${this.props.elementName}`)
    );

      if (fs.existsSync(this.templatePath("LICENSE.txt"))) {
        this.fs.copy(
          this.templatePath("LICENSE.txt"),
          this.destinationPath(`${this.props.elementName}/LICENSE.txt`)
        );
      }

      if (
        this.props.useSass &&
        fs.existsSync(this.templatePath("src/element.scss"))
      ) {
        this.fs.copyTpl(
          this.templatePath("src/element.scss"),
          this.destinationPath(
            `${this.props.elementName}/src/${this.props.elementName}.scss`
        ),
          this.props
        );
      } else if (fs.existsSync(this.templatePath("src/element.css"))) {
        this.fs.copy(
          this.templatePath("src/element.css"),
          this.destinationPath(
            `${this.props.elementName}/src/${this.props.elementName}.css`
        )
      );
      }

      if (fs.existsSync(this.templatePath("src/element.html"))) {
        this.fs.copy(
          this.templatePath("src/element.html"),
          this.destinationPath(
            `${this.props.elementName}/src/${this.props.elementName}.html`
          )
        );
      }
    }

    if (!isPfelement) {
      this.fs.copy(
        this.templatePath("scripts/*"),
        this.destinationPath(`${this.props.elementName}/scripts`)
      );

      this.fs.copy(
        this.templatePath("wct.conf.json"),
        this.destinationPath(`${this.props.elementName}/wct.conf.json`)
      );
    }
    catch ( error ) {
      console.log( error );
      console.log( "//------ Properties set by yeoman:\n" );
      console.log( util.inspect( this.props, { showHidden: false, depth: 4 } ) );
      console.log( "-------------------------------------------//\n" );
    }
  }

  install() {
    process.chdir(this.props.elementName);

    this.installDependencies({
      npm: true,
      bower: false,
      yarn: false
    });
  }

  end() {
    this.spawnCommand("npm", ["run", "build"]);
  }
};
