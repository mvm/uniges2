<?php

include_once "BaseModel.php";

class EntregaUsuarioModel extends BaseModel {
    public $login, $IdEntrega, $Alias, $Horas, $Ruta;
    public $_pri = [ "login", "IdEntrega"];
    public $_types = [ "login" => "s", "IdEntrega" => "s", "Alias" => "s", "Horas" => "i", "Ruta" => "s"];
    public $_name = "USUARIOENTREGA";
    public $_gen = ["Alias", "Ruta"];

    public function genAlias($json) {
        $hashstr = $json["login"] . "/" . $json["IdEntrega"];
        $hashed = hash("sha256", $hashstr);

        return substr($hashed, 0, 8);
    }

    public function genRuta($json) {
        return "./files/";
    }

}

?>