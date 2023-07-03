<?php

include_once "Connection.php";

class BaseModel {
    public $_pri = [];
    public $_types = [];
    public $_name = "";
    public $_gen = [];

    public function __construct($array = []) {
        foreach($this->get_vars() as $key) {
            if(isset($array[$key]))
                $this->$key = $array[$key];
        }
    }

    public function from_assoc($assoc) {
        foreach($this->get_vars() as $key) {
            if(isset($assoc[$key]))
                $this->$key = $assoc[$key];
        }
    }

    public function get_vars() {
        return array_filter(array_keys(get_class_vars(get_class($this))),
            "BaseModel::is_reserved"
        );

    }

    protected function do_write_callback($key, $value) {
        $funName = "write" . ucfirst($key);
        if(method_exists($this, $funName)) {
            $v = $this->$funName($value);
        } else 
            $v = $value;
        return $v;
    }

    protected function do_generate($key) {
        $funName = "generate" . ucfirst($key);
        if(method_exists($this, $funName)) {
            return $this->$funName();
        } else
            throw new Exception("function $funName does not exist");
    }

    public static function is_reserved($var_name) {
        return strncmp($var_name, "_", 1) != 0;
    }

    public function update() {
        $vars = $this->get_vars();
        $keys = $this->_pri;
        $upd_fields = array_diff($vars, $keys);
        
        $upd_arr = array();
        foreach($upd_fields as $k) {
            array_push($upd_arr, "$k = ?");
        }
        $upd_str = implode(", ", $upd_arr);

        $keys_arr = array();
        foreach($keys as $k) {
            array_push($keys_arr, "$k = ?");
        }
        $keys_str = implode(" AND ", $keys_arr);

        $queryStr = "UPDATE $this->_name SET $upd_str WHERE $keys_str";
        
        $conn = Connection::getConnection();
        $stat = $conn->prepare($queryStr);
        if(!$stat) {
            error_log("update prepare error: " . $conn->error);
            throw new Exception($conn->error);
        }

        $types = "";
        foreach($upd_fields as $u) {
            $types .= $this->_types[$u];
        }
        foreach($keys as $k) {
            $types .= $this->_types[$k];
        }

        $values = array();
        foreach($upd_fields as $u) {
            $v = $this->do_write_callback($u, $this->$u);
            array_push($values, $v);
        }
        foreach($keys as $k) {
            array_push($values, $this->$k);
        }
        $arr2 = array_slice($values, 1);
        $stat->bind_param($types, $values[0], ...$arr2);

        $result = $stat->execute();
        if(!$result) {
            error_log("update execute error: " . $conn->error);
            throw new Exception($conn->error);
        }
        return $result;
    }

    public function delete() {
        $keys = $this->_pri;
        $conn = Connection::getConnection();

        $whereStrArr = array();
        foreach($keys as $k) {
            array_push($whereStrArr, "$k = ?");
        }
        $whereStr = implode(" AND ", $whereStrArr);

        $queryStr = "DELETE FROM $this->_name WHERE $whereStr";
        $stat = $conn->prepare($queryStr);
        if(!$stat) {
            error_log("delete prepare error: " . $conn->error);
            throw new Exception($conn->error);
        }

        $typeStr = "";
        $keyarr = array();
        foreach($keys as $k) {
            $typeStr .= $this->_types[$k];
            array_push($keyarr, $this->$k);
        }
        $arr2 = array_slice($keyarr, 1);
        $stat->bind_param($typeStr, $keyarr[0], ...$arr2);

        $result = $stat->execute();
        if(!$result) {
            error_log("delete execute error: " . $conn->error);
            throw new Exception($conn->error);
        }
        return $result;
    }

    public function find_all() {
        $conn = Connection::getConnection();
        $stat = $conn->prepare("SELECT * FROM " . $this->_name);
        if(!$stat) {
            error_log("find_all prepare error: " . $conn->error);
            throw new Exception($conn->error);
        }
        $execResult = $stat->execute();
        if(!$execResult) {
            error_log("find_all execute error: " . $conn->error);
            throw new Exception($conn->error);
        }

        $result = $stat->get_result();
        if(!$result) {
            error_log("find_all get_result error: " . $conn->error);
            throw new Exception($conn->error);
        }
        $return = array();
        $this_class = get_class($this);
        while($o = $result->fetch_assoc()) {
            array_push($return, new $this_class ($o));
        }
        return $return;
    }

    public function find_by($key_params) {
        $conn = Connection::getConnection();
        
        $queryStr = "SELECT * FROM " . $this->_name . " ";
        if(count($key_params) > 0) { 
            $queryStr .= "WHERE ";
            $keys_arr = array();
            foreach($key_params as $key => $value) {
                if(is_array($value)) {
                    if(count($value) != 2) {
                        throw new HTTPException(500, "array for find_by doesn't have two values");
                    }
                    array_push($keys_arr, "$key $value[0] ?");
                } else {
                    array_push($keys_arr, "$key = ?");
                }
            }
            $queryStr .= implode(" AND ", $keys_arr);
        }

        $stat = $conn->prepare($queryStr);
        if(!$stat) {
            error_log("find_by prepare error: " . $conn->error);
            throw new Exception($conn->error);
        }
        
        $typesStr = "";
        $values = array();
        foreach($key_params as $key => $val) {
            $typesStr .= $this->_types[$key];
            if(is_array($val)) {
                if(count($val) != 2) {
                    error_log("find_by array error: params = " . print_r($key_params, true), 3, Log::$logFile);
                    throw new HTTPException(500, "array for find_by doesn't have two values");
                }
                if($val[0] == "LIKE") {  
                    array_push($values, "%". $val[1] . "%");
                } else
                    array_push($values, $val[1]);
            } else
                array_push($values, $val);
        }
        $arr2 = array_slice($values, 1);
        
        if(count($values) > 0) {
            $stat->bind_param($typesStr, $values[0], ...$arr2);
        }
        if(!$stat->execute()) {
            error_log("find_by execute error: " . $conn->error);
            throw new Exception($conn->error);
        }

        $result = $stat->get_result();
        if(!$result) return [];
        $this_class = get_class($this);
        $return = array();
        while($o = $result->fetch_assoc()) {
            array_push($return, new $this_class($o));
        }

        return $return;
    }

    public function insert() {
        $conn = Connection::getConnection();
        $vars = $this->get_vars();
        $vars_ins = implode(", ", $vars);

        $types = array();
        foreach($vars as $v) {
            array_push($types, $this->_types[$v]);
        }
        $typesStr = implode("", $types);

        $values = array();
        foreach($vars as $v) {
            $v = $this->do_write_callback($v, $this->$v);
            array_push($values, $v);
        }

        $intg_arr = array_fill(0, count($vars), "?");
        $intg = implode(", ", $intg_arr);
        $queryStr = "INSERT INTO " . $this->_name . " (" . $vars_ins . ") VALUES (" . $intg .
                ")";
        if(!($stat = $conn->prepare($queryStr))) {
            error_log("insert prepare error: " . $conn->error);
            throw new Exception($conn->error);
        }
        $arr2 = array_slice($values, 1);
        $stat->bind_param($typesStr, $values[0], ...$arr2);
        if(!$stat->execute()) {
            error_log("insert execute error: " . $conn->error);
            throw new Exception($conn->error);
        }
        return TRUE;
    }

    public function to_assoc() {
        $vars = $this->get_vars();
        $result = array();
        foreach($vars as $v) {
            $result[$v] = $this->$v;
        }
        return $result;
    }

    public function to_json() {
        $assoc = $this->to_assoc();
        return json_encode($assoc);
    }

    public function from_json($json_str) {
        $assoc = json_decode($json_str, TRUE);
        $class = get_class($this);
        return new $class($assoc);
    }
}

?>