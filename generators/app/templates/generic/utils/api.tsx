import fetch from 'isomorphic-unfetch'

export const getDocument = (
  req: any,
  documentId: string,
  documenType: string
) => async () => {
  try {
    const protocol = req ? req.headers['x-forwarded-proto'] || 'http' : ''
    const baseUrl = req ? `${protocol}://${req.headers.host}` : ''
    const res = await fetch(
      `${baseUrl}/api-document?id=${documentId}&type=${documenType}`, {
        credentials: 'include'
      }
    )
    return await res.json()
  } catch (e) {
    console.error(`GET document(${documentId}) error: ${e}`)
    return { error: 'Something did not work as expected' }
  }
}
