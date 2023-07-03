<?php

include_once "service/BaseService.php";
include_once "model/EvaluacionesModel.php";
include_once "model/ResultadosModel.php";
include_once "model/HistoriasModel.php";
include_once "model/EntregasModel.php";

class EvaluacionesService extends BaseService {
    public $_model = "EvaluacionesModel";
    protected $onlyOwn = true;
    protected $loginField = "loginEvaluador";

    public function generateResultados($assoc) {
        $resultadosModel = new ResultadosModel([]);
        $evaluacionesModel = new EvaluacionesModel([]);
        $entregasModel = new EntregasModel([]);

        $evals = $evaluacionesModel->find_by($assoc);
        if(count($evals) != 1) {
            throw new HTTPException(404, "evaluation not found or found more than once");
        }
        $eval = $evals[0];

        $entrega = $entregasModel->find_by(["id" => $assoc["IdEntrega"]]);
        if(count($entrega) != 1) {
            throw new HTTPException(404, "task not found or found more than once");
        }
        $dateCorr = new DateTime($entrega[0]->hastaCorr);
        $dateNow = new DateTime("now");
        if($dateCorr < $dateNow) {
            throw new HTTPException(400, "cannot grade after grading date");
        }

        if($this->getAuth()->role == "alumno" && $this->onlyOwn) {
            if($eval->loginEvaluador != $this->getAuth()->login)
                throw new HTTPException(401, "cannot modify result by other assesser");
        }

        $results = $resultadosModel->find_by($assoc);
        if(count($results) > 0) {
            throw new HTTPException(400, "grades already generated");
        }

        $findHistorias = array("IdEntrega" => $assoc["IdEntrega"]);
        $historiasModel = new HistoriasModel([]);
        $historias = $historiasModel->find_by($findHistorias);
        if(count($historias) == 0) {
            throw new HTTPException(400, "task has no requirements");
        }

        $insResult = new ResultadosModel([]);
        $insResult->IdEntrega = $assoc["IdEntrega"];
        $insResult->AliasAutor = $assoc["AliasAutor"];
        $insResult->loginEvaluador = $assoc["loginEvaluador"];
        $insResult->Correccion = -1;
        $insResult->Comentario = "";

        foreach($historias as $h) {
            $insResult->IdHistoria = $h->IdHistoria;
            $insResult->insert();
        }
        $this->printSuccess();

    }

    public function list() {
        if($this->getAuth()->role == "alumno") {
            $o = new $this->_model ([]);
            $resModel = new ResultadosModel([]);

            $login = $this->getAuth()->login;
            $res = $o->getAlumnoEntregas($login);
            
            for($i = 0; $i < count($res); $i++) {
                $resultados = $resModel->find_by(["IdEntrega" => $res[$i]["IdEntrega"],
                    "AliasAutor" => $res[$i]["AliasAutor"],
                    "loginEvaluador" => $res[$i]["loginEvaluador"]]);
                if(count($resultados) > 0) {
                    $res[$i]["Corregido"] = 1;
                } else {
                    $res[$i]["Corregido"] = 0;
                }
            }

            $this->printSuccess($res);
        } else {
            parent::list();
        }
    }
}

?>