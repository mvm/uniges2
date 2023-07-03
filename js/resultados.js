var historias = null; /* Variable con todas las historias para
                       * mostrar texto historia */

function list() {
    var req = new XMLHttpRequest();

    // recibir datos de los resultados
    req.open("GET", "rest.php?controller=resultados&action=list");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var req2 = new XMLHttpRequest();
            // recibir datos de las historias
            req2.open("GET", "rest.php?controller=historias&action=list");
            req2.setRequestHeader("Authorization", session.bearer);
            req2.onload = function () {
                if(req2.status == 200) {
                    var table = document.getElementById("resultadosTable");
                    var jsonArr = JSON.parse(req.responseText)["res"];
                    
                    historias = JSON.parse(req2.responseText)["res"];
                    printResultados(table, jsonArr);
                } else {
                    var jsonErr = JSON.parse(req2.responseText);
                    printJSONError(jsonErr);
                }
            };
            req2.send();
        } else {
            var jsonErr = JSON.parse(req.responseText);
            printJSONError(jsonErr);
        }
    };
    req.send();
}

/* Devuelve el texto de una historia dado su IdEntrega e
 * IdHistoria. Necesita que la variable historias haya
 * sido cargada */
function getTextoHistoria(IdEntrega, IdHistoria) {
    if(historias == null) return "-";

    return historias.find( h => h["IdEntrega"] == IdEntrega && 
        h["IdHistoria"] == IdHistoria)["textoHistoria"];
}

function printResultados(table, jsonArr) {
    var resultados = resultadoGroupBy(jsonArr);
    table.innerHTML = "";
    for(k of Object.keys(resultados)) {
        printTableResultados(table, k, resultados);
    }
    setButtons();
    setFormCallbacks();
    initScriptCallbacks();
    updateLanguage();
}

function setButtons() {
    var forms = document.getElementsByTagName("form");
    for(f of forms) {
        if(f["Correcto"] && f["Incorrecto"] && f["NoCorregido"]) {
            if(f["Correccion"].value > 0) {
                clearButton(f["Incorrecto"]);
                clearButton(f["NoCorregido"]);
                setButton(f["Correcto"]);
            } else if (f["Correccion"].value == 0) {
                clearButton(f["Correcto"]);
                clearButton(f["NoCorregido"]);
                setButton(f["Incorrecto"]);
            } else if(f["Correccion"].value < 0) {
                clearButton(f["Correcto"]);
                clearButton(f["Incorrecto"]);
                setButton(f["NoCorregido"]);
            }
        }
    }
}

function clearButton(b) {
    var formClass = b.getAttribute("class");
    var formClassArr = formClass.split(" ").filter( (x) => x != "active");
    b.setAttribute("class", formClassArr.join(" "));
}

function setButton(b) {
    var formClass = b.getAttribute("class");
    var formClassArr = formClass.split(" ");
    formClassArr.push("active");
    b.setAttribute("class", formClassArr.join(" "));
}

/* muestra una tabla por entrega evaluada */
function printTableResultados(elem, id, resultados) {
    var parsedId = id.split(",");
    elem.innerHTML += `
        <h2>${xmlEsc(parsedId[0])} - ${xmlEsc(parsedId[1])} - ${xmlEsc(parsedId[2])}</h2>
    `;

    var tableEntries = "";

    var resultadosAutor = resultados[id];

    for(r of resultadosAutor) {
        var dateNow = new Date().getTime();
        var dateCorr = new Date(r["hastaCorr"]).getTime();

        if(session.role != "alumno" || dateNow < dateCorr) {
            tableEntries += printListEntry(r);
        } else {
            tableEntries += printEntryReadOnly(r);
        }

        if(session.role != "alumno") {
            var evalId = parsedId[0] + "," + parsedId[1] + ",";
            var resultadosEntrega = [];

            for(e of Object.keys(resultados)) {
                if(e.startsWith(evalId)) {
                    for( f of resultados[e]) {
                        resultadosEntrega.push(f);
                    }
                }
            }

            var resultadosHistoria =
                resultadosEntrega.filter ( x => 
                    x["IdEntrega"] == parsedId[0] &&
                    x["AliasAutor"] == parsedId[1] &&
                    x["loginEvaluador"] != session.user &&
                    x["IdHistoria"] == r["IdHistoria"] &&
                    x["loginEvaluador"] != parsedId[2]);
            
            for(s of resultadosHistoria) {
                tableEntries += printEntryAdmin(s);
            }
        }
    }

    elem.innerHTML += `<div class="container">
        ${tableEntries}
        </div>
    `;
}

function printEntryAdmin(r) {
    var str = "";
    str = `
    <div style="display: table-row;">
    <div style="display: table-cell;">${r["IdHistoria"]}. </div>
    <div style="display: table-cell; width: 40em;"><span text-id="resultados_eval_by">Evaluado por:</span> ${r["loginEvaluador"]}</div>
    <div style="display: table-cell; max-width:300px;">
    
    <button style="width:50px" name="Correcto" class="btn btn-sm btn-outline-primary ${r["Correccion"] > 0 ? "active" : ""}">✓</button>
    <button style="width: 50px" name="Incorrecto" class="btn btn-sm btn-outline-danger ${r["Correccion"] == 0 ? "active" : ""}">✖</button>
    <button style="width: 50px" name="NoCorregido" class="btn btn-sm btn-outline-warning ${r["Correccion"] < 0 ? "active": ""}">_</button>
    
    </div>
    <div style="display: table-cell;">${r["Comentario"] == ""? "..." : r["Comentario"]}</div>
    </div>
    `;
    return str;
}

function printEntryReadOnly(r) {
    var textoHistoria = getTextoHistoria(r["IdEntrega"], r["IdHistoria"]);
    var str = "";
    str += `
    <div style="display: table-row;">
    <div style="display: table-cell;">${r["IdHistoria"]}. </div>
    <div style="display: table-cell; width: 40em;">${textoHistoria}</div>
    <div style="display: table-cell; max-width:300px;">
    
    <button style="width:50px" name="Correcto" class="btn btn-sm btn-outline-primary ${r["Correccion"] > 0 ? "active" : ""}">✓</button>
    <button style="width: 50px" name="Incorrecto" class="btn btn-sm btn-outline-danger ${r["Correccion"] == 0 ? "active" : ""}">✖</button>
    <button style="width: 50px" name="NoCorregido" class="btn btn-sm btn-outline-warning ${r["Correccion"] < 0 ? "active": ""}">_</button>
    
    </div>
    <div style="display: table-cell;">${r["Comentario"] == ""? "..." : r["Comentario"]}</div>
    </div>
    `;
    return str;
}

/* junta filas de SQL según los datos IdEntrega, AliasAutor,
 * loginEvaluador como claves */
function resultadoGroupBy(json) {
    var result = {};
    for(r of json) {
        var id = r["IdEntrega"] + "," + r["AliasAutor"] + "," + r["loginEvaluador"];
        if(result[id] == null) {
            result[id] = [];
        }
        result[id].push(r);
    }
    return result;
}

function onSubmitList(event) {
    var form = event.target.form;
    var json = {IdEntrega: form["IdEntrega"].value,
        AliasAutor: form["AliasAutor"].value,
        loginEvaluador: form["loginEvaluador"].value,
        IdHistoria: form["IdHistoria"].value,
        Correccion: form["Correccion"].value,
        Comentario: form["Comentario"].value};
    //console.log(JSON.stringify(json));

    var req = new XMLHttpRequest();
    req.open("PUT", "rest.php?controller=resultados&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status != 200) {
            var jsonErr = JSON.parse(req.responseText);
            printJSONError(jsonErr);
        }
    };
    req.send(JSON.stringify(json));

    event.preventDefault();
}

function onClickButton(event) {
    var form = event.target.form;
    var target = event.target;
    var name = target.getAttribute("name");

    if(name == "Correcto") {
        form["Correccion"].value = 1;
    } else if(name == "Incorrecto") {
        form["Correccion"].value = 0;
    } else if(name == "NoCorregido") {
        form["Correccion"].value = -1;
    }
    setButtons();
    onSubmitList(event);
}

function setFormCallbacks() {
    var forms = document.getElementsByTagName("form");
    for(f of forms) {
        if(f["Correccion"] && f["Comentario"]) {
            f["Correccion"].addEventListener("change", onSubmitList);
            f["Comentario"].addEventListener("change", onSubmitList);
            f["Correcto"].addEventListener("click", onClickButton);
            f["Incorrecto"].addEventListener("click", onClickButton);
            f["NoCorregido"].addEventListener("click", onClickButton);
        }
    }
}

// <td><a class="btn btn-outline-primary btn-sm" fn="remove" args="${[r["IdEntrega"], r["AliasAutor"], r["loginEvaluador"], r["IdHistoria"]].join(',')}">X</a></td>
// <td><a text-id="link_edit" 
// href="#controller=resultados&action=modify&IdEntrega=${encodeURIComponent(r["IdEntrega"])}&AliasAutor=${encodeURIComponent(r["AliasAutor"])}&loginEvaluador=${encodeURIComponent(r["loginEvaluador"])}&IdHistoria=${encodeURIComponent(r["IdHistoria"])}">Modif.</a></td>

function printListEntry(r) {
    var textoHistoria = getTextoHistoria(r["IdEntrega"], r["IdHistoria"]);

    var str = `
    <form>
    <input type="hidden" name="IdEntrega" value="${r["IdEntrega"]}" />
    <input type="hidden" name="AliasAutor" value="${r["AliasAutor"]}" />
    <input type="hidden" name="loginEvaluador" value="${r["loginEvaluador"]}" />
    <input type="hidden" name="IdHistoria" value="${r["IdHistoria"]}" />
    <input type="hidden" name="Correccion" value="${r["Correccion"]}" />

    <div style="display: table-row;">
    <div style="display: table-cell;">${r["IdHistoria"]}. </div>
    <div style="display: table-cell; width: 40em;">${xmlEsc(textoHistoria)}</div>
    <div style="display: table-cell; max-width:300px;">
    
    <input type="button" style="width:50px" name="Correcto" class="btn btn-sm btn-outline-primary" value="✓" />
    <input type="button" style="width: 50px" name="Incorrecto" class="btn btn-sm btn-outline-danger" value="✖"/>
    <input type="button" style="width: 50px" name="NoCorregido" class="btn btn-sm btn-outline-warning" value="_"/>
    
    </div>
    <div style="display: table-cell;"><input type="text" name="Comentario" placeholder="..." value="${xmlEsc(r["Comentario"])}"/></div>
    </div>
    </form>
    `;
    return str;
}

function remove(elem, IdEntrega, AliasAutor, loginEvaluador, IdHistoria) {
    var json = {IdEntrega: IdEntrega, AliasAutor: AliasAutor, loginEvaluador: loginEvaluador, IdHistoria:IdHistoria};

    if(confirm(_lang["resultados_delete_confirm"]) == false) {
        return false;
    }

    var req = new XMLHttpRequest();
    req.open("DELETE", "rest.php?controller=resultados&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200)
            removeItemFromElem(elem);
        else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.send(JSON.stringify(json));
}

function add() {
    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=evaluaciones&action=search&loginEvaluador=" + encodeURIComponent(session.user));
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var select = document.getElementById("evaluacionInput");
            var json = JSON.parse(req.responseText)["res"];

            for(e of json) {
                printSelectItem(select, e);
            }

            select.onchange = function () {
                updateIdHistoria();
            };
            updateIdHistoria();

        } else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.send();
}

function updateIdHistoria() {
    var evalInput = document.getElementById("evaluacionInput");

    var IdEntrega = evalInput.value.split(',')[0];
    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=historias&action=search&IdEntrega=" + IdEntrega);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        var IdHistoriaInput = document.getElementById("IdHistoriaInput");
        var json = JSON.parse(req.responseText)["res"];

        IdHistoriaInput.innerHTML = "";
        for(e of json) {
            printSelectHistoriaItem(IdHistoriaInput, e);
        }
    };
    req.send();
}

function printSelectItem(select, e) {
    select.innerHTML += `
    <option value="${[e["IdEntrega"], e["AliasAutor"], e["loginEvaluador"]].join(',')}">
    ${e["IdEntrega"]} - ${e["AliasAutor"]}
    </option>
    `;
}

function printSelectHistoriaItem(select, e) {
    select.innerHTML += `
        <option value="${e.IdHistoria}">${e.IdHistoria} - ${xmlEsc(e.textoHistoria)}</option>
    `;
}

function onSubmitAdd() {
    var json = getFormAsJSON("addForm", ["IdHistoria", "Correccion", "Comentario"], null);
    if(json == null)
        return false;

    var select = document.getElementById("evaluacionInput");
    var evalArr = select.value.split(',');
    json["IdEntrega"] = evalArr[0];
    json["AliasAutor"] = evalArr[1];
    json["loginEvaluador"] = evalArr[2];

    var req = new XMLHttpRequest();
    req.open("POST", "rest.php?controller=resultados&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href="#controller=resultados&action=list";
        } else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.send(JSON.stringify(json));
    return false;
}

function modify() {
    var IdEntrega = router.urlParams.get("IdEntrega");
    var AliasAutor = router.urlParams.get("AliasAutor");
    var loginEvaluador = router.urlParams.get("loginEvaluador");
    var IdHistoria = router.urlParams.get("IdHistoria");
    var req = new XMLHttpRequest();
    req.open("GET", `rest.php?controller=resultados&action=id&IdEntrega=${encodeURIComponent(IdEntrega)}&AliasAutor=${encodeURIComponent(AliasAutor)}&loginEvaluador=${encodeURIComponent(loginEvaluador)}&IdHistoria=${encodeURIComponent(IdHistoria)}`);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var result = JSON.parse(req.responseText)["res"];
            setFormFromJSON("modifyForm", ["IdEntrega", "AliasAutor", "loginEvaluador", "IdHistoria", "Correccion", "Comentario"], result);
        } else {
            var json = JSON.parse(req.responseText);
            printJSONError(json);
        }
    };
    req.send();
}

function onSubmitModify() {
    var json = getFormAsJSON("modifyForm", 
        ["IdEntrega", "AliasAutor", "loginEvaluador", 
        "IdHistoria", "Correccion", "Comentario"], null);
    if(json == null)
        return false;

    var req = new XMLHttpRequest();
    req.open("PUT", "rest.php?controller=resultados&action=id");
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            window.location.href="#controller=resultados&action=list";
        } else {
            var response = JSON.parse(req.responseText);
            printJSONError(response);
        }
    };
    req.send(JSON.stringify(json));
}

function searchForm() {

}

function onSubmitSearch() {
    var json = getFormAsJSON("searchForm",
        ["IdEntrega", "AliasAutor", "loginEvaluador", "IdHistoria",
        "Correccion", "Comentario"], null);

    var params = [];
    for(r of Object.keys(json)) {
        if(json[r] != "") {
            params.push(r + "=" + encodeURIComponent(json[r]));
        }
    }
    window.location.href = "#controller=resultados&action=search&" + params.join('&');
    return false;
}

function search() {
    var fields = ["IdEntrega", "AliasAutor", "loginEvaluador",
        "IdHistoria", "Correccion", "Comentario"];
    var queryStrArr = [];

    for(let f of fields) {
        if(router.urlParams.get(f)) {
            queryStrArr.push(f + "=" + encodeURIComponent(router.urlParams.get(f)));
        }
    }
    var queryStr = queryStrArr.join('&');

    var req = new XMLHttpRequest();
    req.open("GET", "rest.php?controller=resultados&action=search&" + queryStr);
    req.setRequestHeader("Authorization", session.bearer);
    req.onload = function () {
        if(req.status == 200) {
            var req2 = new XMLHttpRequest();
            // recibir datos de las historias
            req2.open("GET", "rest.php?controller=historias&action=list");
            req2.setRequestHeader("Authorization", session.bearer);
            req2.onload = function () {
                if(req2.status == 200) {
                    var table = document.getElementById("resultadosTable");
                    var jsonArr = JSON.parse(req.responseText)["res"];
                    
                    historias = JSON.parse(req2.responseText)["res"];
                    printResultados(table, jsonArr);
                } else {
                    var jsonErr = JSON.parse(req2.responseText);
                    printJSONError(jsonErr);
                }
            };
            req2.send();
        } else {
            var jsonErr = JSON.parse(req.responseText);
            printJSONError(jsonErr);
        }
    };
    req.send();
}