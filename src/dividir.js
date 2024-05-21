import { util } from './util.js';
import { PRIMITIVOS } from './util.js';

import { Clase } from './clases.js';
import { Funcion } from './clases.js';
import { Bloque } from './clases.js';
import { Variable } from './clases.js';
import { Servicio } from './clases.js';

//Informacion analizada
let paquetes = []; // [""]
let imports = []; // [""]
let clases = []; // *1

export function dividirFun(){
    util();
    
    return new Promise((resolve, reject) => {
        // Codigo
        let texto = document.getElementById("clase").value;
        texto = texto.replace(/\/\/.*\n/g, '');
        texto = texto.replace(/\/\/.*$/gm, '');
        archivo(texto); 

        // Devolucion
        resolve({
            paquetes: paquetes,
            imports: imports,
            clases: clases
        });
    });

}

// Anidacion de bloques

function archivo(bloque){
    const { INFO, BLOQUES, LINEAS } = separarCodigo(bloque, false);

    //Continua la anidacion
    BLOQUES.forEach((bloque, index_clase) => {
        clase(bloque, index_clase);
    });

    //Analiza las lineas
    LINEAS.forEach(linea => {
        if(linea.includes("package")) 
            paquetes.push(linea);
        if(linea.includes("import")) 
            imports.push(linea);
    });

    // console.log(INFO);
    // console.log(BLOQUES);
    // console.log(LINEAS);
}

function clase(bloque, index_clase){
    const { INFO, BLOQUES, LINEAS } = separarCodigo(bloque);
    let clase = new Clase()

    //Analiza la informacion -> nombre clase
    let analizada = INFO.match(/class (\w+)/);
    clase.nombre = analizada ? analizada[1] : null;

    //Analiza las lineas -> variables/servicios
    LINEAS.forEach(linea => {
        //Sercivios
        if(linea.includes("@Autowired")) {
            linea = linea.removeSemicolon();
            const PARTES = linea.splitSpace();

            let servicio = new Variable();
            servicio.nombre = PARTES[PARTES.length - 1];
            servicio.tipo = PARTES[PARTES.length - 2];
            clase.nombres_servicio.push(servicio);
        }
        //Variables
        else {
            if(linea.includes("=")) linea = linea.split("=")[0].trim();
            else linea = linea.replace(/;/g, "");
            const PARTES = linea.splitSpace();

            let variable = new Variable();
            variable.nombre = PARTES[PARTES.length - 1];
            variable.tipo = PARTES[PARTES.length - 2];
            clase.variables.push(variable);
        }
    });

    clases.push(clase);

    //Continua la anidacion
    BLOQUES.forEach((bloque, index_funcion) => {
        funcion(bloque, index_clase, index_funcion);
    });

    // console.log(INFO);
    // console.log(BLOQUES);
    // console.log(LINEAS);
}

function funcion(bloque, index_clase, index_funcion){
    const { INFO, BLOQUES, LINEAS } = separarCodigo(bloque);
    let funcion = new Funcion();


    //Analiza la informacion -> nombre, privacidad, parametros
    let info = INFO.substring(0, INFO.indexOf("(")).trim().splitSpace();

    switch (info.length) {
        case 2:
            funcion.tipo = info[0];
            funcion.nombre = info[1];
            break;
        case 3:
            funcion.tipo = info[1];
            funcion.nombre = info[2];
            funcion.privada = (info[0] === "private" || info[0] === "internal");
            break;
        default:
            break;
    }     

    let params = INFO.substring(INFO.indexOf("(") + 1, INFO.lastIndexOf(")"))
        .split(",")
        .map(param => param.trim())
        .filter(param => param !== '');
    
    params.forEach(parametro => {

        const PARTES = parametro.splitSpace();    

        let params_obj = new Variable();
        params_obj.tipo = PARTES[PARTES.length - 2];
        params_obj.nombre = PARTES[PARTES.length - 1];

        funcion.parametros = params_obj;
    });
    


    clases[index_clase].funciones.push(funcion);

    //Analiza las lineas
    codigo(LINEAS, index_clase, index_funcion);

    //Continua la anidacion
    BLOQUES.forEach(bloque => {
        estructuraBloque(bloque, index_clase, index_funcion);
    });

    // console.log(INFO);
    // console.log(BLOQUES);
    // console.log(LINEAS);
}

function estructuraBloque(bloque, index_clase, index_funcion){
    const { INFO, BLOQUES, LINEAS } = separarCodigo(bloque);

    //Analiza la informacion
    // *** ANALIZA EL TIPO, LOS PARAMETROS ***

    //Analiza las lineas
    codigo(LINEAS, index_clase, index_funcion);

    //Continua la anidacion
    BLOQUES.forEach(bloque => {
        otros(bloque);
    });

    // console.log(INFO);
    // console.log(BLOQUES);
    // console.log(LINEAS);
}

function codigo(lineas, index_clase, index_funcion){

    //Analiza las lineas -> variables, servicios, llamadas
    lineas.forEach(linea => {

        //variables
        const PARTES = linea.removeSemicolon().splitSpace();

        if(PARTES.length == 2) {
            if(esVariable(PARTES[0], PARTES[1])) {
                let variable = new Variable();
                variable.tipo = PARTES[0];
                variable.nombre = PARTES[1];
               
                clases[index_clase].funciones[index_funcion].variables.push(variable);
            }
        }
        if(PARTES.length > 2) {
            if(PARTES[2] === "=" && esVariable(PARTES[0], PARTES[1])) {
                let variable = new Variable();
                variable.tipo = PARTES[0];
                variable.nombre = PARTES[1];
            
                clases[index_clase].funciones[index_funcion].variables.push(variable);
            }
        }

        //funciones de
        PARTES.forEach((parte, i) => {
            if (parte.match(/^\w+\.\w+\(/)) { // es funcion de un objeto
                if (clases[index_clase].nombres_servicio.some(
                    servicio => parte.split(".")[0] === servicio.nombre)
                ){ // es sevicio

                    let servicio = new Servicio();
                    servicio.declaracion = parte.substring(0, parte.indexOf("("));
                    servicio.asignacion = PARTES[i - 1] === "=";
                    servicio.params = parte
                        .substring(parte.indexOf("(") + 1, parte.lastIndexOf(")"))
                        .split(",")
                        .map(param => param.trim())
                        .filter(param => param !== '');

                    clases[index_clase].funciones[index_funcion].servicios.push(servicio);
                }
                else {
                    // *** GUARDAR LAS PARTES DE LAS FUNCIONES QUE HAGAN FALTA ***
                }
            }
            else if(/^\w+\((\s*\w*\s*,*\s*)*\)$/) { // es una funcion local
                    // *** GUARDAR LAS PARTES DE LAS FUNCIONES QUE HAGAN FALTA ***
            }
        });


    });
}

// Funciones de codigo

function esVariable(tipo, nombre) {

    let tipo_valido = tipo.charCodeAt(0) >= 65 && tipo.charCodeAt(0) <= 90; // Mayusculas
    let nombre_valido = nombre.charCodeAt(0) >= 97 && nombre.charCodeAt(0) <= 122; // Minusculas
    let tipo_primitivo = PRIMITIVOS.includes(tipo);

    return (tipo_valido || tipo_primitivo) && nombre_valido;
}


// Funciones compartidas

function separarCodigo(texto, esCompleto = true){
    texto.trim();

    //1.- Declaracion de la clase/funcion/bucle/condicion
    let INFO = "";
    if (esCompleto) {
        const INICIO = texto.indexOf("{");
        const FIN = texto.lastIndexOf("}");

        INFO = texto.substring(0, INICIO);

        // Elimina la parte usada del codigo
        texto = texto.substring(INICIO + 1, FIN - 1);
    }
    
    //2.- Bloques de codigo en la siguiente iteracion
    const BLOQUES_INDEX = [];
    let ultimoBloque = null;
    let limitante = 0;

    do {
        if (ultimoBloque != null) BLOQUES_INDEX.push(ultimoBloque);
        ultimoBloque = texto.findBlocks(ultimoBloque?.fin + 1 ?? 0)

        if (ultimoBloque !== null) {
            let indices = [';', '{', '}'].map(char => texto.lastIndexOf(char, ultimoBloque.inicio - 1));
            let inicio = Math.max(...indices);
            ultimoBloque.inicio = (inicio !== -1) ? inicio + 1 : 0;
        }

        limitante++;
    } while (ultimoBloque !== null && limitante !== 10); // NOTA: Aumentar el limite si es necesario

    const BLOQUES = BLOQUES_INDEX.map(bloque =>
         texto.substring(bloque.inicio, bloque.fin + 1).cleanText()
    );

    // Elimina la parte usada del codigo
    BLOQUES_INDEX.sort((a, b) => b.inicio - a.inicio);
    BLOQUES_INDEX.forEach(bloque => {
        texto = texto.slice(0, bloque.inicio) + texto.slice(bloque.fin + 1);
    });

    //3.- Divide el texto en lineas de codigo
    const LINEAS_INDEX = texto.findIndex(";");
    let ultimoIndex = 0;

    const LINEAS = LINEAS_INDEX.map(index => {
        const LINEA = texto.substring(ultimoIndex, index + 1).cleanText();
        ultimoIndex = index + 1;
        return LINEA;
    });

    return { INFO, BLOQUES, LINEAS };
}

