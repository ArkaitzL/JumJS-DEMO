export class Clase {
    constructor(){
        this.nombre = "";
        this.variables = [];
        this.nombres_servicio = [];
        this.funciones = [];
    }
}

export class Funcion {
    constructor(){
        this.nombre = "";
        this.tipo = "";
        this.privada = false;
        this.parametros = [];
        this.variables = [];
        this.servicios = [];
        this.llamadas = [];
        this.llamadas_local = [];
        this.bloques = [];
    }
}

export class Bloque {
    constructor(){
        this.tipo = "";
        this.parametros = [];
        this.bloques = []; // ***  ¿¿¿  Añadir bloques en la lista de la funcion  ???  ***
    }
}

export class Variable {
    constructor(nombre, tipo){
        this.nombre = nombre;
        this.tipo = tipo;
    }
}

export class Servicio {
    constructor(declaracion, params, asignacion){
        this.declaracion = declaracion;
        this.params = params;
        this.asignacion = asignacion;
    }
}

/* 
    *1: Estructura clase
    {
        nombre: "",
        variables: [], *5
        nombres_servicio: [], *5
        funciones: [], *2
    }
*/

/* 
    *2: Estructura funcion
    {
        nombre: "",
        tipo: "",
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
        codigo: [],*4 -> Se guarda en el codigo del objeto funcion
        bloques: [] *3
    }
*/

/*
    *4: Estructura codigo
    {
        variables: [], *5
        servicios: [] * 6,
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

/*
    *6: Estructura servicio
    {
        declaracion: "",
        params: []
        aisgnacion: true/false
    }
*/