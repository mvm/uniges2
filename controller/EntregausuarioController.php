<?php
include_once "BaseController.php";

require "vendor/autoload.php";
use Notihnio\MultipartFormDataParser\MultipartFormDataParser;

class EntregausuarioController extends BaseController {
    public $_pri = ["login", "IdEntrega"];
    public $_model = "EntregaUsuarioModel";
    public $_cont = "entregausuario";
    public $_service = "EntregausuarioService";

    protected function put() {
        $auth = $this->checkAuth($this->_cont, "put");
        if(!$auth)
            throw new HTTPException(401, "not authorized");
        
        $euFields = array();

        $request = MultipartFormDataParser::parse();
        
        $requiredFields = ["login", "IdEntrega", "Alias", "Horas", "Ruta"];
        foreach($requiredFields as $f) {
            if(!isset($request->params[$f])) {
                throw new HTTPException(400, "field '$f' not set");
            } else
                $euFields[$f] = $request->params[$f];
        }

        $s = new $this->_service($auth);
        $s->put2($euFields, $request->files);
    }

    protected function post() {
        $auth = $this->checkAuth($this->_cont, "post");
        if(!$auth)
            throw new HTTPException(401, "not authorized");

        $euFields = array();

        $postFields = ["IdEntrega", "Horas"];
        foreach($postFields as $p) {
            if(!isset($_POST[$p]))
                throw new HTTPException(400, "field '$p' is not set");
            else
                $euFields[$p] = $_POST[$p];
        }

        $euFields["login"] = $auth->login;

        $fileFields = ["file"];
        foreach($fileFields as $f) {
            if(!isset($_FILES[$f]))
                throw new HTTPException(400, "field '$f' not set");
        }

        $s = new $this->_service ($auth);
        $s->post2($euFields, $_FILES);
    }
}

?>