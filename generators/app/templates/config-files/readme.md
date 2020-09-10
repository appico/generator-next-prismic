# <%= websiteFullName %>


## Table of content

- [Installation](#installation)
- [Development](#development)
- [Deployment](#deployment)
- [Static export](#static-export)
- [Preview data](#preview-data)
- [Prismic-app connection](#prismic-app-connection)


<a id="installation"></a>
### Installation


Clone repo:

```
git clone <%= githubRepoUrl %>
cd <%= websiteName %>
```

Install the dependencies:

```
npm run install
```
<a id="development"></a>
### Development

Start a live-reload development server:

```
npm run dev
```
<a id="deployment"></a>
### Deployment

Create a file called `.env`, with the following contents:

.env

```
CONTENT_API_URL=<%= prismicApiURL %>
CONTENT_API_TOKEN=<%= prismicApiToken %>
SITE_ROOT=<%= websiteURL %>
```

Generate a production build:

```
npm run build
```

Run the app:

```
npm run start
```

App will be served on port 3000.

<a id="static-export"></a>
### Static export

To generate static HTML version of app execute following command

```
npm run export
```

App will be built into /build folder.




<a id="preview-data"></a>
### Preview Data
To test the app with Preview data from Prismic:

```
PREVIEW=1 npm run dev
```

Or in an external preview server 

```
PREVIEW=1 npm run build && PREVIEW=1 npm run start
```


<a id="prismic-app-connection"></a>
### Prismic-app connection

__Important note on URLs convetion:__ 

App URLs assumes following format: `/lang/rest...` eg. `/de/home`. On Prismic 
site requested document must have URL defined as first tag. URL must not 
contain lang prefix which means that to get `/de/home` page app will query 
Prismic for document with `/home` tag in `de` language version.

1. Next-routes matches every route and passes control to `/pages/main`.
2. `Page` container calls `getInitialProps` with required `asPath` as param.
3. `getInitialProps` function makes `asPath` adjustments to get `pathKey` and `lang` and dispatches `getPage` action with these params (`getPage` receives `asPath` simply as `path`). Example: '/de/home' adjustment will result with `pathKey = '/home'` and `lang = 'de'` 
4. `getPage` action makes API call `/api-page?id=...`
   - server `api-page` passes request to `getDocumentsPage` function
   - `getDocumentsPage` calls `getDocument` which searches in cache for key `${path}-${lang}`
   - Assuming we don’t have `${path}-${lang}` key in cache, we’re calling `getSingleDocument` to query Prismic for page with the proper language.
   - `getDocumentsPage` calls `getDocument` for all entries in `ALL_COMMON_DOCUMENTS` which are Prismic types keys (like `navbar`, `footer` , etc.)
   - `getPage` function 'assembles' all returned data
5. contentReducer consumes `FETCH_CONTENT` and change store `content`
6. Page component renders container depending on `content.docType`. Proper container uses Helmet, Layout -> ContentBlocks and other components
