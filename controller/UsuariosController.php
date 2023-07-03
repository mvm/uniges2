<?php

require "vendor/autoload.php";
use Firebase\JWT\JWT;

include_once "model/UsuariosModel.php";
include_once "BaseController.php";

class UsuariosController extends BaseController {
    public $_pri = ["login"];
    public $_service = "UsuariosService";
    public $_model = "UsuariosModel";
    public $_cont = "usuarios";

    public function login() {
        $body = file_get_contents("php://input");
        $assoc = json_decode($body, true);
        if($assoc == NULL) {
            throw new HTTPException(400, "invalid JSON", "error_invalid_json");
        }

        $keys = ["login", "password"];
        $has_keys = true;
        foreach($keys as $k) {
            if(!isset($assoc[$k])) $has_keys = false;
        }

        if(!$has_keys) {
            throw new HTTPException(401, "keys not set", "error_keys_missing");
        }

        $o = new UsuariosModel([]);
        $list = $o->find_by(["login" => $assoc["login"]]);
        if(count($list) != 1) {
            throw new HTTPException(404, "user not found", "error_user_not_found");
        }
        $o = $list[0];

        //if($o->password != $assoc["password"]) {
        if(!password_verify($assoc["password"], $o->password)) {
            throw new HTTPException(401, "password does not match", "error_password_match");
        }

        $issuedAt = time();
        $expire = time() + 3600;
        $login = $assoc["login"];

        if(in_array($login, Auth::$adminUsers)) {
            $role = "profesor";
        } else {
            $role = "alumno";
        }

        $data = [
            "iat" => $issuedAt,
            "iss" => Auth::$host,
            "nbf" => $issuedAt,
            "exp" => $expire,
            "login" => $login,
            "password" => $assoc["password"],
            "role" => $role
        ];

        header("Authorization: Bearer " . JWT::encode($data, Auth::$secretKey, 'HS512'));
        
        //session_start();
        //$_SESSION["login"] = $assoc["login"];
        echo json_encode(["success" => true, "login" => $assoc["login"],
            "role" => $role]);
    }

    public function register() {
        $body = file_get_contents("php://input");
        $assoc = json_decode($body, true);
        if($assoc == NULL) {
            throw new HTTPException(400, "invalid JSON", "error_invalid_json");
        }

        $keys = ["login", "password", "nombre", "apellidos", "dni", "email"];
        $has_keys = true;
        foreach($keys as $k) {
            if(!isset($assoc[$k])) $has_keys = false;
        }

        if(!$has_keys) {
            throw new HTTPException(401, "keys not set", "error_keys_missing");
        }

        $o = new UsuariosModel([]);
        $list = $o->find_by(["login" => $assoc["login"]]);
        if(count($list) > 0) {
            throw new HTTPException(401, "user already exists", "error_user_exists");
        }
        $o = new UsuariosModel($assoc);
        $o->insert();
        
        http_response_code(200);
        header("Content-Type: application/json");
        echo json_encode(["success" => TRUE]);
    }

    public function logout() {
 
    }
}

?>