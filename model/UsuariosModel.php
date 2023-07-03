<?php

include_once "BaseModel.php";

class UsuariosModel extends BaseModel {
    public $login, $password, $nombre, $apellidos, $dni, $email;
    /* public $id; */
    public $_pri = [ "login" /* "id" */];
    public $_types = [/* "id" => "i", */ "login" => "s", "password" => "s", 
        "nombre" => "s", "apellidos" => "s", "dni" => "s", "email" => "s"];
    public $_name = "USUARIOS";

    public function writePassword($pass) {
        if($pass[0] == '$') return $pass;
        return password_hash($pass, PASSWORD_DEFAULT);
    }
}

?>