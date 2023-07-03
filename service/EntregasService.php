<?php

include_once "HTTPException.php";
include_once "service/BaseService.php";
include_once "model/EntregasModel.php";
include_once "model/HistoriasModel.php";

include_once "model/EntregaUsuarioModel.php";
include_once "model/UsuariosModel.php";
include_once "model/EvaluacionesModel.php";

class EntregasService extends BaseService {
    public $_model = "EntregasModel";

    public function delete($keys_assoc) {
        $id = $keys_assoc["id"];
        $h = new HistoriasModel();
        $historias = $h->find_by(["IdEntrega" => $id]);
        if(count($historias) > 0) {
            throw new HTTPException(401, "entrega tiene historias disponibles", "error_task_hasreqs");
        }
        $e = new EntregasModel ();
        $entregas = $e->find_by($keys_assoc);
        if(count($entregas) == 0) {
            throw new HTTPException(404, "entrega no encontrada", "error_task_notfound");
        }
        $e = $entregas[0];
        $e->delete();

        $this->printSuccess();
    }

    public function generate($identrega, $auth) {
        $m = new EntregaUsuarioModel([]);
        $modelEval = new EvaluacionesModel([]);

        $evals = $modelEval->find_by(["IdEntrega" => $identrega]);
        if(count($evals) > 0) {
            throw new HTTPException(400, "assessments for the task have already been generated",
                "error_generated_eval");
        }

        $entregas = $m->find_by(["IdEntrega" => $identrega]);
        
        foreach($entregas as $e) {
            $modelEval->IdEntrega = $e->IdEntrega;
            $modelEval->AliasAutor = $e->Alias;

            $u = new UsuariosModel ([]);
            /* Crear evaluacion por 5 o menos usuarios que no sean el
             * profesor o el mismo alumno que envió */
            $users = $u->find_by(["login" => ["!=", "admin"]]);

            /* Sólo usar usuarios que no son el usuario que envió
             * la entrega */
            $usersNotSelf = [];
            foreach($users as $u) {
                if($u->login != $e->login) {
                    array_push($usersNotSelf, $u);
                }
            }

            /* aleatorizar y sacar máximo 5 usuarios de la lista */
            shuffle($usersNotSelf);
            $selUsers = array_slice($usersNotSelf, 0, min(5, count($users)));
            foreach($selUsers as $user) {
                $modelEval->loginEvaluador = $user->login;
                $modelEval->insert();
            }

            /* Evaluación por el profesor (admin) */
            $adminUser = $u->find_by(["login" => "admin"]);
            if(count($adminUser) != 1) {
                throw new HTTPException(500, "admin user not found");
            }

            $modelEval->loginEvaluador = $adminUser[0]->login;
            $modelEval->insert();

            /* Autoevaluación por el usuario que envió la entrega */
            $ownUser = $u->find_by(["login" => $e->login]);
            if(count($ownUser) != 1) {
                throw new HTTPException(500, "own user of submission not found");
            }
            $modelEval->loginEvaluador = $ownUser[0]->login;
            $modelEval->insert();
        }

        $this->printSuccess();
    }
}

?>