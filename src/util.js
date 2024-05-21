export const PRIMITIVOS = ["byte", "short", "int", "long", "float", "double", "boolean", "char", "String", "Integer", "Double", "Float", "Long", "Short", "Byte", "Boolean", "Character"];

export function util() {
    String.prototype.findIndex = function(caracter) {
        let indices = [];
        for(let i = 0; i < this.length; i++) {
            if (this.charAt(i) === caracter) {
                indices.push(i);
            }
        }
        return indices;
    }

    String.prototype.findBlocks = function (comenzar = 0) {
        const TEXTO = this;

        let inicio = TEXTO.indexOf('{', comenzar);
        let fin = -1;

        let contador = 1;

        if (inicio === -1) return null; 
    
        for (let i = inicio + 1; i < TEXTO.length; i++) {
            if (TEXTO.charAt(i) === '}') {
                contador--;

                if (contador === 0) {
                    fin = i;
                    break;
                }
            }
            else if (TEXTO.charAt(i) === '{') {
                contador++;
            }
        }
    
        if (fin === -1) return null; 

        return { 
            inicio: inicio,
            fin: fin 
        };
    }

    String.prototype.cleanText = function () {
        return this
            .trim()
            // .replace(/\n/g, '')
            // .replace(/\t/g, '');
    }

    String.prototype.removeSemicolon = function () {
        return this.replace(/;/g, "")
    }

    String.prototype.splitSpace = function () {
        // return this.split(/ (?![^<]*>)/g);
        return this.split(/ (?![^(]*\)|[^<]*>)/g);
    }
}

