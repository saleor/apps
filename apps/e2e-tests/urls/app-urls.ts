
export const appUrls = (appUrl: string) => ({
  manifest: new URL('/api/manifest', appUrl).href,
  register: new URL('/api/register', appUrl).href
})

export default appUrls