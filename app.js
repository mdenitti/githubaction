/* ==========================================
   CI/CD Simulator - Application Logic & State
   ========================================== */

import { confetti } from './confetti.js';

// Educational Content Data for Stage Nodes
const STAGE_EDU_DATA = {
  source: {
    title: "Source Control & Push",
    badge: "Stage 1: Version Control",
    desc: "A developer commits code changes and pushes them to a remote repository like GitHub or GitLab. A webhook detects this push event and automatically triggers the CI/CD runner to start the pipeline.",
    tools: ["Git", "GitHub", "GitLab", "Bitbucket", "Webhooks"],
    why: "Ensures every code change is tracked, versioned, and automatically evaluated. This is the starting trigger for all automation."
  },
  install: {
    title: "Dependency Installation",
    badge: "Stage 2: Package Management",
    desc: "The pipeline runner boots up a clean container (usually in Docker) and pulls down all project dependencies. In Node.js, we use 'npm ci' (clean install) to ensure the packages match the lockfile exactly.",
    tools: ["npm", "Yarn", "pnpm", "NuGet", "pip", "Docker"],
    why: "Builds a reproducible environment. Using clean install guarantees that the packages running in the pipeline are identical to what works locally, preventing the 'works on my machine' bug."
  },
  lint: {
    title: "Code Linting & Building",
    badge: "Stage 3: Static Analysis & Compilation",
    desc: "The runner analyzes the code without executing it (Static Analysis) using Linters to verify syntax, style guide adherence, and potential code smells. The compiler then bundles the assets into a production-ready package.",
    tools: ["ESLint", "Prettier", "TypeScript", "Webpack", "Vite", "Babel"],
    why: "Catches syntax bugs, typos, and formatting inconsistencies early. Compiling ensures that the application builds successfully without errors before wasting resources running tests."
  },
  test: {
    title: "Unit Testing",
    badge: "Stage 4: Automated Testing",
    desc: "Unit tests are run to verify that individual components, functions, or modules perform exactly as expected under different inputs and configurations. Developers write mock tests for core application rules.",
    tools: ["Jest", "Mocha", "Vitest", "JUnit", "PyTest"],
    why: "Ensures that new code additions or modifications do not break existing business logic (regression prevention). High test coverage gives teams confidence to deploy quickly."
  },
  integration: {
    title: "End-to-End & Integration Testing",
    badge: "Stage 5: Systems Validation",
    desc: "Integration and E2E tests run the entire app in a simulated browser, testing complete user flows such as adding items to a cart, user login, and payments.",
    tools: ["Playwright", "Cypress", "Selenium", "Puppeteer"],
    why: "Validates that separate systems (frontend, database, authentication) communicate and function together seamlessly, guaranteeing that critical user paths remain unbroken."
  },
  security: {
    title: "SAST & Dependency Auditing",
    badge: "Stage 6: Security Scanning",
    desc: "Static Application Security Testing (SAST) and software composition scanners check the code and its third-party libraries for security vulnerabilities, exposed API credentials, or license compliance issues.",
    tools: ["Snyk", "SonarQube", "OWASP Dependency Check", "GitHub Advanced Security"],
    why: "Blocks security threats and data leaks before they hit production. It prevents supply-chain attacks by detecting outdated, vulnerable open-source packages."
  },
  staging: {
    title: "Staging Deployment",
    badge: "Stage 7: Release Pre-production",
    desc: "If all checks pass, the build package is deployed to a staging environment (an exact replica of production). This is where QA teams or product owners perform final acceptance checks.",
    tools: ["AWS Elastic Beanstalk", "Vercel", "Netlify", "Heroku", "Kubernetes"],
    why: "Provides a safe sandbox to preview changes in a live web environment before they are exposed to actual customers."
  },
  smoke: {
    title: "Smoke Testing & Verification",
    badge: "Stage 8: Health Checks",
    desc: "Automated smoke tests run quick, high-level health checks against the newly deployed staging environment. They hit critical endpoints to verify that the server returns valid headers and the main landing pages load without crashing.",
    tools: ["curl", "Postman", "k6", "Lighthouse"],
    why: "Verifies the deployment succeeded infrastructure-wise. If a server fails to start, it triggers an immediate automated rollback to keep the previous working version live."
  },
  deploy: {
    title: "Production Deployment",
    badge: "Stage 9: Continuous Delivery",
    desc: "The staging build is promoted to production. Using techniques like Blue-Green deployments or Canary releases, the runner switches traffic to the new version with zero downtime. If any alerts trigger, traffic immediately reverts to the previous version.",
    tools: ["GitHub Actions Deploy", "Argocd", "Kubernetes", "AWS ECS", "Cloudflare Pages"],
    why: "Delivers value to the customer automatically and continuously. Continuous deployment minimizes release cycle times and allows fast hot-fixes."
  }
};

// Simulation Configuration State
const STATE = {
  isRunning: false,
  speed: 1, // multiplier
  scenario: "happy",
  lastSuccessfulConfig: {
    name: "NEON MATRIX",
    theme: "cyan",
    discountPercent: 20,
    enableQuantumCheckout: true,
    welcomeMessage: "Welcome to the future of retail."
  },
  currentConfig: {
    name: "NEON MATRIX",
    theme: "cyan",
    discountPercent: 20,
    enableQuantumCheckout: true,
    welcomeMessage: "Welcome to the future of retail."
  },
  buildCount: 1
};

// Stages array in execution order
const STAGES = [
  "source",
  "install",
  "lint",
  "test",
  "integration",
  "security",
  "staging",
  "smoke",
  "deploy"
];

// Document Elements
const editorTabs = document.querySelectorAll('.tab-btn');
const tabCode = document.getElementById('tab-code');
const tabWorkflow = document.getElementById('tab-workflow');
const codeEditor = document.getElementById('code-editor');
const workflowEditor = document.getElementById('workflow-editor');
const selectScenario = document.getElementById('scenario-select');
const sliderSpeed = document.getElementById('speed-slider');
const valSpeed = document.getElementById('speed-val');
const btnTrigger = document.getElementById('btn-trigger');
const btnTour = document.getElementById('btn-tour');
const badgeStatus = document.getElementById('pipeline-status');
const consoleLogs = document.getElementById('console-logs');

// Stage nodes & paths
const stageNodes = {};
STAGES.forEach(stage => {
  stageNodes[stage] = document.getElementById(`node-${stage}`);
});

// Virtual phone elements
const virtualAppBar = document.getElementById('virtual-app-bar');
const virtualStoreName = document.getElementById('virtual-store-name');
const virtualDiscountBanner = document.getElementById('virtual-discount-banner');
const virtualDiscountAmount = document.getElementById('virtual-discount-amount');
const virtualWelcome = document.getElementById('virtual-welcome');
const virtualQuantumCheckout = document.getElementById('virtual-quantum-checkout');
const virtualDeployOverlay = document.getElementById('virtual-deploy-overlay');
const overlayMsg = document.getElementById('overlay-msg');

// Educational Popover
const eduPopover = document.getElementById('edu-popover');
const eduTitle = document.getElementById('edu-title');
const eduBadge = document.getElementById('edu-badge');
const eduDesc = document.getElementById('edu-desc');
const eduTools = document.getElementById('edu-tools');
const eduWhy = document.getElementById('edu-why');

// ==========================================
// A. Editor Tabs Toggle
// ==========================================
editorTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    editorTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const selectedTab = tab.getAttribute('data-tab');
    if (selectedTab === 'code') {
      tabCode.classList.add('active');
      tabWorkflow.classList.remove('active');
    } else {
      tabCode.classList.remove('active');
      tabWorkflow.classList.add('active');
    }
  });
});

// ==========================================
// B. Scenario & Speed Event Listeners
// ==========================================
selectScenario.addEventListener('change', (e) => {
  STATE.scenario = e.target.value;
  updateEditorDefaults();
});

sliderSpeed.addEventListener('input', (e) => {
  STATE.speed = parseFloat(e.target.value);
  valSpeed.textContent = STATE.speed + "x";
});

// Quick default filler for scenario testing
function updateEditorDefaults() {
  if (STATE.isRunning) return;
  
  if (STATE.scenario === "lint-fail") {
    codeEditor.value = `// Cyberpunk Gadget Store config
export const storeConfig = {
  name: "NEON MATRIX",
  theme: "cyan",
  discountPercent: 20
  enableQuantumCheckout: true // <-- MISSING COMMA (Lint/Syntax Error!)
  welcomeMessage: "Welcome to the future."
};`;
  } else if (STATE.scenario === "test-fail") {
    codeEditor.value = `// Cyberpunk Gadget Store config
export const storeConfig = {
  name: "NEON MATRIX",
  theme: "cyan",
  discountPercent: 150, // <-- Invalid! (Unit test requires 0 - 100)
  enableQuantumCheckout: true,
  welcomeMessage: "Testing invalid discount."
};`;
  } else if (STATE.scenario === "security-fail") {
    codeEditor.value = `// Cyberpunk Gadget Store config
export const storeConfig = {
  name: "NEON MATRIX",
  theme: "cyan",
  discountPercent: 10,
  enableQuantumCheckout: true,
  welcomeMessage: "Deploying production keys...",
  // CAUTION: EXPOSED API KEY (Security scanner failure!)
  AWS_SECRET_KEY: "AKIAIOSFODNN7EXAMPLE/secret-key-signature-12345"
};`;
  } else {
    // Reset to happy/rollback defaults
    codeEditor.value = `// Cyberpunk Gadget Store config
export const storeConfig = {
  name: "${STATE.lastSuccessfulConfig.name}",
  theme: "${STATE.lastSuccessfulConfig.theme}", // options: cyan, pink, amber, emerald
  discountPercent: ${STATE.lastSuccessfulConfig.discountPercent}, // Must be between 0 and 100
  enableQuantumCheckout: ${STATE.lastSuccessfulConfig.enableQuantumCheckout},
  welcomeMessage: "${STATE.lastSuccessfulConfig.welcomeMessage}"
};`;
  }
}

// ==========================================
// C. Interactive Stage Details Popover
// ==========================================
Object.keys(stageNodes).forEach(stageId => {
  const node = stageNodes[stageId];
  node.addEventListener('click', () => {
    const data = STAGE_EDU_DATA[stageId];
    if (!data) return;

    eduTitle.textContent = data.title;
    eduBadge.textContent = data.badge;
    eduDesc.textContent = data.desc;
    eduWhy.textContent = data.why;
    
    // Tools Tags
    eduTools.innerHTML = "";
    data.tools.forEach(tool => {
      const span = document.createElement('span');
      span.textContent = tool;
      eduTools.appendChild(span);
    });
    
    // Trigger Native Popover
    eduPopover.showPopover();
  });
});

// Close popover when clicking backdrop
eduPopover.addEventListener('toggle', (event) => {
  if (event.newState === 'open') {
    // Focus close button for accessibility
    eduPopover.querySelector('.popover-close-btn').focus();
  }
});

// ==========================================
// D. Live Log Terminal stream utilities
// ==========================================
function clearLogs() {
  consoleLogs.innerHTML = "";
}

function appendLog(text, type = "info") {
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  line.textContent = text;
  consoleLogs.appendChild(line);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Helper to wait based on speed
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms / STATE.speed));

// ==========================================
// E. Pipeline Execution Runner
// ==========================================
btnTrigger.addEventListener('click', async () => {
  if (STATE.isRunning) return;
  
  // Lock UI
  STATE.isRunning = true;
  btnTrigger.disabled = true;
  btnTrigger.classList.remove('pulse-effect');
  selectScenario.disabled = true;
  
  clearLogs();
  resetPipelineNodes();
  
  STATE.buildCount++;
  
  // Set Phone loading overlay
  virtualDeployOverlay.classList.add('active');
  overlayMsg.innerHTML = `<span class="spinner"></span> Deploying Build #${STATE.buildCount}...`;

  appendLog(`$ git commit -am "Trigger Build #${STATE.buildCount}"`, "command");
  appendLog(`[main ${Math.random().toString(16).substr(2, 7)}] Trigger Build #${STATE.buildCount}`, "info");
  appendLog(`$ git push origin main`, "command");
  appendLog(`Pushing changes to github.com/autodevops/gadget-store.git...`, "info");
  appendLog(`Webhook triggered: event 'push', branch 'main'. CI/CD Pipeline started.`, "success");

  // Parse code configuration
  const config = parseEditorCode();
  let pipelineSuccess = true;
  let failStage = null;
  
  // Determine if configuration validation triggers a failure regardless of dropdown
  let currentScenario = STATE.scenario;
  if (config.hasSyntaxError) {
    currentScenario = "lint-fail";
  } else if (config.discountPercent < 0 || config.discountPercent > 100 || isNaN(config.discountPercent)) {
    currentScenario = "test-fail";
  } else if (config.AWS_SECRET_KEY || config.codeRaw.includes("AWS_SECRET_KEY") || config.codeRaw.includes("AKIA")) {
    currentScenario = "security-fail";
  }
  
  // Mapping failures to stages
  if (currentScenario === "lint-fail") { failStage = "lint"; }
  else if (currentScenario === "test-fail") { failStage = "test"; }
  else if (currentScenario === "security-fail") { failStage = "security"; }
  else if (currentScenario === "deploy-fail") { failStage = "smoke"; } // Smoke test failure triggers rollback

  badgeStatus.textContent = "Running";
  badgeStatus.className = "pipeline-status-badge running";

  // Execute Stages
  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    
    // Set Node to Running
    setNodeStatus(stage, "running");
    
    // Animate connector path leading to this stage (if not first stage)
    if (i > 0) {
      setPathStatus(i, "active");
    }

    // Stream stage logs
    const success = await runStageSimulation(stage, currentScenario, config);
    
    if (!success) {
      setNodeStatus(stage, "failed");
      if (i > 0) setPathStatus(i, "failed");
      pipelineSuccess = false;
      
      // Mark downstream nodes as skipped
      for (let j = i + 1; j < STAGES.length; j++) {
        setNodeStatus(STAGES[j], "skipped");
      }
      break;
    } else {
      setNodeStatus(stage, "success");
      if (i > 0) setPathStatus(i, "success");
    }
  }

  // End of Pipeline
  STATE.isRunning = false;
  btnTrigger.disabled = false;
  btnTrigger.classList.add('pulse-effect');
  selectScenario.disabled = false;

  if (pipelineSuccess) {
    badgeStatus.textContent = "Passed";
    badgeStatus.className = "pipeline-status-badge success";
    appendLog(`🎉 PIPELINE COMPLETED SUCCESSFULLY! Deployed build #${STATE.buildCount}`, "success");
    
    // Update live preview app
    STATE.lastSuccessfulConfig = { ...config };
    updateLiveAppPreview(config);
    
    virtualDeployOverlay.classList.remove('active');
    
    // Confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } else {
    badgeStatus.textContent = "Failed";
    badgeStatus.className = "pipeline-status-badge failed";
    appendLog(`❌ PIPELINE FAILED AT STAGE '${failStage.toUpperCase()}'! Deployment halted.`, "error");
    
    // Handle rollback representation
    if (currentScenario === "deploy-fail") {
      appendLog(`⚠️ Rolling back deployment to last stable commit...`, "warning");
      await delay(2000);
      appendLog(`✓ Restored version: Stable v1.0.0. Service status: OK.`, "success");
      overlayMsg.innerHTML = `⚠️ Rollback Successful.<br>Active: Stable v1.0.0`;
      await delay(2000);
      virtualDeployOverlay.classList.remove('active');
      updateLiveAppPreview(STATE.lastSuccessfulConfig); // maintain stable
    } else {
      overlayMsg.innerHTML = `❌ Build #${STATE.buildCount} Failed.<br>Running Stable v1.0.0`;
      await delay(2000);
      virtualDeployOverlay.classList.remove('active');
      updateLiveAppPreview(STATE.lastSuccessfulConfig); // maintain stable
    }
  }
});

function resetPipelineNodes() {
  STAGES.forEach(stage => {
    const node = stageNodes[stage];
    node.className = `node-card position-${stage} pending-state`;
    node.querySelector('.node-status').textContent = "Pending";
  });
  
  // Reset paths
  for (let i = 1; i <= 8; i++) {
    const path = document.getElementById(`path-${i}`);
    if (path) path.setAttribute("class", "conn-path");
  }
}

function setNodeStatus(stage, status) {
  const node = stageNodes[stage];
  if (!node) return;
  
  node.className = `node-card position-${stage} ${status}-state`;
  let statusText = "Pending";
  if (status === "running") statusText = "Running...";
  else if (status === "success") statusText = "Success";
  else if (status === "failed") statusText = "Failed";
  else if (status === "skipped") statusText = "Skipped";
  
  node.querySelector('.node-status').textContent = statusText;
}

function setPathStatus(index, status) {
  const path = document.getElementById(`path-${index}`);
  if (path) {
    path.setAttribute("class", `conn-path ${status}`);
  }
}

// Parse custom code configuration
function parseEditorCode() {
  const code = codeEditor.value;
  const result = {
    name: "NEON MATRIX",
    theme: "cyan",
    discountPercent: 20,
    enableQuantumCheckout: true,
    welcomeMessage: "Welcome to the future.",
    hasSyntaxError: false,
    AWS_SECRET_KEY: null,
    codeRaw: code
  };
  
  try {
    // Quick regex extraction for config details
    const nameMatch = code.match(/name:\s*["']([^"']+)["']/);
    const themeMatch = code.match(/theme:\s*["']([^"']+)["']/);
    const discountMatch = code.match(/discountPercent:\s*(\d+)/);
    const quantumMatch = code.match(/enableQuantumCheckout:\s*(true|false)/);
    const welcomeMatch = code.match(/welcomeMessage:\s*["']([^"']+)["']/);
    const awsMatch = code.match(/AWS_SECRET_KEY:\s*["']([^"']+)["']/);

    if (nameMatch) result.name = nameMatch[1];
    if (themeMatch) result.theme = themeMatch[1];
    if (discountMatch) result.discountPercent = parseInt(discountMatch[1], 10);
    if (quantumMatch) result.enableQuantumCheckout = (quantumMatch[1] === "true");
    if (welcomeMatch) result.welcomeMessage = welcomeMatch[1];
    if (awsMatch) result.AWS_SECRET_KEY = awsMatch[1];

    // Basic Javascript Syntax check (matching braces, unclosed strings)
    // Check if open braces match close braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      result.hasSyntaxError = true;
    }
    
    // Check if unclosed string quotes exist on non-comment lines
    const lines = code.split('\n');
    lines.forEach(line => {
      if (line.trim().startsWith('//')) return;
      const dQuotes = (line.match(/"/g) || []).length;
      const sQuotes = (line.match(/'/g) || []).length;
      if (dQuotes % 2 !== 0 || sQuotes % 2 !== 0) {
        result.hasSyntaxError = true;
      }
    });

  } catch (err) {
    result.hasSyntaxError = true;
  }
  
  return result;
}

// ==========================================
// F. Simulator Stage Steps (Realistic Logs)
// ==========================================
async function runStageSimulation(stage, scenario, config) {
  appendLog(`--- Stage: ${stage.toUpperCase()} ---`, "info");
  
  if (stage === "source") {
    appendLog(`$ git checkout main`, "command");
    await delay(600);
    appendLog(`Branch main configured to track remote branch main.`, "info");
    appendLog(`Fetching origin`, "info");
    appendLog(`Already up-to-date.`, "success");
    return true;
  }
  
  if (stage === "install") {
    appendLog(`$ npm ci`, "command");
    await delay(400);
    appendLog(`npm fetch metadata...`, "info");
    await delay(800);
    appendLog(`added 264 packages in 1.1s`, "info");
    appendLog(`audited 265 packages in 1.2s`, "info");
    appendLog(`found 0 vulnerabilities`, "success");
    return true;
  }
  
  if (stage === "lint") {
    appendLog(`$ npm run lint`, "command");
    await delay(1000);
    if (scenario === "lint-fail") {
      appendLog(`\n/workspace/app-config.js`, "error");
      appendLog(`  5:25  error  Parsing error: Unexpected token, expected ","`, "error");
      appendLog(`\n✖ 1 problem (1 error, 0 warnings)`, "error");
      appendLog(`npm ERR! lifecycle lint: failed with exit code 1`, "error");
      return false;
    }
    appendLog(`✓ ESLint: Code conforms to style guidelines. (0 issues)`, "success");
    appendLog(`$ npm run build`, "command");
    await delay(800);
    appendLog(`Vite v5.0.0 building...`, "info");
    appendLog(`✓ 32 assets bundled successfully in 0.6s.`, "success");
    return true;
  }
  
  if (stage === "test") {
    appendLog(`$ npm test`, "command");
    await delay(1200);
    if (scenario === "test-fail") {
      appendLog(`PASS  tests/unit/theme.test.js`, "success");
      appendLog(`FAIL  tests/unit/discount.test.js`, "error");
      appendLog(`  ● Discount percentage validator`, "error");
      appendLog(`    Expect discountPercent to be between 0 and 100.`, "error");
      appendLog(`    Expected: <= 100`, "error");
      appendLog(`    Received: ${config.discountPercent}`, "error");
      appendLog(`\nTest Suites: 1 failed, 1 passed, 2 total`, "error");
      appendLog(`Tests:       1 failed, 8 passed, 9 total`, "error");
      appendLog(`Snapshots:   0 total`, "info");
      appendLog(`Time:        1.45 s`, "info");
      appendLog(`npm ERR! Test failed. See above for details.`, "error");
      return false;
    }
    appendLog(`PASS  tests/unit/theme.test.js (0.42 s)`, "success");
    appendLog(`PASS  tests/unit/discount.test.js (0.61 s)`, "success");
    appendLog(`PASS  tests/unit/quantum-core.test.js (0.35 s)`, "success");
    appendLog(`Test Suites: 3 passed, 3 total`, "success");
    appendLog(`Tests:       15 passed, 15 total`, "success");
    appendLog(`Time:        2.1 s`, "success");
    return true;
  }
  
  if (stage === "integration") {
    appendLog(`$ npx playwright test`, "command");
    await delay(1500);
    appendLog(`Running 4 integration tests in headless Chromium...`, "info");
    appendLog(`  ✓ E2E Checkout Flow (890ms)`, "success");
    appendLog(`  ✓ Page Theme Load (200ms)`, "success");
    appendLog(`  ✓ Item Selection (150ms)`, "success");
    appendLog(`  ✓ Cart Persistence (310ms)`, "success");
    appendLog(`4 passed (1.6s)`, "success");
    return true;
  }
  
  if (stage === "security") {
    appendLog(`$ npm run audit && sast-scan`, "command");
    await delay(1200);
    if (scenario === "security-fail") {
      appendLog(`⚠️  SAST SCAN: VULNERABILITY DETECTED`, "error");
      appendLog(`[CRITICAL] Hardcoded AWS Secret Key discovered on line 12:`, "error");
      appendLog(`   -> AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE/..."`, "error");
      appendLog(`\nSecurity audit halted. Exposed API credentials violates policy Sec-104.`, "error");
      appendLog(`Scan result: FAILED (1 high severity issue)`, "error");
      return false;
    }
    appendLog(`No hardcoded secrets or API keys found.`, "success");
    appendLog(`Checking package vulnerabilities...`, "info");
    appendLog(`0 packages are vulnerable.`, "success");
    appendLog(`SAST Scan clean. Security validation: PASS.`, "success");
    return true;
  }
  
  if (stage === "staging") {
    appendLog(`$ vercel --token=$VERCEL_TOKEN --scope=autodevops --confirm`, "command");
    await delay(1000);
    appendLog(`Uploading build package to staging environment...`, "info");
    appendLog(`Deploying to staging: https://gadget-store-stage-bld${STATE.buildCount}.vercel.app`, "success");
    return true;
  }
  
  if (stage === "smoke") {
    appendLog(`$ curl -I -s -o /dev/null -w "%{http_code}" https://gadget-store-stage-bld${STATE.buildCount}.vercel.app`, "command");
    await delay(1200);
    if (scenario === "deploy-fail") {
      appendLog(`Staging site health check returned: HTTP 500 (Internal Server Error)`, "error");
      appendLog(`$ npm run smoke-test`, "command");
      appendLog(`FAIL: Smoke test suite failed. Production release aborted.`, "error");
      return false;
    }
    appendLog(`Staging site health check returned: HTTP 200 OK`, "success");
    appendLog(`$ npm run smoke-test`, "command");
    appendLog(`✓ Landing page responds in under 200ms`, "success");
    appendLog(`✓ API Healthcheck: Success`, "success");
    appendLog(`Smoke tests passed. Promoting build to production.`, "success");
    return true;
  }
  
  if (stage === "deploy") {
    appendLog(`$ vercel --prod --token=$VERCEL_TOKEN`, "command");
    await delay(1200);
    appendLog(`Promoting staging build #${STATE.buildCount} to production traffic...`, "info");
    appendLog(`Configuring DNS routing...`, "info");
    appendLog(`Blue/Green routing swap: 100% traffic routed to build #${STATE.buildCount}.`, "success");
    appendLog(`Production url active: https://neon-matrix.app`, "success");
    return true;
  }
  
  return true;
}

// ==========================================
// G. Update Live Preview Device UI
// ==========================================
function updateLiveAppPreview(config) {
  // Update theme colors
  virtualAppBar.className = `device-app-bar theme-${config.theme}`;
  virtualDiscountBanner.className = `banner theme-${config.theme}-bg`;
  
  // Update name & details
  virtualStoreName.textContent = config.name;
  virtualDiscountAmount.textContent = config.discountPercent;
  virtualWelcome.textContent = config.welcomeMessage;
  
  // Quantum checkout beta feature
  if (config.enableQuantumCheckout) {
    virtualQuantumCheckout.style.display = "block";
  } else {
    virtualQuantumCheckout.style.display = "none";
  }
}

// Initial preview setup
updateLiveAppPreview(STATE.currentConfig);

// ==========================================
// H. Onboarding Walkthrough Tour System
// ==========================================
const tourSteps = [
  { id: "tour-step-1", targetId: "editor-tour-target" },
  { id: "tour-step-2", targetId: "scenario-tour-target" },
  { id: "tour-step-3", targetId: "pipeline-tour-target" },
  { id: "tour-step-4", targetId: "output-tour-target" },
  { id: "tour-step-5", targetId: "device-tour-target" }
];

btnTour.addEventListener('click', () => {
  startTour();
});

function startTour() {
  closeAllTourPopovers();
  showTourStep(0);
}

function showTourStep(index) {
  closeAllTourPopovers();
  if (index < 0 || index >= tourSteps.length) return;
  
  const step = tourSteps[index];
  const popover = document.getElementById(step.id);
  const target = document.getElementById(step.targetId);
  
  if (!popover || !target) return;
  
  // Show the popover in manual mode
  popover.showPopover();
  
  // Position popover next to target (fallback for anchor positioning)
  positionPopover(popover, target);
  
  // Hook up prev/next/close buttons inside the active popover
  const nextBtn = popover.querySelector('.btn-tour-next');
  const prevBtn = popover.querySelector('.btn-tour-prev');
  const closeBtn = popover.querySelector('.btn-tour-close');
  
  if (nextBtn) {
    nextBtn.onclick = () => showTourStep(index + 1);
  }
  if (prevBtn) {
    prevBtn.onclick = () => showTourStep(index - 1);
  }
  if (closeBtn) {
    closeBtn.onclick = () => closeAllTourPopovers();
  }
}

function closeAllTourPopovers() {
  tourSteps.forEach(step => {
    const popover = document.getElementById(step.id);
    if (popover && popover.matches(':popover-open')) {
      popover.hidePopover();
    }
  });
}

function positionPopover(popover, target) {
  const targetRect = target.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  
  // Determine viewport details
  let top = targetRect.top + window.scrollY + (targetRect.height / 2) - (popoverRect.height / 2);
  let left = targetRect.right + window.scrollX + 15;
  
  // Adjust if overflow right side of window
  if (left + popoverRect.width > window.innerWidth) {
    left = targetRect.left + window.scrollX - popoverRect.width - 15;
  }
  
  // Adjust top boundaries
  if (top < 10) top = 10;
  if (top + popoverRect.height > document.documentElement.scrollHeight - 10) {
    top = document.documentElement.scrollHeight - popoverRect.height - 10;
  }
  
  popover.style.position = 'absolute';
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
  popover.style.margin = '0';
}

// Close tour if window resizes (to prevent misalignments)
window.addEventListener('resize', () => {
  closeAllTourPopovers();
});
