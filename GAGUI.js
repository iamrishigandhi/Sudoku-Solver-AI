class GAGUI extends GUI {

    constructor (container, mapText) {
                                                          
        // construct a GUI in the given container
        super(container);

		this.sudoku = new Sudoku(9);
		this.sqSize = 512 / this.sudoku.size;
		this.sudoku.randomize();
		this.settings = new GASettings(this.sudoku.size);
		this.coloring = "sudoku";
		
		this.setHTML();
		this.reset();
	}

	// reset the genetic algorithm and sudoku board
	reset() {
		
		// get the sudoku size from the slider on the page
		let sudokuSize = document.getElementById('sizeslider').value *  
						 document.getElementById('sizeslider').value;

		// set up the sudoku board based on the current size
		this.sudoku = new Sudoku(sudokuSize);
		this.sudoku.randomize();

		// adjust the gui element sizes based on the sudoku size
		this.sqSize = 512 / this.sudoku.size;
		this.fgFontSize = this.sqSize / 2;
		this.fg_ctx.font = this.fgFontSize + 'pt Arial';
                                                          
		// set up the settings for the GA
		this.settings = new GASettings(this.sudoku.size);
		this.setFitness();
		
		// set up the initial population
		this.generation = 0;
		this.population = [];
		for (let p = 0; p < this.settings.populationSize; p++) {
			let randomGene = [];
			for (let i = 0; i < this.settings.individualSize; i++) {
				randomGene[i] = this.settings.getRandomGeneValue();
			}
			this.population.push({ gene: randomGene, fitness: this.settings.fitnessFunction(randomGene) });
		}

		// set up the highchart object that will track fitness over time
		this.chart = Highcharts.chart('ChartContainer', {
			chart: { animation: false },
			title: { text: 'Genetic Algorithm Fitness Over Time' },
			yAxis: { title: { text: 'Fitness Value' } },
			xAxis: { title: { text: 'Generation' } },
			legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle' },
			series: [{ name: 'Max', data: [] }, { name: 'Avg', data: [] }, { name: 'Min', data: [] }]
		});
	}
                                                          
	update() {

		this.population = GAEvolve(this.population, this.settings);
		this.population.sort(function (a, b) {
			return b.fitness - a.fitness;
		});
		this.sudoku.setArray(this.population[0].gene);

		if (this.generation % 20 == 0 && this.chart.series.length > 0) {
			this.chart.series[0].addPoint([this.generation, this.population[0].fitness]);
			this.chart.series[2].addPoint([this.generation, this.population[this.population.length - 1].fitness]);

			let sum = 0;
			for (let i = 0; i < this.population.length; i++) {
				sum += this.population[i].fitness;
			}
			this.chart.series[1].addPoint([this.generation, sum / this.population.length]);
		}

		this.draw();
		this.generation++;
	}

	// draw the foreground, is called every 'frame'
	draw() {
		let t0 = performance.now();
		this.fg_ctx.clearRect(0, 0, this.bg.width, this.bg.height);

		for (let r = 0; r <= this.sudoku.size; r++) {
			for (let c = 0; c <= this.sudoku.size; c++) {

				if (this.coloring == "sudoku") {
					let conflicts = this.sudoku.numConflicts(r, c) + 1;
					let shade = Math.floor(255 / conflicts);
					this.fg_ctx.fillStyle = "rgb(255," + shade + "," + shade + ")";
				} else {
					let ratio = this.sudoku.get(r,c)/9;
					let shade = Math.floor((1-ratio)*255);
					this.fg_ctx.fillStyle = "rgb(255," + shade + "," + shade + ")";
				}
				this.fg_ctx.fillRect(c * this.sqSize, r * this.sqSize, this.sqSize, this.sqSize);
			}
		}

		// draw thin lines
		this.fg_ctx.fillStyle = "#000000";
		for (let r = 0; r <= this.sudoku.size; r++) {
			this.fg_ctx.beginPath();
			this.fg_ctx.lineWidth = ((r % this.sudoku.sqSize) == 0) ? 5 : 1;
			this.fg_ctx.moveTo(0, r * this.sqSize);
			this.fg_ctx.lineTo(this.fg.width, r * this.sqSize);
			this.fg_ctx.stroke();
		}

		for (let c = 0; c <= this.sudoku.size; c++) {
			this.fg_ctx.beginPath();
			this.fg_ctx.lineWidth = ((c % this.sudoku.sqSize) == 0) ? 5 : 1;
			this.fg_ctx.moveTo(c * this.sqSize, 0);
			this.fg_ctx.lineTo(c * this.sqSize, this.fg.height);
			this.fg_ctx.stroke();
		}

		for (let r = 0; r < this.sudoku.size; r++) {
			for (let c = 0; c < this.sudoku.size; c++) {
				let txt = this.sudoku.get(r, c);
				let tsize = this.fg_ctx.measureText(txt).width / 2;
				this.fg_ctx.fillText(this.sudoku.get(r, c), (c + 0.5) * this.sqSize - tsize, (r + 0.5) * this.sqSize + this.fgFontSize / 2);
			}
		}

		let t1 = performance.now();
		let ms = Math.round(t1 - t0);
	}
	
	setSudokuSize() {
		let sliderValue = document.getElementById('sizeslider').value;
		document.getElementById('sizevalue').innerHTML = sliderValue;
		this.reset();
	}

	setPopulationSize() {
		let sliderValue = document.getElementById('popslider').value;
		document.getElementById('popvalue').innerHTML = sliderValue;
		this.settings.populationSize = sliderValue;
	}
                                                          
	setMutationRate() {
		let sliderValue = document.getElementById('mutslider').value;
		document.getElementById('mutvalue').innerHTML = sliderValue;
		this.settings.mutationRate = sliderValue / 100;
	}

	setRandomGeneRate() {
		let sliderValue = document.getElementById('ranslider').value;
		document.getElementById('ranvalue').innerHTML = sliderValue;
		this.settings.randomRatio = sliderValue / 100;
		this.resizeSliders();
	}

	setEliteSurvivalRate() {
		let sliderValue = document.getElementById('eliteslider').value;
		document.getElementById('elitevalue').innerHTML = sliderValue;
		this.settings.elitismRatio = sliderValue / 100;
		this.resizeSliders();
	}
	
	// need to call this whenever we resize the elite or random slider
	resizeSliders() {
		let elite = document.getElementById('eliteslider');
		let random = document.getElementById('ranslider');
                                                          
		elite.max = 100 - random.value;
		random.max = 100 - elite.value;
	}

	// called whenever the fitness selection box is modified
	setFitness() {
		
		let fitness = document.getElementById('selectfitness').value;
		this.coloring = "default";

			 if (fitness == 'sudoku') 	{ this.settings.fitnessFunction = SudokuFitness; this.coloring = "sudoku"; } 
		else if (fitness == 'sum') 		{ this.settings.fitnessFunction = SumFitness; } 
		else if (fitness == 'sumneg') 	{ this.settings.fitnessFunction = SumNegFitness; } 
		else if (fitness == 'matchrow') { this.settings.fitnessFunction = MatchRowFitness; } 
		else if (fitness == 'matchcol') { this.settings.fitnessFunction = MatchColFitness; } 
		else if (fitness == 'checker') 	{ this.settings.fitnessFunction = CheckerFitness; } 
		else { console.log("Unknown Fitness Type: " + fitness); }
    }

	setHTML() {
		let top = 0, skip = 35, s=0, c1 = 0, c2 = 200, c3 = 325, tWidth = 200, cWidth = 100, cHeight = 25;
		this.createCanvas(this.sudoku.size * this.sqSize + 1, this.sudoku.size * this.sqSize + 1);
		this.chartDiv = this.create('div', 'ChartContainer', this.fg.width + 30, 0, this.fg.width * 4 / 3, this.fg.height);
        this.controlDiv = this.create('div', 'ControlDiv', 0, this.fg.height + 20, 500, 200);
		
		// Sudoku Size Selection
		this.addText(this.controlDiv, 'sizelabel', c1, top + s*skip, tWidth, cHeight, "Fitness Function:");
		this.addSelectBox(this.controlDiv, 'selectfitness', c2, top + 0*skip, 100, 25, function() { this.gui.reset();}, 
            [['sudoku', 'Sudoku'], ['sum', 'Sum Values'], ['matchrow', 'Match Row'], ['matchcol', 'Match Col'], ['checker', 'Checker']]);
		this.addSlider(this.controlDiv, 'sizeslider', c3, top + s*skip, cWidth, cHeight-10, Math.floor(Math.sqrt(this.sudoku.size)), 1, 6, function() { this.gui.setSudokuSize(); });
		this.addText(this.controlDiv, 'sizevalue', c3+150, top + s++*skip, cWidth, cHeight, document.getElementById("sizeslider").value);
		
		// Population Size Selection
		this.addText(this.controlDiv, 'poplabel', c1, top + s*skip, tWidth, cHeight, "Population Size:");
		this.addSlider(this.controlDiv, 'popslider', c2, top + s*skip, cWidth, cHeight-10, 200, 20, 1000, function() { this.gui.setPopulationSize(); });
		this.addText(this.controlDiv, 'popvalue', c3, top + s++*skip, cWidth, cHeight, document.getElementById("popslider").value);

		// Mutation Percentage Selection
		this.addText(this.controlDiv, 'mutlabel', c1, top + s*skip, tWidth, cHeight, "% Individuals Mutated :");
		this.addSlider(this.controlDiv, 'mutslider', c2, top + s*skip, cWidth, cHeight-10, 20, 0, 100, function() { this.gui.setMutationRate(); });
		this.addText(this.controlDiv, 'mutvalue', c3, top + s++*skip, cWidth, cHeight, document.getElementById("mutslider").value);
                                                          
		// Random Gene Insertion Selection
		this.addText(this.controlDiv, 'ranlabel', c1, top + s*skip, tWidth, cHeight, "% Random Genes Inserted :");
		this.addSlider(this.controlDiv, 'ranslider', c2, top + s*skip, cWidth, cHeight-10, 5, 0, 100, function() { this.gui.setRandomGeneRate(); });
		this.addText(this.controlDiv, 'ranvalue', c3, top + s++*skip, cWidth, cHeight, document.getElementById("ranslider").value);

		// Elite Gene Survival Selection
		this.addText(this.controlDiv, 'elitelabel', c1, top + s*skip, tWidth, cHeight, "% Elite Genes Survive :");
		this.addSlider(this.controlDiv, 'eliteslider', c2, top + s*skip, cWidth, cHeight-10, 10, 0, 100, function() { this.gui.setEliteSurvivalRate(); });
		this.addText(this.controlDiv, 'elitevalue', c3, top + s++*skip, cWidth, cHeight, document.getElementById("eliteslider").value);
	}

}