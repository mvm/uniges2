function list() {
    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=evaluaciones&action=list");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var table = document.getElementById("evaluacionesTable");
            var jsonArr = JSON.parse(req.responseText)["res"];

            for(e of jsonArr) {
                table.innerHTML += printListEntry(e);
            }
            initScriptCallbacks();
            updateLanguage();
        } else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.send();
}

function generateResultados(elem, IdEntrega, AliasAutor, loginEvaluador) {
    var json = {IdEntrega:IdEntrega, AliasAutor:AliasAutor, loginEvaluador:loginEvaluador};
    var req = new XMLHttpRequest();
    req.open("POST", "rest.php?controller=evaluaciones&action=generateResultados");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href="#controller=resultados&action=list";
        } else {
            var errorJSON = JSON.parse(req.responseText);
            printJSONError(errorJSON);
        }
    };
    req.send(JSON.stringify(json));
}

function printListEntry(e) {
    var str = `
    <tr uniges-role="item">
    <td>${xmlEsc(e["IdEntrega"])}</td>
    <td>${xmlEsc(e["AliasAutor"])}</td>
    <td>${xmlEsc(e["loginEvaluador"])}</td>`;

    if((session.role != "alumno" || e["loginEvaluador"] == session.user) &&
        (e["Corregido"] == undefined || e["Corregido"] == 0)) {
        str += `
        <td><a class="btn btn-primary btn-sm" fn="generateResultados" 
        args="${[e["IdEntrega"],e["AliasAutor"],e["loginEvaluador"]].join(',')}"
        text-id="generate_result">{{generate_result}}</a></td>
        `;
    }

    str += `
        <td><a user-role="profesor" class="btn btn-outline-primary btn-sm" fn="remove" args="${[e["IdEntrega"],e["AliasAutor"],e["loginEvaluador"]].join(',')}">X</a></td>
        </tr>
    `;
    return str;
}

function remove(elem, identrega, aliasautor, loginevaluador) {
    var json = {IdEntrega: identrega, AliasAutor: aliasautor,
        loginEvaluador: loginevaluador};
    var req = new XMLHttpRequest();
    req.open("DELETE", "rest.php?controller=evaluaciones&action=id");
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

function add() {
    var req1 = new XMLHttpRequest();
    req1.open("GET", "rest.php?controller=entregausuario&action=list");
    req1.setRequestHeader("Authorization", session.bearer);
    req1.onload = function () {
        if(req1.status == 200) {
            var results = JSON.parse(req1.responseText)["res"];
            var select = document.getElementById("entregaSelect");
            for(r of results) {
                select.innerHTML += printOptionEntryEntrega(r);
            }
        } else {
            var json = JSON.parse(req1.responseText);
            printJSONError(json);
        }
    };
    req1.send();

    var req2 = new XMLHttpRequest();
    req2.open("GET", "rest.php?controller=usuarios&action=list");
    req2.setRequestHeader("Authorization", session.bearer);
    req2.onload = function () {
        if(req2.status == 200) {
            var results = JSON.parse(req2.responseText)["res"];
            var select = document.getElementById("loginEvaluadorSelect");
            for(u of results) {
                select.innerHTML += printOptionEntryUser(u);
            }
        } else {
            var json = JSON.parse(req2.responseText);
            printJSONError(json);
        }
    };
    req2.send();
}

function printOptionEntryEntrega(r, selected = false) {
    return `<option value="${[r["IdEntrega"], r["Alias"]].join(',')}" ` +
        (selected? "selected" : "") + `>${xmlEsc(r["IdEntrega"] + "-" + r["Alias"])}</option>`;
}

function printOptionEntryUser(u, selected = false) {
    return `<option value="${u["login"]}" ` +
        (selected? "selected" : "") +
        `>${xmlEsc(u["login"])}</option>`;
}

function onSubmitAdd() {
    var entregaSelect = document.getElementById("entregaSelect");
    var entregaArr = entregaSelect.value.split(',');
    var IdEntrega = entregaArr[0];
    var AliasAutor = entregaArr[1];
    var evaluadorSelect = document.getElementById("loginEvaluadorSelect");
    var evaluadorLogin = evaluadorSelect.value;

    var json = {IdEntrega: IdEntrega, AliasAutor: AliasAutor,
        loginEvaluador: evaluadorLogin};
    var req = new XMLHttpRequest();
    req.open("POST", "rest.php?controller=evaluaciones&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href = "#controller=evaluaciones&action=list";
        } else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.send(JSON.stringify(json));
    return false;
}

function searchForm() {

}

function onSubmitSearchForm() {
    var json = getFormAsJSON("searchForm", ["IdEntrega", "AliasAutor", "loginEvaluador"], null);
    if(json == null) {
        alert("could not get values from searchForm");
        return false;
    }

    var queryStrArr = [];
    for(let j of ["IdEntrega", "AliasAutor", "loginEvaluador"]) {
        if(json[j] != "" && json[j] != null) {
            queryStrArr.push(`${j}=${encodeURIComponent(json[j])}`);
        }
    }
    window.location.href = "#controller=evaluaciones&action=search&" + queryStrArr.join('&');
}

function search() {
    var fields = ["IdEntrega", "AliasAutor", "loginEvaluador"];
    var fieldValues = {};
    for(let f of fields) {
        if(router.urlParams.get(f))
            fieldValues[f] = router.urlParams.get(f);
    }

    var queryStrArr = [];
    for(let f of Object.keys(fieldValues)) {
        queryStrArr.push(`${f}=${encodeURIComponent(fieldValues[f])}`);
    }
    var queryStr = queryStrArr.join('&');

    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=evaluaciones&action=search&" + queryStr);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var table = document.getElementById("evaluacionesTable");
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

