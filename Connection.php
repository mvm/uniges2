<?php

class Connection {
    private static $conn = null;
    private static $host = "localhost";
    private static $username = "uniges2";
    private static $password = "uniges2";
    private static $dbname = "uniges2";
    
    public static function getConnection() {
        if(self::$conn == null) {
            self::$conn = new mysqli(self::$host, self::$username,
                                     self::$password, self::$dbname);
        }
        return self::$conn;
    }
}

class Auth {
    public static $secretKey = "clave_secreta";
    public static $host = "http://localhost";

    public static $adminUsers = ["admin"];
    public static $alumnoPerm = [
        ["usuarios", "list"],
        ["usuarios", "get"],
        ["usuarios", "put"],

        ["entregas", "list"],
        ["entregas", "search"],
        
        ["historias", "list"],
        ["historias", "search"],
        
        ["entregausuario", "list"],
        ["entregausuario", "post"],
        ["entregausuario", "get"],
        ["entregausuario", "put"],
        ["entregausuario", "delete"],
        ["entregausuario", "search"],

        ["evaluaciones", "search"],
        ["evaluaciones", "list"],
        ["evaluaciones", "generateResultados"],

        ["resultados", "list"],
        ["resultados", "post"],
        ["resultados", "get"],
        ["resultados", "put"],
        ["resultados", "delete"],
        ["resultados", "search"]
    ];
}

?>
