<?php

include_once "model/EvaluacionesModel.php";
include_once "BaseController.php";

class EvaluacionesController extends BaseController {
    public $_pri = ["IdEntrega", "AliasAutor", "loginEvaluador"];
    public $_model = "EvaluacionesModel";
    public $_cont = "evaluaciones";
    public $_service = "EvaluacionesService";

    public function generateResultados() {
        $auth = $this->checkAuth($this->_cont, "generateResultados");
        if(!$auth) {
            throw new HTTPException(401, "permission denied", "error_permission_denied");
        }

        $body = file_get_contents("php://input");
        $assoc = json_decode($body, true);
        if($assoc == NULL) {
            throw new HTTPException(400, "invalid JSON", "error_invalid_json");
        }

        $keys = $this->_pri;
        $has_keys = true;
        foreach($keys as $k) {
            if(!isset($assoc[$k])) {
                $has_keys = false;
            }
        }

        if(!$has_keys)
            throw new HTTPException(400, "keys not set");
        
        $s = new $this->_service ($auth);
        $s->generateResultados($assoc);
    }
}

?>