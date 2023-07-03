<?php

include_once "BaseModel.php";

class HistoriasModel extends BaseModel {
    public $IdEntrega, $IdHistoria, $textoHistoria;
    public $_pri = [ "IdEntrega", "IdHistoria" ];
    public $_types = [ "IdEntrega" => "s", "IdHistoria" => "i", "textoHistoria" => "s"];
    public $_name = "HISTORIAS";

    public function get_num($entrega_id) {
        $conn = Connection::getConnection();
        $stat = $conn->prepare("SELECT MAX(IdHistoria)+1 AS max FROM HISTORIAS WHERE IdEntrega = ?");
        if(!$stat) {
            throw new Exception($conn->error);
        }
        $stat->bind_param("s", $entrega_id);
        $result = $stat->execute();
        if(!$result) {
            return 1;
        }
        $result = $stat->get_result();
        if(!$result) return 1;

        $n = $result->fetch_assoc()["max"];
        if($n == NULL)
            return 1;
        else return $n;
    }
}

?>