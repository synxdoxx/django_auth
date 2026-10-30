const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
            ...(options.headers || {})
        },
        credentials: "same-origin"
    });

    let data = null;
    if (response.status !== 204) {
        data = await response.json().catch(() => null);
    }

    if (!response.ok) {
        let errorMsg = "";
        if (data && typeof data === 'object') {
            errorMsg = Object.entries(data)
                .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                .join(' | ');
        } else {
            errorMsg = data?.detail || "Ошибка выполнения запроса";
        }
        throw new Error(errorMsg);
    }
    return data;
}

const labSelect = document.getElementById("lab");
const form = document.getElementById("submission-form");
const commentInput = document.getElementById("comment");
const message = document.getElementById("message");
const list = document.getElementById("submissions-list");
const loading = document.getElementById("loading");
const statusFilter = document.getElementById("status-filter");
const labFilter = document.getElementById("lab-filter");
const historyBox = document.getElementById("history");

const STATUS_NAMES = {
    new: "Сдана",
    booked: "Записана на защиту",
    accepted: "Принята"
};
let openedId = null;   // у какой работы сейчас открыта история

function showMessage(text, isError = false) {
    message.textContent = text;
    message.className = "alert " + (isError ? "alert-danger" : "alert-success");
}

async function loadLabs() {
    const labs = await apiRequest("/api/labs/");
    const selectedLab = labSelect.value;
    const selectedFilter = labFilter.value;

    labSelect.replaceChildren();
    labFilter.replaceChildren(new Option("Все лабораторные", ""));
    for (const lab of labs) {
        labSelect.append(new Option(`${lab.title} (мест: ${lab.free_slots})`, lab.id));
        labFilter.append(new Option(lab.title, lab.id));
    }
    labSelect.value = selectedLab;
    labFilter.value = selectedFilter;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        await apiRequest("/api/submissions/", {
            method: "POST",
            body: JSON.stringify({
                lab: Number(labSelect.value),
                comment: commentInput.value
            })
        });
        commentInput.value = "";
        showMessage("Работа успешно сдана");
        await loadSubmissions();
    } catch (error) {
        showMessage("Не удалось сдать работу: " + error.message, true);
    }
});

async function loadSubmissions() {
    loading.hidden = false;
    const params = new URLSearchParams();
    if (statusFilter.value) {
        params.set("status", statusFilter.value);
    }
    if (labFilter.value) {
        params.set("lab", labFilter.value);
    }
    const query = params.toString();
    const url = "/api/submissions/" + (query ? "?" + query : "");

    try {
        const submissions = await apiRequest(url);
        list.replaceChildren();

        if (submissions.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "Работы не найдены";
            list.append(empty);
            return;
        }

        for (const sub of submissions) {
            const row = document.createElement("div");
            row.className = "d-flex justify-content-between align-items-center border-bottom py-3 gap-3";

            const title = document.createElement("div");
            title.textContent = `${sub.lab_title} — ${sub.comment || "без комментария"}`;

            const actionContainer = document.createElement("div");
            actionContainer.className = "d-flex align-items-center gap-2";

            const status = document.createElement("span");
            status.className = "badge bg-blue-lt";
            status.textContent = STATUS_NAMES[sub.status];

            const bookBtn = document.createElement("button");
            bookBtn.className = "btn btn-sm btn-outline-primary";
            bookBtn.textContent = "Записаться";
            bookBtn.onclick = () => doAction(sub.id, "book");

            const acceptBtn = document.createElement("button");
            acceptBtn.className = "btn btn-sm btn-outline-success";
            acceptBtn.textContent = "Принять";
            acceptBtn.onclick = () => doAction(sub.id, "accept");

            const historyBtn = document.createElement("button");
            historyBtn.className = "btn btn-sm btn-outline-secondary";
            historyBtn.textContent = "История";
            historyBtn.onclick = () => showHistory(sub.id);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-sm btn-outline-danger";
            deleteBtn.textContent = "Удалить";
            deleteBtn.onclick = () => deleteSubmission(sub.id, sub.lab_title);

            actionContainer.append(status, bookBtn, acceptBtn, historyBtn, deleteBtn);
            row.append(title, actionContainer);
            list.append(row);
        }
    } catch (error) {
        showMessage("Не удалось загрузить работы: " + error.message, true);
    } finally {
        loading.hidden = true;
    }
}

// Бизнес-действия: book / accept
async function doAction(id, action) {
    try {
        await apiRequest(`/api/submissions/${id}/${action}/`, { method: "POST" });
        showMessage("Действие выполнено");
        await loadLabs();          // обновить число мест
        await loadSubmissions();
        if (openedId === id) {
            await showHistory(id); // обновить открытую историю
        }
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function showHistory(id) {
    try {
        const events = await apiRequest(`/api/submissions/${id}/history/`);
        openedId = id;
        historyBox.textContent = events
            .map(e => `${e.created_at.slice(0, 16).replace("T", " ")} — ${e.action} (${e.user})`)
            .join("\n");
    } catch (error) {
        showMessage("Не удалось загрузить историю: " + error.message, true);
    }
}

// Удаление с подтверждением (логика та же, что была для заявок)
async function deleteSubmission(id, labTitle) {
    if (!confirm(`Удалить работу «${labTitle}»?`)) {
        return;
    }
    try {
        await apiRequest(`/api/submissions/${id}/`, { method: "DELETE" });
        showMessage("Работа успешно удалена");
        if (openedId === id) {
            historyBox.textContent = "";
            openedId = null;
        }
        await loadSubmissions();
    } catch (error) {
        showMessage("Не удалось удалить работу: " + error.message, true);
    }
}

statusFilter.addEventListener("change", loadSubmissions);
labFilter.addEventListener("change", loadSubmissions);

async function initialize() {
    try {
        await loadLabs();
        await loadSubmissions();
    } catch (error) {
        showMessage("Ошибка инициализации: " + error.message, true);
    }
}

initialize();

