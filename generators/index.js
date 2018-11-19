const Generator = require("yeoman-generator");

const _ = require("lodash");

const mkdirp = require("mkdirp");
const path = require("path");
const process = require("process");
const config = require('better-config');

const util = require("util");
const chalk = require("chalk");
const yosay = require("yosay");
const fs = require("fs");

const packageJson = require("../package.json");

// Check for a config file to look for defaults
if(fs.existsSync("../project.config.json")) {
  config.set("../project.config.json");
}

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user
    this.log(" ___  _  _   ___  _                        _   \n| _ \\| || | | __|| | ___  _ __   ___  _ _ | |_ \n|   /| __ | | _| | |/ -_)| '  \\ / -_)| ' \\|  _|\n|_|_\\|_||_| |___||_|\\___||_|_|_|\\___||_||_|\\__|");

    return this.prompt([
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
        message: "Element name (i.e. rh-card)",
        validate: function(answer) {
            let parts = _.words(answer);
            if (answer.length < 1) {
                return "I get it, naming is hard; but it must have a name. You can always change it later.";
            } else if (parts.length < 2) {
              return "Elements should always have at least two parts. Check that you included the prefix for the name; for example, rh-cta.";
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
          return answers.useSass && !config.has(sassLibrary);
        },
        message: "Do want to use existing Sass dependencies?",
        choices: [
          {
            name: "rh-sass",
            value: {
              pkg: "@rhelements/rh-sass",
              path: "rh-sass/rh-sass"
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
        name: "attributes",
        message: "List any attributes for the element, separated by commas (i.e., color, priority)",
        // validate: function(answer) {},
        filter: function(response) {
          return _.split(response, ",");
        }
      },
      {
        type: "input",
        name: "slots",
        message: "List any slot names for the element, separated by commas (i.e., header, footer)",
        // validate: function(answer) {},
        filter: function(response) {
          return _.split(response, ",");
        }
      }
    ]).then(answers => {
      let name = "";
      answers.name.split("-").forEach(part => {
        if (part !== "rh") {
          name += part + " ";
        }
      });
      // Trim the whitespace
      name = name.trim();

      const { version: rhelementVersion } = require(this.destinationPath(
        "rhelement/package.json"
     ));

      const { version: rhSassVersion } = require(this.destinationPath(
        "rh-sass/package.json"
     ));

      this.props = {
        author: answers.author,
        name: answers.name,
        elementName: answers.name,
        elementClassName: _.chain(answers.name)
          .camelCase()
          .upperFirst()
          .value(),
        readmeName: _.upperFirst(name),
        lowerCaseName: name,
        camelCaseName: _.camelCase(answers.name),
        useSass: answers.useSass,
        sassLibraryPkg: false,
        sassLibraryPath: false,
        generatorRhelementVersion: packageJson.version,
        rhelementVersion,
        rhSassVersion,
        attributes: answers.attributes,
        slots: answers.slots
      };

      if (answers.useSass) {
        if (answers.sassLibrary && answers.sassLibrary.pkg) {
          this.props.sassLibraryPkg = answers.sassLibrary.pkg;
        }

        if (answers.sassLibrary && answers.sassLibrary.path) {
          this.props.sassLibraryPath = answers.sassLibrary.path;
        }
      }

      mkdirp.sync(this.props.elementName);
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath("package.json"),
      this.destinationPath(`${this.props.elementName}/package.json`),
      this.props
   );

    this.fs.copyTpl(
      this.templatePath("src/element.js"),
      this.destinationPath(
        `${this.props.elementName}/src/${this.props.elementName}.js`
     ),
      this.props
   );

    this.fs.copyTpl(
      this.templatePath("README.md"),
      this.destinationPath(`${this.props.elementName}/README.md`),
      this.props
   );

    this.fs.copyTpl(
      this.templatePath("gulpfile.js"),
      this.destinationPath(`${this.props.elementName}/gulpfile.js`),
      this.props
   );

    this.fs.copyTpl(
      this.templatePath("rollup.config.js"),
      this.destinationPath(`${this.props.elementName}/rollup.config.js`),
      this.props
   );

    this.fs.copyTpl(
      this.templatePath("demo/index.html"),
      this.destinationPath(`${this.props.elementName}/demo/index.html`),
      this.props
   );

    this.fs.copyTpl(
      this.templatePath("test/element_test.html"),
      this.destinationPath(
        `${this.props.elementName}/test/${this.props.elementName}_test.html`
     ),
      this.props
   );

    this.fs.copyTpl(
      this.templatePath("test/index.html"),
      this.destinationPath(`${this.props.elementName}/test/index.html`),
      this.props
   );

    this.fs.copyTpl(
      this.templatePath("element.story.js"),
      this.destinationPath(
        `${this.props.elementName}/${this.props.elementName}.story.js`
     ),
      this.props
   );

    this.fs.copy(
      this.templatePath(".*"),
      this.destinationPath(`${this.props.elementName}`)
   );

    this.fs.copy(
      this.templatePath("LICENSE.txt"),
      this.destinationPath(`${this.props.elementName}/LICENSE.txt`)
   );

    if (this.props.useSass) {
      this.fs.copyTpl(
        this.templatePath("src/element.scss"),
        this.destinationPath(
          `${this.props.elementName}/src/${this.props.elementName}.scss`
       ),
        this.props
     );
    } else {
      this.fs.copy(
        this.templatePath("src/element.css"),
        this.destinationPath(
          `${this.props.elementName}/src/${this.props.elementName}.css`
       )
     );
    }

    this.fs.copy(
      this.templatePath("src/element.html"),
      this.destinationPath(
        `${this.props.elementName}/src/${this.props.elementName}.html`
     )
   );
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
