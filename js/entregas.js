var validadorFecha = {fn: function (v) { return /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(v);},
    msg: "inserted date not of format year-month-day",
    text_id: "error_entregas_date"};

var validatorEntrega = {
    id: {fn: function (v) { return /^[a-zA-Z0-9]+$/.test(v); },
        msg: "field Id can contain letters and numbers only",
        text_id: "error_entregas_id"},
    nombre: {fn: function (v) { return v != ""; },
        msg: "field Name must not be empty",
        text_id: "error_entregas_nombre"
    },
    desde: validadorFecha,
    hasta: validadorFecha,
    hastaCorr: validadorFecha
};

function checkDate(json) {
    var desde = new Date(json["desde"]);
    var hasta = new Date(json["hasta"]);
    if(desde > hasta) {
        printError(_lang["error_entrega_desdehasta"], "error_entrega_desdehasta");
        return false;
    } else {
        return true;
    }
}

function list() {
    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=entregas&action=list");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var table = document.getElementById("entregasTable");
        
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
    }
    req.send();
}

function generateEvaluacion(elem, identrega) {
    var json = {IdEntrega: identrega};
    var req = new XMLHttpRequest();

    req.open("POST", "rest.php?controller=entregas&action=generate");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status != 200) {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        } else {
            elem.remove();
        }
    };
    req.send(JSON.stringify(json));
}

function printListEntry(e) {
    var desde = new Date(e["desde"]);
    var hasta = new Date(e["hasta"]);
    var hastaCorr = new Date(e["hastaCorr"]);
    var str = "";
    str += "<tr uniges-role=\"item\">";
    str += "<td>" + xmlEsc(e["id"]) + "</td>";
    str += "<td>" + xmlEsc(e["nombre"]) + "</td>";
    str += "<td>" + xmlEsc(desde.toLocaleDateString()) + "</td>";
    str += "<td>" + xmlEsc(hasta.toLocaleDateString()) + "</td>";
    str += `<td>${xmlEsc(hastaCorr.toLocaleDateString())}</td>`
    str += `<td><a user-role="profesor" class="btn btn-outline-primary btn-sm" fn="remove" args="${e["id"]}">X</a></td>`
    str += `<td><a user-role="profesor" text-id="link_edit" href="#controller=entregas&action=modify&id=${encodeURIComponent(e["id"])}">Modif.</a></td>`;
    str += `<td><a user-role="profesor" class="btn btn-sm btn-primary" fn="generateEvaluacion" args="${encodeURIComponent(e["id"])}" text-id="generate_eval">{{generate_eval}}</a></td>`
    str += "</tr>";
    return str;
}

function modify() {
    var id = router.urlParams.get("id");
    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=entregas&action=id&id=" + id);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status != 200) {
            var error = JSON.parse(req.responseText);
            printJSONError(error);
        } else {
            var entrega = JSON.parse(req.responseText)["res"];
            setFormFromJSON("modifyForm", ["id","nombre","desde","hasta", "hastaCorr"], entrega);
            setFormValid("modifyForm", ["id", "nombre", "desde", "hasta", "hastaCorr"], validatorEntrega);
        }
    };
    req.send();
}

function onSubmitModify() {
    var json = getFormAsJSON("modifyForm", ["id", "nombre", "desde", "hasta", "hastaCorr"], validatorEntrega);
    if(json == null)
        return false;

    if(checkDate(json) == false)
        return false;

    var req = new XMLHttpRequest();
    req.open("PUT", "rest.php?controller=entregas&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href = "#controller=entregas&action=list";
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    };
    req.send(JSON.stringify(json));
}

function add() {
    setFormValid("addForm", ["id", "nombre", "desde", "hasta", "hastaCorr"], validatorEntrega);
}

function onSubmitAdd() {
    var json = getFormAsJSON("addForm", ["id","nombre", "desde", "hasta", "hastaCorr"], validatorEntrega);
    if(json == null)
        return false;

    if(checkDate(json) == false)
        return false;

    var req = new XMLHttpRequest();
    req.open("POST", "rest.php?controller=entregas&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href = "#controller=entregas&action=list";
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    }
    req.send(JSON.stringify(json));
}

function remove(elem, id) {
    var json = {id: id};

    if(confirm(_lang["entrega_delete_confirm"]) == false) {
        return false;
    }

    var req = new XMLHttpRequest();
    req.open("DELETE", "rest.php?controller=entregas&action=id");
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

function search() {
    var fields = ["nombre"];
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
    req.open("GET", "rest.php?controller=entregas&action=search&" + queryStr);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var table = document.getElementById("entregasTable");
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
    var json = getFormAsJSON("searchForm", ["nombre"], null);
    var queryStrArr = [];
    for(let j of Object.keys(json)) {
        if(json[j] != "" && json[j] != null) {
            queryStrArr.push(`${j}=${encodeURIComponent(json[j])}`);
        }
    }
    window.location.href = "#controller=entregas&action=search&" + queryStrArr.join('&');
}