import { util } from './util.js';
import { PRIMITIVOS } from './util.js';
import { VALORES } from './util.js';

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

    // Crear los test de la clase
    const TEST = [];
    clase.funciones.forEach(funcion => {
        TEST.push(test(clase, funcion));
    });

    //Imports de las objetos
    let objetos = clase.variables;
    objetos = objetos.concat(clase.nombres_servicio);
    clase.funciones.forEach(funcion => {
        objetos = objetos.concat(funcion.parametros);
    });
    objetos = objetos.map(objeto => objeto.tipo);

    let imports_objetos = [];
    objetos.forEach(objeto => {
        imports.forEach(imp => {  
            const PARTES = imp
                .split(".")
                .map(parte => parte.trim());

            if(PARTES[PARTES.length - 1].removeSemicolon() === objeto.trim()){
                if(!imports_objetos.includes(imp)) imports_objetos.push(imp);
            }
        });
    });

    // Texto de la clase
    let str = `
        ${paquetes.map(paquete => paquete).join("\n")}

        import static org.junit.jupiter.api.Assertions.*;

        import org.junit.jupiter.api.Test;
        import org.springframework.test.util.ReflectionTestUtils;
        import org.mockito.Mockito;
        import org.mockito.InjectMocks;
        import org.mockito.Mock;
        import org.mockito.junit.jupiter.MockitoExtension;
        import org.junit.jupiter.api.extension.ExtendWith;

        ${imports_objetos.join("\n")}

        @ExtendWith(MockitoExtension.class)
        public class ${clase.nombre} {

            @InjectMocks
            ${clase.nombre} ${clase.nombre.toName()};

            ${clase.nombres_servicio.map((sercicio, i) => `${i != 0 ? `${tab(3)}` :''}@Mock\n${tab(3)}${sercicio.tipo} ${sercicio.nombre};`).join("\n")}

            @BeforeEach
            public void setUp() {
                MockitoAnnotations.initMocks(this);
            }

            ${TEST.join(`\n`)}

}   `;
    // Eliminar las tabulaciones iniciales de cada línea
    return str
        .split('\n')
        .map(line =>
             line.startsWith('        ') ? line.slice(8) 
                : line.startsWith('    ') ? line.slice(4) 
                : line
        )
        .join('\n');
}

function test(clase, funcion){

    // Crear las variables
    let parametros = funcion.parametros.map(parametro => declararVariable(parametro.tipo, parametro.nombre));

    // Crear las llamadas
    let llamada = "";
    if(funcion.tipo === "void"){
        llamada = "assertDoesNotThrow(() -> ";
    }
    else if(PRIMITIVOS.includes(funcion.tipo)){
        let esperado = VALORES.primitivos[funcion.tipo];
        llamada = `assertEquals(${esperado}, `;
    }
    else{
        llamada = "assertNotNull(";
    }

    if(!funcion.privada) {
        llamada += `${clase.nombre}.${funcion.nombre}(${parametros.map(parametro => parametro.nombre).join(", ")}));`
    }
    else{
        llamada += `ReflectionTestUtils.invokeMethod(${clase.nombre}, "${funcion.nombre}", ${parametros.map(parametro => "\"" + parametro.nombre + "\"").join(", ")}));`
    }

    // Texto de la funcion
    return `
            void test01_${funcion.nombre}(){

                ${parametros.map(parametro => parametro.declaracion).join(`\n${tab(1)}`)}
                ${llamada}
            }
    `;
}

function mock(){

}

// Funciones compartidas

function declararVariable(tipo, nombre){

    let variable = {
        declaracion: "",
        nombre: "",
    };

    //PRIMITIVO: Comprueba si es primitiva
    if (tipo in VALORES.primitivos){
        variable.declaracion = `${tipo} ${nombre} = ${VALORES.primitivos[tipo]};`;
        variable.nombre = nombre;

        return variable; //Retorna la variable
    } 
    //LISTA: Comprueba si es una lista
    const TIPO_LISTA = tipo.split('<')[0];
    if (TIPO_LISTA in VALORES.listas) {
        let generico = tipo.match(/<(.*)>/)[1].split(',');

        //Listas con un geneico
        if (generico.length == 1) {
            let elemento = declararVariable(generico, 'elemento_' + nombre);

            variable.declaracion = `
                ${tipo} ${nombre} = ${VALORES.listas[TIPO_LISTA].valor.replace('<>', '<' + generico + '>')};
                ${elemento.declaracion}
                ${nombre}.${VALORES.listas[TIPO_LISTA].add}(${elemento.nombre});`;
        }
        //Listas con dos genericos
        else if (generico.length == 2) {
            let index = declararVariable(generico[0].trim(), 'index_' + nombre);
            let elemento = declararVariable(generico[1].trim(), 'elemento_' + nombre);

            variable.declaracion = `
                ${tipo} ${nombre} = ${VALORES.listas[TIPO_LISTA].valor.replace('<>', '<' + generico[0] + ', ' + generico[1] + '>')};
                ${index.declaracion}
                ${elemento.declaracion}
                ${nombre}.${VALORES.listas[TIPO_LISTA].add}(${index.nombre}, ${elemento.nombre});`;
        }

        variable.nombre = nombre;

        return variable; //Retorna la variable
    }

    //ARRAY: Comprueba si es un array
    if (tipo.endsWith('[]')) {
        let generico = tipo.replace('[]', '');
        let elemento = declararVariable(generico, 'elemento_' + nombre);

        variable.declaracion = `
            ${tipo} ${nombre} = new ${generico}[1];
            ${elemento.declaracion}
            ${nombre}[0] = ${elemento.nombre};
        `;
        variable.nombre = nombre;

        return variable; //Retorna la variable
    }

    //OBJETO: Comprueba si es un objeto
    variable.declaracion = `${tipo} ${nombre} = new ${tipo}();`;
    variable.nombre = nombre;

    return variable; //Retorna la variable
}

// Otras funciones

function tab(cant){
    return '    '.repeat(cant);
}