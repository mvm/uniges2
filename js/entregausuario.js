function list() {
    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=entregausuario&action=list");
    req.onload = function () {
        if(req.status == 200) {
            var table = document.getElementById("entregausuarioTable");
            var jsonArr = JSON.parse(req.responseText)["res"];
            for(r of jsonArr) {
                table.innerHTML += printListEntry(r);
            }
            initScriptCallbacks();
            updateLanguage();
        } else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.setRequestHeader("Authorization", session.bearer);
    req.send();
}

function printListEntry(r) {
    var str = `
    <tr uniges-role="item">
    <td>${xmlEsc(r["login"])}</td>
    <td>${xmlEsc(r["IdEntrega"])}</td>
    <td>${xmlEsc(r["Alias"])}</td>
    <td>${r["Horas"]}</td>
    <td><a href="${r["Ruta"]}" text-id="entregausuario_link">Enlace...</td>
    <td><a class="btn btn-outline-primary btn-sm" fn="remove" args="${[r["login"],r["IdEntrega"]].join(',')}">X</a></td>
    <td><a text-id="link_edit" href="#controller=entregausuario&action=modify&login=${encodeURIComponent(r["login"])}&IdEntrega=${encodeURIComponent(r["IdEntrega"])}">Modif.</a></td>
    </tr>`;
    return str;
}

function remove(elem, login, IdEntrega) {
    var json = {login: login, IdEntrega: IdEntrega};

    if(confirm(_lang["entregausuario_delete_confirm"]) == false) {
        return false;
    }

    var req = new XMLHttpRequest();
    req.open("DELETE", "rest.php?controller=entregausuario&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            removeItemFromElem(elem);
        } else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.send(JSON.stringify(json));
}

function printOptionEntry(e, selected = false) {
    return `<option value="${xmlEsc(e["id"])}" ` +
        (selected? "selected" : "") +
        `>${xmlEsc(e["id"])}</option>`;
}

function add() {
    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=entregas&action=list");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var select = document.getElementById("IdEntregaInput");
            var json = JSON.parse(req.responseText)["res"];
            for(e of json) {
                select.innerHTML += printOptionEntry(e);
            }
        } else {
            var jsonErr = JSON.parse(req.responseText);
            printJSONError(jsonErr);
        }
    };
    req.send();
}

function onSubmitAdd() {
    var json = getFormAsJSON("addForm", ["IdEntrega", "Horas"], null);
    if(json == null)
        return false;

    var fileInput = document.getElementById("fileInput");
    var file = fileInput.files[0];
    if(!file) {
        printError("file not selected");
        return false;
    }

    var formdata = new FormData();
    formdata.append("IdEntrega", json["IdEntrega"]);
    formdata.append("Horas", json["Horas"]);
    formdata.append("file", file);
            

    var req = new XMLHttpRequest();
    req.open("POST", "rest.php?controller=entregausuario&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href = "#controller=entregausuario&action=list";
        } else {
            printJSONError(JSON.parse(req.responseText));
        }
    };
    req.send(formdata);
    return false;
}

function search() {
    var fields = ["login", "IdEntrega"];
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
    req.open("GET", "rest.php?controller=entregausuario&action=search&" + queryStr);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var table = document.getElementById("entregausuarioTable");
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

function searchForm() {

}

function onSubmitSearchForm() {
    var json = getFormAsJSON("searchForm", ["login", "IdEntrega"], null);
    if(json == null) {
        alert("could not get values from form searchForm");
        return false;
    }

    var queryStrArr = [];
    for(let j of ["login", "IdEntrega"]) {
        if(json[j] != "" && json[j] != null) {
            queryStrArr.push(`${j}=${encodeURIComponent(json[j])}`);
        }
    }

    window.location.href = "#controller=entregausuario&action=search&" + queryStrArr.join('&');
}

function modify() {
    var login = router.urlParams.get("login");
    var IdEntrega = router.urlParams.get("IdEntrega");

    var req = new XMLHttpRequest();
    req.open("GET", `rest.php?controller=entregausuario&action=id&login=${encodeURIComponent(login)}&IdEntrega=${encodeURIComponent(IdEntrega)}`);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var entusu = JSON.parse(req.responseText)["res"];
            setFormFromJSON("modifyForm", ["Horas","Alias", "Ruta"], entusu);
        }
    };
    req.send();
}

function onSubmitModify() {
    var login = router.urlParams.get("login");
    var IdEntrega = router.urlParams.get("IdEntrega");
    var json = getFormAsJSON("modifyForm", ["Horas", "Alias", "Ruta"], null);
    if(json == null)
        return false;
    
    json["login"] = login;
    json["IdEntrega"] = IdEntrega;

    var req = new XMLHttpRequest();

    var formdata = new FormData();
    formdata.append("login", json["login"]);
    formdata.append("IdEntrega", json["IdEntrega"]);
    formdata.append("Alias", json["Alias"]);
    formdata.append("Ruta", json["Ruta"]);
    formdata.append("Horas", json["Horas"]);
    var fileInput = document.getElementById("fileInput");
    var file = fileInput.files[0];
    if(file)
        formdata.append("file", file);

    req.open("PUT", "rest.php?controller=entregausuario&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href = "#controller=entregausuario&action=list";
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    };
    req.send(formdata);
}