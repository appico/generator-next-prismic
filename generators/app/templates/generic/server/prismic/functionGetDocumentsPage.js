const { log, logError } = require('./../utils')

const { ALL_COMMON_DOCUMENTS, EXPORT } = require('./constants')

const { removeUnnecessaryData } = require('./utils')
const { getDocument } = require('./functionGetDocument')

/**
 * GET DOCUMENTS Page
 * First check if the path content is in the local cache
 * If not in cache, it will fetch all content associated with a path inside Prismic.io
 * Includes all the common elements needed in the path like 'navbar', 'footer' or 'path_404'
 */
const getDocumentsPage = (toResetCache, cache) => (
  req, // @param req: any
  path, // @param path: string
  lang, // @param lang: string
  onSuccess, // @param onSuccess: (data: any) => void
  onError // onError: (err: string, dataFallback?: any) => void
) => {
  const fecthContent = (onSuccessFn, onErrorFn, cacheInstance) => {
    // Create the promise to get the path document
    const ePromises = []

    if (path) {
      ePromises.push(
        new Promise((resolve, reject) => {
          try {
            getDocument(toResetCache, cache)(req, path, lang, resolve, reject)
          } catch (e) {
            logError(`Error document: ${path} : ${lang}`)
          }
        })
      )
    }

    // Add the promises to get the all the common documents
    ALL_COMMON_DOCUMENTS.map(doc => {
      ePromises.push(
        new Promise((resolve, reject) => {
          try {
            getDocument(toResetCache, cache)(req, doc, lang, resolve, reject)
          } catch (e) {
            logError(`Error document: ${doc} : ${lang}`)
          }
        })
      )
      return doc
    })

    // Run all the promises to get the needed content
    Promise.all(ePromises)
      .then(values => {
        // No results error
        if (!values || values.length <= 0 || !values[0]) {
          onErrorFn('Prismic: No results: All Promises')
          return
        }
        // We have results, lets order them
        try {
          let contentRes = path ? { ...values[0] } : {}

          // Map the results with their names
          ALL_COMMON_DOCUMENTS.map((doc, index) => {
            contentRes[doc] = values[index + (path ? 1 : 0)]
            return doc
          })

          if (path) {
            const pageObj = values[0]
            if (pageObj) {
              removeUnnecessaryData(pageObj.docType, pageObj.body, contentRes)
            }
          }

          log(
            `GET: ${
              path ? `${path.toUpperCase()} path content` : 'common content'
            } `
          )
          if (cacheInstance) {
            // Save into cache with the key
            cacheInstance.set(
              `content-result-${path || 'common'}-${lang}`,
              contentRes
            )
          }
          // Return result
          if (onSuccessFn) onSuccessFn(contentRes)
        } catch (e) {
          log('Error getting Content', e)
          // There was some error
          onErrorFn('Error getting Content: All Promises')
        }
      })
      .catch(onErrorFn)
  }

  if (EXPORT) {
    return new Promise((onSuccess, promiseReject) => {
      const onErrorFn = err => {
        const error = `Error getting content-result -> ${err}`
        promiseReject(new Error(error))
      }

      // So we're gonna fetch data from Prismic.io
      try {
        fecthContent(onSuccess, onErrorFn)
      } catch (e) {
        onErrorFn(e)
      }
    })
  } else {
    const onErrorFn = err => {
      const error = `Error getting cached content-result -> ${err}`
      console.log(error)
      if (onError) {
        const justCachedCommonDocs = {}
        if (ALL_COMMON_DOCUMENTS) {
          ALL_COMMON_DOCUMENTS.map((doc, index) => {
            justCachedCommonDocs[doc] = cache.get(`${doc}-${lang}`)
            return doc
          })
        }
        onError(
          error,
          cache.get(`content-result-${path}-${lang}`) || {
            error,
            ...justCachedCommonDocs
          }
        )
      }
    }

    cache.get(`content-result-${path}-${lang}`, (err, value) => {
      const error = err || !value || value === undefined
      if (process.env.PREVIEW || error || toResetCache) {
        // Cache key not found OR cache has been reset
        // So we're gonna fetch data from Prismic.io

        try {
          fecthContent(onSuccess, onErrorFn, cache)
        } catch (e) {
          onErrorFn(e)
        }
      } else {
        if (onSuccess) onSuccess(value)
      }
    })
  }
}

module.exports = {
  getDocumentsPage
}
