// TASK: import helper functions from utils
// TASK: import initialData
import {getTasks, createNewTask, putTask, deleteTask} from './utils/taskFunctions.js';
import {initialData} from './initialData.js';

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'false')
  } else {
    console.log('Data already exists in localStorage');
  }
}
initializeData();

// TASK: Get elements from the DOM
const elements = {
//Sidebar elements
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  themeSwitch: document.getElementById("switch"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  sideBar: document.querySelector(".side-bar"),
  sideBarBottom: document.querySelector(".side-bar-bottom"),

//Header and layout elements
  headerBoardName: document.getElementById("header-board-name"),
  dropDownBtn: document.getElementById("dropdownBtn"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  deleteBoardBtn: document.getElementById("deleteBoardBtn"),
  editBoardBtn: document.getElementById("edit-board-btn"),

//New task modal elements
  modalWindow: document.getElementById("new-task-modal-window"),
  titleInput: document.getElementById("title-input"),
  descriptionInput: document.getElementById("desc-input"),
  selectStatus: document.getElementById("select-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),

//Task editing modal elements   
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  editTaskForm: document.getElementById("edit-task-form"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editBtn: document.getElementById("edit-btn"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),

//Filter and column divs elements
  columnDivs: document.querySelectorAll(".column-div"),
  filterDiv: document.getElementById("filterDiv"),
}

//Styling for sidebar elements(hide sidebar and theme toggle buttons)
document.getElementById("boards-nav-links-div").style.marginTop = "50px";
document.getElementById("boards-nav-links-div").style.marginBottom = "250px"

//Objects for status selection
const statusSelection = {
  todo: "TODO",
  doing: "DOING",
  done: "DONE"
}

let activeBoard = ""

//Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

//Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.onclick = () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    };
    boardsContainer.appendChild(boardElement);
  });
}

//Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  //Ensure the column titles are set outside of this function or correctly initialized before this function runs
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    const statusSelections = statusSelection[status];
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${statusSelections}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.onclick = () =>  { 
        openEditTaskModal(task);
      };

      tasksContainer.appendChild(taskElement);
    });
  });
}

// Refresh the tasks UI when the active board is changed.
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    } else {
      btn.classList.remove('active'); 
    }
  });
}

// Adds new task to the UI
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }
  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }
  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; 
  taskElement.setAttribute('data-task-id', task.id);
  tasksContainer.appendChild(taskElement); 
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.onclick = () =>  toggleModal(false, elements.editTaskModal);

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.onclick = () =>  toggleSidebar(false);
  elements.showSideBarBtn.onclick = () => toggleSidebar(true);

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
function toggleModal(show, modal = elements.modalWindow ) {
  modal.style.display = show ? 'block' : 'none'; 
}

// Handles form submission event when a user submits the "Add Task" form.
function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      id: '',
      title: elements.titleInput.value,
      description: elements.descriptionInput.value,
      status: elements.selectStatus.value,
      board: activeBoard, 
    };
    //Create a new task object and add it to the array
    const newTask = createNewTask(task);
    //Add the task to the UI
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; 
      event.target.reset();
      refreshTasksUI();
    }
}

// Toggles the sidebar and set the local storage to remember the state
function toggleSidebar(show) {
  elements.sideBar.style.display = show ? 'block' : 'none';
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';

  localStorage.setItem('showSideBar', show);
}

// Toggles the theme and logo and set the local storage to remember the state
function toggleTheme() {
  const isLightTheme = document.body.classList.contains('light-theme');
  document.body.classList.toggle("light-theme");
  const logo = document.getElementById('logo');
  
  if (isLightTheme) {
    logo.src = './assets/logo-dark.svg';
    localStorage.setItem('logo', './assets/logo-dark.svg');
    localStorage.setItem('light-theme', 'disabled');
  } else {
    logo.src = './assets/logo-light.svg';
    localStorage.setItem('logo', './assets/logo-light.svg');
    localStorage.setItem('light-theme', 'enabled');
  }
}

// Fills the edit task modal with task details and sets up event listeners for saving/deleting the task.
function openEditTaskModal(task) {
  // Get button elements from the task modal
  elements.editTaskTitleInput.value = task.title;
  elements.editSelectStatus.value = task.status;
  elements.editTaskDescInput.value = task.description;

  // Call saveTaskChanges upon click of Save Changes button
  elements.saveTaskChangesBtn.onclick = () => {
    saveTaskChanges(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  };

  //Delete task using a helper function and close the task modal
  elements.deleteTaskBtn.onclick = () => {
    //confirmation for task deletion pop-up
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id);
      toggleModal(false, elements.editTaskModal);
      refreshTasksUI(); 
    }
  };
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

// Saves the changes made to the task
function saveTaskChanges(taskId) {
  // Create an object with the updated task details
   const updatedTask = {
    id: taskId,
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editSelectStatus.value,
    board: activeBoard, 
  };

  // Update task using a helper functoin
  putTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}


document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  if (localStorage.getItem('logo') === './assets/logo-light.svg'){
    logo.src = './assets/logo-light.svg';
  }
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  elements.themeSwitch.checked = isLightTheme;
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}