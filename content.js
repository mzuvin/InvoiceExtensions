/*https://gist.github.com/max-pub/a5c15b7831bbfaba7ad13acefc3d0781*/
XML = {
    parse: (string, type = 'text/xml') => new DOMParser().parseFromString(string, type),  // like JSON.parse
    stringify: DOM => new XMLSerializer().serializeToString(DOM),                         // like JSON.stringify

    transform: (xml, xsl) => {
        let proc = new XSLTProcessor();
        proc.importStylesheet(typeof xsl == 'string' ? XML.parse(xsl) : xsl);
        let output = proc.transformToFragment(typeof xml == 'string' ? XML.parse(xml) : xml, document);
        return typeof xml == 'string' ? XML.stringify(output) : output; // if source was string then stringify response, else return object
    },

    minify: node => XML.toString(node, false),
    prettify: node => XML.toString(node, true),
    toString: (node, pretty, level = 0, singleton = false) => { // einzelkind
        if (typeof node == 'string') node = XML.parse(node);
        let tabs = pretty ? Array(level + 1).fill('').join('\t') : '';
        let newLine = pretty ? '\n' : '';
        if (node.nodeType == 3) return (singleton ? '' : tabs) + node.textContent.trim() + (singleton ? '' : newLine)
        if (!node.tagName) return XML.toString(node.firstChild, pretty);
        let output = tabs + `<${node.tagName}`; // >\n
        for (let i = 0; i < node.attributes.length; i++)
            output += ` ${node.attributes[i].name}="${node.attributes[i].value}"`;
        if (node.childNodes.length == 0) return output + ' />' + newLine;
        else output += '>';
        let onlyOneTextChild = ((node.childNodes.length == 1) && (node.childNodes[0].nodeType == 3));
        if (!onlyOneTextChild) output += newLine;
        for (let i = 0; i < node.childNodes.length; i++)
            output += XML.toString(node.childNodes[i], pretty, level + 1, onlyOneTextChild);
        return output + (onlyOneTextChild ? '' : tabs) + `</${node.tagName}>` + newLine;
    }
}

function base64DecodeUtf8(base64String) {
    let binaryString = atob(base64String);
    let binaryLen = binaryString.length;
    let bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    let utf8String = new TextDecoder('utf-8').decode(bytes);
    return utf8String;
}

function transformXML(){
    var xmlStr= document.getElementById('webkit-xml-viewer-source-xml').innerHTML;
    const xmlDoc = new DOMParser().parseFromString(xmlStr, "application/xml");
    const xsltBase64Element =  xmlDoc.querySelector("EmbeddedDocumentBinaryObject");
    var xslt=base64DecodeUtf8(xsltBase64Element.textContent);
    if(xslt.startsWith("http")){
        fetch(xslt).then(resp=>resp.text()).then(xml=>{
            xslt=xml;
        })
    }
    var html=XML.transform(xmlStr,xslt)
    var htmlfinally="<!doctype html><html lang='tr'>"+html+"</html>";
    openHtmlInNewTab(htmlfinally);
}

function openHtmlInNewTab(htmlContent) {
    var newWindow = window.open();
    newWindow.document.write(htmlContent);
    newWindow.document.title = "Fatura";
    newWindow.document.close();
}
transformXML();