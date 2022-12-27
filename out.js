(() => {
  // node_modules/html-to-image/es/util.js
  function resolveUrl(url, baseUrl) {
    if (url.match(/^[a-z]+:\/\//i)) {
      return url;
    }
    if (url.match(/^\/\//)) {
      return window.location.protocol + url;
    }
    if (url.match(/^[a-z]+:/i)) {
      return url;
    }
    const doc = document.implementation.createHTMLDocument();
    const base = doc.createElement("base");
    const a = doc.createElement("a");
    doc.head.appendChild(base);
    doc.body.appendChild(a);
    if (baseUrl) {
      base.href = baseUrl;
    }
    a.href = url;
    return a.href;
  }
  var uuid = (() => {
    let counter = 0;
    const random = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
    return () => {
      counter += 1;
      return `u${random()}${counter}`;
    };
  })();
  function toArray(arrayLike) {
    const arr = [];
    for (let i = 0, l = arrayLike.length; i < l; i++) {
      arr.push(arrayLike[i]);
    }
    return arr;
  }
  function px(node, styleProperty) {
    console.log(node)
    const win = node.ownerDocument.defaultView || window;
    const val = win.getComputedStyle(node).getPropertyValue(styleProperty);
    return val ? parseFloat(val.replace("px", "")) : 0;
  }
  function getNodeWidth(node) {
    const leftBorder = px(node, "border-left-width");
    const rightBorder = px(node, "border-right-width");
    return node.clientWidth + leftBorder + rightBorder;
  }
  function getNodeHeight(node) {
    const topBorder = px(node, "border-top-width");
    const bottomBorder = px(node, "border-bottom-width");
    return node.clientHeight + topBorder + bottomBorder;
  }
  function getImageSize(targetNode, options = {}) {
    const width = options.width || getNodeWidth(targetNode);
    const height = options.height || getNodeHeight(targetNode);
    return { width, height };
  }
  function getPixelRatio() {
    let ratio;
    let FINAL_PROCESS;
    try {
      FINAL_PROCESS = process;
    } catch (e) {
    }
    const val = FINAL_PROCESS && FINAL_PROCESS.env ? FINAL_PROCESS.env.devicePixelRatio : null;
    if (val) {
      ratio = parseInt(val, 10);
      if (Number.isNaN(ratio)) {
        ratio = 1;
      }
    }
    return ratio || window.devicePixelRatio || 1;
  }
  var canvasDimensionLimit = 16384;
  function checkCanvasDimensions(canvas) {
    if (canvas.width > canvasDimensionLimit || canvas.height > canvasDimensionLimit) {
      if (canvas.width > canvasDimensionLimit && canvas.height > canvasDimensionLimit) {
        if (canvas.width > canvas.height) {
          canvas.height *= canvasDimensionLimit / canvas.width;
          canvas.width = canvasDimensionLimit;
        } else {
          canvas.width *= canvasDimensionLimit / canvas.height;
          canvas.height = canvasDimensionLimit;
        }
      } else if (canvas.width > canvasDimensionLimit) {
        canvas.height *= canvasDimensionLimit / canvas.width;
        canvas.width = canvasDimensionLimit;
      } else {
        canvas.width *= canvasDimensionLimit / canvas.height;
        canvas.height = canvasDimensionLimit;
      }
    }
  }
  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decode = () => resolve(img);
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = url;
    });
  }
  async function svgToDataURL(svg) {
    return Promise.resolve().then(() => new XMLSerializer().serializeToString(svg)).then(encodeURIComponent).then((html) => `data:image/svg+xml;charset=utf-8,${html}`);
  }
  async function nodeToDataURL(node, width, height) {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    const foreignObject = document.createElementNS(xmlns, "foreignObject");
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height}`);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    foreignObject.setAttribute("width", "100%");
    foreignObject.setAttribute("height", "100%");
    foreignObject.setAttribute("x", "0");
    foreignObject.setAttribute("y", "0");
    foreignObject.setAttribute("externalResourcesRequired", "true");
    svg.appendChild(foreignObject);
    foreignObject.appendChild(node);
    return svgToDataURL(svg);
  }

  // node_modules/html-to-image/es/clone-pseudos.js
  function formatCSSText(style) {
    const content = style.getPropertyValue("content");
    return `${style.cssText} content: '${content.replace(/'|"/g, "")}';`;
  }
  function formatCSSProperties(style) {
    return toArray(style).map((name) => {
      const value = style.getPropertyValue(name);
      const priority = style.getPropertyPriority(name);
      return `${name}: ${value}${priority ? " !important" : ""};`;
    }).join(" ");
  }
  function getPseudoElementStyle(className, pseudo, style) {
    const selector = `.${className}:${pseudo}`;
    const cssText = style.cssText ? formatCSSText(style) : formatCSSProperties(style);
    return document.createTextNode(`${selector}{${cssText}}`);
  }
  function clonePseudoElement(nativeNode, clonedNode, pseudo) {
    const style = window.getComputedStyle(nativeNode, pseudo);
    const content = style.getPropertyValue("content");
    if (content === "" || content === "none") {
      return;
    }
    const className = uuid();
    try {
      clonedNode.className = `${clonedNode.className} ${className}`;
    } catch (err) {
      return;
    }
    const styleElement = document.createElement("style");
    styleElement.appendChild(getPseudoElementStyle(className, pseudo, style));
    clonedNode.appendChild(styleElement);
  }
  function clonePseudoElements(nativeNode, clonedNode) {
    clonePseudoElement(nativeNode, clonedNode, ":before");
    clonePseudoElement(nativeNode, clonedNode, ":after");
  }

  // node_modules/html-to-image/es/mimes.js
  var WOFF = "application/font-woff";
  var JPEG = "image/jpeg";
  var mimes = {
    woff: WOFF,
    woff2: WOFF,
    ttf: "application/font-truetype",
    eot: "application/vnd.ms-fontobject",
    png: "image/png",
    jpg: JPEG,
    jpeg: JPEG,
    gif: "image/gif",
    tiff: "image/tiff",
    svg: "image/svg+xml",
    webp: "image/webp"
  };
  function getExtension(url) {
    const match = /\.([^./]*?)$/g.exec(url);
    return match ? match[1] : "";
  }
  function getMimeType(url) {
    const extension = getExtension(url).toLowerCase();
    return mimes[extension] || "";
  }

  // node_modules/html-to-image/es/dataurl.js
  function getContentFromDataUrl(dataURL) {
    return dataURL.split(/,/)[1];
  }
  function isDataUrl(url) {
    return url.search(/^(data:)/) !== -1;
  }
  function makeDataUrl(content, mimeType) {
    return `data:${mimeType};base64,${content}`;
  }
  async function fetchAsDataURL(url, init, process2) {
    const res = await fetch(url, init);
    if (res.status === 404) {
      throw new Error(`Resource "${res.url}" not found`);
    }
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => {
        try {
          resolve(process2({ res, result: reader.result }));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(blob);
    });
  }
  var cache = {};
  function getCacheKey(url, contentType, includeQueryParams) {
    let key = url.replace(/\?.*/, "");
    if (includeQueryParams) {
      key = url;
    }
    if (/ttf|otf|eot|woff2?/i.test(key)) {
      key = key.replace(/.*\//, "");
    }
    return contentType ? `[${contentType}]${key}` : key;
  }
  async function resourceToDataURL(resourceUrl, contentType, options) {
    const cacheKey = getCacheKey(resourceUrl, contentType, options.includeQueryParams);
    if (cache[cacheKey] != null) {
      return cache[cacheKey];
    }
    if (options.cacheBust) {
      resourceUrl += (/\?/.test(resourceUrl) ? "&" : "?") + new Date().getTime();
    }
    let dataURL;
    try {
      const content = await fetchAsDataURL(resourceUrl, options.fetchRequestInit, ({ res, result }) => {
        if (!contentType) {
          contentType = res.headers.get("Content-Type") || "";
        }
        return getContentFromDataUrl(result);
      });
      dataURL = makeDataUrl(content, contentType);
    } catch (error) {
      dataURL = options.imagePlaceholder || "";
      let msg = `Failed to fetch resource: ${resourceUrl}`;
      if (error) {
        msg = typeof error === "string" ? error : error.message;
      }
      if (msg) {
        console.warn(msg);
      }
    }
    cache[cacheKey] = dataURL;
    return dataURL;
  }

  // node_modules/html-to-image/es/clone-node.js
  async function cloneCanvasElement(canvas) {
    const dataURL = canvas.toDataURL();
    if (dataURL === "data:,") {
      return canvas.cloneNode(false);
    }
    return createImage(dataURL);
  }
  async function cloneVideoElement(video, options) {
    if (video.currentSrc) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL2 = canvas.toDataURL();
      return createImage(dataURL2);
    }
    const poster = video.poster;
    const contentType = getMimeType(poster);
    const dataURL = await resourceToDataURL(poster, contentType, options);
    return createImage(dataURL);
  }
  async function cloneIFrameElement(iframe) {
    var _a;
    try {
      if ((_a = iframe === null || iframe === void 0 ? void 0 : iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.body) {
        return await cloneNode(iframe.contentDocument.body, {}, true);
      }
    } catch (_b) {
    }
    return iframe.cloneNode(false);
  }
  async function cloneSingleNode(node, options) {
    if (node instanceof HTMLCanvasElement) {
      return cloneCanvasElement(node);
    }
    if (node instanceof HTMLVideoElement) {
      return cloneVideoElement(node, options);
    }
    if (node instanceof HTMLIFrameElement) {
      return cloneIFrameElement(node);
    }
    return node.cloneNode(false);
  }
  var isSlotElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SLOT";
  async function cloneChildren(nativeNode, clonedNode, options) {
    var _a;
    const children = isSlotElement(nativeNode) && nativeNode.assignedNodes ? toArray(nativeNode.assignedNodes()) : toArray(((_a = nativeNode.shadowRoot) !== null && _a !== void 0 ? _a : nativeNode).childNodes);
    if (children.length === 0 || nativeNode instanceof HTMLVideoElement) {
      return clonedNode;
    }
    await children.reduce((deferred, child) => deferred.then(() => cloneNode(child, options)).then((clonedChild) => {
      if (clonedChild) {
        clonedNode.appendChild(clonedChild);
      }
    }), Promise.resolve());
    return clonedNode;
  }
  function cloneCSSStyle(nativeNode, clonedNode) {
    const targetStyle = clonedNode.style;
    if (!targetStyle) {
      return;
    }
    const sourceStyle = window.getComputedStyle(nativeNode);
    if (sourceStyle.cssText) {
      targetStyle.cssText = sourceStyle.cssText;
      targetStyle.transformOrigin = sourceStyle.transformOrigin;
    } else {
      toArray(sourceStyle).forEach((name) => {
        let value = sourceStyle.getPropertyValue(name);
        if (name === "font-size" && value.endsWith("px")) {
          const reducedFont = Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
          value = `${reducedFont}px`;
        }
        targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
      });
    }
  }
  function cloneInputValue(nativeNode, clonedNode) {
    if (nativeNode instanceof HTMLTextAreaElement) {
      clonedNode.innerHTML = nativeNode.value;
    }
    if (nativeNode instanceof HTMLInputElement) {
      clonedNode.setAttribute("value", nativeNode.value);
    }
  }
  function cloneSelectValue(nativeNode, clonedNode) {
    if (nativeNode instanceof HTMLSelectElement) {
      const clonedSelect = clonedNode;
      const selectedOption = Array.from(clonedSelect.children).find((child) => nativeNode.value === child.getAttribute("value"));
      if (selectedOption) {
        selectedOption.setAttribute("selected", "");
      }
    }
  }
  function decorate(nativeNode, clonedNode) {
    if (clonedNode instanceof Element) {
      cloneCSSStyle(nativeNode, clonedNode);
      clonePseudoElements(nativeNode, clonedNode);
      cloneInputValue(nativeNode, clonedNode);
      cloneSelectValue(nativeNode, clonedNode);
    }
    return clonedNode;
  }
  async function ensureSVGSymbols(clone, options) {
    const uses = clone.querySelectorAll ? clone.querySelectorAll("use") : [];
    if (uses.length === 0) {
      return clone;
    }
    const processedDefs = {};
    for (let i = 0; i < uses.length; i++) {
      const use = uses[i];
      const id = use.getAttribute("xlink:href");
      if (id) {
        const exist = clone.querySelector(id);
        const definition = document.querySelector(id);
        if (!exist && definition && !processedDefs[id]) {
          processedDefs[id] = await cloneNode(definition, options, true);
        }
      }
    }
    const nodes = Object.values(processedDefs);
    if (nodes.length) {
      const ns = "http://www.w3.org/1999/xhtml";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("xmlns", ns);
      svg.style.position = "absolute";
      svg.style.width = "0";
      svg.style.height = "0";
      svg.style.overflow = "hidden";
      svg.style.display = "none";
      const defs = document.createElementNS(ns, "defs");
      svg.appendChild(defs);
      for (let i = 0; i < nodes.length; i++) {
        defs.appendChild(nodes[i]);
      }
      clone.appendChild(svg);
    }
    return clone;
  }
  async function cloneNode(node, options, isRoot) {
    if (!isRoot && options.filter && !options.filter(node)) {
      return null;
    }
    return Promise.resolve(node).then((clonedNode) => cloneSingleNode(clonedNode, options)).then((clonedNode) => cloneChildren(node, clonedNode, options)).then((clonedNode) => decorate(node, clonedNode)).then((clonedNode) => ensureSVGSymbols(clonedNode, options));
  }

  // node_modules/html-to-image/es/embed-resources.js
  var URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
  var URL_WITH_FORMAT_REGEX = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
  var FONT_SRC_REGEX = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
  function toRegex(url) {
    const escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp(`(url\\(['"]?)(${escaped})(['"]?\\))`, "g");
  }
  function parseURLs(cssText) {
    const urls = [];
    cssText.replace(URL_REGEX, (raw, quotation, url) => {
      urls.push(url);
      return raw;
    });
    return urls.filter((url) => !isDataUrl(url));
  }
  async function embed(cssText, resourceURL, baseURL, options, getContentFromUrl) {
    try {
      const resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;
      const contentType = getMimeType(resourceURL);
      let dataURL;
      if (getContentFromUrl) {
        const content = await getContentFromUrl(resolvedURL);
        dataURL = makeDataUrl(content, contentType);
      } else {
        dataURL = await resourceToDataURL(resolvedURL, contentType, options);
      }
      return cssText.replace(toRegex(resourceURL), `$1${dataURL}$3`);
    } catch (error) {
    }
    return cssText;
  }
  function filterPreferredFontFormat(str, { preferredFontFormat }) {
    return !preferredFontFormat ? str : str.replace(FONT_SRC_REGEX, (match) => {
      while (true) {
        const [src, , format] = URL_WITH_FORMAT_REGEX.exec(match) || [];
        if (!format) {
          return "";
        }
        if (format === preferredFontFormat) {
          return `src: ${src};`;
        }
      }
    });
  }
  function shouldEmbed(url) {
    return url.search(URL_REGEX) !== -1;
  }
  async function embedResources(cssText, baseUrl, options) {
    if (!shouldEmbed(cssText)) {
      return cssText;
    }
    const filteredCSSText = filterPreferredFontFormat(cssText, options);
    const urls = parseURLs(filteredCSSText);
    return urls.reduce((deferred, url) => deferred.then((css) => embed(css, url, baseUrl, options)), Promise.resolve(filteredCSSText));
  }

  // node_modules/html-to-image/es/embed-images.js
  async function embedBackground(clonedNode, options) {
    var _a;
    const background = (_a = clonedNode.style) === null || _a === void 0 ? void 0 : _a.getPropertyValue("background");
    if (background) {
      const cssString = await embedResources(background, null, options);
      clonedNode.style.setProperty("background", cssString, clonedNode.style.getPropertyPriority("background"));
    }
  }
  async function embedImageNode(clonedNode, options) {
    if (!(clonedNode instanceof HTMLImageElement && !isDataUrl(clonedNode.src)) && !(clonedNode instanceof SVGImageElement && !isDataUrl(clonedNode.href.baseVal))) {
      return;
    }
    const url = clonedNode instanceof HTMLImageElement ? clonedNode.src : clonedNode.href.baseVal;
    const dataURL = await resourceToDataURL(url, getMimeType(url), options);
    await new Promise((resolve, reject) => {
      clonedNode.onload = resolve;
      clonedNode.onerror = reject;
      const image = clonedNode;
      if (image.decode) {
        image.decode = resolve;
      }
      if (clonedNode instanceof HTMLImageElement) {
        clonedNode.srcset = "";
        clonedNode.src = dataURL;
      } else {
        clonedNode.href.baseVal = dataURL;
      }
    });
  }
  async function embedChildren(clonedNode, options) {
    const children = toArray(clonedNode.childNodes);
    const deferreds = children.map((child) => embedImages(child, options));
    await Promise.all(deferreds).then(() => clonedNode);
  }
  async function embedImages(clonedNode, options) {
    if (clonedNode instanceof Element) {
      await embedBackground(clonedNode, options);
      await embedImageNode(clonedNode, options);
      await embedChildren(clonedNode, options);
    }
  }

  // node_modules/html-to-image/es/apply-style.js
  function applyStyle(node, options) {
    const { style } = node;
    if (options.backgroundColor) {
      style.backgroundColor = options.backgroundColor;
    }
    if (options.width) {
      style.width = `${options.width}px`;
    }
    if (options.height) {
      style.height = `${options.height}px`;
    }
    const manual = options.style;
    if (manual != null) {
      Object.keys(manual).forEach((key) => {
        style[key] = manual[key];
      });
    }
    return node;
  }

  // node_modules/html-to-image/es/embed-webfonts.js
  var cssFetchCache = {};
  async function fetchCSS(url) {
    let cache2 = cssFetchCache[url];
    if (cache2 != null) {
      return cache2;
    }
    const res = await fetch(url);
    const cssText = await res.text();
    cache2 = { url, cssText };
    cssFetchCache[url] = cache2;
    return cache2;
  }
  async function embedFonts(data, options) {
    let cssText = data.cssText;
    const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
    const fontLocs = cssText.match(/url\([^)]+\)/g) || [];
    const loadFonts = fontLocs.map(async (loc) => {
      let url = loc.replace(regexUrl, "$1");
      if (!url.startsWith("https://")) {
        url = new URL(url, data.url).href;
      }
      return fetchAsDataURL(url, options.fetchRequestInit, ({ result }) => {
        cssText = cssText.replace(loc, `url(${result})`);
        return [loc, result];
      });
    });
    return Promise.all(loadFonts).then(() => cssText);
  }
  function parseCSS(source) {
    if (source == null) {
      return [];
    }
    const result = [];
    const commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
    let cssText = source.replace(commentsRegex, "");
    const keyframesRegex = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
    while (true) {
      const matches = keyframesRegex.exec(cssText);
      if (matches === null) {
        break;
      }
      result.push(matches[0]);
    }
    cssText = cssText.replace(keyframesRegex, "");
    const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
    const combinedCSSRegex = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})";
    const unifiedRegex = new RegExp(combinedCSSRegex, "gi");
    while (true) {
      let matches = importRegex.exec(cssText);
      if (matches === null) {
        matches = unifiedRegex.exec(cssText);
        if (matches === null) {
          break;
        } else {
          importRegex.lastIndex = unifiedRegex.lastIndex;
        }
      } else {
        unifiedRegex.lastIndex = importRegex.lastIndex;
      }
      result.push(matches[0]);
    }
    return result;
  }
  async function getCSSRules(styleSheets, options) {
    const ret = [];
    const deferreds = [];
    styleSheets.forEach((sheet) => {
      if ("cssRules" in sheet) {
        try {
          toArray(sheet.cssRules || []).forEach((item, index) => {
            if (item.type === CSSRule.IMPORT_RULE) {
              let importIndex = index + 1;
              const url = item.href;
              const deferred = fetchCSS(url).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
                try {
                  sheet.insertRule(rule, rule.startsWith("@import") ? importIndex += 1 : sheet.cssRules.length);
                } catch (error) {
                  console.error("Error inserting rule from remote css", {
                    rule,
                    error
                  });
                }
              })).catch((e) => {
                console.error("Error loading remote css", e.toString());
              });
              deferreds.push(deferred);
            }
          });
        } catch (e) {
          const inline = styleSheets.find((a) => a.href == null) || document.styleSheets[0];
          if (sheet.href != null) {
            deferreds.push(fetchCSS(sheet.href).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
              inline.insertRule(rule, sheet.cssRules.length);
            })).catch((err) => {
              console.error("Error loading remote stylesheet", err.toString());
            }));
          }
          console.error("Error inlining remote css file", e.toString());
        }
      }
    });
    return Promise.all(deferreds).then(() => {
      styleSheets.forEach((sheet) => {
        if ("cssRules" in sheet) {
          try {
            toArray(sheet.cssRules || []).forEach((item) => {
              ret.push(item);
            });
          } catch (e) {
            console.error(`Error while reading CSS rules from ${sheet.href}`, e.toString());
          }
        }
      });
      return ret;
    });
  }
  function getWebFontRules(cssRules) {
    return cssRules.filter((rule) => rule.type === CSSRule.FONT_FACE_RULE).filter((rule) => shouldEmbed(rule.style.getPropertyValue("src")));
  }
  async function parseWebFontRules(node, options) {
    if (node.ownerDocument == null) {
      throw new Error("Provided element is not within a Document");
    }
    const styleSheets = toArray(node.ownerDocument.styleSheets);
    const cssRules = await getCSSRules(styleSheets, options);
    return getWebFontRules(cssRules);
  }
  async function getWebFontCSS(node, options) {
    const rules = await parseWebFontRules(node, options);
    const cssTexts = await Promise.all(rules.map((rule) => {
      const baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
      return embedResources(rule.cssText, baseUrl, options);
    }));
    return cssTexts.join("\n");
  }
  async function embedWebFonts(clonedNode, options) {
    const cssText = options.fontEmbedCSS != null ? options.fontEmbedCSS : options.skipFonts ? null : await getWebFontCSS(clonedNode, options);
    if (cssText) {
      const styleNode = document.createElement("style");
      const sytleContent = document.createTextNode(cssText);
      styleNode.appendChild(sytleContent);
      if (clonedNode.firstChild) {
        clonedNode.insertBefore(styleNode, clonedNode.firstChild);
      } else {
        clonedNode.appendChild(styleNode);
      }
    }
  }

  // node_modules/html-to-image/es/index.js
  async function toSvg(node, options = {}) {
    const { width, height } = getImageSize(node, options);
    const clonedNode = await cloneNode(node, options, true);
    await embedWebFonts(clonedNode, options);
    await embedImages(clonedNode, options);
    applyStyle(clonedNode, options);
    const datauri = await nodeToDataURL(clonedNode, width, height);
    return datauri;
  }
  async function toCanvas(node, options = {}) {
    const { width, height } = getImageSize(node, options);
    const svg = await toSvg(node, options);
    const img = await createImage(svg);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const ratio = options.pixelRatio || getPixelRatio();
    const canvasWidth = options.canvasWidth || width;
    const canvasHeight = options.canvasHeight || height;
    canvas.width = canvasWidth * ratio;
    canvas.height = canvasHeight * ratio;
    if (!options.skipAutoScale) {
      checkCanvasDimensions(canvas);
    }
    canvas.style.width = `${canvasWidth}`;
    canvas.style.height = `${canvasHeight}`;
    if (options.backgroundColor) {
      context.fillStyle = options.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  async function toPng(node, options = {}) {
    const canvas = await toCanvas(node, options);
    return canvas.toDataURL();
  }

  // index.js
  let config = {
      width: 50,
      height: 50,
      color: "white",
      drawing: true,
      eraser: false
    
  }
   
  var events = {
    mousedown: false
  };
  document.querySelector(".select-file").addEventListener("click", function(e) {
    this.value = null;
  });
  document.querySelector(".select-file").addEventListener("change", function(e) {
    let files = e.target.files;
    let f = files[0];
    let reader = new FileReader();
    document.querySelector(".error").classList.remove("active");
    reader.onload = async function(file) {
      if (file.type == "image/png" || file.type == "image/jpg" || file.type == "image/gif" || file.type == "image/jpeg") {
        const bitmap = await createImageBitmap(file);
        const canvas = document.querySelector("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 9999, 9999);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        let constructPixelData = [];
        for (let i = 0; i < config.width; ++i) {
          for (let j = 0; j < config.height; ++j) {
            let pixelData = canvas.getContext("2d").getImageData(i, j, 1, 1).data;
            if (pixelData[3] !== 0) {
              constructPixelData.push({ x: i, y: j, color: `rgb(${pixelData[0]} ${pixelData[1]} ${pixelData[2]})` });
            }
          }
        }
        constructPixelData.forEach(function(i) {
          let getPixel = document.querySelector(`.pixel[data-x-coordinate="${i.x}"][data-y-coordinate="${i.y}"]`);
          if (getPixel !== null) {
            getPixel.setAttribute("data-color", i.color);
            getPixel.style.background = i.color;
          }
        });
      } else {
        document.querySelector(".error").textContent = "Пожалуйста выберите png/jpg формат файла для загрузки.";
        document.querySelector(".error").classList.add("active");
      }
    }(f);
  });
  const loader = async (param) =>{
    const loader = document.querySelector('#loader')
    if(param){
      loader.style.display = 'block'
    }
    else{
      loader.style.display = 'none'
    }
      
  }
  document.querySelector('#pixel-art-options').addEventListener('submit',async (e) =>{
    e.preventDefault();
    
    const arr = document.querySelectorAll('input[type="number"]');
   
    let w = parseInt(arr[0].value)
    let h  = parseInt(arr[1].value)
    config.width = w
    config.height = h
    const make = async () =>{
      document.getElementById("pixel-art-area").style.width = `calc(${0.825 * config.width}rem + ${config.height * 3}px)`;
      document.getElementById("pixel-art-area").style.height = `calc(${0.825 * config.height}rem + ${config.width * 3}px)`;
      document.getElementById("pixel-art-area").style.display = 'flex';
      document.getElementById("pixel-art-options").style.width = `calc(${0.825 * config.width}rem + ${config.height * 3}px)`;
      for (let i = 0; i < config.width; ++i) {
        for (let j = 0; j < config.height; ++j) {
          let createEl = document.createElement("div");
          createEl.classList.add("pixel");
          createEl.setAttribute("data-x-coordinate", j);
          createEl.setAttribute("data-y-coordinate", i);
          document.getElementById("pixel-art-area").appendChild(createEl);
        }
      }
      document.querySelectorAll(".pixel").forEach(function(item) {
        item.addEventListener("pointerdown", function(e) {
          if (config.eraser === true) {
            item.setAttribute("data-color", null);
            item.style.background = `#0a0c11`;
          } else {
            item.setAttribute("data-color", config.color);
            item.style.background = `${config.color}`;
          }
          events.mousedown = true;
        });
      });
    }
  
     
    document.querySelector("#pixel-art-area").style.visibility = 'hidden'
  
    await loader(true)
    setTimeout(async () =>{
      await make()
    await loader(false)
    document.querySelector("#pixel-art-area").style.visibility = 'visible'
    document.querySelector(".modal-open").style.display = 'block'
    },500)
  })
    
    
  document.querySelector('.generate-modal').onclick = (e) =>{
    if(document.querySelector('.pixel[style]')){
      document.querySelector('#modal').style.display = 'flex'
      return document.querySelector('#filter').style.display = 'block'
    }
      alert('Хотя бы 1 пиксель должен быть закрашен!')
    
    
  }
  
  document.querySelectorAll('.tabs li').forEach((e) =>{
    e.onclick = (vt) =>{
      if(!e.classList.contains('activate')){
        e.classList.toggle('activate');
        document.querySelector(`#${e.children[0].href.slice(e.children[0].href.length-3)}`).classList.toggle('activateLi');
       
       
      [...e.parentNode.children].filter(n => n !== e)[0].classList.remove('activate')
      }
    
      if(`${e.children[0].href.slice(e.children[0].href.length-3)}` == 'css'){
        document.querySelector(`#css`).classList.add('activateLi');
        document.querySelector(`#img`).classList.remove('activateLi');
      }
      else{
        document.querySelector(`#img`).classList.add('activateLi');
        document.querySelector(`#css`).classList.remove('activateLi');
      }
     
      
    }
  })
 document.querySelector('.select-file').onclick = (e) =>{
  if(document.querySelector('.pixel') === null){
    e.preventDefault()
    alert('Сгенерируйте сетку!')
  }
 }

  document.getElementById('filter').onclick = (e) =>{
    e.target.style.display = 'none'
    document.querySelectorAll('.tab').forEach(e => e.classList.remove('activate'))
    document.querySelectorAll('.tabs-elems').forEach(e => e.classList.remove('activateLi'))
    document.querySelector('#modal').style.display = 'none'
  
    
   
  }
 
  document.getElementById("pixel-art-area").addEventListener("pointermove", function(e) {
    if (config.drawing === true && events.mousedown === true || config.eraser === true && events.mousedown === true) {
      if (e.target.matches(".pixel")) {
        if (config.eraser === true) {
          e.target.setAttribute("data-color", null);
          e.target.style.background = `#0a0c11`;
        } else {
          e.target.setAttribute("data-color", config.color);
          e.target.style.background = `${config.color}`;
        }
      }
    }
  });
  document.body.addEventListener("pointerup", function(e) {
    events.mousedown = false;
  });
  ["click", "input"].forEach(function(item) {
    document.querySelector(".color-picker").addEventListener(item, function() {
      document.querySelector(".error").classList.remove("active");
      config.color = this.value;
      document.querySelectorAll(".colors > div").forEach(function(i) {
        i.classList.remove("current");
      });
      this.classList.add("current");
      config.eraser = false;
      document.querySelector(".eraser-container").classList.remove("current");
    });
  });
  document.querySelectorAll(".colors > div").forEach(function(item) {
    document.querySelector(".error").classList.remove("active");
    if (item.classList.contains("select-color")) {
      return false;
    } else {
      item.addEventListener("click", function(e) {
        document.querySelector(".color-picker").classList.remove("current");
        document.querySelectorAll(".colors > div").forEach(function(i) {
          i.classList.remove("current");
        });
        item.classList.add("current");
        config.eraser = false;
        config.color = `${item.getAttribute("data-color")}`;
        document.querySelector(".eraser-container").classList.remove("current");
      });
    }
  });
  document.querySelector(".reset").addEventListener("click", function(e) {
    document.querySelector(".error").classList.remove("active");
    document.querySelectorAll(".pixel").forEach(function(item) {
      item.setAttribute("data-color", null);
      item.style.background = "#0a0c11";
    });
  });
  


  document.querySelector(".eraser").addEventListener("click", function(e) {
    document.querySelector(".error").classList.remove("active");
    document.querySelectorAll(".colors > div").forEach(function(i) {
      i.classList.remove("current");
    });
    document.querySelector(".color-picker").classList.remove("current");
    if (this.classList.contains("current")) {
      this.parentElement.classList.remove("current");
      document.querySelector(".color > div").classList.add("current");
      config.color = "white";
      config.eraser = false;
    } else {
      this.parentElement.classList.add("current");
      config.eraser = true;
    }
  });

  document.querySelector('.generate-img').onclick =  () =>{
let boxShadow = `.pixelart {
        width: 1px;
        height: 1px;
        transform: scale(5);
        background: transparent;
        box-shadow: `;
document.querySelectorAll(".pixel").forEach(function(item) {
  if (item.getAttribute("data-color") !== "null" && item.getAttribute("data-color") !== null) {
    let x = item.getAttribute("data-x-coordinate");
    let y = item.getAttribute("data-y-coordinate");
    let color = item.getAttribute("data-color");
    boxShadow += `${x}px ${y}px ${color}, `;
  }
});
boxShadow = boxShadow.slice(0, -2);
boxShadow = `${boxShadow};
}`;
let newStyle = document.createElement("style");
newStyle.innerHTML = boxShadow;

let newPixelArt = document.createElement("div");
newPixelArt.append(newStyle)
newPixelArt.classList.add("pixelart");
  document.getElementById('popup-pixel-art').append(newPixelArt);

  let div = document.createElement("div");
  div.style = boxShadow.slice(12,boxShadow.length-2)

 

  
  
  const bg = document.querySelector('#white-bg')
  
  bg.style.height = `${config.height*5}px`
  bg.style.width = `${config.width*5}px`
  bg.appendChild(div)
  setTimeout(() =>{
    toPng(bg).then((data) => {
      let link = document.querySelector('.link-img')
      link.href = data
      link.style.display = 'inline'
    })
  },5000)
  
  
 
  }

  document.querySelector(".generate-css").addEventListener("click", function(e) {
    document.querySelector(".error").classList.remove("active");
    document.getElementById("popup-pixel-art").innerHTML = `
        <h2>Pixel Art Code</h2>
        <p>Скопируйе код ниже на свой сайт</p>
        <div class="close"><i class="fal fa-times"></i></div>`;
    let boxShadow = `.pixelart {
            width: 1px;
            height: 1px;
            transform: scale(5);
            background: transparent;
            box-shadow: `;
    document.querySelectorAll(".pixel").forEach(function(item) {
      if (item.getAttribute("data-color") !== "null" && item.getAttribute("data-color") !== null) {
        let x = item.getAttribute("data-x-coordinate");
        let y = item.getAttribute("data-y-coordinate");
        let color = item.getAttribute("data-color");
        boxShadow += `${x}px ${y}px ${color}, `;
      }
    });
    boxShadow = boxShadow.slice(0, -2);
    boxShadow = `${boxShadow};
    }`;
    let boxShadowCode = `
    &lt;<span class="token tag">div</span> <span class="token attr-name">class</span>="<span class="token attr-value">pixelart</span>">&lt;/<span class="token attr-name">div</span>>
    &lt;<span class="token tag">style</span> <span class="token attr-name">type</span>="<span class="token attr-value">text/css</span>">
    <span class="token selector">.pixelart</span> {
        <span class="token property">width</span>: <span class="token number">1</span>px;
        <span class="token property">height</span>: <span class="token number">1</span>px;
        <span class="token property">transform</span>: scale(<span class="token number">20</span>);
        <span class="token property">background</span>: transparent;
        <span class="token property">box-shadow</span>: `;
    document.querySelectorAll(".pixel").forEach(function(item) {
      if (item.getAttribute("data-color") !== "null" && item.getAttribute("data-color") !== null) {
        let x = item.getAttribute("data-x-coordinate");
        let y = item.getAttribute("data-y-coordinate");
        let color = item.getAttribute("data-color");
        boxShadowCode += `<span class="token number">${x}</span><span class="token unit">px</span> <span class="token number">${y}</span><span class="token unit">px</span> ${color}, `;
      }
    });
    boxShadowCode = boxShadowCode.slice(0, -2);
    boxShadowCode = `${boxShadowCode};
    }
    &lt;/<span class="token tag">style</span>>`;
    let newStyle = document.createElement("style");
    newStyle.innerHTML = boxShadow;
    document.body.append(newStyle);
    let newPixelArt = document.createElement("div");
    newPixelArt.classList.add("pixelart");
    
    
     
     
      let newCodeBlock = document.createElement("pre");
      newCodeBlock.innerHTML = `<code>${boxShadowCode}</code>`;
      document.getElementById("popup-pixel-art").append(newCodeBlock);
      document.getElementById('popup-pixel-art').append(newPixelArt);
      document.getElementById("popup-pixel-art").classList.add("active");
     
      
      
  });
 
  var parent = function(el, match, last) {
    var result = [];
    for (var p = el && el.parentElement; p; p = p.parentElement) {
      result.push(p);
      if (p.matches(match)) {
        break;
      }
    }
    if (last == 1) {
      return result[result.length - 1];
    } else {
      return result;
    }
  };
})();
