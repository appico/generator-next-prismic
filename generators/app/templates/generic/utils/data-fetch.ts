import fetch from 'isomorphic-unfetch'

export const getPage = async (req: any, path: string, lang: <%- languages.map(lang => `'${lang}'`).join(' | ') %>) => {
  try {
    const protocol =
      req && req.headers ? req.headers['x-forwarded-proto'] || 'http' : ''
    const baseUrl =
      req && req.headers ? `${protocol}://${req.headers.host}` : ''

    // Server is running
    if (!process.env.EXPORT) {
      const res = await fetch(`${baseUrl}/api-page?lang=${lang}&path=${path}`)
      const data = await res.json()
      return { [path]: data }
    }
    // Server is NOT running - export mode
    else {
      const prismicApi = require('./../server/prismic')
      const data = await prismicApi.getDocumentsPage({}, path, lang)
      return { [path]: data }
    }
  } catch (e) {
    console.error(`GET page(${path}) error: ${e}`)
    return { error: 'Something did not work as expected' }
  }
}

export const getStaticContent = async (
  asPath: string,
  pathId: string,
  lang: string
) => {
  try {
    const requestedUrl = asPath === '/' ? `/${lang}/home` : asPath
    const res = await fetch(`${requestedUrl.replace(/\/$/, '')}/content.json`)
    const data = await res.json()

    return { [pathId]: data }
  } catch (e) {
    console.log(`Error fetching content file for ${asPath}: `, e)
  }
}
