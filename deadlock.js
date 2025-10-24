const generateBtn = document.getElementById('generateMatricesBtn');
const resetBtn = document.getElementById('resetDeadlockBtn');
const matricesDiv = document.getElementById('matricesInput');
const outputDiv = document.getElementById('deadlockOutput');
// Reset button works anytime, even before generating matrices
resetBtn.addEventListener('click', () => {
    // Reset process/resource count inputs
    document.getElementById('processCount').value = 0;
    document.getElementById('resourceCount').value = 0;

    // Clear dynamically created matrices
    matricesDiv.innerHTML = '';

    // Clear output
    outputDiv.innerHTML = '';

    // ✅ Clear RAG canvas if it exists
    const canvas = document.getElementById('ragCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});


generateBtn.addEventListener('click', () => {
  const processCount = parseInt(document.getElementById('processCount').value);
  const resourceCount = parseInt(document.getElementById('resourceCount').value);

  if (processCount <= 0 || resourceCount <= 0) {
    alert("Enter positive number of processes and resources!");
    return;
  }

  matricesDiv.innerHTML = '';

  // Allocation Table
  let allocationHTML = `<h3>Allocation Matrix</h3><table border="1" style="margin:auto;"><tr><th>Process</th>`;
  for (let r = 0; r < resourceCount; r++) allocationHTML += `<th>R${r}</th>`;
  allocationHTML += `</tr>`;
  for (let p = 0; p < processCount; p++) {
    allocationHTML += `<tr><td>P${p}</td>`;
    for (let r = 0; r < resourceCount; r++)
      allocationHTML += `<td><input type="number" min="0" value="0" class="allocInput" data-p="${p}" data-r="${r}"></td>`;
    allocationHTML += `</tr>`;
  }
  allocationHTML += `</table>`;

  // Max Table
  let maxHTML = `<h3>Max Matrix</h3><table border="1" style="margin:auto;"><tr><th>Process</th>`;
  for (let r = 0; r < resourceCount; r++) maxHTML += `<th>R${r}</th>`;
  maxHTML += `</tr>`;
  for (let p = 0; p < processCount; p++) {
    maxHTML += `<tr><td>P${p}</td>`;
    for (let r = 0; r < resourceCount; r++)
      maxHTML += `<td><input type="number" min="0" value="0" class="maxInput" data-p="${p}" data-r="${r}"></td>`;
    maxHTML += `</tr>`;
  }
  maxHTML += `</table>`;
// Create a container for Need Matrix
let needDiv = document.createElement('div');
needDiv.id = 'needMatrixContainer';
needDiv.style.marginTop = '20px';


function updateNeedMatrix() {
  const allocInputs = document.querySelectorAll('.allocInput');
  const maxInputs = document.querySelectorAll('.maxInput');

  const processCount = Math.max(...Array.from(allocInputs).map(i => parseInt(i.dataset.p))) + 1;
  const resourceCount = Math.max(...Array.from(allocInputs).map(i => parseInt(i.dataset.r))) + 1;

  let Need = Array.from({length: processCount}, () => Array(resourceCount).fill(0));

  for (let p = 0; p < processCount; p++) {
    for (let r = 0; r < resourceCount; r++) {
      const alloc = parseInt(document.querySelector(`.allocInput[data-p="${p}"][data-r="${r}"]`).value) || 0;
      const max = parseInt(document.querySelector(`.maxInput[data-p="${p}"][data-r="${r}"]`).value) || 0;
      Need[p][r] = Math.max(0, max - alloc);
    }
  }

  // Display Need matrix
  let needHTML = `<h3>Need Matrix</h3><table border="1" style="margin:auto;"><tr><th>Process</th>`;
  for (let r = 0; r < resourceCount; r++) needHTML += `<th>R${r}</th>`;
  needHTML += `</tr>`;
  for (let p = 0; p < processCount; p++) {
    needHTML += `<tr><td>P${p}</td>`;
    for (let r = 0; r < resourceCount; r++) needHTML += `<td>${Need[p][r]}</td>`;
    needHTML += `</tr>`;
  }
  needHTML += `</table>`;
  needDiv.innerHTML = needHTML;
}

// Update Need matrix whenever user changes Allocation or Max inputs
document.addEventListener('input', e => {
  if (e.target.classList.contains('allocInput') || e.target.classList.contains('maxInput')) {
    updateNeedMatrix();
  }
});

// Initial Need matrix after generating tables
//updateNeedMatrix();


  // Available Resources
  let availHTML = `<h3>Available Resources</h3>`;
  for (let r = 0; r < resourceCount; r++)
    availHTML += `R${r}: <input type="number" min="0" value="0" class="availInput" data-r="${r}" style="width:50px; margin:5px;">`;

 matricesDiv.innerHTML = allocationHTML + maxHTML + availHTML;

// ✅ Add Need Matrix below Available Resources
matricesDiv.appendChild(needDiv);
updateNeedMatrix(); // show Need Matrix initially

// ✅ Now add Check Deadlock button AFTER Need Matrix
let checkBtnDiv = document.createElement('div');
checkBtnDiv.style.marginTop = '10px';
checkBtnDiv.innerHTML = `<button class="btn" id="checkDeadlockBtn">Check for Deadlock</button>`;
matricesDiv.appendChild(checkBtnDiv);



  document.getElementById('checkDeadlockBtn').addEventListener('click', checkDeadlock);
// Draw Resource Allocation Graph button
let drawGraphBtnDiv = document.createElement('div');
drawGraphBtnDiv.style.marginTop = '10px';
drawGraphBtnDiv.innerHTML = `<button class="btn" id="drawGraphBtn">Draw Resource Allocation Graph</button>`;
matricesDiv.appendChild(drawGraphBtnDiv);

document.getElementById('drawGraphBtn').addEventListener('click', drawRAG);


// Reset all inputs and output
//resetBtn.addEventListener('click', () => {
//document.getElementById('processCount').value = 0;
//document.getElementById('resourceCount').value = 0;
//matricesDiv.innerHTML = '';
//outputDiv.innerHTML = '';
//});
// After building matricesDiv.innerHTML
// Add Reset Table button dynamically
let resetTableBtn = document.createElement('button');
resetTableBtn.textContent = "Reset Table";
resetTableBtn.className = "btn";
resetTableBtn.style.marginTop = "10px";
matricesDiv.appendChild(resetTableBtn);

// Reset table inputs and output
resetTableBtn.addEventListener('click', () => {
  // Reset all table inputs
  document.querySelectorAll('.allocInput').forEach(input => input.value = 0);
  document.querySelectorAll('.maxInput').forEach(input => input.value = 0);
  document.querySelectorAll('.availInput').forEach(input => input.value = 0);

  // Update Need matrix
  updateNeedMatrix();

  // Clear output
  outputDiv.innerHTML = '';

  // ✅ Clear RAG canvas instead of removing container
  const canvas = document.getElementById('ragCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});


});

function checkDeadlock() {
  const allocInputs = document.querySelectorAll('.allocInput');
  const maxInputs = document.querySelectorAll('.maxInput');
  const availInputs = document.querySelectorAll('.availInput');

  const processCount = Math.max(...Array.from(allocInputs).map(i => parseInt(i.dataset.p))) + 1;
  const resourceCount = Math.max(...Array.from(allocInputs).map(i => parseInt(i.dataset.r))) + 1;

  // Build matrices
  let Allocation = Array.from({length: processCount}, () => Array(resourceCount).fill(0));
  let Max = Array.from({length: processCount}, () => Array(resourceCount).fill(0));
  let Need = Array.from({length: processCount}, () => Array(resourceCount).fill(0));
  let Available = Array.from({length: resourceCount}, (_, r) => parseInt(availInputs[r].value));

  allocInputs.forEach(input => {
    const p = parseInt(input.dataset.p);
    const r = parseInt(input.dataset.r);
    Allocation[p][r] = Math.max(0, parseInt(input.value)); // prevent negative
  });

  maxInputs.forEach(input => {
    const p = parseInt(input.dataset.p);
    const r = parseInt(input.dataset.r);
    Max[p][r] = Math.max(0, parseInt(input.value)); // prevent negative
    Need[p][r] = Max[p][r] - Allocation[p][r];
  });

  // Banker's Algorithm
  let Finish = Array(processCount).fill(false);
  let safeSeq = [];
  let changed = true;

  while (safeSeq.length < processCount && changed) {
    changed = false;
    for (let p = 0; p < processCount; p++) {
      if (!Finish[p] && Need[p].every((n, r) => n <= Available[r])) {
        for (let r = 0; r < resourceCount; r++) Available[r] += Allocation[p][r];
        Finish[p] = true;
        safeSeq.push('P' + p);
        changed = true;
      }
    }
  }

  if (safeSeq.length === processCount) {
    outputDiv.innerHTML = `✅ Safe state! Safe sequence: ${safeSeq.join(' → ')}`;
  } else {
    outputDiv.innerHTML = `❌ Unsafe state / Deadlock possible!`;
  }
}

function drawRAG() {
  const canvas = document.getElementById('ragCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const allocInputs = document.querySelectorAll('.allocInput');
  const availInputs = document.querySelectorAll('.availInput');
  const maxInputs = document.querySelectorAll('.maxInput');

  const processCount = Math.max(...Array.from(allocInputs).map(i => parseInt(i.dataset.p))) + 1;
  const resourceCount = Math.max(...Array.from(allocInputs).map(i => parseInt(i.dataset.r))) + 1;

  let Allocation = Array.from({length: processCount}, () => Array(resourceCount).fill(0));
  let Max = Array.from({length: processCount}, () => Array(resourceCount).fill(0));
  let Need = Array.from({length: processCount}, () => Array(resourceCount).fill(0));
  let Available = Array.from({length: resourceCount}, (_, r) => parseInt(availInputs[r].value));

  allocInputs.forEach(input => {
    const p = parseInt(input.dataset.p);
    const r = parseInt(input.dataset.r);
    Allocation[p][r] = Math.max(0, parseInt(input.value));
  });

  maxInputs.forEach(input => {
    const p = parseInt(input.dataset.p);
    const r = parseInt(input.dataset.r);
    Max[p][r] = Math.max(0, parseInt(input.value));
    Need[p][r] = Max[p][r] - Allocation[p][r];
  });

  // Draw Processes (circles)
  const procX = 150;
  const procYGap = canvas.height / (processCount + 1);
  const procRadius = 25;
  let processPositions = [];
  for (let p = 0; p < processCount; p++) {
    let y = (p + 1) * procYGap;
    processPositions.push({x: procX, y: y});
    ctx.beginPath();
    ctx.arc(procX, y, procRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#3498db';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('P' + p, procX - 10, y + 5);
  }

  // Draw Resources (rectangles)
  const resX = 600;
  const resYGap = canvas.height / (resourceCount + 1);
  const resWidth = 50;
  const resHeight = 30;
  let resourcePositions = [];
  for (let r = 0; r < resourceCount; r++) {
    let y = (r + 1) * resYGap;
    resourcePositions.push({x: resX, y: y});
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(resX - resWidth/2, y - resHeight/2, resWidth, resHeight);
    ctx.strokeRect(resX - resWidth/2, y - resHeight/2, resWidth, resHeight);
    ctx.fillStyle = '#fff';
    ctx.fillText('R' + r, resX - 10, y + 5);
  }

  // Draw Allocation Edges (R -> P)
  ctx.strokeStyle = '#27ae60';
  ctx.lineWidth = 2;
  for (let p = 0; p < processCount; p++) {
    for (let r = 0; r < resourceCount; r++) {
      if (Allocation[p][r] > 0) {
        let from = resourcePositions[r];
        let to = processPositions[p];
        ctx.beginPath();
        ctx.moveTo(from.x - resWidth/2, from.y);
        ctx.lineTo(to.x + procRadius, to.y);
        ctx.stroke();
        // Optional: label with number of allocated instances
        ctx.fillStyle = '#000';
        ctx.fillText(Allocation[p][r], (from.x + to.x)/2 - 5, (from.y + to.y)/2 - 5);
      }
    }
  }

  // Draw Request Edges (P -> R)
  ctx.strokeStyle = '#f1c40f';
  ctx.setLineDash([5, 5]); // dashed line
  for (let p = 0; p < processCount; p++) {
    for (let r = 0; r < resourceCount; r++) {
      if (Need[p][r] > 0) {
        let from = processPositions[p];
        let to = resourcePositions[r];
        ctx.beginPath();
        ctx.moveTo(from.x + procRadius, from.y);
        ctx.lineTo(to.x - resWidth/2, to.y);
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.fillText(Need[p][r], (from.x + to.x)/2, (from.y + to.y)/2 - 5);
      }
    }
  }
  ctx.setLineDash([]); // reset dash
}

