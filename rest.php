<?php

include_once "HTTPException.php";

$controller = "usuarios";
$action = "id";

if(isset($_GET["controller"]) && preg_match("/^[A-Za-z]+$/", $_GET["controller"])) {
    $controller = strtolower($_GET["controller"]);
}

if(isset($_GET["action"]) && preg_match("/^[A-Za-z]+$/", $_GET["action"])) {
    $action = strtolower($_GET["action"]);
}

$controller_class = ucfirst($controller) . "Controller";
$service_class = ucfirst($controller) . "Service";
$controller_file = "./controller/$controller_class.php";
$service_file = "./service/$service_class.php";

try {
    if(file_exists($controller_file)) {
        include $controller_file;
    } else {
        throw new HTTPException(404, "controller '$controller' does not exist");
    }

    if(file_exists($service_file)) {
        include $service_file;
    } else {
        throw new HTTPException(404, "service $service_class does not exist");
    }

    $c = new $controller_class ();
    if(!method_exists($c, $action))
        throw new HTTPException(404, "method $action not found in $controller_class");
    $c->$action();
} catch(HTTPException $he) {
    http_response_code($he->getHTTPCode());
    header("Content-Type: application/json");

    $resp_array = ["success" => false, "code" => $he->getHTTPCode(), "msg" => $he->getMessage()];
    if($he->getTextId()) {
        $resp_array["text_id"] = $he->getTextId();
    }

    echo json_encode($resp_array);
} catch(Exception $e) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["success" => false, "code" => 500, "msg" => $e->getMessage()]);
    return;
}

end:

?>