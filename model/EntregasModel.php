<?php

include_once "BaseModel.php";

class EntregasModel extends BaseModel {
    public $id, $nombre, $desde, $hasta, $hastaCorr;
    public $_pri = [ "id" ];
    public $_types = [ "id" => "s", "nombre" => "s", "desde" => "s", "hasta" => "s",
        "hastaCorr" => "s"];
    public $_name = "ENTREGA";
}

?>