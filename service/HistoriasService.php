<?php

include_once "service/BaseService.php";
include_once "model/HistoriasModel.php";

class HistoriasService extends BaseService {
    public $_model = "HistoriasModel";

    public function get_num($identrega) {
        $m = new HistoriasModel([]);
        $n = $m->get_num($identrega);
        $this->printSuccess($n);
    }
}

?>