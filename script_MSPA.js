
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const taskSummary = document.getElementById("taskSummary");
const statusMessage = document.getElementById("statusMessage");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];
let currentFilter = "all";
let nextId = 1;

// Add a new task
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (title === "") {
    statusMessage.textContent = "Please enter a task.";
    return;
  }

  tasks.push({
    id: nextId++,
    title: title,
    completed: false,
    source: "My task"
  });

  taskInput.value = "";
  statusMessage.textContent = "Task added successfully! 🎉";
  renderTasks();
});

// Display tasks and update dashboard counters
function renderTasks() {
  const visibleTasks = tasks.filter(function (task) {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  // reduce() counts completed and pending tasks
  const counts = tasks.reduce(function (result, task) {
    result.total++;
    if (task.completed) {
      result.completed++;
    } else {
      result.pending++;
    }
    return result;
  }, { total: 0, completed: 0, pending: 0 });

  totalCount.textContent = counts.total;
  completedCount.textContent = counts.completed;
  pendingCount.textContent = counts.pending;

  taskList.replaceChildren();

  // map() creates a display element for each visible task
  const taskElements = visibleTasks.map(function (task) {
    const item = document.createElement("article");
    item.className = "task-item";
    if (task.completed) item.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    checkbox.addEventListener("change", function () {
      task.completed = checkbox.checked;
      statusMessage.textContent = task.completed
        ? "Great job! Task completed. 🌟"
        : "Task moved back to pending.";
      renderTasks();
    });

    const details = document.createElement("div");
    details.className = "task-details";

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const source = document.createElement("p");
    source.className = "task-source";
    source.textContent = task.source;

    details.append(title, source);

    const badge = document.createElement("span");
    badge.className = "task-badge " +
      (task.completed ? "completed-badge" : "pending-badge");
    badge.textContent = task.completed ? "Completed" : "Pending";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "🗑";
    deleteButton.setAttribute("aria-label", "Delete " + task.title);

    deleteButton.addEventListener("click", function () {
      // filter() removes the selected task
      tasks = tasks.filter(function (item) {
        return item.id !== task.id;
      });

      statusMessage.textContent = "Task deleted.";
      renderTasks();
    });

    item.append(checkbox, details, badge, deleteButton);
    return item;
  });

  taskElements.forEach(function (element) {
    taskList.appendChild(element);
  });

  if (visibleTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const icon = document.createElement("span");
    icon.textContent = currentFilter === "completed" ? "🌱" : "📝";

    const message = document.createElement("p");
    message.textContent = currentFilter === "pending"
      ? "You're all caught up! No pending tasks."
      : currentFilter === "completed"
        ? "No completed tasks yet."
        : "No tasks yet. Add your first task above!";

    empty.append(icon, message);
    taskList.appendChild(empty);
  }

  taskSummary.textContent =
    visibleTasks.length + " task(s) shown";
}

// Filter buttons
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn === button);
    });

    statusMessage.textContent = "";
    renderTasks();
  });
});

// Fetch sample tasks from JSONPlaceholder
loadSampleBtn.addEventListener("click", async function () {
  loadSampleBtn.disabled = true;
  loadSampleBtn.textContent = "⏳ Loading...";
  statusMessage.textContent = "Fetching sample tasks...";

  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos?_limit=5"
    );

    if (!response.ok) {
      throw new Error("Could not fetch tasks.");
    }

    const data = await response.json();

    // Convert API data into our task object format
    const sampleTasks = data.map(function (item) {
      return {
        id: nextId++,
        title: item.title,
        completed: item.completed,
        source: "Sample API"
      };
    });

    tasks.push(...sampleTasks);
    statusMessage.textContent =
      sampleTasks.length + " sample tasks loaded successfully! ☁️";

    renderTasks();
  } catch (error) {
    statusMessage.textContent =
      "Unable to load tasks. Please check your internet connection.";
  } finally {
    loadSampleBtn.disabled = false;
    loadSampleBtn.textContent = "☁️ Load Sample Tasks";
  }
});

// Initial dashboard
renderTasks();
