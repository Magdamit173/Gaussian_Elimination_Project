document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('matrixInputContainer')
    const sizeInput = document.getElementById('matrixSize')
    const stepsLog = document.getElementById('stepsLog')
    const finalResult = document.getElementById('finalResult')

    function generateMatrix() {
        const n = parseInt(sizeInput.value)
        while (container.firstChild) container.removeChild(container.firstChild)
        
        container.style.display = 'grid'
        container.style.gridTemplateColumns = `repeat(${n}, 70px) 30px 70px`

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const input = document.createElement('input')
                input.type = 'number'
                input.className = 'matrix-input a-val'
                input.dataset.row = i
                input.dataset.col = j
                input.value = 0
                container.appendChild(input)
            }
            const eq = document.createElement('span')
            eq.textContent = '='
            eq.style.textAlign = 'center'
            container.appendChild(eq)

            const bInput = document.createElement('input')
            bInput.type = 'number'
            bInput.className = 'matrix-input b-val'
            bInput.dataset.row = i
            bInput.value = 0
            container.appendChild(bInput)
        }
    }

    class Gauss {
        logToUI(matrixA, matrixB, matrixC, title) {
            const block = document.createElement('div')
            block.className = 'step-block'
            block.style.whiteSpace = 'pre'
            block.style.marginBottom = '20px'

            const label = document.createElement('strong')
            label.textContent = `> ${title}\n`
            label.style.color = '#38bdf8'
            block.appendChild(label)

            const header = document.createElement('span')
            header.style.color = '#94a3b8'
            header.textContent = ' '.repeat(10) + matrixC.map(c => c.padStart(8)).join('  ') + '\n'
            block.appendChild(header)

            for (let i = 0; i < matrixA.length; i++) {
                const rowStr = matrixA[i].map(v => v.toFixed(4).padStart(8)).join('  ')
                const lineText = `|  ${rowStr}  |  =  ${matrixB[i].toFixed(4).padStart(8)}\n`
                block.appendChild(document.createTextNode(lineText))
            }
            stepsLog.appendChild(block)
        }

        get_ordinal(n) {
            const j = n % 10, k = n % 100;
            if (j == 1 && k != 11) return n + "st";
            if (j == 2 && k != 12) return n + "nd";
            if (j == 3 && k != 13) return n + "rd";
            return n + "th";
        }

        showError(msg) {
            const err = document.createElement('div')
            err.style.color = '#ef4444'
            err.style.fontWeight = 'bold'
            err.style.padding = '10px'
            err.style.border = '1px solid #ef4444'
            err.style.borderRadius = '8px'
            err.style.marginTop = '10px'
            err.textContent = `ERROR: ${msg}`
            finalResult.appendChild(err)
        }
    }

    const copyBtn = document.createElement('button')
    copyBtn.textContent = "Copy Terminal Log"
    copyBtn.style.margin = "10px 0"
    copyBtn.onclick = () => {
        const text = stepsLog.innerText
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = "Copied!"
            setTimeout(() => copyBtn.textContent = "Copy Terminal Log", 2000)
        })
    }
    document.querySelector('.output-section').insertBefore(copyBtn, stepsLog)

    document.getElementById('solveBtn').onclick = () => {
        while (stepsLog.firstChild) stepsLog.removeChild(stepsLog.firstChild)
        while (finalResult.firstChild) finalResult.removeChild(finalResult.firstChild)

        const n = parseInt(sizeInput.value)
        let A = Array.from({length: n}, () => Array(n).fill(0))
        let B = Array(n).fill(0)
        let C = Array.from({length: n}, (_, i) => `X${i+1}`)

        document.querySelectorAll('.a-val').forEach(el => A[el.dataset.row][el.dataset.col] = parseFloat(el.value) || 0)
        document.querySelectorAll('.b-val').forEach(el => B[el.dataset.row] = parseFloat(el.value) || 0)

        const gauss = new Gauss()

        for (let i = 0; i < n; i++) {
            const div = document.createElement('div')
            div.style.color = '#6366f1'
            div.style.margin = '25px 0 10px 0'
            div.style.fontWeight = 'bold'
            div.textContent = `------------------------ ${gauss.get_ordinal(i + 1)} Pivot ------------------------`
            stepsLog.appendChild(div)

            gauss.logToUI(A, B, C, "Display Initial")

            let maxVal = -1, rMax = i, cMax = i
            for (let r = i; r < n; r++) {
                for (let c = i; c < n; c++) {
                    if (Math.abs(A[r][c]) > maxVal) {
                        maxVal = Math.abs(A[r][c])
                        rMax = r
                        cMax = c
                    }
                }
            }

            // NaN/Singular Handler: If max value is essentially zero, stop.
            if (maxVal < 1e-12) {
                gauss.showError("The matrix is singular or has no unique solution (Pivot is 0).")
                return
            }

            // Swapping Rows
            let tempA = A[i]
            A[i] = A[rMax]
            A[rMax] = tempA
            let tempB = B[i]
            B[i] = B[rMax]
            B[rMax] = tempB
            gauss.logToUI(A, B, C, "After Row Swap")

            // Swapping Columns
            for (let r = 0; r < n; r++) {
                let tempCol = A[r][i]
                A[r][i] = A[r][cMax]
                A[r][cMax] = tempCol
            }
            let tempC = C[i]
            C[i] = C[cMax]
            C[cMax] = tempC
            gauss.logToUI(A, B, C, "After Column Swap")

            // Normalize
            const pivot = A[i][i]
            for (let c = i; c < n; c++) A[i][c] /= pivot
            B[i] /= pivot
            gauss.logToUI(A, B, C, "After Normalizing")

            // Zeroing
            for (let r = i + 1; r < n; r++) {
                const factor = A[r][i]
                for (let c = i; c < n; c++) A[r][c] -= factor * A[i][c]
                B[r] -= factor * B[i]
            }
            gauss.logToUI(A, B, C, "After Zeroing Below")
        }

        const x_vals = new Array(n).fill(0)
        for (let i = n - 1; i >= 0; i--) {
            let sum = 0
            for (let j = i + 1; j < n; j++) sum += A[i][j] * x_vals[j]
            
            // Final check for NaN during back substitution
            const denominator = A[i][i]
            if (Math.abs(denominator) < 1e-12) {
                gauss.showError("Division by zero encountered in back substitution.")
                return
            }
            x_vals[i] = (B[i] - sum) / denominator
        }

        const finalResults = C.map((name, idx) => ({ name, val: x_vals[idx] }))
                              .sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}))

        const resHeader = document.createElement('h3')
        resHeader.textContent = "FINAL RESULTS:"
        finalResult.appendChild(resHeader)

        finalResults.forEach(res => {
            const p = document.createElement('div')
            // If the value is NaN or Infinity, show as Undefined
            const displayVal = isFinite(res.val) ? res.val.toFixed(4) : "Undefined"
            p.textContent = `${res.name} = ${displayVal}`
            finalResult.appendChild(p)
        })
        
        stepsLog.scrollTop = stepsLog.scrollHeight
    }

    document.getElementById('generateBtn').onclick = generateMatrix
    document.getElementById('resetBtn').onclick = () => {
        while (stepsLog.firstChild) stepsLog.removeChild(stepsLog.firstChild)
        while (finalResult.firstChild) finalResult.removeChild(finalResult.firstChild)
        generateMatrix()
    }

    generateMatrix()
})