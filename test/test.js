const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const {StageTest, correct, wrong} = require('hs-test-web');

class TodoTest extends StageTest {

    page = this.getPage(pagePath)

    tests = [
        this.page.execute(() => {
            if (document.title !== 'To-Do List') {
                return wrong("The title of the page should be 'To-Do List'")
            }

            return correct();
        }),
        this.page.execute(async () => {

            let taskList = document.getElementById("task-list")

            if (taskList === null || taskList.tagName !== 'UL')
                return wrong("Can't find <ul> tag with id '#task-list'")

            let tasks = taskList.getElementsByTagName("li")

            const numberOfTasks = tasks.length;
            let counter = 0;

            while (true) {

                if (counter > numberOfTasks) {
                    return wrong("Looks like after deleting a task it is not removed from the task list!")
                }

                const deleteButton = document.querySelector("button.delete-btn")
                if (deleteButton === null) {
                    break
                }
                await deleteButton.click()
                counter++
            }

            taskList = document.getElementById("task-list")
            if (taskList === null || taskList.tagName !== 'UL')
                return wrong("After deleting the tasks can't find <ul> tag with id '#task-list'")

            tasks = taskList.getElementsByTagName("li")

            if (tasks.length !== 0) {
                return wrong("After deleting all the tasks there shouldn't be any <li> tag")
            }

            return correct()
        }),

        // Test adding a new task and verifying localStorage update
        this.page.execute(async () => {
            // Clear localStorage to start with a clean slate
            localStorage.clear();

            const inputField = document.getElementById("input-task")
            if (inputField.tagName !== 'INPUT')
                return wrong("Can't find input field with id '#input-task'")

            inputField.value = "New task to test localStorage"

            const addButton = document.getElementById("add-task-button")
            if (addButton.tagName !== 'BUTTON')
                return wrong("Can't find button with id '#add-task-button'")

            addButton.click()

            // Retrieve tasks from localStorage
            const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

            console.log("here", JSON.stringify(savedTasks));

            if (savedTasks.length !== 1)
                return wrong("After adding a new task, localStorage should contain exactly 1 task.")

            if (savedTasks[0].name !== "New task to test localStorage")
                return wrong("The task name in localStorage does not match the added task.")

            if (savedTasks[0].completed !== false)
                return wrong("Newly added task should have completed status set to false.")

            const taskList = document.getElementById("task-list"); // Assuming there's a container for tasks
            if (!taskList)
                return wrong("Can't find task list container with id '#task-list'.");

            const taskItem = Array.from(taskList.children).find(
                (item) => item.textContent.includes("New task to test localStorage")
            );

            if (!taskItem)
                return wrong("Can't find the newly created task in the DOM.");

            taskItem.remove();

            return correct();
        }),


        this.page.execute(() => {
            localStorage.clear();


            // Add a few tasks programmatically
            const taskList = document.getElementById('task-list');
            const tasks = [
                { name: "Test Task 1", completed: false },
                { name: "Test Task 2", completed: true },
                { name: "Test Task 3", completed: false }
            ];

            tasks.forEach(task => {
                const li = document.createElement('li');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;

                const span = document.createElement('span');
                span.className = 'task';
                span.textContent = task.name;
                if (task.completed) {
                    span.style.textDecoration = 'line-through';
                }

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = 'Delete';

                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(deleteBtn);
                taskList.appendChild(li);
            });


            // Trigger save to localStorage
            const script = document.createElement('script');
            script.textContent = 'saveTasks()';
            document.body.appendChild(script);
            script.remove();


            // Retrieve saved tasks from localStorage
            const savedTasks = JSON.parse(localStorage.getItem('tasks'));


            for (let i = 0; i < tasks.length; i++) {
                if (savedTasks[i].name !== tasks[i].name) {
                    return wrong(`Task name mismatch. Expected "${tasks[i].name}", got "${savedTasks[i].name}"`);
                }
                if (savedTasks[i].completed !== tasks[i].completed) {
                    return wrong(`Task completed status mismatch for task "${tasks[i].name}"`);
                }
            }

            return correct();
        }),


    ]
}

it('Test stage', async function () {
    try {
        this.timeout(30000)
    } catch (ignored) {
    }
    await new TodoTest().runTests()
}, 30000)

