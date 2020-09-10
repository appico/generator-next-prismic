import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
const { getLangFromPathHelper: langFromPath } = require('./../server/utils')

export default class MyDocument extends Document<any, any> {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    const acceptLanguage =
      ctx && ctx.req && ctx.req.headers && ctx.req.headers['accept-language']
        ? ctx.req.headers['accept-language']
        : null
    return {
      ...initialProps,
      pathname: ctx.req.url,
      acceptLanguage
    }
  }

  render() {
    const { pathname, acceptLanguage } = this.props
    const lang = langFromPath(pathname, null, acceptLanguage)

    return (
      <html lang={lang}>
        <Head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, minimum-scale=1"
          />

          {process.env.PREVIEW && (
            <>
              <script dangerouslySetInnerHTML={{
                  __html: `
                window.prismic = {
                  endpoint: '<%= prismicApiURL %>'
                };`}} ></script>
              <script type="text/javascript" src="https://static.cdn.prismic.io/prismic.min.js?new=true"></script>
            </>
          )}

          <script
            dangerouslySetInnerHTML={{
              __html: `
            if (document) {
              document.documentElement.classList.add('js')
              document.documentElement.classList.add('fade')
              let device = false
              if (window.isDevice) {
                device = true
              } else {
                if (
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                  )
                ) {
                  device = true
                  window.isDevice = true
                }
              }
              if (device) {
                document.documentElement.classList.add('device')
              }
              window.addEventListener('load', function(e) {
                document.documentElement.classList.remove('fade')
              })
            }`
            }}
          />

          <link
            rel="apple-touch-icon-precomposed"
            sizes="57x57"
            href="/static/favicon/apple-touch-icon-57x57.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="114x114"
            href="/static/favicon/apple-touch-icon-114x114.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="72x72"
            href="/static/favicon/apple-touch-icon-72x72.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="144x144"
            href="/static/favicon/apple-touch-icon-144x144.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="60x60"
            href="/static/favicon/apple-touch-icon-60x60.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="120x120"
            href="/static/favicon/apple-touch-icon-120x120.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="76x76"
            href="/static/favicon/apple-touch-icon-76x76.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="152x152"
            href="/static/favicon/apple-touch-icon-152x152.png"
          />
          <link
            rel="icon"
            type="image/png"
            href="/static/favicon/favicon-196x196.png"
            sizes="196x196"
          />
          <link
            rel="icon"
            type="image/png"
            href="/static/favicon/favicon-96x96.png"
            sizes="96x96"
          />
          <link
            rel="icon"
            type="image/png"
            href="/static/favicon/favicon-32x32.png"
            sizes="32x32"
          />
          <link
            rel="icon"
            type="image/png"
            href="/static/favicon/favicon-16x16.png"
            sizes="16x16"
          />
          <link
            rel="icon"
            type="image/png"
            href="/static/favicon/favicon-128.png"
            sizes="128x128"
          />
          <meta name="application-name" content="&nbsp;" />
          <meta name="msapplication-TileColor" content="#FFFFFF" />
          <meta
            name="msapplication-TileImage"
            content="/static/favicon/mstile-144x144.png"
          />
          <meta
            name="msapplication-square70x70logo"
            content="/static/favicon/mstile-70x70.png"
          />
          <meta
            name="msapplication-square150x150logo"
            content="/static/favicon/mstile-150x150.png"
          />
          <meta
            name="msapplication-wide310x150logo"
            content="/static/favicon/mstile-310x150.png"
          />
          <meta
            name="msapplication-square310x310logo"
            content="/static/favicon/mstile-310x310.png"
          />

          <meta name="theme-color" content="<%= primaryColor %>" />
          <link rel="manifest" href="/static/manifest.webmanifest" />

          <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" />
          <script src="/static/async-font.js" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
