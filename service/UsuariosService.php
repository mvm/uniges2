<?php

include_once "service/BaseService.php";
include_once "model/UsuariosModel.php";

class UsuariosService extends BaseService {
    public $_model = "UsuariosModel";
    protected $onlyOwn = true;
    protected $loginField = "login";
}

?>