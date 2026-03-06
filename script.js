document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('matrixInputContainer');
    const sizeInput = document.getElementById('matrixSize');
    const stepsLog = document.getElementById('stepsLog');
    const finalResult = document.getElementById('finalResult');

    function generateMatrix() {
        const n = parseInt(sizeInput.value);
        container.replaceChildren();
        container.style.gridTemplateColumns = `repeat(${n}, 70px) 30px 70px`;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'matrix-input a-val';
                input.dataset.row = i; input.dataset.col = j;
                input.value = ""; // (Math.random() * 10).toFixed(0);
                container.appendChild(input);
            }
            const eq = document.createElement('span'); eq.textContent = '=';
            container.appendChild(eq);
            const bInput = document.createElement('input');
            bInput.type = 'number';
            bInput.className = 'matrix-input b-val';
            bInput.dataset.row = i; 
            bInput.value = ""; // (Math.random() * 10).toFixed(0);
            container.appendChild(bInput);
        }
    }

    class Gauss {
        logStep(matrixA, matrixB, matrixC, title, highlights = {}) {
            const block = document.createElement('div');
            block.className = 'step-block';
            
            const label = document.createElement('strong');
            label.textContent = `> ${title}\n`;
            label.style.color = '#38bdf8';
            block.appendChild(label);

            const headerStr = ' '.repeat(10) + matrixC.map(c => c.padStart(8)).join('  ') + '\n';
            const header = document.createElement('span');
            header.style.color = '#94a3b8';
            header.textContent = headerStr + '-'.repeat(headerStr.length) + '\n';
            block.appendChild(header);

            for (let i = 0; i < matrixA.length; i++) {
                const rowDiv = document.createElement('div');
                rowDiv.style.display = 'flex';
                
                if (highlights.rowOut === i) rowDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'; 
                if (highlights.rowIn === i) rowDiv.style.backgroundColor = 'rgba(34, 197, 94, 0.3)';  
                if (highlights.rowActive === i) rowDiv.style.backgroundColor = 'rgba(56, 189, 248, 0.2)';

                let rowText = `|  `;
                matrixA[i].forEach((val, j) => {
                    let valStr = val.toFixed(4).padStart(8);
                    if (highlights.pRow === i && highlights.pCol === j) {
                        rowText += `[${valStr}] `;
                    } else {
                        rowText += ` ${valStr}  `;
                    }
                });
                rowText += ` |  =  ${matrixB[i].toFixed(4).padStart(8)}`;
                
                if (rowText.includes('[')) {
                    rowDiv.style.color = '#fbbf24';
                    rowDiv.style.fontWeight = 'bold';
                }
                rowDiv.textContent = rowText;
                block.appendChild(rowDiv);
            }
            stepsLog.appendChild(block);
        }

        get_ordinal(n) {
            const j = n % 10, k = n % 100;
            return (j == 1 && k != 11) ? n + "st" : (j == 2 && k != 12) ? n + "nd" : (j == 3 && k != 13) ? n + "rd" : n + "th";
        }
    }

    document.getElementById('solveBtn').onclick = () => {
        stepsLog.replaceChildren();
        finalResult.replaceChildren();

        const n = parseInt(sizeInput.value);
        let A = Array.from({length: n}, () => Array(n).fill(0));
        let B = Array(n).fill(0);
        let C = Array.from({length: n}, (_, i) => `X${i+1}`);

        document.querySelectorAll('.a-val').forEach(el => A[el.dataset.row][el.dataset.col] = parseFloat(el.value) || 0);
        document.querySelectorAll('.b-val').forEach(el => B[el.dataset.row] = parseFloat(el.value) || 0);

        const gauss = new Gauss();
        let isSingular = false;

        for (let i = 0; i < n; i++) {
            const pivotHeader = document.createElement('div');
            pivotHeader.style.color = '#6366f1';
            pivotHeader.style.margin = '25px 0 10px 0';
            pivotHeader.style.fontWeight = 'bold';
            pivotHeader.textContent = `------------------------ ${gauss.get_ordinal(i + 1)} Pivot ------------------------`;
            stepsLog.appendChild(pivotHeader);

            // STEP 1: INITIAL STATE
            gauss.logStep(A, B, C, "Display Initial");

            // STEP 2: OBTAIN MAX
            let maxVal = -1, rMax = i, cMax = i;
            for (let r = i; r < n; r++) {
                for (let c = i; c < n; c++) {
                    if (Math.abs(A[r][c]) > maxVal) {
                        maxVal = Math.abs(A[r][c]); rMax = r; cMax = c;
                    }
                }
            }
            
            // --- SINGULARITY CHECK ---
            if (maxVal < 1e-12) {
                const errDiv = document.createElement('div');
                errDiv.style.color = '#ef4444';
                errDiv.style.fontWeight = 'bold';
                errDiv.style.margin = '10px 0';
                errDiv.textContent = `[!] ERROR: Matrix is singular at Pivot ${i+1}. Found max: ${maxVal.toFixed(15)}`;
                stepsLog.appendChild(errDiv);
                isSingular = true;
                break;
            }

            gauss.logStep(A, B, C, `Obtain Max: Found ${maxVal.toFixed(4)}`, {pRow: rMax, pCol: cMax});

            // STEP 3: SWAP ROW
            [A[i], A[rMax]] = [A[rMax], A[i]];
            [B[i], B[rMax]] = [B[rMax], B[i]];
            gauss.logStep(A, B, C, `After Row Swap (Row ${rMax+1} to ${i+1})`, {rowOut: i, rowIn: rMax, pRow: i, pCol: cMax});

            // STEP 4: SWAP COLUMN
            for (let r = 0; r < n; r++) {
                [A[r][i], A[r][cMax]] = [A[r][cMax], A[r][i]];
            }
            [C[i], C[cMax]] = [C[cMax], C[i]];
            gauss.logStep(A, B, C, `After Column Swap (Col ${cMax+1} to ${i+1})`, {pRow: i, pCol: i});

            // STEP 5: NORMALIZE
            const pivot = A[i][i];
            for (let c = i; c < n; c++) A[i][c] /= pivot;
            B[i] /= pivot;
            gauss.logStep(A, B, C, "After Normalizing", {rowActive: i});

            // STEP 6: ZERO BELOW
            for (let r = i + 1; r < n; r++) {
                const factor = A[r][i];
                for (let c = i; c < n; c++) A[r][c] -= factor * A[i][c];
                B[r] -= factor * B[i];
            }
            gauss.logStep(A, B, C, "After Zeroing Below");
        }

        if (!isSingular) {
            // BACK SUBSTITUTION
            const x_vals = new Array(n).fill(0);
            const subLog = document.createElement('div');
            subLog.className = 'step-block';
            subLog.innerHTML = `<strong style="color: #fbbf24">> Back Substitution:</strong><br>`;

            for (let i = n - 1; i >= 0; i--) {
                let sum = 0;
                let process = `${C[i]} = (${B[i].toFixed(4)}`;
                for (let j = i + 1; j < n; j++) {
                    sum += A[i][j] * x_vals[j];
                    process += ` - [${A[i][j].toFixed(4)} * ${x_vals[j].toFixed(4)}]`;
                }
                x_vals[i] = (B[i] - sum) / A[i][i];
                process += `) = <b>${x_vals[i].toFixed(4)}</b><br>`;
                subLog.innerHTML += process;
            }
            stepsLog.appendChild(subLog);

            // REORGANIZED
            const sortLog = document.createElement('div');
            sortLog.className = 'step-block';
            sortLog.innerHTML = `<strong style="color: #34d399">> Reorganized:</strong><br>`;
            const paired = C.map((name, idx) => ({ name, val: x_vals[idx], id: parseInt(name.slice(1)) }));
            paired.forEach(p => sortLog.innerHTML += `Sorted: ${p.name} = ${p.val.toFixed(4)}<br>`);
            paired.sort((a, b) => a.id - b.id);
            stepsLog.appendChild(sortLog);

            const resHeader = document.createElement('h3');
            resHeader.textContent = "FINAL SOLUTIONS:";
            finalResult.appendChild(resHeader);
            paired.forEach(res => {
                const div = document.createElement('div');
                div.textContent = `${res.name} = ${res.val.toFixed(4)}`;
                finalResult.appendChild(div);
            });
        } else {
            const finalErr = document.createElement('h3');
            finalErr.style.color = '#ef4444';
            finalErr.textContent = "EXECUTION STOPPED: Singular Matrix Found.";
            finalResult.appendChild(finalErr);
        }
        stepsLog.scrollTop = stepsLog.scrollHeight;
    };

    document.getElementById('generateBtn').onclick = generateMatrix;
    document.getElementById('resetBtn').onclick = () => {
        stepsLog.replaceChildren();
        finalResult.replaceChildren();
        generateMatrix();
    };
    generateMatrix();
});