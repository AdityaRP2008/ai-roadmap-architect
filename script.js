let currentNodes = [
  {
    id: 1,
    phase: "Phase 1: Foundation",
    duration: "2 Weeks",
    title: "Core Fundamentals",
    summary: "Essential syntax, semantic elements, and modern layout foundations.",
    overview: "Grasp foundational concepts before advancing to real-world architectures.",
    topics: ["Syntax & Rules", "Structure & Tags", "Semantic Standards"],
    project: "Build a responsive semantic personal portfolio page.",
    resources: ["Official Documentation", "MDN Web Docs"],
    completed: false
  }
];

const roadmapContainer = document.getElementById("roadmap-container");
const searchForm = document.getElementById("search-form");
const promptInput = document.getElementById("prompt-input");
const depthSelect = document.getElementById("depth-select");
const modelSelect = document.getElementById("model-select");
const submitBtn = document.getElementById("submit-btn");
const headingEl = document.getElementById("roadmap-title");
const subtitleEl = document.getElementById("roadmap-subtitle");
const progressText = document.getElementById("progress-text");
const activeModelDisplay = document.getElementById("active-model-display");

function renderCurriculum(nodes) {
  if (!roadmapContainer) return;
  roadmapContainer.innerHTML = "";

  nodes.forEach((node, index) => {
    const card = document.createElement("div");
    card.className = `node-card ${node.completed ? "completed" : ""}`;
    card.innerHTML = `
      <div class="node-header">
        <span class="node-badge">${node.phase || `Milestone 0${index + 1}`}</span>
        <span class="node-duration">${node.duration || "Self-Paced"}</span>
      </div>
      <h3 class="node-title">${node.title}</h3>
      <p class="node-summary">${node.summary || node.overview || ""}</p>
      
      <div class="topics-list">
        <strong>Key Concepts:</strong>
        <ul>
          ${(node.topics || []).map(t => `<li>${t}</li>`).join("")}
        </ul>
      </div>

      ${node.project ? `
        <div class="node-project">
          <strong>Project:</strong> ${node.project}
        </div>
      ` : ""}

      ${node.resources && node.resources.length ? `
        <div class="node-resources">
          <strong>Resources:</strong>
          <ul>
            ${node.resources.map(r => `<li>${r}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    `;
    roadmapContainer.appendChild(card);
  });

  updateProgress();
}

function updateProgress() {
  if (!progressText) return;
  const completed = currentNodes.filter(n => n.completed).length;
  const total = currentNodes.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  progressText.innerText = `${percent}% Completed (${completed}/${total} Modules)`;
}

// Initial render
renderCurriculum(currentNodes);

// Form submission
if (searchForm) {
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const topic = promptInput.value.trim();
    if (!topic) return;

    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector(".btn-text") || submitBtn;
    const oldText = btnText.innerText;
    btnText.innerText = "Synthesizing...";

    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          depth: depthSelect ? depthSelect.value : "Standard"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (headingEl && data.title) headingEl.innerText = data.title;
      if (subtitleEl && data.subtitle) subtitleEl.innerText = data.subtitle;
      if (activeModelDisplay) activeModelDisplay.innerText = "Gemini 2.5 Flash // Active Path Live";

      currentNodes = data.nodes || [];
      renderCurriculum(currentNodes);
      promptInput.value = "";
    } catch (err) {
      console.error("Roadmap generation error:", err);
      alert(`Generation Error: ${err.message}`);
    } finally {
      submitBtn.disabled = false;
      btnText.innerText = oldText;
    }
  });
}
