import * as React from 'react'
import { useEffect, useState } from 'react'

import Router from 'next/router'
import { Helmet } from 'react-helmet'
import dynamic from 'next/dynamic'

const {
  websiteURL,
  FACEBOOK_APP_ID,
  openGraphDefaultImage,
  languages
} = require('../constants')

import {
  getPathAndLangForPage,
  langFromPath,
  isNextHR,
  renderMeta,
  ct,
  isNode
} from '../utils'

import { MetaData } from '../components'

import { getPage, getStaticContent } from './../utils/data-fetch'

import PageContainer from '../containers/Page/Page'
// Dynamic Containers
const d = container =>
  dynamic(() => import(`../containers/${container}/${container}`))
const ErrorPageContainer = d('ErrorPage')
//const PageContainer = d('Page')

interface StatelessPage<P = {}> extends React.SFC<P> {
  getInitialProps?: (ctx: any) => any
}

interface IPageProps {
  content: any
  lang: string
  pathId: string
  dev: boolean
  asPath: string
  isErrorFile?: boolean
  dispatch?: (any) => {}
  req?: any
  isExport?: boolean
  linkedToError?: boolean
}

const Page: StatelessPage<IPageProps> = ({
  content,
  lang,
  pathId,
  asPath,
  dev,
  isErrorFile = false,
  dispatch,
  req,
  isExport = false,
  linkedToError = false
}) => {
  const [langFix, setLangFix] = useState(lang)

  // @todo Rewrite to work on staging
  // useEffect(() => {
  //   if (false && isErrorFile && !isNode) {
  //     const langError = langFromPath(document.location.pathname)
  //     dispatch(getPage(req, pathId, langError))
  //     setLangFix(langError)
  //   }
  // }, [])

  useEffect(() => {
    const onRouteChange = () => {
      document.body.scrollTo(0, 0)
    }
    Router.events.on('routeChangeComplete', onRouteChange)
    return () => {
      Router.events.off('routeChangeComplete', onRouteChange)
    }
  })

  let toReturnError = null
  const page = content ? content[pathId] : null

  if (linkedToError && isExport) {
    window.location.reload()
    toReturnError = <div />
  } else if (!content || !page || page.error) {
    if (pathId !== '404') {
      if (!isNode) {
        let langFor404 = langFix
        if (asPath && asPath.split('/').length > 1) {
          langFor404 = asPath.split('/')[1]
        }
        if (!languages.includes(langFor404)) {
          langFor404 = langFix
        }
        Router.push(`/${langFor404}/404`, `/${langFor404}/404`, {
          shallow: true
        })
      }
      toReturnError = <div />
    } else {
      toReturnError = <ErrorPageContainer {...page} lang={langFix} />
    }
  }

  if (toReturnError) {
    return toReturnError
  }

  const {
    meta_title,
    meta_description,
    meta_tags,
    meta_open_graph_image = {
      url: null,
      alt: null
    },
    settings,
    ...rest
  } = page

  let urlPart = asPath
  if (urlPart[urlPart.length - 1] === '/') {
    urlPart = urlPart.slice(0, -1)
  }
  <% if (baseComponents.includes('MetaData')) { %>const seoTitle = ct(meta_title)
  const seoCanonical = `${websiteURL}${urlPart}/`
  const seoData = {
    title: seoTitle,
    description: meta_description,
    canonical: seoCanonical,
    facebook: {
      appId: FACEBOOK_APP_ID
    },
    openGraph: {
      title: seoTitle,
      description: meta_description,
      url: seoCanonical,
      type: 'website',
      images: [
        {
          url: meta_open_graph_image.url || openGraphDefaultImage,
          alt: meta_open_graph_image.alt
        }
      ]
    }
  }<% } %>
  let urlWithoutLang = urlPart
  for (let langI = 0; langI < languages.length; langI++) {
    urlWithoutLang = urlWithoutLang.replace(`/${languages[langI]}/`, ``)
  }

  const pageNameParts = asPath.split('/')
  let pageName = pageNameParts[pageNameParts.length - 1]
  if (pageNameParts[pageNameParts.length - 1] === '') {
    pageName = pageNameParts[pageNameParts.length - 2]
  }
  if (languages.includes(pageName)) {
    // Is language root path so we fix the page name
    pageName = 'home'
  }

  const renderContainerForPage = () => {
    let Container: any
    switch (page.docType) {
      case 'page':
      default:
        Container = PageContainer
        break
    }
    return (
      <Container
        {...rest}
        type={page.docType}
        langFix={langFix}
        urlPart={urlPart}
      />
    )
  }

  const containerPageName = page.docType
    ? page.docType.charAt(0).toUpperCase() + page.docType.substring(1)
    : 'Page'

  return (
    <section
      className={`${containerPageName} ${containerPageName}-${pageName}`}
    >
      <% if (baseComponents.includes('MetaData')) { %><MetaData seoData={seoData} /><% } %>
      <Helmet>
        {meta_tags && renderMeta(meta_tags)}

        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${websiteURL}/${languages[0]}/${urlWithoutLang}/`}
        />
      </Helmet>

      {renderContainerForPage()}
    </section>
  )
}

Page.getInitialProps = async options => {
  const { req, asPath, query } = options

  const lang = langFromPath(asPath, req)
  const pathKey = asPath
    .replace(`/${lang}/`, '/')
    .split('?')[0]
    .replace(/\/$/, '')

  const reqToReturn = req ? { headers: req.headers } : null

  // Static fetching next page's content
  if (!isNode && process.env.EXPORT) {
    if (asPath) {
      const content = await getStaticContent(asPath, pathKey, lang)
      const page = content ? content[pathKey] : null

      return {
        content,
        req: reqToReturn,
        pathId: pathKey,
        lang,
        asPath,
        isExport: process.env.EXPORT,
        linkedToError: !page
      }
    } else {
      console.log(
        `Error with fecthing new page from getInitialProps on static exported: ${asPath}: `
      )
      return
    }
  }

  // Avoid querying data with next.js-hot-reloading
  if (isNextHR(req ? req.url : asPath)) return

  // Fetching page's content
  try {
    let { lang, pathId, type } = getPathAndLangForPage(req, asPath, query)

    let isErrorFile = false
    if (
      (process.env.EXPORT && pathId === 'error.html') ||
      (req && req.statusCode === 404)
    ) {
      pathId = '404'
      isErrorFile = true
    }

    const content = await getPage(req, pathKey, lang)

    return {
      content,
      req: reqToReturn,
      pathId: pathKey,
      lang,
      asPath,
      isErrorFile,
      isExport: process.env.EXPORT
    }
  } catch (e) {
    console.log('getInitialProps error', e)
  }
}

export default Page
