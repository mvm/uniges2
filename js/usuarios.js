function login() {
}

var validatorLogin = {
    login: function (v) { return true; },
    password: function(v) { return true; }
};

// ["login", "password", "nombre", "apellidos", "dni", "email"]
var validatorUsuario = {
    login: {fn: function(v) { return /^[a-zA-Z0-9]+$/.test(v); },
        msg: "field Login cam contain letters and numbers only",
        text_id: "error_usuarios_login"},
    password: function(v) { return true; },
    nombre: function (v) { return true; },
    apellidos: function(v) { return true; },
    dni:  { fn: function (v) { return /^[0-9]{8}[a-zA-Z]$/.test(v); },
        msg: "field DNI must contain eight digits and one letter",
        text_id: "error_usuarios_dni"},
    email: {fn: function(v) { return /^[a-zA-Z.]+@[a-zA-Z.]+$/.test(v); },
        msg: "field Email must be a valid email address (x@y.z)",
        text_id: "error_usuarios_email"}
}

function onSubmitLogin() {
    let jsonReq = getFormAsJSON("loginForm", ["login", "password"], validatorLogin);
    if(jsonReq == false) return false;

    let jsonBody = JSON.stringify(jsonReq);

    var req = new XMLHttpRequest();
    req.open("POST", "rest.php?controller=usuarios&action=login");
    req.onload = function () {
        let reqJSON = JSON.parse(req.responseText);
        if(req.status == 200) {
            maincontent.main.innerHTML = "<p text-id=\"login_success\">" + _lang["login_success"] + "</p>";
            session.bearer = req.getResponseHeader("Authorization");
            var resp = JSON.parse(req.responseText);
            session.user = resp["login"];
            session.role = resp["role"];
            navbar.renderLinks();
        } else {
            printJSONError(reqJSON);
        }
    }
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(jsonBody);
    return false;
}

function list() {

    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=usuarios&action=list");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var table = document.getElementById("usuariosTable");
            var jsonArr = JSON.parse(req.responseText)["res"];
            for(r of jsonArr) {
                table.innerHTML += printListEntry(r);
            }
            initScriptCallbacks();
            updateLanguage();
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    }
    req.send();
}

function searchForm() {

}

function onSubmitSearchForm() {
    var json = getFormAsJSON("searchForm", ["login", "nombre", "apellidos", "dni", "email"], null);
    var queryStrArr = [];
    for(let j of Object.keys(json)) {
        if(json[j] != "" && json[j] != null) {
            queryStrArr.push(`${j}=${encodeURIComponent(json[j])}`);
        }
    }
    window.location.href = "#controller=usuarios&action=search&" + queryStrArr.join('&');
}

function search() {
    var fields = ["login", "nombre", "apellidos", "dni", "email"];
    var fieldValues = {};
    for(let f of fields) {
        if(router.urlParams.get(f)) {
            fieldValues[f] = router.urlParams.get(f);
        }
    }

    var queryStrArr = [];
    for(let f of Object.keys(fieldValues)) {
        queryStrArr.push(`${f}=${encodeURIComponent(fieldValues[f])}`);
    }
    var queryStr = queryStrArr.join('&');

    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=usuarios&action=search&" + queryStr);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var table = document.getElementById("usuariosTable");
            var jsonArr = JSON.parse(req.responseText)["res"];
            for(r of jsonArr) {
                table.innerHTML += printListEntry(r);
            }
            initScriptCallbacks();
            updateLanguage();
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    };
    req.send();
}

function printListEntry(row) {
    var str = "";
    str += "<tr uniges-role=\"item\">";
    str += "<td>" + xmlEsc(row["login"]) + "</td>";
    str += "<td>" + xmlEsc(row["nombre"]) + "</td>";
    str += "<td>" + xmlEsc(row["apellidos"]) + "</td>";
    str += "<td>" + xmlEsc(row["email"]) + "</td>";
    str += `<td><a user-role="profesor" class="btn btn-outline-primary btn-sm" fn="remove" args="${row["login"]}">X</a></td>`
    str += `<td><a text-id="link_edit" href="#controller=usuarios&action=modify&login=${encodeURIComponent(row["login"])}">Modificar</a></td>`
    str += "</tr>";
    return str;
}

function add() {
    setFormValid("addForm", ["login", "password", "nombre", "apellidos",
    "dni", "email"], validatorUsuario);
}

function remove(elem, login) {
    var json = {login: login};

    if(confirm(_lang["user_delete_confirm"]) == false) {
        return false;
    }

    var req = new XMLHttpRequest();
    req.open("DELETE", "rest.php?controller=usuarios&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            removeItemFromElem(elem);
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    }
    req.send(JSON.stringify(json));
}

function onSubmitAdd() {
    var json = getFormAsJSON("addForm", ["login", "password", "nombre", "apellidos",
        "dni", "email"], validatorUsuario);
    if(json == null)
        return false;

    var req = new XMLHttpRequest();
    req.open("POST", "rest.php?controller=usuarios&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location = "#controller=usuarios&action=list";  
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }        
    }
    req.send(JSON.stringify(json));
}

function modify() {
    var login = router.urlParams.get("login");

    var req = new XMLHttpRequest();
    req.open("GET", `rest.php?controller=usuarios&action=id&login=${encodeURIComponent(login)}`);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var json = JSON.parse(req.responseText)["res"];
            setFormFromJSON("modifyForm", ["password", "nombre", "apellidos", "dni", "email"], json);
            setFormValid("modifyForm", ["password", "nombre", "apellidos", "dni", "email"], validatorUsuario);
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    };
    req.send();
}

function onSubmitModify() {
    var login = router.urlParams.get("login");

    var json = getFormAsJSON("modifyForm", ["password", "nombre", "apellidos", "dni",
        "email"], validatorUsuario);
    if(json == null)
        return false;
    json["login"] = login;
    
    var req = new XMLHttpRequest();
    req.open("PUT", "rest.php?controller=usuarios&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href = "#controller=usuarios&action=list";
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    };
    req.send(JSON.stringify(json));
}

function logout() {
    session.bearer = null;
    window.location.href = "#controller=home&action=home";
}

function register() {
}

function onSubmitRegister() {
    var json = getFormAsJSON("registerForm", 
        ["login", "password", "nombre", "apellidos", "dni", "email"],
        validatorUsuario);
    if(json == false)
        return false;

    var req = new XMLHttpRequest();
    req.open("POST", "rest.php?controller=usuarios&action=register");
    req.onload = function() {
        if(req.status == 200) {
            window.location.href = "#controller=usuarios&action=login";
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    };
    req.setRequestHeader('Content-Type', 'application/json');
    var jsonText = JSON.stringify(json);
    req.send(jsonText);
}