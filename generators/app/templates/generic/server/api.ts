export {} // Avoid typescript issue with "Cannot redeclare block-scoped variable"

const { initApi } = require('./prismic/functionsCommon')

const iFetch = require('isomorphic-unfetch')
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator/check')

const { log, logError } = require('./utils')

let clearCacheTimeout = null

// Exports API
module.exports = (
  app: any,
  prismicApi: any,
  sitemap: any,
  path: any,
  dev: boolean
) => {
  // Example preview endpoint for NodeJS with ExpressJS 
  app.get('/preview', function (req, res) {    
    initApi(req)
      .then((url) => {
        res.redirect(302, url);
      });
  });

  // Query for page
  app.get('/api-page', (req, res) => {
    try {
      prismicApi.getDocumentsPage(
        req,
        req.query.path,
        req.query.lang,
        data => {
          res.status(200).send({ ...data, dev })
        },
        (error, dataFallback) => {
          if (dataFallback) {
            res.status(200).send({ ...dataFallback, dev })
          } else {
            res.status(404).send({ error, dev })
          }
        }
      )
    } catch (error) {
      res.status(404).send({ error, dev })
    }
  })

  // Query for document
  app.get('/api-document', (req, res) => {
    try {
      prismicApi.getDocument(
        req,
        req.query.id,
        req.query.type,
        req.query.lang,
        data => {
          res.status(200).send({ ...data, dev })
        },
        (error, dataFallback) => {
          if (dataFallback) {
            res.status(200).send({ ...dataFallback, dev })
          } else {
            res.status(404).send({ error, dev })
          }
        }
      )
    } catch (error) {
      res.status(404).send({ error, dev })
    }
  })

  // Query for document
  app.get('/api-all-documents', (req, res) => {
    try {
      prismicApi.getDocument(
        req,
        '*',
        req.query.lang,
        data => {
          res.status(200).send(data)
        },
        (error, dataFallback) => {
          if (dataFallback) {
            res.status(200).send(dataFallback)
          } else {
            res.status(404).send({ error })
          }
        }
      )
    } catch (error) {
      res.status(404).send({ error, dev })
    }
  })

  // Clear api content cache
  app.post('/api-clear-cache', (req, res) => {
    try {
      log('/clear-cache - webhook', true)
      if (clearCacheTimeout) {
        clearTimeout(clearCacheTimeout)
        log('/clear-cache - timeout cleared', true)
      }

      clearCacheTimeout = setTimeout(() => {
        // Clear Contentful cache
        prismicApi.clearCache()

        // Sitemap
        sitemap(app, prismicApi, path)
      }, 1000 * 60 * 2) // Delay of 2 minutes, to avoid consecutive clearing the cache when changing several things in prismic

      res.status(200).send('Alright, cache will clear.')
    } catch (error) {
      logError('api-clear-cache: ', error)
    }
  })

  // create application/json parser
  app.use(bodyParser.json())
}
