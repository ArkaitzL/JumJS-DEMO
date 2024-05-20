import { dividirFun } from './dividir.js';
import { crearFun } from './crear.js';
import { util } from './util.js';

onload = () => {
    util();
    document.getElementById("crear").addEventListener("click", crear);
    console.log("INFO");
}

async function crear() {
    try {
        let datos = await dividirFun();
        console.log(datos);
        // let resultado = await crearFun(datos);
        // console.log(resultado);
        
    } catch (error) {
        console.error(error);
    }
}
