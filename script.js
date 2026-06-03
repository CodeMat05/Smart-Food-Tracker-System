let editMode = false;
let currentCard = null;
let activities = [];
let currentFilter = "All";
let deleteTarget = null;

function showPage(pageId, button){

      let pages = document.querySelectorAll('.page');
      pages.forEach(page => {
        page.classList.remove('active');
      });

      document.getElementById(pageId).classList.add('active');

      let buttons = document.querySelectorAll('.nav-btn');
      buttons.forEach(btn => {
        btn.classList.remove('active');
      });

      button.classList.add('active');

      if(pageId !== "addExpense"){
        resetEditState();
      }
}

function updateDashboard(){

  const cards =
    document.querySelectorAll(".expense-card");

  let total = 0;
  let today = 0;

  const todayDate =
    new Date().toISOString().split("T")[0];

  cards.forEach(card => {

    const price = Number(
      card.querySelector(".price")
        .textContent.replace("₱","")
    );

    const date =
      card.querySelectorAll("p")[1]
        .textContent.replace("Date: ","");

    total += price;

    if(date === todayDate){
      today += price;
    }

  });

  document.getElementById("totalExpenses")
    .textContent = "₱" + total.toLocaleString();

  document.getElementById("expenseCount")
    .textContent = cards.length;

  document.getElementById("todaySpending")
    .textContent = "₱" + today.toLocaleString();
}

function updateBudgetUsage(){

  const cards =
    document.querySelectorAll(".expense-card");

  let totalExpense = 0;

  cards.forEach(card => {

    totalExpense += Number(
      card.querySelector(".price")
        .textContent.replace("₱","")
    );

  });

  const budgetText =
    document.getElementById("budgetDisplay")
      .textContent.replace("₱","");

  const budget = Number(budgetText);

  if(budget <= 0) return;

  const remaining = budget - totalExpense;

  const displayRemaining = remaining < 0 ? 0 : remaining;

  document.getElementById("remainingBudget")
    .textContent = "₱" + displayRemaining.toLocaleString();

  if(remaining < 0){

    const overBudget = Math.abs(remaining);

    document.getElementById("remainingBudget")
      .style.color = "#ef4444";

    document.getElementById("overBudgetText")
      .textContent =
      "Over Budget: ₱" + overBudget.toLocaleString();

    document.getElementById("overBudgetText")
      .style.color = "#ef4444";

  } else {

    document.getElementById("remainingBudget")
      .style.color = "#2563eb";

    document.getElementById("overBudgetText")
      .textContent = "";

  }

  let percent =
    (totalExpense / budget) * 100;

  if(percent > 100){
    percent = 100;
  }

  const progressFill =
    document.getElementById("progressFill");

  if(percent >= 100){
    progressFill.style.background = "#ef4444"; // red
  }
  else if(percent >= 80){
    progressFill.style.background = "#f59e0b"; // orange
  }
  else{
    progressFill.style.background = "#2563eb"; // blue
  }

  document.getElementById("progressFill")
    .style.width = percent + "%";

  document.getElementById("progressText")
    .textContent =
    "₱" + totalExpense.toLocaleString() +
    " of ₱" + budget.toLocaleString() +
    " used";
}

function updateBudget(){

  let budget =
    document.getElementById("budgetInput").value;

  if(budget === "") return;

  document.getElementById("budgetDisplay")
    .textContent = "₱" + budget;

  updateBudgetUsage();

  document.getElementById("budgetInput").value = "";
}

let selectedCategory = "Meals";
let selectedEmoji = "🍽️";

function selectCategory(category, emoji, button){

  selectedCategory = category;
  selectedEmoji = emoji;

  document
    .querySelectorAll('.category-btn')
    .forEach(btn => btn.classList.remove('active-category'));

  button.classList.add('active-category');

  updatePreview();
}

function updatePreview(){

  const name =
    document.getElementById('foodName').value ||
    'Food Item';

  const price =
    document.getElementById('price').value || '0';

  const date =
    document.getElementById('expenseDate').value ||
    'Select Date';

  document.getElementById('previewEmoji')
    .textContent = selectedEmoji;

  document.getElementById('previewName')
    .textContent = name;

  document.getElementById('previewCategory')
    .textContent = selectedCategory;

  document.getElementById('previewPrice')
    .textContent = '₱' + price;

  document.getElementById('previewDate')
    .textContent = date;
}

function saveExpense(){

  if(editMode){
    updateExpense();
  }
  else{
    addExpense();
  }

}

function addExpense(){

  const name =
    document.getElementById("foodName").value;

  const price =
    document.getElementById("price").value;

  const date =
    document.getElementById("expenseDate").value;

  if(name === "" || price === "" || date === ""){
    showToast("Please complete all fields", "error");
    return;
  }

  if(price <= 0){
    showToast("Price must be greater than 0", "error");
    return;
  }

  const card = document.createElement("div");

  card.className = "expense-card";

  card.innerHTML = `
    <h3>${selectedEmoji} ${name}</h3>

    <p>Category: ${selectedCategory}</p>

    <p>Date: ${date}</p>

    <div class="price">₱${price}</div>

    <div class="actions">

      <button class="edit"
        onclick="editExpense(this)">
        Edit
      </button>

      <button class="delete"
        onclick="deleteExpense(this)">
        Delete
      </button>

    </div>
  `;

  document
    .getElementById("expenseListContainer")
    .prepend(card);

  updateDashboard();
  updateBudgetUsage();

  updateRecentExpenses();
  addActivity("Added " + name);

  clearForm();

  showToast("Expense added successfully!", "success");

}

function deleteExpense(button){
  deleteTarget = button.closest(".expense-card");
  document.getElementById("confirmModal").style.display = "flex";
}

function confirmDelete(){

  if(!deleteTarget) return;

  const name = deleteTarget.querySelector("h3").textContent;

  deleteTarget.remove();
  deleteTarget = null;

  updateDashboard();
  updateBudgetUsage();
  updateRecentExpenses();
  addActivity("Deleted " + name);

  showToast("Expense deleted successfully!", "success");

  closeModal();
}

function closeModal(){
  document.getElementById("confirmModal").style.display = "none";
  deleteTarget = null;
}


function clearForm(){

  document.getElementById('foodName').value = "";
  document.getElementById('price').value = "";
  document.getElementById('expenseDate').value =
    new Date().toISOString().split("T")[0];

  updatePreview();
}

function filterExpenses(category, button){

  currentFilter = category;

  document
    .querySelectorAll(".filter-buttons button")
    .forEach(btn =>
      btn.classList.remove("active-filter")
    );

  button.classList.add("active-filter");

  searchExpenses();

}

function searchExpenses(){

  const searchValue =
    document.getElementById("searchBox")
      .value
      .toLowerCase();

  const cards =
    document.querySelectorAll(".expense-card");

  let visibleCount = 0;

  cards.forEach(card => {

    const title =
      card.querySelector("h3")
        .textContent
        .toLowerCase();

    const category =
      card.querySelectorAll("p")[0]
        .textContent
        .replace("Category: ","");

    const matchesSearch =
      title.includes(searchValue);

    const matchesCategory =
      currentFilter === "All" ||
      category === currentFilter;

    if(matchesSearch && matchesCategory){
      card.style.display = "block";
      visibleCount++;
    }
    else{
      card.style.display = "none";
    }

  });

  document.getElementById("noResults").style.display =
    visibleCount === 0 ? "block" : "none";
}

function editExpense(button){

  currentCard = button.closest(".expense-card");

  const title =
    currentCard.querySelector("h3").textContent;

  const category =
    currentCard.querySelectorAll("p")[0]
      .textContent
      .replace("Category: ","");

  const date =
    currentCard.querySelectorAll("p")[1]
      .textContent
      .replace("Date: ","");

  const price =
    currentCard.querySelector(".price")
      .textContent
      .replace("₱","");

  document.getElementById("foodName").value =
    title.substring(3);

  document.getElementById("price").value =
    price;

  document.getElementById("expenseDate").value =
    date;

  if(category === "Meals"){
    selectedCategory = "Meals";
    selectedEmoji = "🍽️";
  }
  else if(category === "Drinks"){
    selectedCategory = "Drinks";
    selectedEmoji = "🥤";
  }
  else if(category === "Snacks"){
    selectedCategory = "Snacks";
    selectedEmoji = "🍟";
  }

  document
    .querySelectorAll(".category-btn")
    .forEach(btn => btn.classList.remove("active-category"));

  document
    .querySelectorAll(".category-btn")
    .forEach(btn => {
      if(btn.textContent.includes(category)){
        btn.classList.add("active-category");
      }
    });

  document.getElementById("submitBtn")
    .textContent = "Update Expense";

  document.getElementById("cancelEditBtn")
    .style.display = "block";

  editMode = true;

  updatePreview();

  const addBtn = document.querySelectorAll(".nav-btn")[1];
  showPage("addExpense", addBtn);
}

function cancelEdit(){

  resetEditState();

  clearForm();

  showToast("Edit cancelled", "success");

  const listBtn = document.querySelectorAll(".nav-btn")[2];
  showPage("expenseList", listBtn);
}

function updateExpense(){

  const name =
    document.getElementById("foodName").value;

  const price =
    document.getElementById("price").value;

  const date =
    document.getElementById("expenseDate").value;

  if(name === "" || price === "" || date === ""){
    showToast("Please complete all fields", "error");
    return;
  }

  if(price <= 0){
    showToast("Price must be greater than 0", "error");
    return;
  }

  currentCard.querySelector("h3")
    .textContent =
    selectedEmoji + " " + name;

  currentCard.querySelectorAll("p")[0]
    .textContent =
    "Category: " + selectedCategory;

  currentCard.querySelectorAll("p")[1]
    .textContent =
    "Date: " + date;

  currentCard.querySelector(".price")
    .textContent =
    "₱" + price;
  
  updateDashboard();
  updateBudgetUsage();

  updateRecentExpenses();
  addActivity("Updated " + name);

  resetEditState();

  clearForm();
  showToast("Expense updated successfully!", "success");

  // ONLY THIS handles page switching properly
  const listBtn = document.querySelectorAll(".nav-btn")[2];
  showPage("expenseList", listBtn);
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.className = "toast show " + type;

  let icon = type === "success" ? "✔" : "⚠";

  toast.innerHTML = `<span>${icon}</span> ${message}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000); 
}

function updateRecentExpenses(){

  const container =
    document.getElementById("recentExpenses");

  const cards =
    document.querySelectorAll(".expense-card");

  container.innerHTML = "";

  let count = 0;

  cards.forEach(card => {

    if(count >= 5) return;

    const name =
      card.querySelector("h3").textContent;

    const price =
      card.querySelector(".price").textContent;

    container.innerHTML += `
      <div class="recent-item">
        <span>${name}</span>
        <strong>${price}</strong>
      </div>
    `;

    count++;

  });

}

function resetEditState(){
  editMode = false;
  currentCard = null;

  document.getElementById("submitBtn").textContent = "Add Expense";
  document.getElementById("cancelEditBtn").style.display = "none";
}

function addActivity(text){

  activities.unshift(text);

  if(activities.length > 5){
    activities.pop();
  }

  const container =
    document.getElementById("activityList");

  container.innerHTML = "";

  activities.forEach(item => {  

    const icon =
      item.includes("Added") ? "🟢" :
      item.includes("Deleted") ? "🔴" :
      item.includes("Updated") ? "🟡" :
      "📌";

    container.innerHTML += `
      <div class="activity-item">
        <span class="activity-icon">${icon}</span>
        <span class="activity-text">${item}</span>
      </div>
    `;

  });

}

updateDashboard();
updateRecentExpenses();
updateBudgetUsage();

document.getElementById("expenseDate").value =
  new Date().toISOString().split("T")[0];