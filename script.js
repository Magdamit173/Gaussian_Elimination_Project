document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('matrixInputContainer');
    const sizeInput = document.getElementById('matrixSize');
    const stepsLog = document.getElementById('stepsLog');
    const finalResult = document.getElementById('finalResult');

    // Generate Matrix Inputs
    function generateMatrix() {
        const n = parseInt(sizeInput.value);
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${n}, 70px) 30px 70px`;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                container.innerHTML += `<input type="number" class="matrix-input a-val" data-row="${i}" data-col="${j}" value="0">`;
            }
            container.innerHTML += `<span style="text-align:center">=</span>`;
            container.innerHTML += `<input type="number" class="matrix-input b-val" data-row="${i}" value="0">`;
        }
    }

    // Gaussian Logic Class
    class GaussSolver {
        constructor(A, B) {
            this.A = A;
            this.B = B;
            this.n = A.length;
            this.C = Array.from({length: this.n}, (_, i) => `X${i+1}`);
        }

        solve() {
            stepsLog.innerHTML = '';
            for (let i = 0; i < this.n; i++) {
                this.pivoting(i);
                this.eliminate(i);
                this.logStep(i);
            }
            return this.getResults();
        }

        pivoting(step) {
            let maxVal = -1;
            let row = step, col = step;

            for (let r = step; r < this.n; r++) {
                for (let c = step; c < this.n; c++) {
                    if (Math.abs(this.A[r][c]) > maxVal) {
                        maxVal = Math.abs(this.A[r][c]);
                        row = r; col = c;
                    }
                }
            }

            // Swap Rows
            [this.A[step], this.A[row]] = [this.A[row], this.A[step]];
            [this.B[step], this.B[row]] = [this.B[row], this.B[step]];

            // Swap Columns
            for (let r = 0; r < this.n; r++) {
                [this.A[r][step], this.A[r][col]] = [this.A[r][col], this.A[r][step]];
            }
            [this.C[step], this.C[col]] = [this.C[col], this.C[step]];
        }

        eliminate(step) {
            let pivot = this.A[step][step];
            for (let c = step; c < this.n; c++) this.A[step][c] /= pivot;
            this.B[step] /= pivot;

            for (let r = 0; r < this.n; r++) {
                if (r !== step) {
                    let factor = this.A[r][step];
                    for (let c = step; c < this.n; c++) {
                        this.A[r][c] -= factor * this.A[step][c];
                    }
                    this.B[r] -= factor * this.B[step];
                }
            }
        }

        logStep(step) {
            let html = `<div class="step-block"><strong>Step ${step + 1}:</strong><br>`;
            this.A.forEach((row, i) => {
                html += `[ ${row.map(v => v.toFixed(2)).join(' , ')} ] | [ ${this.B[i].toFixed(2)} ]<br>`;
            });
            html += `Current Variable Order: ${this.C.join(', ')}</div>`;
            stepsLog.innerHTML += html;
        }

        getResults() {
            return this.C.map((name, i) => `${name} = ${this.B[i].toFixed(4)}`);
        }
    }

    document.getElementById('solveBtn').onclick = () => {
        const n = parseInt(sizeInput.value);
        let A = Array.from({length: n}, () => Array(n).fill(0));
        let B = Array(n).fill(0);

        document.querySelectorAll('.a-val').forEach(el => {
            A[el.dataset.row][el.dataset.col] = parseFloat(el.value) || 0;
        });
        document.querySelectorAll('.b-val').forEach(el => {
            B[el.dataset.row] = parseFloat(el.value) || 0;
        });

        const solver = new GaussSolver(A, B);
        const results = solver.solve();
        finalResult.innerHTML = "FINAL RESULTS:<br>" + results.join('<br>');
    };

    document.getElementById('generateBtn').onclick = generateMatrix;
    document.getElementById('resetBtn').onclick = () => { generateMatrix(); stepsLog.innerHTML = ''; finalResult.innerHTML = ''; };

    generateMatrix();
});