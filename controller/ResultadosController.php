<?php

include_once "model/ResultadosModel.php";
include_once "BaseController.php";

class ResultadosController extends BaseController {
    public $_pri = ["IdEntrega", "AliasAutor", "loginEvaluador", "IdHistoria"];
    public $_model = "ResultadosModel";
    public $_cont = "resultados";
    public $_service = "ResultadosService";
}

?>