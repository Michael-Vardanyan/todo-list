const taskList = document.getElementById("task-list");
let isTaskChecked = false;
function ToDoListObject(name, completed) {
    this.name = name;
    this.completed = completed;
}

function addTask() {
    const inputField = document.getElementById("input-task");
    const addTaskButton = document.getElementById("add-task-button");
    addTaskButton.addEventListener("click", function () {
        const lastText = inputField.value.trim();
        if (lastText !== "") {
            inputField.value = "";

            const taskItem = createTaskElement(lastText, isTaskChecked);
            taskList.append(taskItem);

            saveTasks(lastText, isTaskChecked);
        }
    });
}

function deleteTask() {
    taskList.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-btn")) {
            const taskItem = event.target.closest("li");
            const checkBox = taskItem.querySelector("input[type='checkbox']");

            if (checkBox.checked) {
                const taskText = taskItem.querySelector(".task").textContent;

                taskItem.remove();

                let tasks = retrieveTasks();
                tasks = tasks.filter(task => task.name !== taskText);
                localStorage.setItem("tasks", JSON.stringify(tasks));
            }
        }
    });
}

function crossOutTaskWhenChecked() {
    taskList.addEventListener("change", function (event) {
        if (event.target.type === "checkbox") {
            const checkBox = event.target;
            const taskItem = checkBox.closest("li");
            const taskText = taskItem.querySelector(".task").textContent;

            const isChecked = checkBox.checked;
            const textItem = taskItem.querySelector(".task");
            textItem.style.textDecoration = isChecked ? "line-through" : "none";

            let tasks = retrieveTasks();
            tasks = tasks.map(task =>
                task.name === taskText ? { ...task, completed: isChecked } : task
            );
            localStorage.setItem("tasks", JSON.stringify(tasks));
        }
    });
}

function saveTasks() {
    let taskList = retrieveTasks();

    const taskItems = document.querySelectorAll("#task-list li");
    taskItems.forEach((taskItem) => {
        const checkbox = taskItem.querySelector("input[type='checkbox']");
        const text = taskItem.querySelector(".task").textContent;

        const newTask = new ToDoListObject(text, checkbox.checked);

        if (!taskList.some(task => task.name === newTask.name)) {
            taskList.push(newTask);
        }
    });

    localStorage.setItem("tasks", JSON.stringify(taskList));
}

function retrieveTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function loadTasksFromStorage() {
    const tasksToLoad = retrieveTasks();

    tasksToLoad.forEach((task) => {
        const taskItem = createTaskElement(task.name, task.completed);
        taskList.append(taskItem);
    });
}

function createTaskElement(name, completed) {
    const taskItem = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;

    const taskText = document.createElement("span");
    taskText.setAttribute("class", "task");
    taskText.textContent = name;

    taskText.style.textDecoration = completed ? "line-through" : "none";

    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "delete-btn");

    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteButton);

    return taskItem;
}

window.onload = function () {
    loadTasksFromStorage();
    addTask();
    deleteTask();
    crossOutTaskWhenChecked();
};
