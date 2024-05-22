export const PRIMITIVOS = ["byte", "short", "int", "long", "float", "double", "boolean", "char", "String", "Integer", "Double", "Float", "Long", "Short", "Byte", "Boolean", "Character"];
export const VALORES = {
    primitivos: {
        "byte": "0",
        "short": "0",
        "int": "0",
        "long": "0L",
        "float": "0.0f",
        "double": "0.0d",
        "boolean": "false",
        "char": "'a'",
        "String": "\"Ejemplo\"",
        "Integer": "Integer.valueOf(0)",
        "Double": "Double.valueOf(0.0)",
        "Float": "Float.valueOf(0.0f)",
        "Long": "Long.valueOf(0L)",
        "Short": "Short.valueOf((short)0)",
        "Byte": "Byte.valueOf((byte)0)",
        "Boolean": "Boolean.valueOf(false)",
        "Character": "Character.valueOf('a')"
    },
    listas: {
        'List': {tipo: 'List<>', valor: 'new ArrayList<>()', add: 'add'},
        'HashMap': {tipo: 'HashMap<>', valor: 'new HashMap<>()', add: 'put'},
        'Set': {tipo: 'Set<>', valor: 'new HashSet<>()', add: 'add'},
        'Map': {tipo: 'Map<>', valor: 'new HashMap<>()', add: 'put'},
        'LinkedList': {tipo: 'LinkedList<>', valor: 'new LinkedList<>()', add: 'add'},
        'TreeMap': {tipo: 'TreeMap<>', valor: 'new TreeMap<>()', add: 'put'},
        'TreeSet': {tipo: 'TreeSet<>', valor: 'new TreeSet<>()', add: 'add'},
        'LinkedHashMap': {tipo: 'LinkedHashMap<>', valor: 'new LinkedHashMap<>()', add: 'put'},
        'LinkedHashSet': {tipo: 'LinkedHashSet<>', valor: 'new LinkedHashSet<>()', add: 'add'},
        'Vector': {tipo: 'Vector<>', valor: 'new Vector<>()', add: 'add'},
        'Stack': {tipo: 'Stack<>', valor: 'new Stack<>()', add: 'push'},
        'Queue': {tipo: 'Queue<>', valor: 'new LinkedList<>()', add: 'add'},
        'Deque': {tipo: 'Deque<>', valor: 'new ArrayDeque<>()', add: 'add'},
        'PriorityQueue': {tipo: 'PriorityQueue<>', valor: 'new PriorityQueue<>()', add: 'add'},
    }
}
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
        return this.split(/ (?![^(]*\)|[^<]*>)/g);
    }

    String.prototype.splitComma = function () {
        return this.split(/,(?![^<]*>)/g);
    }

    String.prototype.toName = function () {
        return this.charAt(0).toLowerCase() + this.slice(1);
    }
}

