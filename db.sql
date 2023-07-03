DROP DATABASE uniges2;
CREATE DATABASE IF NOT EXISTS uniges2;
USE uniges2;

CREATE USER IF NOT EXISTS 'uniges2'@'localhost' IDENTIFIED BY 'uniges2';
GRANT ALL PRIVILEGES ON uniges2.* TO 'uniges2'@'localhost';

CREATE TABLE IF NOT EXISTS `USUARIOS` (
  `login` varchar(9) primary key COLLATE latin1_spanish_ci NOT NULL,
  `password` varchar(128) COLLATE latin1_spanish_ci NOT NULL,
  `nombre` varchar(30) COLLATE latin1_spanish_ci NOT NULL,
  `apellidos` varchar(50) COLLATE latin1_spanish_ci NOT NULL,
  `dni` varchar(9) COLLATE latin1_spanish_ci NOT NULL,
  `email` varchar(40) COLLATE latin1_spanish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

CREATE TABLE `ENTREGA` (
  `id` varchar(6) primary key COLLATE latin1_spanish_ci NOT NULL,
  `nombre` varchar(60) COLLATE latin1_spanish_ci NOT NULL,
  `desde` date NOT NULL,
  `hasta` date NOT NULL,
  `hastaCorr` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

CREATE TABLE `HISTORIAS` (
  `IdEntrega` varchar(6) COLLATE latin1_spanish_ci NOT NULL,
  `IdHistoria` int(2) NOT NULL,
  `textoHistoria` varchar(300) COLLATE latin1_spanish_ci NOT NULL,
  PRIMARY KEY (IdEntrega, IdHistoria)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

CREATE TABLE `USUARIOENTREGA` (
  `login` varchar(9) COLLATE latin1_spanish_ci NOT NULL,
  `IdEntrega` varchar(6) COLLATE latin1_spanish_ci NOT NULL,
  `Alias` varchar(9) COLLATE latin1_spanish_ci NOT NULL,
  `Horas` int(2) DEFAULT NULL,
  `Ruta` varchar(60) COLLATE latin1_spanish_ci DEFAULT NULL,
  PRIMARY KEY (login, IdEntrega)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

CREATE TABLE `EVALUACION` (
  `IdEntrega` varchar(6) COLLATE latin1_spanish_ci NOT NULL,
  `AliasAutor` varchar(9) COLLATE latin1_spanish_ci NOT NULL,
  `loginEvaluador` varchar(9) COLLATE latin1_spanish_ci NOT NULL,
  PRIMARY KEY (IdEntrega, AliasAutor, loginEvaluador)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

CREATE TABLE `RESULTADO_EVALUACION` (
  `IdEntrega` varchar(6) COLLATE latin1_spanish_ci NOT NULL,
  `AliasAutor` varchar(9) COLLATE latin1_spanish_ci NOT NULL,
  `loginEvaluador` varchar(9) COLLATE latin1_spanish_ci NOT NULL,
  `IdHistoria` int(2) NOT NULL,
  `Correccion` tinyint(1) NOT NULL,
  `Comentario` varchar(600) COLLATE latin1_spanish_ci NOT NULL,
  PRIMARY KEY(IdEntrega, AliasAutor, loginEvaluador, IdHistoria)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;

--
-- Dumping data for table `ENTREGA`
--

INSERT INTO `ENTREGA` (`id`, `nombre`, `desde`, `hasta`, `hastaCorr`) VALUES
('ET1', 'Entrega1', '2017-10-16', '2017-10-19', '2022-08-20'),
('QA1', 'QUALITY MANAGER 1', '2017-10-22', '2017-10-26', '2022-08-20');

INSERT INTO `HISTORIAS` (`IdEntrega`, `IdHistoria`, `textoHistoria`) VALUES
('ET1', 1, 'El diseÃ±o sigue la estructura solicitada'),
('ET1', 2, 'El diseÃ±o tiene todos los elementos solicitados'),
('ET1', 3, 'El diseÃ±o mantiene coherencia visual entre los elementos de la pÃ¡gina'),
('ET1', 4, 'El diseÃ±o de los formularios es coherente entre los mismos'),
('ET1', 5, 'El diseÃ±o de las tablas de muestra de datos es coherente entre las tablas'),
('ET1', 6, 'La pÃ¡gina mantiene la estructura de la presentaciÃ³n ante un redimensionamiento del navegador'),
('ET1', 7, 'La pÃ¡gina mantiene coherencia entre opciones (tiene siempre la misma opciÃ³n para la misma acciÃ³n)'),
('ET1', 8, 'Los campos de formulario tienen el tamaÃ±o de control correcto para el atributo de la tabla que solicitan'),
('ET1', 9, 'Los campos del formulario tiene el tamaÃ±o del dato solicitado correcto para el atributo de la tabla que solicitan'),
('ET1', 10, 'Todas las acciones estÃ¡n representadas por iconos'),
('ET1', 11, 'La tabla de SHOWALL es clara y visualmente correcta'),
('ET1', 12, 'La tabla de DELETE es clara y visualmente correcta'),
('ET1', 13, 'Existe una validaciÃ³n por campo de formulario correcta'),
('ET1', 14, 'Existe una validaciÃ³n por submit que comprueba la validez de todos los campos del formulario antes de enviar al servidor'),
('ET1', 15, 'El formulario de SEARCH permite buscar por todos los campos que se desee'),
('ET1', 16, 'El formulario de SEARCH permite colocar valores parciales en cada campo del formulario (p.e. una parte del dni)'),
('ET1', 17, 'El formulario de SEARCH permite buscar solo por parte de los campos del formulario'),
('ET1', 18, 'El formulario de EDIT no permite modificar los campos clave de la tabla'),
('ET1', 19, 'En el formulario de ADD son obligatorios los campos NOT NULL de la tabla'),
('ET1', 20, 'En el formulario de EDIT son obligatorios los campos NOT NULL de la tabla'),
('ET1', 21, 'Las funciones javascript tienen comentario con una descripciÃ³n antes de su comienzo'),
('ET1', 22, 'Las funciones javascript tienen todas las variables definidas'),
('ET1', 23, 'Las funciones javascript tienen las variables comentadas en su definiciÃ³n'),
('ET1', 24, 'Las funciones javascript tienen comentadas todas las estructuras de control'),
('ET1', 25, 'Los ficheros del trabajo tiene todos al principio del fichero comentada su funciÃ³n, autor y fecha'),
('ET1', 26, 'Los fichero tienen el nombre indicado en la definiciÃ³n de la entrega'),
('ET1', 27, 'El directorio a entregar existe y tiene el nombre indicado en la entrega'),
('ET1', 28, 'El alumno evaluado ha indicado el nÃºmero de horas utilizado en la entrega');

INSERT INTO `USUARIOS` VALUES ('admin','$2y$10$0HdKSIglDEFrvxdM0wqcWeOuxFmEI6ncv.Oijyypf0dQ3Q2TLIrUq','Miguel','Vicente Moure','12345678O','mvmoure@esei.uvigo.es'), -- password 1234
('agonzalez','$2y$10$gP8mujpqSCnzp.4LpCw9C.s5cleRlqI/h/DWNEwi5t6SknZwXAmU6','Antonio','González','09876541W','agonzalez@uvigo.es'),
('eperez','$2y$10$DWkwhqvC5a3.Q/WHo/GJROIBjedey2POzfJ.cZ4NgH7/6XrsnjuSq','Enrique','Pérez','34563456P','eperez@uvigo.es'),
('plopez','$2y$10$bXLIpY2PFXzPb/y8KADrDOZ0Cq18Jcf/1Yw3UyM8v/8jBql8xeacG','Pablo','López','22222222T','plopez@uvigo.es'),
('test','$2y$10$kd/dCknmA6iv.XcNWYwqtOkjzPWxjSRqsg7QK9lf73DeR8fgF1mSu','Felipe','García','12345670Q','felipe@fgarcia.com'), -- password 1234
('test2','$2y$10$apapI8fmcGgzJiENAntRyedzVsnGEWOA4TCBZDXOX2YntVUOtXYby','Ernesto','González','56789123Q','egonzalez@egonzalez.com');

INSERT INTO `USUARIOENTREGA` VALUES ('test','ET1','7923b27a',6,'./files/ET1_test_7923b27a.log');
