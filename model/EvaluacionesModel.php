<?php

include_once "BaseModel.php";
include_once "UsuariosModel.php";

class EvaluacionesModel extends BaseModel {
    public $IdEntrega, $AliasAutor, $loginEvaluador;
   
    public $_pri = [ "IdEntrega", "AliasAutor", "loginEvaluador"];
    public $_types = ["IdEntrega" => "s", "AliasAutor" => "s", "loginEvaluador" => "s"];
    public $_name = "EVALUACION";

    public function generate($IdEntrega, $AliasAutor) {
        $evals = $this->find_by(["AliasAutor" => $AliasAutor, "IdEntrega" => $IdEntrega]);
        if(count($evals) > 0) {
            throw new HTTPException(500, "submission selected already has assessments", "error_has_assessments");
        }

        $usuariosmodel = new UsuariosModel([]);

        $usuarios = $usuariosmodel->find_by(["login" => ["!=", $AliasAutor]]);
        shuffle($usuarios);
        $usuarios = array_slice($usuarios, 0, min(5, count($usuarios)));
        
        $usersLogin = array();
        foreach($usuarios as $u) {
            array_push($usersLogin, $u->login);
        }

        $evmodel = new EvaluacionesModel(["IdEntrega" => $IdEntrega, "AliasAutor" => $AliasAutor]);
        foreach($usersLogin as $u) {
            $evmodel->loginEvaluador = $u;
            $evmodel->insert();
        }
    }

    public function getAlumnoEntregas($login) {
        $queryStr = "SELECT USUARIOENTREGA.IdEntrega, AliasAutor, loginEvaluador FROM USUARIOENTREGA JOIN EVALUACION " .
            "ON USUARIOENTREGA.Alias = EVALUACION.AliasAutor " .
            "WHERE login = ? OR loginEvaluador = ?";
        $conn = Connection::getConnection();
        $stat = $conn->prepare($queryStr);
        $stat->bind_param("ss", $login, $login);
        $stat->execute();
        $result = $stat->get_result();
        $return = array();
        while($o = $result->fetch_assoc()) {
            array_push($return, $o);
        }
        return $return;
    }
}

?>