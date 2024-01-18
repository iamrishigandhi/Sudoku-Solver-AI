class GASettings {

    constructor (sudokuSize) {
        
        this.fitnessFunction = SudokuFitness;
        this.individualSize = sudokuSize * sudokuSize;
        this.populationSize = 100;
        this.elitismRatio = 0.1;
        this.mutationRate = 0.2;
        this.randomRatio = 0.05;
        this.individualValues = [];
        for (let i = 1; i <= sudokuSize; i++) {
            this.individualValues.push(i);
        }
    }

    getRandomGeneValue = function () {
        return this.individualValues[Math.floor(Math.random() * this.individualValues.length)];
    }
}

function SumFitness(array) {
    let sum = 0;
    for (let i=0; i < array.length; i++) {
        sum += array[i];
    }
    return sum;
}

function CheckerFitness(array) {
    let sum = 0;
    let size = Math.sqrt(array.length);
    for (let i=0; i < size; i++) {
        for (let j=0; j<size; j++) {
            if ((i+j)%2 == 0) {
                if (array[i*size + j] == 1) { sum = sum + 1; }
            } else {
                if (array[i*size + j] == size) { sum = sum + 1; }
            }
        }
    }
    return sum;
}

function MatchRowFitness(array) {
    let sum = 0;
    let size = Math.sqrt(array.length);
    for (let i=0; i < array.length; i++) {
        let row = Math.floor(i / size) + 1;
        if (array[i] == row) {
            sum = sum + 1;
        }
    }
    return sum;
}

function MatchColFitness(array) {
    let sum = 0;
    let size = Math.sqrt(array.length);
    for (let i=0; i < array.length; i++) {
        let col = (i % size) + 1;
        if (array[i] == col) {
            sum = sum + 1;
        }
    }
    return sum;
}