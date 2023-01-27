export const saleorUrls = (url: string) => ({
  dashboard: {
    homepage: new URL('/dashboard', url).href,
    apps: new URL('/dashboard/apps', url).href
  }, 
  api: new URL('/graphql/', url).href
})

export default saleorUrls