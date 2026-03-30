// Stub declaration for playwright — only installed on servers that need browser automation.
// On Vercel, this module is dynamically imported and may not be present.
declare module 'playwright' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const chromium: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const firefox: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const webkit: any;
}
