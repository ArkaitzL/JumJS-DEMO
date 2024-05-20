import { util } from './util.js';

import { Clase } from './clases.js';
import { Funcion } from './clases.js';
import { Bloque } from './clases.js';
import { Codigo } from './clases.js';
import { Variable } from './clases.js';

//Informacion analizada
let paquetes = []; // [""]
let imports = []; // [""]
let clases = []; // *1

export function dividirFun(){
    util();
    
    return new Promise((resolve, reject) => {
        // Codigo
        let texto = document.getElementById("clase").value.replace(/\/\/.*\n/g, '\n');
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
            linea = linea.replace(/;/g, "");
            const PARTES = linea.split(" ");

            let servicio = new Variable();
            servicio.nombre = PARTES[PARTES.length - 1];
            servicio.tipo = PARTES[PARTES.length - 2];
            clase.nombres_servicio.push(servicio);
        }
        //Variables
        else {
            if(linea.includes("=")) linea = linea.split("=")[0].trim();
            else linea = linea.replace(/;/g, "");
            const PARTES = linea.split(" ");

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
    let params = INFO.match(/\((.*?)\)/);
    params = params ? params[1] : null;
    let info = INFO.replace(`(${params})`, "").trim().split(" ");

    switch (info.length) { // *** HACIENDO ***
        case 2:
            funcion.tipo = info[0];
            funcion.nombre = info[1];
            break;
        case 3:
            funcion.tipo = info[1];
            funcion.nombre = info[2];
            funcion.privada = (info[0] === "private" || info[0] === "protected");
            break;
        default:
            break;
    }     

    //Analiza las lineas
    codigo(LINEAS);

    clases[index_clase].funciones.push(funcion);

    //Continua la anidacion
    BLOQUES.forEach(bloque => {
        estructuraBloque(bloque);
    });

    // console.log(INFO);
    // console.log(BLOQUES);
    // console.log(LINEAS);
}

function estructuraBloque(bloque){
    const { INFO, BLOQUES, LINEAS } = separarCodigo(bloque);

    //Analiza la informacion
    // *** ANALIZA EL TIPO, LOS PARAMETROS ***

    //Analiza las lineas
    codigo(LINEAS);

    //Continua la anidacion
    BLOQUES.forEach(bloque => {
        otros(bloque);
    });
    
    // console.log(INFO);
    // console.log(BLOQUES);
    // console.log(LINEAS);
}

function codigo(lineas){
    //Analiza las lineas
    // *** ANALIZA VARIABLE, SERVICIOS, LLAMADAS ***
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

