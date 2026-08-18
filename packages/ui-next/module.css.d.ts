// Taken from official Next.js types
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };

  // eslint-disable-next-line import/no-default-export
  export default classes;
}
