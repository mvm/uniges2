<?php

include_once "service/BaseService.php";
include_once "model/EntregaUsuarioModel.php";
include_once "model/EntregasModel.php";

class EntregausuarioService extends BaseService {
    public $_model = "EntregaUsuarioModel";
    protected $onlyOwn = true;
    protected $loginField = "login";

    private function getRoute($tmp_file, $post) {
        $pathinfo = pathinfo($tmp_file);
        $route = "./files/" . $post["IdEntrega"] . "_" . $post["login"] . "_" . $post["Alias"] .
            "." . $pathinfo["extension"];
        return $route;
    }

    public function put2($post, $files) {
        $m = new $this->_model([]);
        $idFields = ["login", "IdEntrega"];
        $findBy = array();
        foreach($idFields as $f) {
            $findBy[$f] = $post[$f];
        }

        /* devolver entrega correspondiente al envio */
        $IdEntrega = $findBy["IdEntrega"];
        $entregasmodel = new EntregasModel([]);
        $entregas = $entregasmodel->find_by(["id" => $IdEntrega]);
        if(count($entregas) != 1) {
            throw new HTTPException(500, "more than one task available for submission");
        }
        $entrega = $entregas[0];

        /* es el envío en plazo? */
        $dateNow = new DateTime("now");
        $dateEntrega = new DateTime($entrega->hasta);
        if($dateNow > $dateEntrega) {
            throw new HTTPException(400, "submission date already passed", "error_submission_date_passed");
        }

        /* Sólo modificar entradas del propio usuario */
        if($this->getAuth()->role == "alumno" && $this->onlyOwn && $this->loginField) {
            $findBy[$this->loginField] = $this->getAuth()->login;
        }

        $res = $m->find_by($findBy);
        if(count($res) != 1) {
            throw new HTTPException(404, "object not found or found more than once");
        }
        $o = $res[0];

        $oldRoute = $o->Ruta;
        $o->from_assoc($post);

        if(dirname($o->Ruta) != "./files")
            throw new HTTPException(400, "name of the directory of route is not ./files");

        try {
            $o->update();
        } catch(Exception $e) {
            throw new HTTPException(500, "could not update");
        }

        if(isset($files["file"]) && dirname($o->Ruta) == "./files") {
            $route = $o->Ruta;
            $res = rename($files["file"]["tmp_name"], __DIR__ . "/../" . $route);
            if(!$res)
                throw new HTTPException(500, "error moving uploaded file");

            if($oldRoute != $route && $oldRoute != "./files/" && file_exists($oldRoute)) {
                unlink($oldRoute);
                error_log("file '" . $oldRoute . "' deleted");
            }
        }

        $this->printSuccess($o->to_assoc());
    }

    public function post2($post, $files) {
        /* Sólo añadir entradas del propio usuario */
        if($this->getAuth()->role == "alumno" && $this->onlyOwn && $this->loginField) {
            $post[$this->loginField] = $this->getAuth()->login;
        }

         /* devolver entrega correspondiente al envio */
         $IdEntrega = $post["IdEntrega"];
         $entregasmodel = new EntregasModel([]);
         $entregas = $entregasmodel->find_by(["id" => $IdEntrega]);
         if(count($entregas) != 1) {
             throw new HTTPException(500, "more than one task available for submission");
         }
         $entrega = $entregas[0];
 
         /* es el envío en plazo? */
         $dateNow = new DateTime("now");
         $dateEntrega = new DateTime($entrega->hasta);
         if($dateNow > $dateEntrega) {
             throw new HTTPException(400, "submission date already passed", "error_submission_date_passed");
         }

        $m = new $this->_model ([]);
        foreach($m->_gen as $genField) {
            $genMethod = "gen" . ucfirst($genField);
            if(method_exists($this->_model, $genMethod)) {
                $post[$genField] = $m->$genMethod($post);
            }
        }
        $o = new $this->_model ($post);

        $route = $this->getRoute($files["file"]["name"], $post);
        $o->Ruta = $route;

        try {
            $o->insert();
        } catch(Exception $e) {
            throw new HTTPException(400, "could not insert", "error_insert");
        }

        $res = move_uploaded_file($files["file"]["tmp_name"], $route);
        if(!$res) {
            throw new HTTPException(500, "error moving upoaded file");
        }

        $this->printSuccess($o->to_assoc());
    }

    public function delete($keys_assoc) {
        /* sólo borrar entradas del propio usuario */
        if($this->getAuth()->role == "alumno" && $this->onlyOwn && $this->loginField) {
            if($keys_assoc[$this->loginField] != $this->getAuth()->login) {
                throw new HTTPException(401, "permission denied", "error_permission_denied");
            }
        }

        $m = new EntregaUsuarioModel ([]);
        $found = $m->find_by($keys_assoc);
        if(count($found) == 1) {
            $o = $found[0];

            /* borrar fichero de la entrega */
            if($o->Ruta != "./files/" && file_exists($o->Ruta)) {
                unlink($o->Ruta);
                error_log("file '" . $o->Ruta . "' deleted");
            }
        }
        parent::delete($keys_assoc);
    }
}

?>