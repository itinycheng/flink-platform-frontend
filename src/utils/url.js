export function rewriteUrl(router, route, query = {}) {
  const newQuery = Object.fromEntries(
    Object.entries(query).filter(([_, value]) => value != null && value !== '')
  )

  router.push({
    path: route.path,
    query: newQuery
  })
}
