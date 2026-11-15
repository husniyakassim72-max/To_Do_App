// ==============================================
// STEP 1: Grab all the HTML elements we need
// ==============================================
// getElementById() and querySelector() let us "grab" elements from the page
// so we can read from them or change them with JavaScript.

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const clearBtn = document.getElementById("clearBtn");
const filterButtons = document.querySelectorAll(".filter-btn");


// ==============================================
// STEP 2: Set up our data
// ==============================================
// We store all tasks in an ARRAY of OBJECTS.
// Each task is an OBJECT with 3 properties: id, text, completed.
// Example: { id: 123, text: "Buy milk", completed: false }

let tasks = [];

// currentFilter keeps track of which filter button is active: "all", "completed", or "pending"
let currentFilter = "all";


// ==============================================
// STEP 3: Local Storage helper functions
// ==============================================
// Local Storage lets us save data in the browser so tasks are still there
// even after the page is refreshed or closed.

// Save the tasks array into Local Storage.
// Local Storage can only store STRINGS, so we use JSON.stringify()
// to turn our array/objects into a string.
function saveTasks() {
  localStorage.setItem("myTasks", JSON.stringify(tasks));
}

// Load tasks from Local Storage when the page starts.
// JSON.parse() turns the saved string back into a real array/objects.
function loadTasks() {
  const savedTasks = localStorage.getItem("myTasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
}


// ==============================================
// STEP 4: Render (display) tasks on the screen
// ==============================================
// This function clears the task list and rebuilds it from the "tasks" array.
// We call this function every time something changes (add, delete, edit, etc.)

function renderTasks() {
  // Clear out everything currently inside the task list
  taskList.innerHTML = "";

  // DECISION: figure out which tasks to show based on the current filter
  // We use the .filter() array method to create a new filtered array.
  let tasksToShow = tasks;

  if (currentFilter === "completed") {
    tasksToShow = tasks.filter(function (task) {
      return task.completed === true;
    });
  } else if (currentFilter === "pending") {
    tasksToShow = tasks.filter(function (task) {
      return task.completed === false;
    });
  }

  // If there are no tasks to show, display a friendly empty message
  if (tasksToShow.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "empty-message";
    emptyMsg.textContent = "No tasks here yet!";
    taskList.appendChild(emptyMsg);
  }

  // LOOP: go through every task in tasksToShow and build an <li> for it
  tasksToShow.forEach(function (task) {

    // Create the <li> container for this task
    const li = document.createElement("li");
    li.className = "task-item";

    // ---- Checkbox (marks task complete/incomplete) ----
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;

    // EVENT: when checkbox is clicked, toggle the task's completed status
    checkbox.addEventListener("change", function () {
      toggleComplete(task.id);
    });

    // ---- Task text ----
    const span = document.createElement("span");
    span.textContent = task.text;
    span.className = "task-text";

    // classList.add() applies the "completed" CSS style (line-through) if needed
    if (task.completed) {
      span.classList.add("completed");
    }

    // EVENT: clicking the text also toggles complete/incomplete (nice shortcut)
    span.addEventListener("click", function () {
      toggleComplete(task.id);
    });

    // ---- Edit button ----
    const editBtn = document.createElement("button");
    editBtn.textContent = "";
    editBtn.className = "icon-btn";
    editBtn.addEventListener("click", function () {
      startEditTask(li, task);
    });

    // ---- Delete button ----
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.className = "icon-btn";
    deleteBtn.addEventListener("click", function () {
      deleteTask(task.id);
    });

    // Group the two action buttons together
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    // Put checkbox, text, and actions together inside the <li>
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actionsDiv);

    // Finally, add this <li> to the task list on the page
    taskList.appendChild(li);
  });

  // Update the counter and save to Local Storage every time we render
  updateCounter();
  saveTasks();
}


// ==============================================
// STEP 5: Add a new task
// ==============================================
function addTask() {
  // Get the text typed by the user, and trim() removes extra spaces
  const text = taskInput.value.trim();

  // DECISION: don't add empty tasks
  if (text === "") {
    alert("Please type a task first!");
    return;
  }

  // Create a new task OBJECT
  const newTask = {
    id: Date.now(),      // Date.now() gives a unique number based on current time
    text: text,
    completed: false
  };

  // Add the new task object to the end of our tasks ARRAY
  tasks.push(newTask);

  // Clear the input box and refresh the list on screen
  taskInput.value = "";
  renderTasks();
}


// ==============================================
// STEP 6: Delete a task
// ==============================================
function deleteTask(id) {
  // .filter() creates a new array that excludes the task with the matching id
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });

  renderTasks();
}


// ==============================================
// STEP 7: Toggle complete / uncomplete
// ==============================================
function toggleComplete(id) {
  // LOOP through tasks using forEach to find the matching task
  tasks.forEach(function (task) {
    if (task.id === id) {
      // Flip true to false, or false to true
      task.completed = !task.completed;
    }
  });

  renderTasks();
}


// ==============================================
// STEP 8: Edit a task
// ==============================================
// This replaces the task's text with an input box so the user can edit it.
function startEditTask(li, task) {
  // Clear the current <li> content
  li.innerHTML = "";

  // Create an input box pre-filled with the current task text
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = task.text;
  editInput.className = "edit-input";

  li.appendChild(editInput);
  editInput.focus();

  // Function to save the edited text
  function saveEdit() {
    const newText = editInput.value.trim();

    // DECISION: only save if the new text isn't empty
    if (newText !== "") {
      task.text = newText;
    }

    renderTasks();
  }

  // EVENT: save changes when the input loses focus (user clicks elsewhere)
  editInput.addEventListener("blur", saveEdit);

  // EVENT: save changes when the user presses "Enter"
  editInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      editInput.blur(); // triggers the "blur" event above, which saves
    }
  });
}


// ==============================================
// STEP 9: Update the task counter
// ==============================================
function updateCounter() {

  const remaining = tasks.filter(function (task) {
    return task.completed === false;
  }).length;

  taskCounter.textContent = remaining + " task" + (remaining !== 1 ? "s" : "") + " left";
}


// ==============================================
// STEP 10: Clear all completed tasks
// ==============================================
function clearCompleted() {
  tasks = tasks.filter(function (task) {
    return task.completed === false;
  });

  renderTasks();
}


// ==============================================
// STEP 11: Handle filter button clicks (All / Completed / Pending)
// ==============================================
filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    // Remove "active" style from every filter button
    filterButtons.forEach(function (b) {
      b.classList.remove("active");
    });

    // Add "active" style to the button that was just clicked
    btn.classList.add("active");

    // data-filter attribute tells us which filter was selected
    currentFilter = btn.getAttribute("data-filter");

    renderTasks();
  });
});


// ==============================================
// STEP 12: Set up main event listeners
// ==============================================

// Add task when the "Add" button is clicked
addBtn.addEventListener("click", addTask);

// Add task when the user presses "Enter" inside the input box
taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

// Clear all completed tasks when the "Clear Completed" button is clicked
clearBtn.addEventListener("click", clearCompleted);


// ==============================================
// STEP 13: Run this when the page first loads
// ==============================================
loadTasks();   // Load any saved tasks from Local Storage
renderTasks(); // Display them on the screen
