<?php

include_once "HTTPException.php";

class BaseService {
    private $auth;
    protected $onlyOwn = false;
    protected $loginField = null;

    public function __construct($auth = null) {
        if($auth) $this->auth = $auth;
    }

    public function getAuth() {
        return $this->auth;
    }

    protected function printSuccess($res = []) {
        header("Content-Type: application/json");
        $assoc = ["success" => true, "code" => 200, "res" => $res];
        echo json_encode($assoc);
    }

    function get($find_keys) {
        $o = new $this->_model ([]);

        /* sólo mostrar entradas del propio usuario */
        if($this->getAuth()->role == "alumno" &&
            $this->onlyOwn && $this->loginField) {
            $find_keys[$this->loginField] = $this->getAuth()->login;
        }

        $list = $o->find_by($find_keys);
        if(count($list) == 1) {
            $this->printSuccess($list[0]->to_assoc());
        } else if(count($list) == 0) {
            throw new HTTPException(404, "no element found", "error_no_get_element");
        } else {
            throw new HTTPException(404, "more than one element found", "error_more_get_element");
        }
    }

    function post($assoc, $keys_assoc = []) {

        /* Sólo añadir entradas del propio usuario si onlyOwn = true */
        if($this->getAuth()->role == "alumno" &&
            $this->onlyOwn && $this->loginField) {
            if($assoc[$this->loginField] != $this->getAuth()->login) {
                throw new HTTPException(401, "permission denied", "error_permission_denied");
            }
        }

        $m = new $this->_model([]);
        foreach($m->_gen as $genField) {
            $genMethod = "gen" . ucfirst($genField);
            if(method_exists($this->_model, $genMethod)) {
                $assoc[$genField] = $m->$genMethod($assoc);
            }
        }

        $o = new $this->_model ($assoc);

        if(count($keys_assoc) > 0) {
            $searched = $o->find_by($keys_assoc);
            if(count($searched) > 0) {
                throw new HTTPException(400, "object to insert already exists", "error_insert_exists");
            }
        }

        try {
            $inserted = $o->insert();
        } catch(Exception $e) {
            throw new HTTPException(400, "could not insert", "error_insert");
        }
        $this->printSuccess($assoc);
    }

    function delete($keys_assoc) {

        /* Sólo borrar entradas del propio usuario si onlyOwn = true */
        if($this->getAuth()->role == "alumno" &&
            $this->onlyOwn && $this->loginField) {
            if($keys_assoc[$this->loginField] != $this->getAuth()->login)
                throw new HTTPException(400, "permission denied", "error_permission_denied");
        }

        $o = new $this->_model ();
        $list = $o->find_by($keys_assoc);
        if(count($list) != 1) {
            throw new HTTPException(400, "element not found", "error_no_delete_element");
        }
        $o = $list[0];

        try {
            $deleted = $o->delete();
        } catch(Exception $e) {
            throw new HTTPException(500, "could not delete", "error_delete");
        }
        $this->printSuccess();
    }

    function put($keys_assoc, $assoc) {

        /* Sólo modificar entradas del propio usuario */
        if($this->getAuth()->role == "alumno" &&
            $this->onlyOwn && $this->loginField) {
            if($keys_assoc[$this->loginField] != $this->getAuth()->login)
                throw new HTTPException(401, "permission denied", "error_permission_denied");
        }

        $o = new $this->_model ();
        $list = $o->find_by($keys_assoc);
        if(count($list) != 1) {
            throw new HTTPException(400, "element not found", "error_no_put_element");
        }
        $o = $list[0];
        $o->from_assoc($assoc);

        try {
            $updated = $o->update();
        } catch(Exception $e) {
            throw new HTTPException(500, "could not update", "error_update");
        }
        $this->printSuccess($o->to_assoc());
    }

    function list() {
        $o = new $this->_model ([]);
        $lista = $o->find_all();
        $result = array();
        foreach($lista as $l) {
            $a = $l->to_assoc();

            /* sólo mostrar entradas del propio usuario si
             * onlyOwn está activado */
            if($this->getAuth()->role == "alumno" && $this->onlyOwn && $this->loginField) {
                if($a[$this->loginField] == $this->getAuth()->login)
                    array_push($result, $a);
            } else {
                array_push($result, $a);
            }
        }

        $this->printSuccess($result);
    }

    function search($reqFields) {
        $findByLike = array();
        foreach($reqFields as $r) {
            $findByLike[$r[0]] = array("LIKE", $r[1]);
        }

        // Sólo mostrar entradas del propio usuario
        if($this->getAuth()->role == "alumno" && 
            $this->onlyOwn && $this->loginField) {
            $findByLike[$this->loginField] = $this->getAuth()->login;
        }

        $m = new $this->_model ([]);
        $lista = $m->find_by($findByLike);
        $ret = array ();
        foreach($lista as $l) {
            array_push($ret, $l->to_assoc());
        }

        $this->printSuccess($ret);
    }
}

?>