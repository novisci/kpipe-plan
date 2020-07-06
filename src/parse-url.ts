/***
 * parse a kpipe storage url and return reader/writer parameters
 *
 * eg.
 *
 *  s3://bucket-name/pre/fix/object
 *
 *  fs://relative/path/from/cwd
 *
 *  fs:///absolute/path/to/file
 *
 *  stdio://
 *
 *  kafka://
 */
interface UrlComponents {
  protocol: string
  path: string[]
  prefixes: string[]
  file: string | null
  extension: string
  isAbsolute: boolean
  isDir: boolean
}

function safeMatch (url: string, regex: RegExp, na: any = null): string {
  const m = url.match(regex)
  if (!m) {
    return na
  }
  return m[1]
}

// const first = (arr) => arr[0]
const last = (arr: any[]): any => arr[arr.length - 1]

const protocol = (url: string): string => safeMatch(url, /^([^:]+):\/\//)
const path = (url: string): string => safeMatch(url, /^[^:]+:\/\/(.*)$/)
const pathcomps = (url: string): string[] => (path(url) || '').split('/')
const prefixes = (url: string): string[] => pathcomps(url).slice(0, -1)
const extension = (url: string): string => safeMatch(url, /\.([^/.]+)$/)
const isAbsolute = (url: string): boolean => pathcomps(url)[0] === ''
const isDir = (url: string): boolean => last(pathcomps(url)) === ''
const file = (url: string): string|null => last(pathcomps(url)) || null

export default function (url: string): UrlComponents {
  return {
    protocol: protocol(url),
    path: pathcomps(url),
    prefixes: prefixes(url),
    file: file(url),
    extension: extension(url),
    isAbsolute: isAbsolute(url),
    isDir: isDir(url)
  }
}
