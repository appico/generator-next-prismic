'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')

const { fixDotfiles } = require('./fix-dotfiles')

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts)

    // This makes `websiteName` a possible argument
    this.argument('websiteName', { type: String, required: false })
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to our ${chalk.green('next-prismic')} generator!
      
      Let's create your 
      new ${
        this.options.websiteName
          ? chalk.green(
            this.options.websiteName.replace(/\b\w/g, l => l.toUpperCase())
          )
          : ''
        } project`)
    )

    let prompts = []

    // If not websiteName declared then ask for it
    if (!this.options.websiteName || this.options.websiteName.length < 1) {
      prompts = [
        {
          type: 'input',
          name: 'websiteName',
          message: `What is the name of your project? ${chalk.gray(
            "will be the folder's name"
          )}`,
          filter: websiteName => {
            return websiteName
              .toLowerCase()
              .trim()
              .split(' ')
              .join('-')
          }
        }
      ]
    }

    prompts = [
      ...prompts,
      {
        type: 'input',
        name: 'websiteFullName',
        message: `What is the full name of the company/product?`
      },
      {
        type: 'input',
        name: 'websiteDescription',
        message: `And the default description? ${chalk.gray(
          chalk.italic('(It can be changed later in constants)')
        )}`
      },
      {
        type: 'checkbox',
        name: 'languages',
        choices: [{ name: 'de', checked: true }, { name: 'en', checked: true }, { name: 'fr', checked: false }, { name: 'at', checked: false }, { name: 'ch', checked: false }, { name: 'es', checked: false }, { name: 'it', checked: false }, { name: 'nl', checked: false }, { name: 'gr', checked: false }, { name: 'pl', checked: false }, { name: 'cz', checked: false }, { name: 'sk', checked: false }, { name: 'hr', checked: false }, { name: 'ru', checked: false }, { name: 'hu', checked: false }, { name: 'ru', checked: false }, { name: 'sl', checked: false }, { name: 'tr', checked: false }, { name: 'jp', checked: false }, { name: 'kr', checked: false }, { name: 'cn', checked: false }, { name: 'ar', checked: false }, { name: 'br', checked: false }, { name: 'mx', checked: false }, { name: 'au', checked: false }],
        message: `Select the base languages for your project? ${chalk.gray(
          chalk.italic(
            '(If differents languages are needed can be changed later in constants)'
          )
        )}`,
        validate: input => {
          if (input && input.length >= 1) {
            return true
          }

          return 'Select at least one language'
        }
      },
      {
        type: 'list',
        name: 'languageDefault',
        choices: (answers) => {
          return answers.languages
        },
        message: `Select default language for your project`
      },
      {
        type: 'checkbox',
        name: 'baseComponents',
        choices: [
          { name: 'Demo', checked: true },
          { name: 'LazyImg', checked: true },
          { name: 'Portal', checked: true },
          { name: 'Link', checked: true },
          { name: 'Button', checked: true },
          { name: 'Form', checked: false },
          { name: 'GoogleMap', checked: false },
          { name: 'Markdown', checked: true },
          { name: 'MetaData', checked: true },
          { name: 'ContentBlocks', checked: true },
          { name: 'Anims', checked: true },
          { name: 'PageTransitions', checked: false }
        ],
        message: 'Which base React Components you would like to have?'
      },
      {
        type: 'input',
        name: 'primaryColor',
        message: `Primary color for the site? ${chalk.gray(
          chalk.italic(
            '(can be changed later in components/Layout/common/colors.scss)'
          )
        )}`,
        validate: input => {
          const isValidColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input)
          if (isValidColor) {
            return true
          }

          return "That's not a valid hexadecimal color"
        }
      },
      {
        type: 'input',
        name: 'prismicApiURL',
        message: `What is the Prismic API URL for this project? ${chalk.gray(
          chalk.italic('(can be changed later in .env)')
        )}`,
        validate: input => {
          if (input && input.length >= 1) {
            return true
          }

          return 'Prismic API URL is required'
        }
      },
      {
        type: 'input',
        name: 'prismicApiToken',
        message: `What is the Prismic API Token for this project? ${chalk.gray(
          chalk.italic('(can be changed later in .env)')
        )}`,
        validate: input => {
          if (input && input.length >= 1) {
            return true
          }

          return 'Prismic API Token is required'
        }
      },
      {
        type: 'input',
        name: 'websiteURL',
        message: `What about the site's root URL? ${chalk.gray(
          chalk.italic('(It can be changed later in constants)')
        )}`,
        validate: input => {
          if (input && input.length >= 1) {
            return true
          }

          return 'Site root URL is required'
        }
      },
      {
        type: 'input',
        name: 'githubRepoUrl',
        message: `And what's the Github repository URL of the project? ${chalk.gray(
          chalk.italic(
            '(It can be changed later in read.me under Installation)'
          )
        )}`,
        validate: input => {
          if (
            input &&
            input.length >= 1 &&
            input.indexOf('https://github.com/') >= 0
          ) {
            return true
          }

          return 'Add a proper Github repository URL. It should start with https://github.com/'
        }
      }
    ]

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props

      // Reorder languages array to set default language
      if (this.props.languages.indexOf(this.props.languageDefault) > 0) {
        this.props.languages.splice(this.props.languages.indexOf(this.props.languageDefault), 1)
        this.props.languages.unshift(this.props.languageDefault)
      }
    })
  }

  writing() {
    let websiteName =
      !this.options.websiteName || this.options.websiteName.length < 1
        ? this.props.websiteName
        : this.options.websiteName
    websiteName = websiteName
      .toLowerCase()
      .trim()
      .split(' ')
      .join('-')
    this.destinationRoot(websiteName)

    const props = { ...this.props, websiteName }

    // Components
    this.props.baseComponents
      .concat(['Navbar', 'Footer', 'Layout', 'CookieMessage'])
      .map(component => {
        this.fs.copyTpl(
          `${this.templatePath()}/components/${component}/**/*`,
          `${this.destinationPath()}/components/${component}`,
          props
        )
        if (component === 'Anims') {
          this.fs.copyTpl(
            `${this.templatePath()}/components/AnimOnScroll/**/*`,
            `${this.destinationPath()}/components/AnimOnScroll`,
            props
          )
        }
        if (component === 'Form') {
          this.fs.copyTpl(
            `${this.templatePath()}/components/Form/*`,
            `${this.destinationPath()}/components/Form`,
            props
          )
          this.fs.copyTpl(
            `${this.templatePath()}/components/InlineIcons/*`,
            `${this.destinationPath()}/components/InlineIcons`,
            props
          )
          this.fs.copyTpl(
            `${this.templatePath()}/components/ProgressButton/*`,
            `${this.destinationPath()}/components/ProgressButton`,
            props
          )
        }
        return component
      })
    this.fs.copyTpl(
      `${this.templatePath()}/components/index.ts`,
      `${this.destinationPath()}/components/index.ts`,
      props
    )
    // ---

    // Constants, Store, Utils, ...
    this.fs.copyTpl(
      `${this.templatePath()}/generic/**/*`,
      this.destinationPath(),
      props
    )

    // Omit pages/_app.js file if PageTransitions component is not present
    if (!this.props.baseComponents.includes('PageTransitions')) {
      this.fs.delete(`${this.destinationPath()}/pages/_app.tsx`)
    }

    // Files on root. Mainly config files
    this.fs.copyTpl(
      `${this.templatePath()}/config-files/*`,
      this.destinationPath(),
      props
    )
    this.fs.copyTpl(
      `${this.templatePath()}/config-files/.*`,
      this.destinationPath(),
      props
    )

    fixDotfiles(this)
  }

  install() {
    this.installDependencies({
      bower: false
    })
  }
}
