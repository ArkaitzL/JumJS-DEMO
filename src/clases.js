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
        this.codigo = [];
        this.bloques = [];
    }
}

export class Bloque {
    constructor(){
        this.tipo = "";
        this.parametros = [];
        this.bloques = [];
    }
}

export class Codigo {
    constructor(){
        this.variables = [];
        this.servicios = [];
        this.llamadas = [];
    }
}

export class Variable {
    constructor(nombre, tipo){
        this.nombre = nombre;
        this.tipo = tipo;
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