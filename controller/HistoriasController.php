<?php

include_once "model/HistoriasModel.php";
include_once "BaseController.php";

class HistoriasController extends BaseController {
    public $_pri = ["IdEntrega", "IdHistoria"];
    public $_model = "HistoriasModel";
    public $_cont = "historias";
    public $_service = "HistoriasService";

    public function getnum() {
        if(!isset($_GET["IdEntrega"])) {
            throw new HTTPException(400, "IdEntrega not set");
        }
        $identrega = $_GET["IdEntrega"];

        $s = new HistoriasService();
        $s->get_num($identrega);
    }
}

?>