import { util } from './util.js';

//Informacion analizada
let paquetes = []; // [""]
let imports = []; // [""]
let clases = []; // *1

/* 
    *1: Estructura clase
    {
        nombre: "",
        variables: [], *5
        funciones: [], *2
    }
*/

/* 
    *2: Estructura funcion
    {
        nombre: "",
        privada: true/false,
        parametros: [], *5 
        codigo: [], *4
        bloques: [] *3
    }
*/

/* 
    *3: Estructura bloque
    {
        tipo: bucle/condicion,
        parametros: [], *5 
        codigo: [],*4
        bloques: [] *3
    }
*/

/*
    *4: Estructura codigo
    {
        variables: [], *5
        servicios: [""],
        llamadas: [""],

    }
*/

/*
    *5: Estructura variable
    {
        nombre: "",
        tipo: "",
    }
*/

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
    BLOQUES.forEach(bloque => {
        clase(bloque);
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

function clase(bloque){
    const { INFO, BLOQUES, LINEAS } = separarCodigo(bloque);

    //Continua la anidacion
    BLOQUES.forEach(bloque => {
        funcion(bloque);
    });

    //Analiza la informacion
    // *** ANALIZA EL NOMBRE ***

    //Analiza las lineas
    // LINEAS.forEach(linea => {
    // *** ANALIZA LAS VARIABLES ***
    // });

    // console.log(INFO);
    // console.log(BLOQUES);
    // console.log(LINEAS);
}

function funcion(bloque){
    const { INFO, BLOQUES, LINEAS } = separarCodigo(bloque);

    //Continua la anidacion
    BLOQUES.forEach(bloque => {
        estructuraBloque(bloque);
    });

    //Analiza la informacion
    // *** ANALIZA EL NOMBRE, LA PRIVACIDAD, LOS PARAMETROS ***

    //Analiza las lineas
    codigo(LINEAS);

    // console.log(INFO);
    // console.log(BLOQUES);
    // console.log(LINEAS);
}

function estructuraBloque(bloque){
    const { INFO, BLOQUES, LINEAS } = separarCodigo(bloque);

    //Continua la anidacion
    BLOQUES.forEach(bloque => {
        otros(bloque);
    });

    //Analiza la informacion
    // *** ANALIZA EL TIPO, LOS PARAMETROS ***

    //Analiza las lineas
    codigo(LINEAS);


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

