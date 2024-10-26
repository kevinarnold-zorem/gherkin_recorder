const puppeteer = function (scriptName, isWithComment = false) {

    var _scriptName = scriptName || ""

    /** version 0.1 2009-04-30
     * @author      Andrea Giammarchi
     * @license     Mit Style License
     * @project     http://code.google.com/p/css2xpath/
     */
    css2xpath = (function () { var b = [/\[([^\]~\$\*\^\|\!]+)(=[^\]]+)?\]/g, "[@$1$2]", /\s*,\s*/g, "|", /\s*(\+|~|>)\s*/g, "$1", /([a-zA-Z0-9\_\-\*])~([a-zA-Z0-9\_\-\*])/g, "$1/following-sibling::$2", /([a-zA-Z0-9\_\-\*])\+([a-zA-Z0-9\_\-\*])/g, "$1/following-sibling::*[1]/self::$2", /([a-zA-Z0-9\_\-\*])>([a-zA-Z0-9\_\-\*])/g, "$1/$2", /\[([^=]+)=([^'|"][^\]]*)\]/g, "[$1='$2']", /(^|[^a-zA-Z0-9\_\-\*])(#|\.)([a-zA-Z0-9\_\-]+)/g, "$1*$2$3", /([\>\+\|\~\,\s])([a-zA-Z\*]+)/g, "$1//$2", /\s+\/\//g, "//", /([a-zA-Z0-9\_\-\*]+):first-child/g, "*[1]/self::$1", /([a-zA-Z0-9\_\-\*]+):last-child/g, "$1[not(following-sibling::*)]", /([a-zA-Z0-9\_\-\*]+):only-child/g, "*[last()=1]/self::$1", /([a-zA-Z0-9\_\-\*]+):empty/g, "$1[not(*) and not(normalize-space())]", /([a-zA-Z0-9\_\-\*]+):not\(([^\)]*)\)/g, function (f, e, d) { return e.concat("[not(", a(d).replace(/^[^\[]+\[([^\]]*)\].*$/g, "$1"), ")]") }, /([a-zA-Z0-9\_\-\*]+):nth-child\(([^\)]*)\)/g, function (f, e, d) { switch (d) { case "n": return e; case "even": return "*[position() mod 2=0 and position()>=0]/self::" + e; case "odd": return e + "[(count(preceding-sibling::*) + 1) mod 2=1]"; default: d = (d || "0").replace(/^([0-9]*)n.*?([0-9]*)$/, "$1+$2").split("+"); d[1] = d[1] || "0"; return "*[(position()-".concat(d[1], ") mod ", d[0], "=0 and position()>=", d[1], "]/self::", e) } }, /:contains\(([^\)]*)\)/g, function (e, d) { return "[contains(text(),'" + d + "')]" }, /\[([a-zA-Z0-9\_\-]+)\|=([^\]]+)\]/g, "[@$1=$2 or starts-with(@$1,concat($2,'-'))]", /\[([a-zA-Z0-9\_\-]+)\*=([^\]]+)\]/g, "[contains(@$1,$2)]", /\[([a-zA-Z0-9\_\-]+)~=([^\]]+)\]/g, "[contains(concat(' ',normalize-space(@$1),' '),concat(' ',$2,' '))]", /\[([a-zA-Z0-9\_\-]+)\^=([^\]]+)\]/g, "[starts-with(@$1,$2)]", /\[([a-zA-Z0-9\_\-]+)\$=([^\]]+)\]/g, function (f, e, d) { return "[substring(@".concat(e, ",string-length(@", e, ")-", d.length - 3, ")=", d, "]") }, /\[([a-zA-Z0-9\_\-]+)\!=([^\]]+)\]/g, "[not(@$1) or @$1!=$2]", /#([a-zA-Z0-9\_\-]+)/g, "[@id='$1']", /\.([a-zA-Z0-9\_\-]+)/g, "[contains(concat(' ',normalize-space(@class),' '),' $1 ')]", /\]\[([^\]]+)/g, " and ($1)"], c = b.length; return function a(e) { var d = 0; while (d < c) { e = e.replace(b[d++], b[d++]) } return "//" + e } })();

    const locatorType = {

        xpath: (target) => {
            return target
        },
        css: (target) => {
            return css2xpath(target)
        },
        absoluteCSS: (target) => {
            return css2xpath(target)
        },
        id: (target) => {
            return "//*[@id=\"" + target + "\"]";
        },
        link: (target) => {
            let offset = 0;
            if (target.substring(0, 6) == 'exact:') {
                offset = 6
            }
            return "//a[contains(text(),'" + target.substring(offset, target.length) + "')]";
        },
        name: (target) => {
            return "//*[@name=\"" + target + "\"]";
        },

        // tag_name: (target) => {
        //     return `By.tagName("${target.replace(/\"/g, "\'")}")`
        // }

    }

    function locator(target) {

        if (target.substring(0, 1) === "/" || target.substring(0, 2) === "//") {
            return target;
        }

        let locType = target.split("=", 1)
        let selectorStr = target.substr(target.indexOf("=") + 1, target.length)
        let locatorFunc = locatorType[locType]
        if (typeof (locatorFunc) == 'undefined') {
            // return `By.xpath("${target.replace(/\"/g, "\'")}")`
            // return 'not defined'
            return target
        }

        return locatorFunc(selectorStr)

    }


    // built in selenium vars
    // https://github.com/Jongkeun/selenium-ide/blob/6d18a36991a9541ab3e9cad50c2023b0680e497b/packages/selenium-ide/src/content/selenium-api.js
    // https://github.com/GoogleChrome/puppeteer/blob/master/lib/USKeyboardLayout.js
    let keyDictionary = {
        '${KEY_LEFT}': 'ArrowLeft',
        '${KEY_UP}': 'ArrowUp',
        '${KEY_RIGHT}': 'ArrowRight',
        '${KEY_DOWN}': 'ArrowDown',
        '${KEY_PGUP}': 'PageUp',
        '${KEY_PAGE_UP}': 'PageUp',
        '${KEY_PGDN}': 'PageDown',
        '${KEY_PAGE_DOWN}': 'PageDown',
        '${KEY_BKSP}': 'Backspace',
        '${KEY_BACKSPACE}': 'Backspace',
        '${KEY_DEL}': 'Delete',
        '${KEY_DELETE}': 'Delete',
        '${KEY_ENTER}': 'Enter',
        '${KEY_TAB}': 'Tab',
        '${KEY_HOME}': 'Home'
    };

    function puppeteerReplaceAll(inputString, str1, str2, ignore) {
        return inputString.replace(
          new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
            (ignore ? "gi" : "g")),
          (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2
        );
    }

    function seleniumKeyVars(originalValue) {
        let modifiedValue = originalValue;


        console.log("originalValue", originalValue);
        // loop over all selenium vars and replace all instances with the value in keyDictionary
        Object.keys(keyDictionary).forEach(key =>
          modifiedValue = puppeteerReplaceAll(modifiedValue, key, keyDictionary[key])
        );

        console.log("modifiedValue", modifiedValue);

        return modifiedValue;
    }


    // NR Synthetics
    // https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/synthetics-scripted-browser-reference-monitor-versions-050#browser-waitForAndFindElement
    // katalon
    // https://docs.katalon.com/katalon-recorder/docs/selenese-selenium-ide-commands-reference.html
    const seleneseCommands = {
        open: (x) => `await page.goto(\`${locator(x.target)}\`, { waitUntil: 'networkidle0' });`,
        doubleclick: (x) => `element = await page.$x(\`${locator(x.target)}\`);\n\tawait element[0].click({ clickCount: 2 });`,
        click: (x) => `element = await page.$x(\`${locator(x.target)}\`);\n\tawait element[0].click();${waitForNavigationIfNeeded(x)}`,
        store: (x) => `await let ${locator(x.target)} = ${x.value};`,
        type: (x) => `element = await page.$x(\`${locator(x.target)}\`);\n\tawait element[0].type(\`${x.value}\`);`,
        pause: (x) => `await page.waitFor(parseInt('${locator(x.target)}'));`,
        mouseover: (x) => `await page.hover(\`${locator(x.target)}\`);`,
        deleteallvisiblecookies: (x) => `await page.deleteCookie(await page.cookies());`,
        capturescreenshot: (x) => `await page.screenshot({ path: \`${locator(x.target || "screenshot")}.jpg\` });`,
        captureentirepagescreenshot: (x) => `await page.screenshot({ path: \`${locator(x.target || "screenshot")}.jpg\`, fullPage: true });`,
        bringbrowsertoforeground: (x) => `await page.bringToFront();`,
        refresh: (x) => `await page.reload();`,
        echo: (x) => `console.log(\`${locator(x.target)}\`, \`${x.value}\`);`,
        get: (x) => `await page.goto(\`${locator(x.target)}\`);${waitForNavigationIfNeeded(x)}`,
        comment: (x) => `// ${locator(x.target)}`,
        submit: (x) => `formElement = await page.$x(\`${locator(x.target)}\`);\n\tawait page.evaluate(form => form.submit(), formElement[0]);\n\tawait page.waitForNavigation();`,
        sendkeys: (x) => `await page.keyboard.press(\`${seleniumKeyVars(x.value)}\`)${waitForNavigationIfNeeded(x)}`,
        selectframe: (x) => `var frames = await page.frames();\n\tvar newFrame = await frames.find(f => f.name() === \`${x.target}\`);`,
        selectwindow: (x) => `tabs = await browser.pages();\n\tconsole.log(tabs);`,
        assertelementpresent: (x) => `if (await page.$(\`${locator(x.target)}\`) !== null) { console.log("assertElementPresent PASSED."); } else { throw "assertElementPresent FAILED. Element not found."; }`,
        verifyelementpresent: (x) => `if (await page.$(\`${locator(x.target)}\`) !== null) { console.log("verifyElementPresent PASSED."); } else { console.log("verifyElementPresent FAILED. Element not found."); }`,
        waitforpagetoload: (x) => `await page.waitForFunction(() => { while (document.readyState !== 'complete'); return true; });`,
        waitforvisible: (x) => `await page.waitForXPath(\`${locator(x.target)}\`, { visible: true });`,
        waitforelementpresent: (x) => `await page.waitForXPath(\`${locator(x.target)}\`);`,
    };

    /**
     * Automatically adds "waitForNavigation" if the command needs it
     * @param {{command: string, target: string, value: string}} command
     * @return string}
     */
    function waitForNavigationIfNeeded(command) {
        if (command.target.toLowerCase().startsWith("link=")) {
            // It's a link, the page is probably going to change
            return `\n\tawait page.waitForNavigation();`;
        }

        return "";
    }

    const header =
      "// Script Name: {_SCRIPT_NAME_}\n\n" +
      "const puppeteer = require('puppeteer');\n\n" +
      "(async () => {\n" +
      "const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args: ['--start-maximized'] });\n" +
      "const page = await browser.newPage();\n" +
      "let element, formElement, tabs;\n\n"

    const footer =
      "await browser.close();\n" +
      "})();"


    function formatter(commands) {

        return header.replace(/_SCRIPT_NAME_/g, _scriptName) +
          commandExports(commands).content +
          footer +
          funcExports()


    }

    function commandExports(commands) {

        let output = commands.reduce((accObj, commandObj) => {
            let { command, target, value } = commandObj

            let cmd = seleneseCommands[command.toLowerCase()]
            if (typeof (cmd) == "undefined") {
                accObj.content += `\n\n\t// WARNING: unsupported command ${command}. Object= ${JSON.stringify(commandObj)}\n\n`
                return accObj
            }

            let cmdString = cmd(commandObj)

            if (typeof (accObj) == "undefined") {
                accObj = { step: 1, content: "" }
            }

            accObj.step += 1
            if (isWithComment) {
                let oldCommand = `Command: ${command}, Target: ${target}, Value: ${value}`
                accObj.content +=
                  `// Original Zorem Recorder info - ${oldCommand}\n`
            }
            accObj.content += `${cmdString}\n`

            return accObj
        }, { step: 1, content: "" })


        return output
    }

    function funcExports() {
        let funcs = ''
        return funcs
    }

    return {
        formatter,
        commandExports,
        funcExports,
        locator,
        seleneseCommands,
        locatorType,
        specialKeyMap: keyDictionary
    }

}

const gherkin = function(commands) {
    let gherkinContent = "#language: es\n";
    gherkinContent += "Característica: Título del Scenario\n\n";
    gherkinContent += "  @marca_demo\n";
    gherkinContent += "  Escenario: Nombre del Scenario - no voy a hacer todo\n";

    commands.forEach(commandObj => {
        const { command, target, value } = commandObj;

        let targetValue = target.includes('=') ? target.split('=')[1] : 'Webelement';

        switch (command.toLowerCase()) {
            case 'open':
                gherkinContent += `    Dado que estoy en la página '${target}'\n`;
                break;
            case 'click':
                gherkinContent += `    Y hago clic en el elemento '${targetValue}'\n`;
                break;
            case 'waitforvisible':
                gherkinContent += `    Y espero hasta que el elemento '${targetValue}' sea visible\n`;
                break;
            case 'doubleclick':
                gherkinContent += `    Y hago doble clic en el elemento '${targetValue}'\n`;
                break;
            case 'hover':
                gherkinContent += `    Y hago hover en el elemento '${targetValue}'\n`;
                break;
            case 'select':
                gherkinContent += `    Y se pulsa sobre el desplegable '${targetValue}' y selecciona el valor '${value}'\n`;
                break;
            case 'scrollto':
                gherkinContent += `    Y desplazo la página al elemento '${targetValue}'\n`;
                break;
            case 'verifytext':
                gherkinContent += `    Entonces valido que el elemento '${targetValue}' tiene el texto '${value}'\n`;
                break;
            case 'type':
                gherkinContent += `    Y relleno el elemento '${targetValue}' con el valor '${value}'\n`;
                break;
            case 'scrolltoelement':
                gherkinContent += `    Y desplazo la página al elemento '${targetValue}'\n`;
                break;
            case 'verifytitle':
                gherkinContent += `    Entonces valido que el elemento '${targetValue}' tiene el title '${value}'\n`;
                break;      
            case 'verifyvalue':
                gherkinContent += `    Entonces valido que el elemento '${targetValue}' tiene el valor '${value}'\n`;
                break;
            case 'asserttext':
                gherkinContent += `    Entonces verifico que el elemento '${targetValue}' contiene el texto '${value}'\n`;
                break;   
            case 'asserttitle':
                gherkinContent += `    Entonces verifico que el elemento '${targetValue}' contiene el title '${value}'\n`;
                break;
            case 'assertvalue':
                gherkinContent += `    Entonces verifico que el elemento '${targetValue}' contiene el valor '${value}'\n`;
                break;
            case 'storetext':
                gherkinContent += `    Entonces almaceno el texto del elemento '${targetValue}' en la variable '${value}'\n`;
                break;
            case 'storetitle':
                gherkinContent += `    Entonces almaceno el titulo del elemento '${targetValue}' en la variable '${value}'\n`;
                break;     
            case 'storevalue':
                gherkinContent += `    Entonces almaceno el valor del elemento '${targetValue}' en la variable '${value}'\n`;
                break;
            case 'waitforelementpresent':
                gherkinContent += `    Y espero que el elemento '${targetValue}' este presente en el DOM\n`;
                break;
            case 'waitforelementnotpresent':
                gherkinContent += `    Y espero que el elemento '${targetValue}' no este presente en el DOM\n`;
                break;
            case 'waitfortextpresent':
                gherkinContent += `    Y espero hasta que el texto '${value}' esté presente en el elemento '${targetValue}'\n`;
                break;
            case 'waitfortextnotpresent':
                gherkinContent += `    Y espero hasta que el texto '${value}' ya no esté presente en el elemento '${targetValue}'\n`;
                break;
            case 'waitforvalue':
                gherkinContent += `    Y espero hasta que el elemento '${targetValue}' tenga el valor '${value}'\n`;
                break;
            case 'waitfornotvalue':
                gherkinContent += `    Y espero hasta que el elemento '${targetValue}' ya no tenga el valor '${value}'\n`;
                break;
            case 'waitfornotvisible':
                gherkinContent += `    Y espero hasta que el elemento '${targetValue}' ya no sea visible\n`;
                break;                           
            default:
                gherkinContent += `    # Comando no soportado: ${command} con target '${target}' y valor '${value}'\n`;
                break;
        }
    });

    return gherkinContent;
}

const locators = function(commands) {
    let locatorContent = '';
    let addedTargets = new Set();

    commands.forEach(commandObj => {
        const {command, target, locators } = commandObj;
        if(command.toLowerCase() != 'open'){
            let targetValue = target.includes('=') ? target.split('=')[1] : 'Webelement';

            if (!addedTargets.has(targetValue)) {
                let firstXpath = locators.find(locator => locator.startsWith('xpath=')) || '';
                firstXpath = firstXpath.replace('xpath=', '');
                locatorContent += `${targetValue}:@: ${firstXpath}\n`;
                addedTargets.add(targetValue);
            }
        }
        
    });

    return locatorContent;
};

$(document).ready(function(){
    newFormatters.puppeteer = function (name, commands) {
        return {
            content: puppeteer(name).formatter(commands),
            extension: 'js',
            mimetype: 'application/javascript'
        }
    }

    newFormatters.puppeteer_w_comment = function (name, commands) {
        return {
            content: puppeteer(name, true).formatter(commands),
            extension: 'js',
            mimetype: 'application/javascript'
        }
    }

    newFormatters.puppeteer_json = function (name, commands) {
        return {
            content: JSON.stringify(commands),
            extension: 'json',
            mimetype: 'application/ld-json'
        }
    }
    
    newFormatters.gherkin = function (name, commands) {
        return {
            content: gherkin(commands),
            extension: 'json',
            mimetype: 'application/feature'
        }
    }

    newFormatters.locators = function (name, commands) {
        return {
            content: locators(commands),
            extension: 'json',
            mimetype: 'application/loc'
        }
    }
})



