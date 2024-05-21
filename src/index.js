import { dividirFun } from './dividir.js';
import { crearFun } from './crear.js';
import { util } from './util.js';

onload = () => {
    util();
    document.getElementById("crear").addEventListener("click", crear);
}

async function crear() {
    try {
        let datos = await dividirFun();
        console.log(datos);
        let data = await crearFun(datos);
        console.log(data.resultado);
        
    } catch (error) {
        console.error(error);
    }
}
