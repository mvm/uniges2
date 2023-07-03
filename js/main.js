var navbar, maincontent, router, session;

var _languages = [
    {id: "es", name:"Español"},
    {id: "en", name:"English"}
];

function template(str, dict) {
    return str.replaceAll(/{{([a-zA-Z_]+)}}/g,
    function (v, w) {
        return dict[w];
    });
}

function xmlEsc(str) {
    return str.replaceAll(/(&|<|>)/g, function (v, w) {
        switch(w) {
            case '&': return "&amp;";
            case '<': return "&lt;";
            case '>': return "&gt;";
        }
    });
}

function updateLanguage() {
    document.querySelectorAll("[text-id]").forEach ((e) => {
        e.innerHTML = _lang[e.getAttribute("text-id")];
    });
    document.querySelectorAll("[text-value]").forEach((e) => {
        e.value = _lang[e.getAttribute("text-value")];
    });
    document.querySelectorAll("[user-role]").forEach((e) => {
        if(e.getAttribute("user-role") != session.role) {
            e.remove();
        }
    });
    // document.querySelectorAll("[date-text]").forEach( e => {});
}

class Session {
    constructor() {
        this.bearer = null;
        this.login = null;
        this.language = "es";
        this.role = null;
    }

    init() {

    }

    render() {
        var oldLangScript = document.getElementById("langScript");
        oldLangScript.parentElement.removeChild(oldLangScript);

        var langScript = document.createElement("script");
        var langFile = `js/lang_${session.language}.js`;
        langScript.setAttribute("src", langFile);
        langScript.setAttribute("id", "langScript");
        langScript.addEventListener("load", function () {
            updateLanguage();
        });
        document.getElementsByTagName("head")[0].appendChild(langScript);
    }
}

class Navbar {
    constructor() {
        this.maincontent = document.getElementById("navbar");
        this.links = [{"title": "Home", "page": "#controller=home&action=home"}];
    }

    setLinks() {
        if(session.bearer) {
            this.links = [
                {"title":"{{link_home}}", "page":"#controller=home&action=home", "text_id":"link_home"},
                {"title":"{{link_user}}", "page":"#controller=usuarios&action=list", "text_id":"link_user"},
                {"title":"{{link_task}}", "page":"#controller=entregas&action=list", text_id:"link_task"},
                {"title":"{{link_requirements}}", "page":"#controller=historias&action=list", text_id:"link_requirements"},
                {"title":"{{link_submissions}}", "page":"#controller=entregausuario&action=list", text_id: "link_submissions"},
                {"title": "{{link_assessments}}", "page":"#controller=evaluaciones&action=list", "text_id": "link_assessments"},
                {"title":"{{link_results}}", "page":"#controller=resultados&action=list", text_id:"link_results"},
                {"title":"{{link_logout}}", "page":"#controller=usuarios&action=logout", text_id:"link_logout"}
            ];
        } else
            this.links = [
                {"title": "{{link_home}}", "page":"#controller=home&action=home", text_id:"link_home"},
                {"title":"{{link_login}}", "page":"#controller=usuarios&action=login", text_id:"link_login"},
                {"title":"{{link_register}}", "page": "#controller=usuarios&action=register", text_id:"link_register"}
            ];
    }

    renderLink(i) {
        if(this.links[i].user_role && this.links[i].user_role != session.role) {
            return "";
        }

        var l = "<li class=\"nav-item\"><a href=\"" + this.links[i].page + "\" class=\"nav-link\" ";
        if(this.links[i].text_id) {
            l += `text-id="${this.links[i].text_id}"`;
        }

        if(this.links[i].user_role) {
            l += ` user-role="${this.links[i].user_role}" `;
        }

        l += ">" + template(this.links[i].title, _lang) + "</a></li>";
        return l;
    }

    renderLinks() {
        this.setLinks();
        this.maincontent.innerHTML = "";
        var innerHTML = "<ul class=\"nav nav-pills\">\n";
        for(var i = 0; i < this.links.length; i++) {
            innerHTML += this.renderLink(i);
        }

        var langLi = "";
        for(let l of _languages) {
            langLi += `<li><a class="dropdown-item" onclick="setLanguage('${l["id"]}');">
            ${l["name"]}
            </a></li>`;
        }

        innerHTML += `<li class="dropdown nav-item">
            <a class="nav-link dropdown-toggle" href="#" role="button"
                id="dropdownLang" data-bs-toggle="dropdown"
                text-id="link_language">
                ${_lang["link_language"]}
            </a>

            <ul class="dropdown-menu" aria-labelledby="dropdownLang">
            ${langLi}
            </ul>
        </li>`;

        innerHTML += "</ul>\n";

        this.maincontent.innerHTML = innerHTML;
    }

    addLink(title, url) {
        this.links.push({"title":title, "page": url});
    }

    addLinkArray(arr) {
        this.links = this.links.concat(arr);
    }
}

class MainContent {
    constructor() {
        this.main = document.getElementById("maincontent");
    }
}

function allowedWithoutLogin(cont, action) {
    return ["home/home", "usuarios/login", "usuarios/register"].find( (e) =>
     `${cont}/${action}` == e
    );
}

class Router {
    constructor() {
        this.urlStr = window.location.hash;
        this.urlParams = new URLSearchParams(this.urlStr.substring(1));
        var url = window.location.pathname;
        this.basedir = url.substring(0, url.lastIndexOf('/')+1);
    }

    route() {
        this.urlStr = window.location.hash;
        this.urlParams = new URLSearchParams(this.urlStr.substring(1));

        var cont = this.urlParams.get("controller");
        var action = this.urlParams.get("action");

        if(cont == null)
            cont = "home";
        if(action == null || cont == "home")
            action = "home";
        
        if(session.bearer == null && !allowedWithoutLogin(cont, action)) {
            window.location.href = "#controller=usuarios&action=login";
            return;
        }
        

        var req = new XMLHttpRequest();
        req.addEventListener("load", function () {
            maincontent.main.innerHTML = template(req.responseText, _lang);
            loadJS();
            updateLanguage();
            
        });
        var getUrl = this.basedir + "view/" + cont + "/" + action + ".html";
        req.open("GET", getUrl);
        req.send();
    }
}

function setLanguage(l) {
    session.language = l;
    session.render();
    updateLanguage();
}

function getFormAsJSON(form, fields, validator) {
    var result = {};
    for(f of fields) {
        var value = document.forms[form][f].value;
        if(validator != null && 
            validator[f] != null) {

                if(typeof validator[f] == 'function') {
                    if(validator[f](value) == false) {
                        printError(`error validating field '${f}'`);
                        return null;
                    }
                } else if(typeof validator[f] == 'object') {
                    if(validator[f].fn && validator[f].msg && validator[f].text_id) {
                        if(validator[f].fn(value) == false) {
                            printJSONError(validator[f]);
                            return null;
                        }
                    } else {
                        alert(`Fields fn, msg, text_id not found in validator of '${f}'`);
                        return null;
                    }
                }        
        }
        result[f] = value;
    }
    return result;
}

function setFormFromJSON(form, fields, json) {
    if(document.forms[form] == undefined) {
        alert("Form " + form + " not found in page");
        return;
    }
    for(f of fields) {
        if(document.forms[form][f] != undefined) {
            document.forms[form][f].value = json[f];
        } else {
            alert("Field " + f + " not found in form " + form);
            return;
        }
    }
}

function setFormValid(form, fields, validator) {
    if(document.forms[form] == undefined) {
        alert("Form " + form + " not found in page");
        return;
    }

    if(validator == null) {
        alert("Validator is null in call to setFormValid");
        return;
    }

    for(f of fields) {
        var input_elem = document.getElementById(f + "Input");
        if(!input_elem) continue;
        input_elem.addEventListener('change', function (e) {
            
            var f = this.id.match(/([a-zA-Z]+)Input/)[1];

            if(validator[f]) {
                var valid_elem = document.getElementById(f + "Valid");
                if(!valid_elem) {
                    return;
                }

                var vfun = null;
                if(typeof validator[f] == 'function') {
                    vfun = validator[f]
                } else if(validator[f].fn) {
                    vfun = validator[f].fn;
                }

                if(vfun(this.value)) {
                    valid_elem.setAttribute("class", "bi-check");
                } else {
                    valid_elem.setAttribute("class", "bi-x");
                }
            }
        });
    }
}

function printJSONError(json) {
    if(json["text_id"]) {
        printError(_lang[json["text_id"]], json["text_id"]);
    } else {
        printError(json["msg"]);
    }
}

function printError(msg, text_id = null) {
    var div = document.getElementById("errorDiv");
    if(div == null) {
        alert(`Error: ${msg}`);
    } else {
        div.innerHTML = `
        <div class="alert alert-danger alert-dismissible" role="alert">
        <p>Error: <span ${text_id != null? "text-id=\"" + text_id + "\"" : "" }>${msg}</p>
        <button type="button" class="btn-close" data-bs-dismiss="alert"
            aria-label="Close" id="errorClose"></button>
        </div>
        `;
        updateLanguage();
    }
}

function initScriptCallbacks() {
    var elems = document.querySelectorAll('[fn]');
    for(e of elems) {
        e.onclick = function (e) {
            var fn = this.getAttribute("fn");
            var args = this.getAttribute("args");
            var argArr = [];
            if(args) {
                argArr = args.split(",");
            }
            if(!window[fn]) {
                alert("function " + fn + " does not exist");
                return;
            }
            var elem = this;
            window[fn](elem, ...argArr);
        };
    }
}

function removeItemFromElem(elem) {
    var parent = elem.parentElement;
    do {
        var role = parent.getAttribute("uniges-role");
        if(role != null && role == "item") {
            parent.remove();
        }
        parent = parent.parentElement;
    } while(parent);
}

function onLoadApp() {
    router = new Router();
    navbar = new Navbar();
    maincontent = new MainContent();
    session = new Session();

    session.init();
    navbar.renderLinks();
    session.render();
    router.route();

    window.onhashchange = function (event) {
        session.render();
        navbar.renderLinks();
        router.route();
    }
}

function loadJS() {
    var cont = router.urlParams.get("controller");

    var oldScript = document.getElementById("controllerScript");
    oldScript.parentElement.removeChild(oldScript);

    var scriptElement = document.createElement("script");
    scriptElement.setAttribute("src", "js/" + cont + ".js");
    scriptElement.setAttribute("id", "controllerScript");
    scriptElement.onload = function () {
        var action = router.urlParams.get("action");
        if(action) {
            window[action](); // llamar a función action
        }
        
    };
    document.getElementsByTagName("head")[0].appendChild(scriptElement);
}