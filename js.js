"use strict";

import { getBloodStatus } from "./blood.js";

const studentDataUrl = "https://petlatkea.dk/2021/hogwarts/students.json";

let allStudents = [];
let expelledStudents = [];
let allStudentsCopy = [];

// counter variables
let allStudentsCounter = 0;
let expelledStudentsCounter = 0;
let displayedStudentsCounter = 0;

const allStudentsCounterElement = document.querySelector("#count-all-students");
const expelledStudentsCounterElement = document.querySelector("#count-expelled-students");
const displayedStudentsCounterElement = document.querySelector("#count-displayed-students");

document.addEventListener("DOMContentLoaded", loadPage);

const Student = {
  firstname: "",
  middlename: "",
  lastname: "",
  nickname: "",
  image: "",
  blood: "",
  house: "",
  iqsquad: false,
  prefect: false,
  expelled: false,
  gender: "",
};

const settings = {
  filter: "all",
  sortBy: "firstname",
  sortDir: "desc",
};

// Toggles between the lists of students and expelled students
function toggleStudents() {
  let allStudents = document.getElementById("allstudents");
  let expelledStudents = document.getElementById("expelledstudents");
  let toggleButton = document.getElementById("togglebutton");

  if (allStudents.style.display === "none") {
    allStudents.style.display = "block";
    expelledStudents.style.display = "none";
    toggleButton.textContent = "Show expelled students";
  } else {
    allStudents.style.display = "none";
    expelledStudents.style.display = "block";
    toggleButton.textContent = "Show all students";
  }
}

// Loads the page
function loadPage() {
  console.log("Page loaded");

  // Gives eventlisteners on all the buttons

  document.getElementById("search-button").addEventListener("click", searchStudents);
  document.getElementById("reset-button").addEventListener("click", resetStudents);
  document.getElementById("togglebutton").addEventListener("click", toggleStudents);
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));

  loadJSON(studentDataUrl);
}

// Loads the Json and prepares the data for the following functions---------------------------
function loadJSON() {
  fetch(studentDataUrl)
    .then((response) => response.json())
    .then((jsonData) => {
      prepareObjects(jsonData);
    });

  // Shows the array with all the students in the console
  console.log(allStudents);
}

function prepareObjects(jsonData) {
  allStudents = jsonData.map(prepareObject);

  buildList();
}
// setup
function prepareObject(jsonObject) {
  // Creates a const with the name student card that contains all the information from the Object
  const studentCard = Object.create(Student);

  // Trims the fullName string
  let fullnameTrim = jsonObject.fullname.trim().split(" ");

  studentCard.firstname = getFirstname(fullnameTrim);
  studentCard.middlename = getMiddlename(fullnameTrim);
  studentCard.nickname = getNickname(fullnameTrim);
  studentCard.lastname = getLastname(fullnameTrim);
  studentCard.image = getStudentImage(fullnameTrim);
  studentCard.house = getStudentHouse(jsonObject);
  studentCard.gender = getStudentGender(jsonObject);
  studentCard.blood = getBloodStatus(studentCard.lastname);

  return studentCard;
}
// Gets the firstname
function getFirstname(studentName) {
  return `${studentName[0].charAt(0).toUpperCase()}${studentName[0].slice(1).toLowerCase()}`;
}

// Gets the middlename
function getMiddlename(studentName) {
  if (studentName.length <= 2) {
    return `N/a`;
  } else {
    if (studentName[1].includes(`"`) === true) {
      return `N/a`;
    } else {
      return `${studentName[1].charAt(0).toUpperCase()}${studentName[1].slice(1).toLowerCase()}`;
    }
  }
}

// Gets the nickname
function getNickname(studentName) {
  if (studentName.length === 1) {
    return `N/a`;
  } else if (studentName.length > 1) {
    if (studentName[1].includes(`"`) !== true) {
      return `N/a`;
    } else {
      return `${studentName[1].substring(1, 2).toUpperCase()}${studentName[1].substring(2, studentName[1].lastIndexOf('"')).toLowerCase()}`;
    }
  }
}

// Gets the lastname
function getLastname(studentName) {
  if (studentName.length === 1) {
    return `N/a`;
  } else {
    if (studentName[1].includes("-")) {
      let sepLastName = studentName[1].split("-");
      return `${sepLastName[0].charAt(0).toUpperCase()}${sepLastName[0].slice(1).toLowerCase()}-${sepLastName[1].charAt(0).toUpperCase()}${sepLastName[1].slice(1).toLowerCase()}`;
    } else {
      const trimName = studentName[studentName.length - 1];
      return `${trimName.charAt(0).toUpperCase()}${trimName.slice(1).toLowerCase()}`;
    }
  }
}

// Gets the student image
function getStudentImage(studentName) {
  let trimName = studentName[studentName.length - 1];
  if (studentName.length === 1) {
    return ``;
  } else if (studentName[1] === "Patil") {
    return `${trimName.toLowerCase()}_${studentName[0].toLowerCase()}.png`;
  } else {
    if (studentName[1].includes("-")) {
      let sepName = trimName.split("-");
      return `${sepName[sepName.length - 1].toLowerCase()}_${studentName[0].charAt(0).toLowerCase()}.png`;
    } else {
      //Last name fix
      return `${trimName.toLowerCase()}_${studentName[0].charAt(0).toLowerCase()}.png`;
    }
  }
}

// Gets the house
function getStudentHouse(person) {
  const houseTrim = person.house.trim();
  return `${houseTrim.charAt(0).toUpperCase()}${houseTrim.slice(1).toLowerCase()}`;
}
function getStudentGender(person) {
  const genderTrim = person.gender.trim();
  // return `${genderTrim.charAt(0).toUpperCase()}${genderTrim.slice(1).toLowerCase()}`;
  return genderTrim;
}

// FILTERING ------------------------------------->
// Controls the filter functions
const filterFunctions = {
  gryffindor: (studentCard) => studentCard.house === "Gryffindor",
  hufflepuff: (studentCard) => studentCard.house === "Hufflepuff",
  ravenclaw: (studentCard) => studentCard.house === "Ravenclaw",
  slytherin: (studentCard) => studentCard.house === "Slytherin",
  prefect: (studentCard) => studentCard.prefect === true,
  iqsquad: (studentCard) => studentCard.iqSquad === true,
  girl: (studentCard) => studentCard.gender === "girl",
  boy: (studentCard) => studentCard.gender === "boy",
  pureblood: (studentCard) => studentCard.blood === "Pure-Blood",
  halfblood: (studentCard) => studentCard.blood === "Half-Blood",
  muggleborn: (studentCard) => studentCard.blood === "Muggle-Born",
};

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`selectFilter() User selected ${filter}`);

  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  console.log("setFilter() is running");
  buildList();
}

function filterList(filteredList) {
  const filterFunction = filterFunctions[settings.filterBy];
  if (filterFunction) {
    console.log(settings.filterBy);
    filteredList = allStudents.filter(filterFunction);
  } else {
    filteredList = allStudents;
  }
  return filteredList;
}

// SORTING ------------------------------------->

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;
  console.log(`user selected ${settings.sortBy} - ${sortDir}`);

  // find old sortby element and remove .sortby
  const oldElement = document.querySelector(`[data-sort= '${settings.sortBy}']`);
  //   console.log("This is sortBy " + sortBy);
  oldElement.classList.remove("sortby");

  // indicate selected sorting direction
  event.target.classList.add("sortby");

  // toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}
function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    settings.direction = 1;
  }
  sortedList = sortedList.sort(sortByProperty);

  // this is a compare function - a function that takes two arguments and then compares them

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

// SEARCHING ------------------------------------->

function searchStudents() {
  // allStudentsCopy hold a copy of allStudents array.
  // Function checks if the copy is empty. If it is a copy is created
  // search is performed on allStudentsCopy.
  // Results are stored in the allStudents array.
  // ! Ensures that the allStudents array can be searched repeadetly. Every search the allStudents array is filtered and updated, while the allStudentsCopy array holds the copy
  const searchTerm = document.getElementById("search-input").value.trim().toLowerCase();

  // if allStudentsCopy is empty, create a copy of allStudents array
  if (allStudentsCopy.length === 0) {
    allStudentsCopy = [...allStudents];
  }

  allStudents = allStudentsCopy.filter((student) => student.firstname.toLowerCase().includes(searchTerm));
  buildList();
  console.log(allStudents);
}

// Resets the list of students back to the allStudents array
function resetStudents() {
  document.getElementById("search-input").value = ""; // clear the search input field
  allStudents = [...allStudentsCopy]; // restore the original unfiltered array
  buildList();
}

// Build the list of students whenever the user filter or sorts. This is the center of the script
function buildList() {
  displayedStudentsCounter = 0;

  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
  updateCounters(currentList);
}

function displayList(allStudents) {
  // empties the content
  document.querySelector("#list tbody").innerHTML = "";

  //  Calls the displayStudent functions for each student
  allStudents.forEach(displayStudent);
}

// Creates the student card/row for each of the students
function displayStudent(studentCard) {
  // Clones the template for each of the students
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // Grabs the data field in the HTML and displays the textcontent from the studentCard property
  clone.querySelector("[data-field=firstname]").textContent = studentCard.firstname;
  clone.querySelector("[data-field=lastname]").textContent = studentCard.lastname;
  clone.querySelector("[data-field=house]").textContent = studentCard.house;
  clone.querySelector("#studentImage").src = `images/${studentCard.image}`;

  if (studentCard.image === ``) {
    clone.querySelector("#studentImage").src = `nopic.png`;
  }

  // show more button popup
  clone.querySelector("[data-field='showMore']").addEventListener("click", () => {
    popUp(studentCard);
  });

  //   clone blood
  // clone.querySelector("[data-field=blood]").textContent = studentCard.blood;

  // Assign prefect
  clone.querySelector("[data-field=prefect]").dataset.prefect = studentCard.prefect;
  clone.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);

  // count students
  const studentCounted = studentCounter(studentCard);
  displayCount(studentCounted);

  // Expelled function.
  clone.querySelector("[data-field=expelled]").addEventListener("click", function () {
    document.querySelector("#removestudent").classList.remove("hide");
    document.querySelector("#removestudent .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#removestudent #yes").addEventListener("click", expelStudent);
    document.querySelector("#removestudent #no").addEventListener("click", closeDialog);
    document.querySelector("#expelled_student_name").textContent = `You are about to expel ${studentCard.firstname} ${studentCard.lastname}. Is this correct?`;

    // Find the index of the student in the allStudents array
    const index = allStudents.findIndex((student) => student.firstname === studentCard.firstname);

    // Remove the student from the allStudents array and add them to the expelledStudents array
    const expelledStudent = allStudents.splice(index, 1)[0];
    expelledStudents.push(expelledStudent);

    function closeDialog() {
      document.querySelector("#removestudent").classList.add("hide");
      document.querySelector("#removestudent .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#removestudent #yes").removeEventListener("click", expelStudent);
    }
    function expelStudent() {
      closeDialog();
      moveToExpelled(studentCard);
    }
  });

  // inqsquad function.

  clone.querySelector("[data-field=iqsquad]").addEventListener("click", clickIqSquad);

  if (studentCard.iqSquad === true) {
    clone.querySelector("[data-field=iqsquad]").textContent = "🐍";
  } else {
    clone.querySelector("[data-field=iqsquad]").textContent = "⬜️";
  }

  // Check whether the student is from Slytherin or not.
  function clickIqSquad() {
    if (checkStudentHouse(studentCard)) {
      if (studentCard.iqSquad === true) {
        studentCard.iqSquad = false;
      } else {
        studentCard.iqSquad = true;
      }
      buildList();
    } else {
      notASlytherinStudent();
    }
  }
  function notASlytherinStudent() {
    document.querySelector("#onlyslytherin").classList.remove("hide");
    document.querySelector("#onlyslytherin .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#onlyslytherin .filter").addEventListener("click", closeDialog);

    function closeDialog() {
      document.querySelector("#onlyslytherin .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#onlyslytherin .filter").removeEventListener("click", closeDialog);
      document.querySelector("#onlyslytherin").classList.add("hide");
    }
  }

  function clickPrefect() {
    document.querySelector(".student_container [data-field=prefect]").removeEventListener("click", clickPrefect);

    if (studentCard.prefect === true) {
      studentCard.prefect = false;
    } else {
      makeStudentAPrefect(studentCard);
    }
    buildList();
  }
  document.querySelector("#list tbody").appendChild(clone);
}

function checkStudentHouse(student) {
  return student.house === "Slytherin";
}
// Check the house and gender of the selected prefect and returns the value
function checkPrefectLimit(house, gender) {
  let prefectsFromHouse = allStudents.filter((student) => student.house === house && student.prefect);
  let prefectsFromGender = prefectsFromHouse.filter((student) => student.gender === gender);
  return prefectsFromHouse.length < 2 && prefectsFromGender.length < 1;
}

// Makes the selected student a prefect
function makeStudentAPrefect(selectedStudent) {
  const prefects = allStudents.filter((studentCard) => studentCard.prefect);

  // const numberOfPrefects = prefects.length;
  const other = prefects.filter((studentCard) => studentCard.gender === selectedStudent.gender).shift();

  assignPrefect(selectedStudent);
  // Checks the limit for prefects in each house
  function assignPrefect(student) {
    if (checkPrefectLimit(student.house, student.gender)) {
      student.prefect = true;
    } else {
      removeOtherPrefect(other);
    }
  }
  function removeOtherPrefect(other) {
    // if remove other:
    document.querySelector("#remove_other").classList.remove("hide");
    document.querySelector("#remove_other .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_other #removeother").addEventListener("click", clickRemoveOther);
    document.querySelector("#remove_other [data-field=otherprefect]").textContent = `${other.firstname} ${other.lastname} as prefect`;

    function closeDialog() {
      document.querySelector("#remove_other").classList.add("hide");
      document.querySelector("#remove_other .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_other #removeother").removeEventListener("click", clickRemoveOther);
    }
    function clickRemoveOther() {
      removePrefect(other);
      assignPrefect(selectedStudent);
      buildList();
      closeDialog();
    }
  }

  function removePrefect(studentCard) {
    studentCard.prefect = false;
  }
}

function moveToExpelled(studentCard) {
  // Get the template for expelled students
  const template = document.querySelector("#expelledstudent");

  // Clone the template and fill in the fields with the expelled student's data
  const row = template.content.cloneNode(true).querySelector("tr");
  row.querySelector("[data-field='image'] img").src = `images/${studentCard.image}`;
  row.querySelector("[data-field='gender']").textContent = studentCard.gender;
  row.querySelector("[data-field='iqsquad']").textContent = `N/A`;
  row.querySelector("[data-field='prefect']").textContent = `N/A`;
  row.querySelector("[data-field='blood']").textContent = studentCard.blood;
  row.querySelector("[data-field='firstname']").textContent = studentCard.firstname;
  row.querySelector("[data-field='nickname']").textContent = studentCard.nickname;
  row.querySelector("[data-field='middlename']").textContent = studentCard.middlename;
  row.querySelector("[data-field='lastname']").textContent = studentCard.lastname;
  row.querySelector("[data-field='house']").textContent = studentCard.house;

  // Add the new row to the table
  const tbody = document.querySelector("#expelledlist tbody");
  tbody.appendChild(row);
  //   console.log(allStudents);
  //   console.log(expelledStudents);
  buildList();
}

// // count students

function updateCounters(currentList) {
  allStudentsCounter = allStudents.length;
  allStudentsCounterElement.textContent = allStudentsCounter;

  expelledStudentsCounter = expelledStudents.length;
  expelledStudentsCounterElement.textContent = expelledStudentsCounter;

  displayedStudentsCounter = currentList.length;
  displayedStudentsCounterElement.textContent = displayedStudentsCounter;
}

// Counting all the students, their houses, displayed and expelled
function studentCounter() {
  const countStudents = {
    Gryffindor: 0,
    Hufflepuff: 0,
    Ravenclaw: 0,
    Slytherin: 0,
  };

  allStudents.forEach((student) => {
    countStudents[student.house]++;
  });

  return countStudents;
}

function displayCount(studentCounted) {
  document.querySelector("#count-gryf-students").textContent = studentCounted.Gryffindor;
  document.querySelector("#count-huff-students").textContent = studentCounted.Hufflepuff;
  document.querySelector("#count-rave-students").textContent = studentCounted.Ravenclaw;
  document.querySelector("#count-slyt-students").textContent = studentCounted.Slytherin;
}

// pop_up

function popUp(studentCard) {
  console.log(studentCard);
  const popup = document.querySelector("#pop_up");
  popup.classList.remove("hide");

  const htmlPage = document.querySelector("main");
  htmlPage.classList.add("blur");

  popup.querySelector("#image").src = `images/${studentCard.image}`;

  popup.querySelector("[data-field=firstname]").textContent = `${studentCard.firstname}`;
  popup.querySelector("[data-field=middlename]").textContent = `${studentCard.middlename}`;
  popup.querySelector("[data-field=nickname").textContent = `${studentCard.nickname}`;
  popup.querySelector("[data-field=lastname]").textContent = `${studentCard.lastname}`;
  popup.querySelector("[data-field=gender").textContent = `${studentCard.gender}`;
  popup.querySelector("[data-field=house]").textContent = `${studentCard.house}`;
  popup.querySelector("[data-field=blood]").textContent = `${studentCard.blood}`;

  // House crests

  const crestImg = document.querySelector("#pop_up .crest_img");
  const background = document.querySelector(".content");
  if (studentCard.house === "Gryffindor") {
    crestImg.src = "house_crests/Gryffindor.svg";
    background.classList.add("color-gryf");
  }
  if (studentCard.house === "Slytherin") {
    crestImg.src = "house_crests/Slytherin.svg";
    background.classList.add("color-slyt");
  }
  if (studentCard.house === "Ravenclaw") {
    crestImg.src = "house_crests/Ravenclaw.svg";
    background.classList.add("color-rave");
  }
  if (studentCard.house === "Hufflepuff") {
    crestImg.src = "house_crests/Huffelpuff.svg";
    background.classList.add("color-huff");
  }

  if (studentCard.middlename === `N/a`) {
    popup.querySelector("[data-field=fullname]").textContent = `${studentCard.firstname} ${studentCard.lastname}`;
  } else {
    popup.querySelector("[data-field=fullname]").textContent = `${studentCard.firstname} ${studentCard.middlename} ${studentCard.lastname}`;
  }

  // expelling from pop up
  popup.querySelector("[data-field=expelled]").addEventListener("click", function () {
    const expelBtn = popup.querySelector("#expel_btn");
    if (studentCard.expelled === false) {
      expelBtn.textContent = "Expelled";
      expelStudent();
      expelBtn.classList.add("expelBtn");
    }

    function expelStudent() {
      moveToExpelled(studentCard);
      // updateCounters(currentList);
    }
  });

  // assigning to prefect from popup

  const prefectBtn = popup.querySelector("#prefect_btn");

  if (studentCard.prefect === true) {
    prefectBtn.textContent = "Prefect";
    prefectBtn.classList.add("prefectBtn");
  } else {
    prefectBtn.textContent = "Make prefect";
    prefectBtn.classList.remove("prefectBtn");
    buildList();
    popup.querySelector("#prefect_btn").addEventListener("click", function () {
      makeStudentAPrefect(studentCard);
      if (studentCard.prefect === true) {
        prefectBtn.textContent = "Prefect";
        prefectBtn.classList.add("prefectBtn");
      }
      buildList();
    });
  }

  // assigning to squad from popup
  const squadBtn = popup.querySelector("#squad_btn");

  if (studentCard.iqSquad === true) {
    squadBtn.textContent = "Squad-member";
    squadBtn.classList.add("squadBtn");
  } else {
    squadBtn.textContent = "Join Squad";
    squadBtn.classList.remove("squadBtn");
    popup.querySelector("#squad_btn").addEventListener("click", function () {
      squadBtn.textContent = "Squad-member";
      squadBtn.classList.add("squadBtn");

      buildList();
    });
  }

  // closing
  document.querySelector(".close").addEventListener("click", closePopUp);

  function closePopUp() {
    document.querySelector("#pop_up").classList.add("hide");
    document.querySelector("main").classList.remove("blur");
    document.querySelector("#pop_up .close").removeEventListener("click", closePopUp);
    buildList();
  }
}

// HACKING ------------------------------------------------------------------------->
const dobbyBtn = document.getElementById("dobby_hack");

setTimeout(() => {
  dobbyBtn.classList.remove("hide");
  dobbyBtn.classList.add("fly_animate");
  dobbyBtn.addEventListener("click", hackTheSystem);
}, 100);

function hackTheSystem() {
  console.log("hackTheSystem");
  dobbyBtn.classList.remove("fly_animate");

  setTimeout(hackStudentList, 2500);

  hackBlood();
  const hacker = createHacker();
  allStudents.push(hacker);
  buildList();
}

function hackStudentList() {
  document.querySelector("h1").textContent = "I solemnly swear I am up to NO good!";
  document.querySelector("*").classList.add("invert");
  dobbyBtn.removeEventListener("click", hackTheSystem);
}

function createHacker() {
  const hacker = Object.create(allStudents);
  hacker.firstname = "Felicia";
  hacker.lastname = "Hetman";
  hacker.middlename = "Eliza";
  hacker.nickname = `"Hacker"`;
  hacker.gender = "girl";
  hacker.image = "felicia_hacker.png";
  hacker.house = "Owner of Hogwarts";
  hacker.blood = "Pure";
  hacker.hacker = true;

  return hacker;
}

function hackBlood() {
  allStudents.forEach((student) => {
    const randomNumber = Math.floor(Math.random() * 3);
    const randomBloodArr = ["muggle", "half", "pure"];

    if (student.blood === "half" || student.blood === "muggle") {
      student.blood = "pure";
    } else if (student.blood === "pure") {
      student.blood = randomBloodArr[randomNumber];
    }
  });
}
