export function prefix(location, ...prefixes) {
    return prefixes.some(
      prefix => (
        location.href.indexOf(`${location.origin}/${prefix}`) !== -1
      )
    )
  }
  
  export function homePage(location) {
    return prefix(location, '')
  }
  
  export function reactPage(location) {
    return prefix(location, 'react')
  }
  
  export function angularPage(location) {
    return prefix(location, 'angular')
  }