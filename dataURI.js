// For converting assets to data urls. You can include this in a script tag.

const dataURIs = {
    "filename.extension" : "data:...", // The file, the data uri of the file
}

(function() {
    
  

    const ORIGINAL_CREATE_ELEMENT = document.createElement;
    const ORIGINAL_SET_ATTRIBUTE = Element.prototype.setAttribute;

    
    document.createElement = function(tagName) {
        const el = ORIGINAL_CREATE_ELEMENT.call(this, tagName);

        if (tagName.toLowerCase() === 'script') {
            Object.defineProperty(el, 'src', {
                set(newSrc) {
                    const filename = extractFilename(newSrc);
                    const replacement = dataURIs[filename];
                    if (replacement) {
                        
                        ORIGINAL_SET_ATTRIBUTE.call(el, 'src', replacement);
                    } else {
                        ORIGINAL_SET_ATTRIBUTE.call(el, 'src', newSrc);
                    }
                },
                get() {
                    return el.getAttribute('src');
                },
                configurable: true
            });
        }

        return el;
    };

    
    Element.prototype.setAttribute = function(name, value) {
        if (this.tagName === 'SCRIPT' && name === 'src') {
            const filename = extractFilename(value);
            const replacement = dataURIs[filename];
            if (replacement) {
             
                return ORIGINAL_SET_ATTRIBUTE.call(this, name, replacement);
            }
        }

        return ORIGINAL_SET_ATTRIBUTE.call(this, name, value);
    };

    function extractFilename(url) {
        try {
            return new URL(url, location.href).pathname.split('/').pop();
        } catch {
            return url.split('/').pop(); 
        }
    }
})();

const imageSrcDescriptor = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
Object.defineProperty(Image.prototype, 'src', {
  set(value) {
    const newURL = rewriteURL(value);
    imageSrcDescriptor.set.call(this, newURL);
  },
  get: imageSrcDescriptor.get,
  configurable: true,
  enumerable: true,
});


const scriptSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
Object.defineProperty(HTMLScriptElement.prototype, 'src', {
  set(value) {
    const newURL = rewriteURL(value);
    scriptSrcDescriptor.set.call(this, newURL);
  },
  get: scriptSrcDescriptor.get,
  configurable: true,
  enumerable: true,
});


const linkHrefDescriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
Object.defineProperty(HTMLLinkElement.prototype, 'href', {
  set(value) {
    const newURL = rewriteURL(value);
    linkHrefDescriptor.set.call(this, newURL);
  },
  get: linkHrefDescriptor.get,
  configurable: true,
  enumerable: true,
});


const mediaSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
Object.defineProperty(HTMLMediaElement.prototype, 'src', {
  set(value) {
    const newURL = rewriteURL(value);
    mediaSrcDescriptor.set.call(this, newURL);
  },
  get: mediaSrcDescriptor.get,
  configurable: true,
  enumerable: true,
});

// fetch
const originalFetch = window.fetch;
window.fetch = function(resource, init) {
  if (typeof resource === "string") {
    resource = rewriteURL(resource);
  } else if (resource instanceof Request) {
    resource = new Request(rewriteURL(resource.url), resource);
  }
  return originalFetch.call(this, resource, init);
};

// XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  const newURL = rewriteURL(url);
  return originalOpen.call(this, method, newURL, ...rest);
};


const OriginalAudio = window.Audio;
window.Audio = function(src) {
  const audio = new OriginalAudio();
  if (src) {
    audio.src = rewriteURL(src);
  }
  return audio;
};
window.Audio.prototype = OriginalAudio.prototype;


function rewriteURL(original) {
  var trimmed = original.split("/").pop();
  if (trimmed.includes("?")) trimmed = trimmed.split("?")[0]
  return dataURIs[trimmed] || original;
}
