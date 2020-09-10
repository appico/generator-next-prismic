const Cookies = require('cookies')
const { log, logError } = require('./../utils')
const { COMMON_DOCUMENTS, EXPORT } = require('./constants')

const { getSingleDocument, initApi } = require('./functionsCommon')

let EXPORT_SIMULATED_CACHE = {}

/**
 * GET DOCUMENT
 * First check if the document is in the local cache
 * If not in cache, it will fetch it from Prismic.io and save it in the cache afterwards
 */
const getDocument = (toResetCache, cache) => (
  req, // @param req: any
  path, // @param path: string
  lang, // @param lang: string
  onSuccess, // @param onSuccess: (data: any) => void,
  onError // @param onError: (err: string, dataFallback?: any) => void
) => {
  if (EXPORT) {
    if (EXPORT_SIMULATED_CACHE[`${path}-${lang}`]) {
      onSuccess(EXPORT_SIMULATED_CACHE[`${path}-${lang}`])
      return
    }
  }
  cache.get(`${path}-${lang}`, (err, value) => {
    const error = err || !value || value === undefined
    if (process.env.PREVIEW || error || toResetCache) {
      // Cache key not found OR cache has been reset
      // So we're gonna fetch data from Prismic.io

      const onErrorQuery = e => {
        cache.set(`${path}-${lang}`, null)
        logError(`Prismic: ${path}: something went wrong: ${e}`)

        if (COMMON_DOCUMENTS.includes(path)) {
          onError(new Error(`Common document ${path} not found`))
        }

        if (toResetCache) {
          onSuccess(value)
        } else {
          onError(e, value)
        }
      }

      const onErrorInit = error => {
        logError(
          `Prismic: ${path}: something went wrong when initializing the Prismic api: ${error}`
        )
        onError(error, value)
      }

      const cookies = req && req.url ? new Cookies(req) : null

      // If not init then we init the primisAPI
      try {
        let prismicAPI = initApi(req)

        prismicAPI
          .then(api => {
            try {
              getSingleDocument(
                cache,
                api,
                path,
                lang,
                onSuccess,
                onErrorQuery,
                1,
                [],
                EXPORT ? EXPORT_SIMULATED_CACHE : null,
                cookies ? cookies.get('io.prismic.preview') : null
              )
            } catch (err) {
              onErrorInit(err)
            }
          })
          .catch(onErrorInit)
      } catch (err) {
        logError(
          `Prismic: something went wrong when initializing the Prismic api: ${err}`
        )
        onError(err, value)
      }
    } else {
      log(`Prismic: cache: document: ${path} : ${lang}`)
      onSuccess(value)
    }
  })
}

module.exports = {
  getDocument
}
