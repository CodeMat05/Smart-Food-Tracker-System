let editMode = false;
let currentCard = null;

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
    .textContent = "₱" + total;

  document.getElementById("expenseCount")
    .textContent = cards.length;

  document.getElementById("todaySpending")
    .textContent = "₱" + today;
}

function updateBudget(){

  let budget =
    document.getElementById("budgetInput").value;

  if(budget === "" || budget <= 0) return;

  document.getElementById("budgetDisplay")
    .innerText = "₱" + budget;

  let totalExpense = 0;

  document
    .querySelectorAll(".expense-card")
    .forEach(card => {

      const price = Number(
        card.querySelector(".price")
          .textContent.replace("₱","")
      );

      totalExpense += price;
    });

  let remaining = budget - totalExpense;

  document.getElementById("remainingBudget")
    .innerText = "₱" + remaining;

  let percent =
    (totalExpense / budget) * 100;

  if(percent > 100){
    percent = 100;
  }

  document.getElementById("progressFill")
    .style.width = percent + "%";

  document.getElementById("progressText")
    .innerText =
    "₱" + totalExpense + " of ₱" + budget + " used";

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

  clearForm();

  showToast("Expense added successfully!", "success");

}

function clearForm(){

  document.getElementById('foodName').value = "";
  document.getElementById('price').value = "";
  document.getElementById('expenseDate').value = "";

  updatePreview();
}

function filterExpenses(category){

  const cards =
    document.querySelectorAll(".expense-card");

  cards.forEach(card => {

    const cardCategory =
      card.querySelectorAll("p")[0]
      .textContent
      .replace("Category: ","");

    if(category === "All"){
      card.style.display = "block";
    }
    else if(cardCategory === category){
      card.style.display = "block";
    }
    else{
      card.style.display = "none";
    }

  });

}

function searchExpenses(){

  const searchValue =
    document.getElementById("searchBox")
      .value
      .toLowerCase();

  const cards =
    document.querySelectorAll(".expense-card");

  cards.forEach(card => {

    const title =
      card.querySelector("h3")
        .textContent
        .toLowerCase();

    if(title.includes(searchValue)){
      card.style.display = "block";
    }
    else{
      card.style.display = "none";
    }

  });

}

function deleteExpense(button){

  const card = button.closest(".expense-card");
  const itemName = card.querySelector("h3").textContent;

  card.remove();

  updateDashboard();

  showToast(itemName + " deleted successfully!", "success");

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

  editMode = true;

  updatePreview();

  document
    .getElementById("addExpense")
    .classList.add("active");

  document
    .getElementById("expenseList")
    .classList.remove("active");
}

function updateExpense(){

  const name =
    document.getElementById("foodName").value;

  const price =
    document.getElementById("price").value;

  const date =
    document.getElementById("expenseDate").value;

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

  editMode = false;
  currentCard = null;

  document.getElementById("submitBtn").textContent = "Add Expense";

  clearForm();

  showToast("Expense updated successfully!", "success");

  document.querySelectorAll(".page")
  .forEach(page => page.classList.remove("active"));

  document.getElementById("expenseList")
    .classList.add("active");

  document.querySelectorAll(".nav-btn")
    .forEach(btn => btn.classList.remove("active"));

  document.querySelectorAll(".nav-btn")[2]
    .classList.add("active");
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

updateDashboard();