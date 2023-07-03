<?php

include_once "model/EntregasModel.php";
include_once "BaseController.php";

class EntregasController extends BaseController {
    public $_pri = ["id"];
    public $_model = "EntregasModel";
    public $_cont = "entregas";
    public $_service = "EntregasService";

    public function generate() {
        $auth = $this->checkAuth($this->_cont, "generate");
        if(!$auth)
            throw new HTTPException(401, "permission denied", "error_permission_denied");
        $body = file_get_contents("php://input");
        $assoc = json_decode($body, true);
        if($assoc == NULL)
            throw new HTTPException(400, "invalid JSON", "error_invalid_json");
    
        $reqFields = ["IdEntrega"];
        $fields_set = true;
        foreach($reqFields as $f) {
            if(!isset($assoc[$f])) $fields_set = false;
        }
        if(!$fields_set)
            throw new HTTPException(400, "keys not set", "error_keys_missing");
        
        $s = new $this->_service ($auth);
        $s->generate($assoc["IdEntrega"], $auth );
    }
}

?>