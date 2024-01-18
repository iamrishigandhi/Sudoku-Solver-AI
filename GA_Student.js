function GAEvolve(population, settings) {

    let nextPopulation = [];
    population.sort((x, y) => y.fitness - x.fitness);

    for (let i = 0; i < settings.elitismRatio * settings.populationSize; i++) {
        nextPopulation.push(population[i]);
    }

    for (let i = 0; i < settings.populationSize * settings.randomRatio; i++) {
        let geneVariable = [];
        for (let j = 0; j < settings.individualSize; j++) {
            geneVariable.push(settings.getRandomGeneValue());
        }
        nextPopulation.push({ gene: geneVariable, fitness: settings.fitnessFunction(geneVariable) });
    }

    while (nextPopulation.length < settings.populationSize) {

        let fitnessSum = 0;
        for (let i = 0; i < population.length; i++) {
            fitnessSum += population[i].fitness;
        }

        let parent1 = RouletteWheelSelection(population, fitnessSum);
        let parent2 = RouletteWheelSelection(population, fitnessSum);
        let child1 = CrossOver(parent1, parent2, settings);
        let child2 = CrossOver(parent2, parent1, settings);
        MutateIndividual(child1, settings);
        MutateIndividual(child2, settings);

        child1.fitness = settings.fitnessFunction(child1.gene);    // update the values of fitness for child1 and child2
        child2.fitness = settings.fitnessFunction(child2.gene);

        if (nextPopulation.length < settings.populationSize) {
            nextPopulation.push(child1);

            if (nextPopulation.length < settings.populationSize) {
                nextPopulation.push(child2);
            }
        }
    }

    return nextPopulation;
}

function RouletteWheelSelection(population, fitnessSum) {
    let pick = Math.random() * fitnessSum;
    let current = 0;
    let selectedIndex = 0;

    for (let i = 0; i < population.length; i++) {
        current += population[i].fitness;

        if (current > pick) {
            selectedIndex = i;
            break;
        }
    }
    return population[selectedIndex];
}

function CrossOver(parent1, parent2, settings) {
    let crossoverPoint = Math.floor(parent1.gene.length / 2); // cut at the middle or left of the middle for odd length parent
    let childGene = [];

    for (let i = 0; i < crossoverPoint; i++) {
        childGene.push(parent1.gene[i]);
    }

    for (let i = crossoverPoint; i < parent2.gene.length; i++) {
        childGene.push(parent2.gene[i]);
    }

    return { gene: childGene, fitness: settings.fitnessFunction(childGene) };
}

function MutateIndividual(individual, settings) {
    if (Math.random() < settings.mutationRate) {
        let randomIndex = Math.floor(Math.random() * settings.individualSize);
        individual.gene[randomIndex] = settings.getRandomGeneValue();
    }
}

// almost the same logic used as firstly implemented by Dave, just changed the three parts into
// functions of their own and added in calls from those functions into the main sudokufitness function.
// more functions improve speed in code so I did that as a method of improving it

function SudokuFitness(array) {
    let s = new Sudoku(9);
    let size = Math.round(Math.sqrt(array.length));
    s.setArray(array);
    let fitness = 0;

    // add unique values in each row, column, and square
    for (let i = 0; i < size; i++) {
        fitness += valsInRow(s, i);
        fitness += valsInColumn(s, i);
        fitness += valsInSquare(s, i);
    }

    return fitness;
}

// function to add unique values in row
function valsInRow(sudoku, row) {
    let vals = new Set();
    for (let col = 0; col < sudoku.size; col++) {
        vals.add(sudoku.get(row, col));
    }
    return vals.size;
}

// function to add unique values in column
function valsInColumn(sudoku, col) {
    let vals = new Set();
    for (let row = 0; row < sudoku.size; row++) {
        vals.add(sudoku.get(row, col));
    }
    return vals.size;
}

// function to add unique values in square
function valsInSquare(sudoku, square) {
    let sqsize = Math.round(Math.sqrt(sudoku.size));
    let vals = new Set();

    for (let r = 0; r < sqsize; r++) {
        for (let c = 0; c < sqsize; c++) {
            vals.add(sudoku.get(square * sqsize + r, square * sqsize + c));
        }
    }
    return vals.size;
}