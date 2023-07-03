<?php

class HTTPException extends Exception {
    private $http_code;
    private $text_id;

    public function __construct($code, $msg, $text_id = NULL) {
        $this->http_code = $code;
        if($text_id) $this->text_id = $text_id;
        parent::__construct($msg);
    }

    public function getHTTPCode() {
        return $this->http_code;
    }

    public function getTextId() {
        return $this->text_id;
    }
}
?>