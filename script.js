const defaultCurriculum = {
  domain: "Astrophysics & Cosmological Models",
  model: "Gemini 1.5 Pro",
  title: "Astrophysics & Stellar Mechanics",
  subtitle: "Theoretical and observational foundations mapping stellar evolution, relativity, and high-energy cosmology.",
  nodes: [
    {
      id: 1,
      phase: "Milestone 01",
      duration: "4-6 Weeks",
      title: "Radiative Processes & Stellar Atmospheres",
      summary: "Deconstruct blackbody radiation, opacity coefficients, and hydrostatic equilibrium inside stellar interiors.",
      overview: "Establishes thermodynamic baselines for energy generation and photon transport through dense stellar plasma.",
      topics: [
        "Hydrostatic Equilibrium & The Virial Theorem",
        "LTE (Local Thermodynamic Equilibrium) & Saha Ionization Equations",
        "Rosseland Mean Opacity & Radiative Transfer Gradients"
      ],
      project: "Simulate a polytropic stellar envelope using numerical integration in Python (Lane-Emden Equation solver).",
      resources: ["Carroll & Ostlie: Intro to Modern Astrophysics", "Rybicki & Lightman: Radiative Processes"],
      completed: false
    },
    {
      id: 2,
      phase: "Milestone 02",
      duration: "6-8 Weeks",
      title: "Nuclear Astrophysics & Stellar Nucleosynthesis",
      summary: "Trace proton-proton chains, CNO cycles, and late-stage alpha processes governing post-main-sequence evolution.",
      overview: "Examines cross-sections of thermonuclear reactions that yield heavy elements, supernova triggers, and degenerate cores.",
      topics: [
        "Gamow Peak & Quantum Tunneling in Fusion Cross-Sections",
        "Degenerate Electron Pressure & The Chandrasekhar Mass Limit",
        "Core-Collapse Mechanics & Type Ia Supernova Signatures"
      ],
      project: "Calculate mass-radius relations for non-relativistic and relativistic degenerate white dwarf equations of state.",
      resources: ["Clayton: Principles of Stellar Evolution", "MESA (Modules for Experiments in Stellar Astrophysics)"],
      completed: false
    },
    {
      id: 3,
      phase: "Milestone 03",
      duration: "8-12 Weeks",
      title: "General Relativity & Compact Object Geometries",
      summary: "Derive Schwarzschild and Kerr spacetime geometries around black holes and relativistic magnetars.",
      overview: "Bridges observational astrophysics with gravitational physics, analyzing gravitational lensing, accretion discs, and gravitational wave signals.",
      topics: [
        "Schwarzschild Metric & Geodesic Equations of Motion",
        "Frame Dragging & Ergosphere Dynamics in Kerr Spacetimes",
        "Gravitational Wave Chirp Mass & Quadrupole Formulas"
      ],
      project: "Ray-trace null geodesics around a Schwarzschild black hole to render gravitational lensing distortions.",
      resources: ["Misner, Thorne & Wheeler: Gravitation", "Shapiro & Teukolsky: Physics of Compact Objects"],
      completed: false
    }
  ]
};

let currentNodes = [...defaultCurriculum.nodes];

// DOM Elements
const roadmapContainer = document.getElementById("roadmap-container");
const roadmapForm = document.getElementById("roadmap-form");
const promptInput = document.getElementById("prompt-input");
const modelSelect = document.getElementById("model-select");
const depthSelect = document.getElementById("depth-select");
const activeModelDisplay = document.getElementById("active-model-display");
const progressBar = document.getElementById("progress-bar");
const completionText = document.getElementById("completion-text");
const headingEl = document.getElementById("roadmap-heading");
const subtitleEl = document.getElementById("roadmap-sub");
const submitBtn = document.getElementById("submit-btn");

// Modal Elements
const modal = document.getElementById("detail-modal");
const closeModal = document.getElementById("close-modal");
const modalPhase = document.getElementById("modal-phase");
const modalTitle = document.getElementById("modal-title");
const modalDuration = document.getElementById("modal-duration");
const modalOverview = document.getElementById("modal-overview");
const modalTopics = document.getElementById("modal-topics");
const modalProject = document.getElementById("modal-project");
const modalResources = document.getElementById("modal-resources");

// Render Timeline
function renderCurriculum(nodes) {
  roadmapContainer.innerHTML = "";

  nodes.forEach((node, index) => {
    const nodeEl = document.createElement("article");
    nodeEl.className = `milestone-node ${node.completed ? "completed" : ""}`;
    nodeEl.style.animationDelay = `${index * 0.1}s`;

    const topicList = node.topics
      .map(item => `<div class="competency-item">${item}</div>`)
      .join("");

    nodeEl.innerHTML = `
      <div class="node-anchor" data-id="${node.id}" title="Toggle Milestone Completion"></div>
      <div class="milestone-card">
        <div class="milestone-meta">
          <div class="meta-indicators">
            <span class="phase-pill">${node.phase}</span>
            <span class="duration-pill">${node.duration}</span>
          </div>
          <div class="card-actions">
            <button class="inspect-btn" data-id="${node.id}">Examine In-Depth ↗</button>
            <span class="status-badge">${node.completed ? "● Mastered" : "○ In Progress"}</span>
          </div>
        </div>
        <h2>${node.title}</h2>
        <p>${node.summary}</p>
        <div class="competency-list">
          ${topicList}
        </div>
      </div>
    `;

    roadmapContainer.appendChild(nodeEl);
  });

  updateProgress();
  attachEventListeners();
}

function updateProgress() {
  const completedCount = currentNodes.filter(n => n.completed).length;
  const percentage = Math.round((completedCount / currentNodes.length) * 100) || 0;
  
  progressBar.style.width = `${percentage}%`;
  completionText.innerText = `${percentage}% Completed (${completedCount}/${currentNodes.length} Modules)`;
}

function attachEventListeners() {
  // Completion Toggle
  document.querySelectorAll(".node-anchor").forEach(el => {
    el.addEventListener("click", () => {
      const id = parseInt(el.getAttribute("data-id"));
      const target = currentNodes.find(n => n.id === id);
      if (target) {
        target.completed = !target.completed;
        renderCurriculum(currentNodes);
      }
    });
  });

  // Modal Open
  document.querySelectorAll(".inspect-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      openNodeModal(id);
    });
  });
}

function openNodeModal(id) {
  const node = currentNodes.find(n => n.id === id);
  if (!node) return;

  modalPhase.innerText = node.phase;
  modalTitle.innerText = node.title;
  modalDuration.innerText = `Duration: ${node.duration}`;
  modalOverview.innerText = node.overview;
  
  modalTopics.innerHTML = node.topics.map(t => `<li>${t}</li>`).join("");
  modalProject.innerText = node.project;
  modalResources.innerHTML = node.resources.map(r => `<span class="source-tag">${r}</span>`).join("");

  modal.classList.add("active");
}

closeModal.addEventListener("click", () => modal.classList.remove("active"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("active");
});

// AI Model Selection Feedback
modelSelect.addEventListener("change", (e) => {
  const label = e.target.options[e.target.selectedIndex].text;
  activeModelDisplay.innerText = `${label.split("(")[0].trim()} // Synthesizer Configured`;
});

// Real Backend Synthesis Request
roadmapForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const rawSubject = promptInput.value.trim();
  if (!rawSubject) return;

  const selectedModelName = modelSelect.options[modelSelect.selectedIndex].text.split("(")[0].trim();
  const selectedDepth = depthSelect.value;

  // 1. Enter visual loading state
  submitBtn.disabled = true;
  submitBtn.querySelector(".btn-text").innerText = "Synthesizing...";
  activeModelDisplay.innerText = `${selectedModelName} // Synthesizing [${rawSubject}]...`;

  try {
    // 2. Fetch from backend API
    const response = await fetch("http://localhost:5000/api/generate-roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: rawSubject,
        depth: selectedDepth,
        model: modelSelect.value
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // 3. Update headers with backend AI response
    headingEl.innerText = data.title;
    subtitleEl.innerText = data.subtitle;
    activeModelDisplay.innerText = `${selectedModelName} // Active Path Live`;

    // 4. Update and render live nodes
    currentNodes = data.nodes;
    renderCurriculum(currentNodes);
    promptInput.value = "";

  } catch (err) {
    console.error("Roadmap generation error:", err);
    alert("Could not connect to backend server. Make sure your local server is running on http://localhost:5000.");
    activeModelDisplay.innerText = "System Idle // Generation Error";
  } finally {
    // 5. Reset button state
    submitBtn.disabled = false;
    submitBtn.querySelector(".btn-text").innerText = "Generate Blueprint";
  }
});

// Initial boot with default data
renderCurriculum(currentNodes);