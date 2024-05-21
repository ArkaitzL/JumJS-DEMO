import { util } from './util.js';

let paquetes = [];
let imports = []; 
let clases = [];

export function crearFun(datos){
    util();
    ({paquetes, imports, clases} = datos);

    return new Promise((resolve, reject) => {
        // Codigo
        let resultado = "";

        clases.forEach(clase => {
            resultado += claseTest(clase) + "\n\n";

        });

        // Devolucion
        resolve({
            resultado
        });
    });
}

function claseTest(clase){

    const TEST = [];
    clase.funciones.forEach(funcion => {
        TEST.push(test(funcion));
    });

    return `
        ${paquetes.map(paquete => paquete).join("\n") /*Paquetes*/}

        import **pendiente-basico**;

        @**pendiente**
        public class ${clase.nombre} {

            @InjectMocks
            ${clase.nombre}

            ${clase.variables.map(variable => `@Mock\n\t\t${variable.tipo} ${variable.nombre}`).join("\n")}

            **funcion pendiente{
                TEST
            }**

            ${TEST.join("\n")}

        }
    `;
}

function test(funcion){

    return `
        void test01_${funcion.nombre}(){


        }
    `;
}

function mock(){

}