<?php

include_once "service/BaseService.php";
include_once "model/ResultadosModel.php";
include_once "model/EntregasModel.php";

class ResultadosService extends BaseService {
    public $_model = "ResultadosModel";
    protected $onlyOwn = true;
    protected $loginField = "loginEvaluador";

    public function list() {
        $auth = $this->getAuth();

        if($auth->role == "alumno" && $this->onlyOwn) {
            $model = new $this->_model ([]);
            $this->printSuccess($model->getAlumnoLista($auth->login));
        } else {
            parent::list();
        }
    }

    public function put($keys_assoc, $assoc) {
        $auth = $this->getAuth();

        if($auth->role == "alumno") {
            $entregasModel = new EntregasModel([]);
            $entregas = $entregasModel->find_by(["id" => $keys_assoc["IdEntrega"]]);
            $e = $entregas[0];

            $dateNow = new DateTime("now");
            $dateEntrega = new DateTime($e->hastaCorr);

            if($dateEntrega < $dateNow) {
                throw new HTTPException(400, "can't grade after end date");
            } else {
                parent::put($keys_assoc, $assoc);
            }
        } else {
            parent::put($keys_assoc, $assoc);
        }
    }
}

?>