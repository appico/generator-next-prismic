const AcceptLanguageParser = require('accept-language-parser')
const { languages } = require('../constants')
const chalk = require('chalk')

/*
 * GET LANGUAGE FROM the PATH
 * First checking the language preference from the user
 */
module.exports.getLangFromPathHelper = (pathname, req, acceptLang) => {
  // Try to find the proper language
  try {
    let lang = pathname.split('/')[1]

    if (!lang || !languages.includes(lang)) {
      // Check for user's langauge preference
      const acceptLanguage = acceptLang
        ? acceptLang
        : req && req.headers && req.headers['accept-language']
        ? req.headers['accept-language']
        : null
      let preferedLang
      if (acceptLanguage) {
        const preferedLangList = AcceptLanguageParser.parse(acceptLanguage)
        preferedLang =
          preferedLangList &&
          preferedLangList.length &&
          preferedLangList[0].quality >= 1
            ? preferedLangList[0].code
            : null
      }
      // Chose the most appropiate language
      lang = languages.includes(preferedLang) ? preferedLang : languages[0]
    }

    return lang
  } catch (e) {
    console.log(`Document: error find language :${e}`, pathname)
    return languages[0]
  }
}

// If language not in the url we add it
module.exports.addLangIfNotInUrl = (url, userLang) => {
  let hasLang = false
  for (let lang of languages) {
    if (url.startsWith(`/${lang}`)) {
      hasLang = true
    }
  }
  if (!hasLang) {
    return `/${userLang}${url}`
  }
  return url
}

// Simple LOGGING when NOT in PRODUCTION enviroment
module.exports.log = content => {
  if (process.env.NODE_ENV !== 'production' || process.env.EXPORT) {
    console.log(content)
  }
}

// Simple ERROR LOGGING (also on production)
module.exports.logError = content => {
  console.log(`${chalk.red(content)} ${chalk.grey(`at ${new Date()}`)} `)
}

/**
 * Helper function for searching for a key for a given value
 */
module.exports.getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value)
}
