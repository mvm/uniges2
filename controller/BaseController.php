<?php

include_once 'Connection.php';
include_once "HTTPException.php";

require "vendor/autoload.php";
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class BaseController {
    protected function checkAuth($controller, $action) {
        $headers = getallheaders();
        if(isset($headers["Authorization"])) {
            $auth = $headers["Authorization"];
            $bearerArr = explode(" ", $auth);
            if(count($bearerArr) != 2)
                return FALSE;
            $token = $bearerArr[1];

            
            try {
                $decoded = JWT::decode($token, new Key(Auth::$secretKey, 'HS512'));
                if($decoded) {
                    if($decoded->role == "alumno") {
                        $hasPerm = in_array([$controller, $action], Auth::$alumnoPerm);
                        if($hasPerm)
                            return $decoded;
                        else
                            return false;
                    } else {
                        return $decoded;
                    }
                }
                else    
                    throw new HTTPException(401, "authorization failed", "error_auth_fail");
            } catch(Exception $e) {
                throw new HTTPException(401, "authorization failed", "error_auth_fail");
            }
        } else
            return FALSE;
    }

    protected function checkFields($assoc, $fields) {
        $keys = $fields;
        $keys_set = TRUE;
        
        foreach($keys as $k) {
            if(!isset($assoc[$k])) { $keys_set = FALSE; break; }
        }
        
        if(!$keys_set) {
            return false;
        } else
            return true;
    }

    protected function readJSON() {
        $body = file_get_contents("php://input");
        $assoc = json_decode($body, true);
        return $assoc;
    }

    protected function get() {
        $auth = $this->checkAuth($this->_cont, "get");
        if(!$auth) {
            throw new HTTPException(401, "permission denied", "error_permission_denied");
        }
        $keys = $this->_pri;
        $keys_set = TRUE;
        foreach($keys as $k) {
            if(!isset($_GET[$k])) $keys_set = FALSE;
        }
        if(!$keys_set) {
            throw new HTTPException(401, "keys not set", "error_keys_missing");
        }

        $find_keys = array();
        foreach($keys as $k) {
            $find_keys[$k] = $_GET[$k];
        }

        /* introducir service */
        $s = new $this->_service ($auth);
        $s->get($find_keys);
    }

    protected function post() {
        $auth = $this->checkAuth($this->_cont, "post");
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
        $keys_assoc = array ();
        foreach($keys as $k) {
            if(isset($assoc[$k])) {
                $keys_assoc[$k] = $assoc[$k];
            } else {
                $has_keys = false;
            }
        }

        if(!$has_keys) {
            throw new HTTPException(400, "element for post does not have keys");
        }

        /* introducir service */
        $s = new $this->_service ($auth);
        $s->post($assoc, $keys_assoc);
    }

    protected function delete() {
        $auth = $this->checkAuth($this->_cont, "delete");
        if(!$auth) {
            throw new HTTPException(401, "permission denied", "error_permission_denied");
        }
        $body = file_get_contents("php://input");
        $assoc = json_decode($body, true);
        if($assoc == NULL) {
            throw new HTTPException(400, "invalid JSON", "error_invalid_json");
        }

        $keys = $this->_pri;
        $keys_assoc = array();
        $has_keys = true;
        foreach($keys as $k) {
            if(!isset($assoc[$k])) { $has_keys = false; break; }
            $keys_assoc[$k] = $assoc[$k];
        }

        if(!$has_keys) {
            throw new HTTPException(401, "keys not set", "error_keys_missing");
        }

        /* introducir service */
        $s = new $this->_service ($auth);
        $s->delete($keys_assoc);
    }

    protected function put() {
        $auth = $this->checkAuth($this->_cont, "put");
        if(!$auth) {
            throw new HTTPException(401, "permission denied", "error_permission_denied");
        }
        $body = file_get_contents("php://input");
        $assoc = json_decode($body, true);
        if($assoc == NULL) {
            throw new HTTPException(400, "invalid JSON", "error_invalid_json");
        }

        $keys = $this->_pri;
        $keys_assoc = array();
        $has_keys = true;
        foreach($keys as $k) {
            if(!isset($assoc[$k])) { $has_keys = false; break; }
            $keys_assoc[$k] = $assoc[$k];
        }

        if(!$has_keys) {
            throw new HTTPException(401, "keys not set", "error_keys_missing");
        }

        /* introducir service */
        $s = new $this->_service ($auth);
        $s->put($keys_assoc, $assoc);
    }

    function id() {
        if($_SERVER['REQUEST_METHOD'] == "GET") {
            $this->get();
        } else if ($_SERVER['REQUEST_METHOD'] == "POST") {
            $this->post();
        } else if($_SERVER["REQUEST_METHOD"] == 'DELETE') {
            $this->delete();
        } else if($_SERVER["REQUEST_METHOD"] == "PUT") {
            $this->put();
        } else { /* unknown request code */
            throw new HTTPException(400, "bad request method", "error_bad_request_method");
        }
    }

    function list() {
        $auth = $this->checkAuth($this->_cont, "list");
        if(!$auth) {
            http_response_code(401);
            echo json_encode(["success" => FALSE, "msg" => "permission denied"]);
            return;
        }
        
        $s = new $this->_service ($auth);
        $s->list();
    }

    function search() {
        $auth = $this->checkAuth($this->_cont, "search");
        if(!$auth) {
            throw new HTTPException(401, "permission denied", "error_permission_denied");
        }

        $model = new $this->_model ([]);
        $fields = $model->get_vars();
        $request_fields = array();
        foreach($fields as $f) {
            if(isset($_GET[$f])) {
                array_push($request_fields, [$f, $_GET[$f]]);
            }
        }

        $s = new $this->_service ($auth);
        $s->search($request_fields);
    }
}

?>
