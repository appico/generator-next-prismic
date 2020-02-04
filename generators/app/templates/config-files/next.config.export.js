const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const prismicApi = require('./server/prismic')
const sitemap = require('./server/sitemap')
const { removeUnnecessaryData } = require('./server/prismic/utils')
const { languages } = require('./constants')
const { initApi, getLanguagesAlternatesURLs } = require('./server/prismic/functionsCommon')

/**
 * Helper function for searching for a key for a given value
 */
const getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value)
}

/**
 * Genrerates sitemap.xml file into static folder
 */
const generateSiteMap = () => {
  sitemap(prismicApi)
}

/**
 * Generates redirection files for home page and language homes
 */
const generateRedirectFiles = outDir => {
  // Iterate through languages and create redirection files
  languages.map((lang, index) => {
    const fileString = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/${lang}/home" /></head><body></body></html>`

    // Create folder for given language
    mkdirp.sync(path.join(outDir, `${lang}`), err => {
      console.log(`Creating dir for lang ${lang} error`, err)
    })

    // Write redirection HTML into file
    fs.writeFile(
      path.join(outDir, `${lang}`, 'index.html'),
      fileString,
      (err, data) => {
        if (err) {
          console.log(`Generating ${lang} lang redirection file error`, err)
        }
      }
    )

    // Root file
    if (index === 0) {
      // Write redirection HTML into root file
      fs.writeFile(path.join(outDir, 'index.html'), fileString, (err, data) => {
        if (err) {
          console.log(`Generating root redirection file error`, err)
        }
      })
    }
  })
  console.log(`Redirection files generated`)
}

const getCommonDocumentsForLang = (lang, commonDocumentsForLangs) => {
  return new Promise((resolve, reject) => {
    prismicApi
      .getDocumentsPage(null, null, lang)
      .then(value => {
        commonDocumentsForLangs[lang] = value
        resolve()
      })
      .catch(e => {
        reject(
          new Error(
            `Export failed while fetching common documents data. Error: ${e}`
          )
        )
      })
  })
}

/**
 * Module's main function which produces path mapping object for next.js
 * export as described at https://github.com/zeit/next.js/#usage
 *
 * Example result object:
 *
 * {
 *   '/de/page': { page: '/main' },
 *   '/de/blog/blog-test': { page: '/blog_detail', query: { blog_id: 'blog-test' } }
 * }
 */
const getMap = async outDir => {
  generateSiteMap()
  generateRedirectFiles(outDir)

  let commonDocumentsForLangs = {}

  await Promise.all(
    languages.map(async lang => {
      await getCommonDocumentsForLang(lang, commonDocumentsForLangs)
      return lang
    })
  )

  return new Promise((resolve, reject) => {
    const promises = []
    let result = {}
    languages.forEach(lang => {
      prismicApi.COMMON_REPEATABLE_DOCUMENTS.forEach(docType => {
        promises.push(
          new Promise((success, failure) => {
            prismicApi.getAllForType(
              null,
              docType,
              prismicApi.LANGS_PRISMIC[lang],
              success,
              failure,
              1
            )
          })
        )
      })
    })

    Promise.all(promises)
      .then(values => {
        values.map(group => {
          group.map(item => {
            if (!item.tags || item.tags.length < 1) return {}

            const lang = getKeyByValue(prismicApi.LANGS_PRISMIC, item.lang)
            const pathPage = item.tags ? item.tags[0] : ''
            const adjustedUID = item.uid
              ? item.uid.replace(/(-(<%- languages.map(lang => `${lang}`).join('|') %>))$/, '')
              : null
            let outPath = `${outDir}/${lang}${pathPage}`

            const fix404 = adjustedUID === '404'

            //Write content file for static prefetch of pages
            //Create export folder for given language
            mkdirp.sync(outPath, err => {
              console.log(`Error generating export dir`, err)
            })

            let data = {
              ...commonDocumentsForLangs[lang],
              ...item.data,
              uid: item.uid,
              docType: item.type,
              tags: item.tags
            }

            removeUnnecessaryData(item.type, item.data.body, data)

            initApi(null).then(async api => {
              data.languagesAlternatesURLs = await getLanguagesAlternatesURLs(api, item, lang, languages)
              fs.writeFile(
                path.join(outPath, 'content.json'),
                JSON.stringify(data),
                err => {
                  if (err) {
                    console.log(
                      `Error generating content data file for ${outPath} file`,
                      err
                    )
                  }
                }
              )
            })

            const adjustedPath = `/${lang}${pathPage}`

            const obj = {
              [adjustedPath]: {
                page: '/main'
              }
            }

            if (fix404) {
              result = Object.assign(result, {
                ['/error.html']: {
                  page: '/main'
                }
              })
            }

            result = Object.assign(result, obj)
          })
        })
        resolve(result)
      })
      .catch(e => {
        reject(new Error(`Export failed while fetching data. Error: ${e}`))
      })
  })
}

/**
 * Module exported functions
 */
module.exports = {
  getMap
}
