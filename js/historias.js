var validatorHistoria = {
    IdEntrega: {fn: function(v) {
            return /^[a-zA-Z0-9]+$/.test(v);
        },
        msg: "field Task Id can contain only digits and letters",
        text_id: "error_historia_identrega"
    },
    IdHistoria: {fn: function(v) { return /^[0-9]+$/.test(v); },
        msg: "field Requirement Id must be a number",
        text_id: "error_historia_idhistoria"},
    textoHistoria: function(v) { return true; }
};

function list() {
    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=historias&action=list");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function() {
        if(req.status == 200) {
            var div = document.getElementById("historias");
            var jsonArr = JSON.parse(req.responseText)["res"];
            for(h of jsonArr) {
                div.innerHTML += printListEntry(h);
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

function printListEntry(h) {
    return `
    <div class="card" uniges-role="item">
        <div class="card-body">
            <h5 class="card-title">${xmlEsc(h.IdEntrega)} - ${h.IdHistoria}</h5>
            <p class="card-text">${xmlEsc(h.textoHistoria)}</p>
            <a user-role="profesor" class="card-link btn btn-outline-primary btn-sm pull-right" fn="remove" args="${[h.IdEntrega, h.IdHistoria].join(",")}">X</a>
            <a user-role="profesor" class="card-link" text-id="link_edit" href="#controller=historias&action=modify&IdEntrega=${encodeURIComponent(h.IdEntrega)}&IdHistoria=${h.IdHistoria}">Modif.</a>
        </div>
    </div>
    `;
}

function remove(elem, IdEntrega, IdHistoria) {
    var json = {IdEntrega: IdEntrega, IdHistoria: IdHistoria};

    if(confirm(_lang["historia_delete_confirm"]) == false) {
        return false;
    }

    var req = new XMLHttpRequest();
    req.open("DELETE", "rest.php?controller=historias&action=id");
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
    return `<option value="${xmlEsc(e.id)}"` +
        (selected? "selected": "")
    + `>${xmlEsc(e.nombre)}</option>`;
}

function add() {
    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=entregas&action=list");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if (req.status == 200) {
            var entregas = JSON.parse(req.responseText)["res"];
            var select = document.getElementById("IdEntregaInput");
            select.innerHTML += `<option value="" text-id="historia_select_task">Select task...</option>`;
            for(e of entregas) {
                select.innerHTML += printOptionEntry(e);
            }
            updateLanguage();

            select.onchange = function (event) {
                var select = document.getElementById("IdEntregaInput");
                var IdEntrega = select.value ;
                if(IdEntrega == "")
                    return;
                var req2 = new XMLHttpRequest();
                req2.open("GET", "rest.php?controller=historias&action=getnum&IdEntrega="+encodeURIComponent(IdEntrega));
                req2.setRequestHeader("Authentication", session.bearer);
                req2.onload = function () {
                    var idhistoriainput = document.getElementById("IdHistoriaInput");
                    idhistoriainput.value = JSON.parse(req2.responseText)["res"];
                };
                req2.send();
            };
            setFormValid("addForm", ["IdEntrega", "IdHistoria", "textoHistoria"], validatorHistoria);
        } else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.send();
}

function onSubmitAdd() {
    var json = getFormAsJSON("addForm", ["IdEntrega", "IdHistoria", "textoHistoria"], validatorHistoria);
    if(json == null)
        return false;

    json["IdHistoria"] = parseInt(json["IdHistoria"]);

    var req = new XMLHttpRequest();
    req.open("POST", "rest.php?controller=historias&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href = "#controller=historias&action=list";
        } else {
            var jsonErr = JSON.parse(req.responseText);
            printJSONError(jsonErr);
        }
    };
    req.send(JSON.stringify(json));
}

function modify() {
    var IdEntrega = router.urlParams.get("IdEntrega");
    var IdHistoria = router.urlParams.get("IdHistoria");

    var req = new XMLHttpRequest();
    req.open("GET", `rest.php?controller=historias&action=id&IdEntrega=${IdEntrega}&IdHistoria=${IdHistoria}`);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var jsonHist = JSON.parse(req.responseText)["res"];
            setFormFromJSON("modifyForm", ["IdEntrega", "IdHistoria", "textoHistoria"], jsonHist);
            setFormValid("modifyForm", ["IdEntrega", "IdHistoria", "textoHistoria"], validatorHistoria);
        } else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.send();
}

function onSubmitModify() {
    var json = getFormAsJSON("modifyForm", ["IdEntrega", "IdHistoria", "textoHistoria"], validatorHistoria);
    if(json == null) return false;

    var req = new XMLHttpRequest();
    req.open("PUT", "rest.php?controller=historias&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href = "#controller=historias&action=list";
        } else {
            var jsonErr = JSON.parse(req.responseText);
            printJSONError(jsonErr);
        }
    };
    req.send(JSON.stringify(json));
}

function searchForm() {

}

function onSubmitSearchForm() {
    var json = getFormAsJSON("searchForm", ["IdEntrega", "textoHistoria"], null); // don't validate
    var queryStrArr = [];
    for(let j of Object.keys(json)) {
        if(json[j] != "" && json[j] != null) {
            queryStrArr.push(`${j}=${encodeURIComponent(json[j])}`);
        }
    }
    window.location.href = "#controller=historias&action=search&" + queryStrArr.join('&');
}

function search() {
    var fields = ["IdEntrega", "textoHistoria"];
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
    req.open("GET", "rest.php?controller=historias&action=search&" + queryStr);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var div = document.getElementById("historias");
            var jsonArr = JSON.parse(req.responseText)["res"];
            for(h of jsonArr) {
                div.innerHTML += printListEntry(h);
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