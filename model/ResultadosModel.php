<?php

include_once "BaseModel.php";

class ResultadosModel extends BaseModel {
    public $IdEntrega, $AliasAutor, $loginEvaluador,
        $IdHistoria, $Correccion, $Comentario;
    public $_pri = [ "IdEntrega", "AliasAutor", "loginEvaluador", "IdHistoria" ];
    public $_types = [ "IdEntrega" => "s", "AliasAutor" => "s", "loginEvaluador" => "s", "IdHistoria" => "i", "Correccion" => "i", "Comentario" => "s"];
    public $_name = "RESULTADO_EVALUACION";

    public function getAlumnoLista($login) {
        $queryStr = "SELECT RESULTADO_EVALUACION.*, hastaCorr FROM " .
            "RESULTADO_EVALUACION JOIN ENTREGA ON RESULTADO_EVALUACION.IdEntrega = ENTREGA.id " .
            "WHERE loginEvaluador = ?";
        $conn = Connection::getConnection();
        $stat = $conn->prepare($queryStr);
        $stat->bind_param("s", $login);
        $stat->execute();
        $result = $stat->get_result();
        $return = array ();
        while($o = $result->fetch_assoc()) {
            array_push($return, $o);
        }
        return $return;
    }
}

?>