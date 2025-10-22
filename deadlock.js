const generateBtn = document.getElementById('generateMatricesBtn');
const resetBtn = document.getElementById('resetDeadlockBtn');
const matricesDiv = document.getElementById('matricesInput');
const outputDiv = document.getElementById('deadlockOutput');

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


// Reset all inputs and output
resetBtn.addEventListener('click', () => {
  document.getElementById('processCount').value = 0;
  document.getElementById('resourceCount').value = 0;
  matricesDiv.innerHTML = '';
  outputDiv.innerHTML = '';
});
// After building matricesDiv.innerHTML
// Add Reset Table button dynamically
let resetTableBtn = document.createElement('button');
resetTableBtn.textContent = "Reset Table";
resetTableBtn.className = "btn";
resetTableBtn.style.marginTop = "10px";
matricesDiv.appendChild(resetTableBtn);

// Reset table inputs and output
resetTableBtn.addEventListener('click', () => {
  document.querySelectorAll('.allocInput').forEach(input => input.value = 0);
  document.querySelectorAll('.maxInput').forEach(input => input.value = 0);
  document.querySelectorAll('.availInput').forEach(input => input.value = 0);
  updateNeedMatrix(); // ✅ this resets Need matrix
  outputDiv.innerHTML = '';
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

