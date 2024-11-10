document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    enableDragAndDrop();
});

const caixaescreve = document.getElementById("caixa-escreve");
const boxlista = document.getElementById("box-lista");
const deletedTasksList = document.getElementById("deletedTasksList");
const emptyMessage = document.getElementById("emptyMessage");

document.addEventListener("click", handleTaskClick);

function toggleLeftMenu() {
    const menuLateralEsquerda = document.getElementById('menuLateralEsquerda');
    menuLateralEsquerda.classList.toggle('show');
}

function toggleMenu() {
    const menuLateral = document.getElementById('menuLateral');
    menuLateral.classList.toggle('show');
}

function sanitizeInput(input) {
    const tempElement = document.createElement('div');
    tempElement.innerText = input;
    return tempElement.innerHTML;
}

function addTask(button) {
    const input = button ? button.previousElementSibling : caixaescreve;
    const taskText = sanitizeInput(input.value);

    if (taskText === '') {
        alert("Você deve escrever algo primeiro");
    } else {
        const li = document.createElement("li");
        const currentDate = new Date();
        const dateTime = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`; 

        // Adiciona o texto da tarefa (sem a data/hora)
        const taskTextNode = document.createTextNode(taskText);
        li.appendChild(taskTextNode);

        // Adiciona o círculo preto para definir a importância depois do texto
        const circle = document.createElement("div");
        circle.classList.add("circle");
        circle.onclick = () => openTaskModal(taskText, dateTime); // Passa a data e hora para o modal
        li.appendChild(circle);

        const span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);

        li.addEventListener("click", handleTaskClick);

        const ul = button ? button.parentElement.nextElementSibling : boxlista;
        ul.appendChild(li);

        input.value = "";
        saveTasks();
        enableDragAndDrop();
    }
}

boxlista.addEventListener("click", handleTaskClick);
deletedTasksList.addEventListener("click", handleDeletedTaskClick);

function handleTaskClick(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("verificado");

        // Mantém o círculo preto para definir a importância
        if (!e.target.querySelector(".circle")) {
            const circle = document.createElement("div");
            circle.classList.add("circle");
            circle.onclick = () => openTaskModal(e.target.innerText.trim());
            e.target.insertBefore(circle, e.target.firstChild); // Insere o círculo como o primeiro elemento dentro da tarefa
        }

        saveTasks(); 
    } else if (e.target.tagName === "SPAN") {
        moveTaskToDeleted(e.target); 
    }
}

function moveTaskToDeleted(target) {
    if (!target || !target.parentElement) {
        console.error("Elemento pai do target não encontrado.");
        return;
    }
    
    const taskText = target.parentElement.textContent.replace('\u00d7', '').trim();
    const taskChecked = target.parentElement.classList.contains("verificado");
    const currentDate = new Date();
    const dateTime = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`; // Corrigido para usar crases

    const deletedTask = document.createElement("li");
    if (taskChecked) {
        deletedTask.classList.add("checked");
    }
    
    deletedTask.innerHTML = `${taskText} <small>(${dateTime})</small> <button class="delete-btn">x</button>`; // Corrigido para usar crases
    deletedTask.setAttribute('data-original-list', target.parentElement.parentElement.id);

    deletedTasksList.appendChild(deletedTask);
    target.parentElement.remove();
    saveTasks(); 
    updateEmptyMessage(); 
}

deletedTasksList.addEventListener("click", handleDeletedTaskClick);

function handleDeletedTaskClick(e) {
    if (e.target.tagName === "BUTTON" && e.target.classList.contains("delete-btn")) {
        e.target.parentElement.remove();
        saveTasks();
        updateEmptyMessage(); 
    } else if (e.target.tagName === "LI") {
        restoreTask(e.target); 
    }
}

function restoreTask(taskElement) {
    const taskText = taskElement.innerHTML.split(' <small>')[0].trim(); 
    const taskChecked = taskElement.classList.contains("checked");

    const originalListId = taskElement.getAttribute('data-original-list');
    const originalList = document.getElementById(originalListId);

    if (!originalList) {
        alert('A lista original não foi encontrada!');
        return;
    }

    const taskExists = Array.from(originalList.getElementsByTagName('li')).some(li => {
        return li.textContent.replace('\u00d7', '').trim() === taskText;
    });

    if (taskExists) {
        return;
    }

    const restoredTask = document.createElement("li");

    // Adiciona o texto da tarefa
    const taskTextNode = document.createTextNode(taskText);
    restoredTask.appendChild(taskTextNode);

    // Adiciona o círculo de importância após o texto
    const circle = document.createElement("div");
    circle.classList.add("circle");
    circle.onclick = () => openTaskModal(taskText); // Reaplica o evento para abrir o modal
    restoredTask.appendChild(circle);

    // Adiciona o botão de exclusão
    const span = document.createElement("span");
    span.innerHTML = "\u00d7";
    restoredTask.appendChild(span);

    if (taskChecked) {
        restoredTask.classList.add("verificado");
    }

    restoredTask.addEventListener("click", handleTaskClick);

    originalList.appendChild(restoredTask);

    taskElement.remove();
    saveTasks(); 
    updateEmptyMessage();
    enableDragAndDrop(); 
}

function saveTasks() {
    const lists = document.querySelectorAll('.box-to-do ul');
    lists.forEach((ul, index) => {
        localStorage.setItem(`tasksList${index}`, ul.innerHTML); // Corrigido para usar crases e aspas
    });

    localStorage.setItem("deletedTasks", deletedTasksList.innerHTML); 
}

function loadTasks() {
    const lists = document.querySelectorAll('.box-to-do ul');
    lists.forEach((ul, index) => {
        ul.innerHTML = localStorage.getItem(`tasksList${index}`) || '';
        ul.querySelectorAll('li').forEach(task => {
            task.addEventListener("click", handleTaskClick);

            // Adiciona o círculo de importância, se ainda não estiver presente
            if (!task.querySelector(".circle")) {
                const circle = document.createElement("div");
                circle.classList.add("circle");
                const taskText = task.textContent.replace("\u00d7", "").trim();
                circle.onclick = () => openTaskModal(taskText);
                task.insertBefore(circle, task.firstChild);
            } else {
                // Reativa o evento onclick do círculo existente
                const circle = task.querySelector(".circle");
                const taskText = task.textContent.replace("\u00d7", "").trim();
                circle.onclick = () => openTaskModal(taskText);
            }
        });
    });

    deletedTasksList.innerHTML = localStorage.getItem("deletedTasks") || '';
    deletedTasksList.querySelectorAll('li').forEach(task => {
        task.addEventListener("click", handleDeletedTaskClick);
    });

    updateEmptyMessage();
}

function updateEmptyMessage() {
    emptyMessage.style.display = deletedTasksList.children.length === 0 ? 'block' : 'none';
}

function mostrarCadastroModal() {
    const modal = document.getElementById('cadastroModal');
    modal.style.display = 'block'; 
}

function mostrarLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';  
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal com o ID '${modalId}' não foi encontrado.`); // Corrigido para usar crases
        return;
    }
    modal.style.display = "block"; 
    modal.classList.remove('hidden'); 
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';  
}

window.onclick = function(event) {
    const modals = ['cadastroModal', 'loginModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (event.target === modal) {
                closeModal(modalId);
            }
            const closeButton = modal.querySelector('.fechar');
            if (event.target === closeButton) {
                closeModal(modalId);
            }
        }
    });
};

document.getElementById("formCadastro").addEventListener("submit", function(e) {
    e.preventDefault();
    alert("Cadastro realizado com sucesso!");
    closeModal("cadastroModal");
});

document.getElementById("formLogin").addEventListener("submit", function(e) {
    e.preventDefault();
    closeModal("loginModal");
    showUserArea();
});

document.querySelectorAll('.fechar').forEach(button => {
    button.onclick = function() {
        const modalId = this.closest('.modal, .modal-login').id;
        closeModal(modalId);
    };
});

function showUserArea() {
    const areaUsuario = document.getElementById("areaUsuario");
    areaUsuario.style.display = "block";

    document.querySelectorAll('.menu-buttons button').forEach(button => button.style.display = 'none');
    document.getElementById("logoutButton").style.display = 'block';

    const usuarioFoto = document.getElementById("usuarioFoto");
    const savedFoto = localStorage.getItem("usuarioFoto");
    usuarioFoto.src = savedFoto || "default_photo-removebg-preview.png";
    document.getElementById("usuarioNome").innerText = "Nome do Usuário";
    document.getElementById('todoArea').style.display = 'block';
}

function logout() {
    document.getElementById("areaUsuario").style.display = "none";
    document.querySelectorAll('.menu-buttons button').forEach(button => button.style.display = 'block');
    document.getElementById("logoutButton").style.display = 'none';
}

function previewImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        document.getElementById("usuarioFoto").src = e.target.result;
        localStorage.setItem("usuarioFoto", e.target.result);
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        document.getElementById("usuarioFoto").src = "default_photo-removebg-preview.png";
    }
}

function editarNomeLista() {
    const nomeLista = document.getElementById("nomeLista");
    const inputNomeLista = document.getElementById("inputNomeLista");

    inputNomeLista.value = nomeLista.innerText;
    nomeLista.style.display = "none";
    inputNomeLista.style.display = "inline";
    inputNomeLista.focus();

    inputNomeLista.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            salvarNomeLista();
        }
    });
}

function salvarNomeLista() {
    const nomeLista = document.getElementById("nomeLista");
    const inputNomeLista = document.getElementById("inputNomeLista");

    nomeLista.innerText = inputNomeLista.value;
    nomeLista.style.display = "inline";
    inputNomeLista.style.display = "none";

    localStorage.setItem('nomeLista', inputNomeLista.value);
}

function setupEditTitle(span) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.innerText;

    input.classList.add("input-titulo");
    input.style.fontFamily = getComputedStyle(span).fontFamily;
    input.style.fontSize = getComputedStyle(span).fontSize;
    input.style.color = getComputedStyle(span).color;

    const parent = span.parentElement;
    parent.replaceChild(input, span);

    input.focus();

    input.addEventListener("blur", function() {
        saveTitle(input.value, parent);
    });

    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            saveTitle(input.value, parent);
        }
    });
}

function saveTitle(newTitle, parent) {
    const span = document.createElement("span");
    span.className = "lista-titulo";
    span.innerText = newTitle;

    span.onclick = function() {
        setupEditTitle(this);
    };

    span.style.fontFamily = getComputedStyle(parent.querySelector("input")).fontFamily;
    span.style.fontSize = getComputedStyle(parent.querySelector("input")).fontSize;
    span.style.color = getComputedStyle(parent.querySelector("input")).color;

    parent.replaceChild(span, parent.querySelector("input"));

    saveTasks();
}

function addNewList() {
    const newList = document.createElement('div');
    newList.classList.add('box-to-do');

    const listId = `list-${Date.now()}`;

    newList.innerHTML = `
        <h2>
            <span class="lista-titulo" onclick="setupEditTitle(this)">Nova lista</span>
            <input type="text" style="display: none;" class="input-titulo" />
            <img src="icon.png" alt="icone da lista">
        </h2>
        <div class="coiso">
            <input type="text" placeholder="Escreva aqui...">
            <button onclick="addTask(this)">Adicionar</button>
        </div>
        <ul id="${listId}"></ul>
    `;

    document.getElementById('listasContainer').appendChild(newList);

    const ul = newList.querySelector("ul");
    ul.addEventListener("click", handleTaskClick);

    enableDragAndDrop(); 
    document.getElementById('addListButton').style.display = 'none';
}

function moveTaskToPosition(task, newPosition) {
    const list = task.parentElement;
    const tasks = Array.from(list.children);

    if (newPosition < 0 || newPosition >= tasks.length) {
        alert("Posição inválida!");
        return;
    }

    list.removeChild(task); 
    if (newPosition === tasks.length) {
        list.appendChild(task); 
    } else {
        list.insertBefore(task, tasks[newPosition]); 
    }
    saveTasks(); 
}

function enableTaskReordering() {
    const tasks = Array.from(document.querySelectorAll('#box-lista li'));
    tasks.forEach(task => {
        task.addEventListener('click', () => {
            const newPosition = parseInt(prompt("Digite a nova posição (0 para início):"));
            moveTaskToPosition(task, newPosition);
        });
    });
}

enableTaskReordering();

function enableDragAndDrop() {
    const lists = document.querySelectorAll('.box-to-do ul');
    lists.forEach(list => {
        const tasks = list.querySelectorAll('li');
        tasks.forEach(task => {
            task.setAttribute('draggable', true);
            task.addEventListener('dragstart', handleDragStart);
            task.addEventListener('dragover', handleDragOver);
            task.addEventListener('drop', handleDrop);
            task.addEventListener('dragenter', handleDragEnter);
            task.addEventListener('dragleave', handleDragLeave);
        });
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    if (e.target.tagName === 'LI' && e.target !== draggedElement) {
        const list = e.target.parentElement;
        
        const bounding = e.target.getBoundingClientRect();
        const offset = e.clientY - bounding.top;

        if (offset > bounding.height / 2) {
            list.insertBefore(draggedElement, e.target.nextSibling); 
        } else {
            list.insertBefore(draggedElement, e.target); 
        }

        saveTasks(); 
    }
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function openTaskModal(taskText, dateTime) {
    const taskDetails = document.getElementById("taskDetails");

    if (!taskDetails) {
        console.error("Elemento 'taskDetails' não encontrado.");
        return;
    }

    taskDetails.innerText = taskText;

    // Cria um novo elemento para exibir a data e hora
    const taskDateTime = document.createElement("div");
    taskDateTime.innerText = `Criado em: ${dateTime}`; // Define o texto da data e hora
    taskDateTime.classList.add("task-datetime"); // Adiciona uma classe para possível estilização
    taskDetails.appendChild(taskDateTime); // Adiciona ao modal

    const modal = document.getElementById('taskModal');
    modal.style.display = 'block';

    window.addEventListener('click', closeModalOnOutsideClick);
}

function createImportanceCircle(taskElement) {
    const circle = document.createElement("span");
    circle.classList.add("importance-circle");
    circle.innerText = "●"; 
    circle.onclick = () => openTaskModal(taskElement);
    taskElement.appendChild(circle);
}

function setImportance() {
    const importanceSelect = document.getElementById("importance");
    const importance = importanceSelect.value;
    const taskText = document.getElementById("taskDetails").innerText;

    alert(`Importância definida como: ${importance} para a tarefa: ${taskText}`); // Corrigido para usar crases

    closeModal('taskModal');
}

function setImportance(level) {
    const taskText = document.getElementById("taskDetails").innerText.trim();
    const tasks = document.querySelectorAll('#box-lista li');

    tasks.forEach(task => {
        if (task.innerText.trim() === taskText) {
            task.classList.remove("urgent", "important", "not-important");

            if (level === 'urgent') {
                task.classList.add("urgent");
            } else if (level === 'important') {
                task.classList.add("important");
            } else if (level === 'not-important') {
                task.classList.add("not-important");
            }

            saveTasks();
            closeModal('taskModal');
        }
    });
}

function closeModalOnOutsideClick(event) {
    const modal = document.getElementById('taskModal');
    if (event.target === modal) {
        closeModal('taskModal');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';  

    window.removeEventListener('click', closeModalOnOutsideClick);
}