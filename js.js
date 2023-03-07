"use strict";

import { getBloodStatus } from "./blood.js";

const studentDataUrl = "https://petlatkea.dk/2021/hogwarts/students.json";

let allStudents = [];
let expelledStudents = [];
let allStudentsCopy = [];
let studentBloodStatus = [];
let pureBloods = [];
let halfBloods = [];

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
// Controls the filter functions
const filterFunctions = {
  gryffindor: (studentCard) => studentCard.house === "Gryffindor",
  hufflepuff: (studentCard) => studentCard.house === "Hufflepuff",
  ravenclaw: (studentCard) => studentCard.house === "Ravenclaw",
  slytherin: (studentCard) => studentCard.house === "Slytherin",
  prefect: (studentCard) => studentCard.prefect === true,
  iqsquad: (studentCard) => studentCard.iqSquad === true,
  pureblood: (studentCard) => studentCard.blood === "Pure Blood",
  halfblood: (studentCard) => studentCard.blood === "Half Blood",
  muggleborn: (studentCard) => studentCard.blood === "Muggle Born",
};

// controls the sorting and filter settings
const settings = {
  filter: "all",
  sortBy: "firstname",
  sortDir: "desc",
};
// Loads the page
function loadPage() {
  console.log("Page loaded");
  registerButtons();

  loadJSON(studentDataUrl);
}
// Gives eventlisteners on all the buttons
function registerButtons() {
  document.getElementById("search-button").addEventListener("click", searchStudents);
  document.getElementById("reset-button").addEventListener("click", resetStudents);
  document.getElementById("togglebutton").addEventListener("click", toggleStudents);
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));

  //   console.log("buttons ready");
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
  return `${genderTrim.charAt(0).toUpperCase()}${genderTrim.slice(1).toLowerCase()}`;
}

// Search function
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
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);
  displayList(sortedList);
}

// Clears the html and displays the list-----------------------------------
function displayList(allStudents) {
  // Grabs the id="list" and the tbody element from the HTML and empties the content
  document.querySelector("#list tbody").innerHTML = "";

  //  Runs the displayStudent functions for each of the data entries in the Json file
  allStudents.forEach(displayStudent);
}

// Creates the student card/row for each of the students
function displayStudent(studentCard) {
  // Clones the template for each of the students
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // Grabs the firstname data field in the HTML and displays the textcontent from the studentCard firstname property
  clone.querySelector("[data-field=firstname]").textContent = studentCard.firstname;
  clone.querySelector("[data-field=nickname]").textContent = studentCard.nickname;
  clone.querySelector("[data-field=middlename]").textContent = studentCard.middlename;
  clone.querySelector("[data-field=lastname]").textContent = studentCard.lastname;
  clone.querySelector("[data-field=house]").textContent = studentCard.house;
  clone.querySelector("[data-field=gender]").textContent = studentCard.gender;
  clone.querySelector("#studentImage").src = `images/${studentCard.image}`;

  //   clone blood
  clone.querySelector("[data-field=bloodtype]").textContent = studentCard.blood;

  // Assign prefect
  clone.querySelector("[data-field=prefect]").dataset.prefect = studentCard.prefect;
  clone.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);

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
  console.log(student.house);
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
    if (checkPrefectLimit(student.house, student.gender, student.firstname, student.lastname)) {
      student.prefect = true;
      // removePrefectAOrPrefectB(prefects[0], prefects[1]);
    } else {
      // removePrefectAOrPrefectB(prefects[0], prefects[1]);
      removeOtherPrefect(other);
    }
  }
  function removeOtherPrefect(other) {
    // if ignore - do nothing

    // if remove other:
    document.querySelector("#remove_other").classList.remove("hide");
    document.querySelector("#remove_other .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_other #removeother").addEventListener("click", clickRemoveOther);
    document.querySelector("#remove_other [data-field=otherprefect]").textContent = `${other.firstname} ${other.lastname} as prefect`;
    // removePrefect(other);
    // assignPrefect(selectedStudent);

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
    // Ask the user to remove or ignore the other
  }

  function removePrefectAOrPrefectB(prefectA, prefectB) {
    document.querySelector("#remove_aorb").classList.remove("hide");
    document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb #removea").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb #removeb").addEventListener("click", clickRemoveB);

    // Show names on buttons
    document.querySelector("#remove_aorb [data-field=winnerA]").textContent = winnerA.name;
    document.querySelector("#remove_aorb [data-field=winnerB]").textContent = winnerB.name;

    // if ignore - do nothing
    function closeDialog() {
      document.querySelector("#remove_aorb").classList.add("hide");
      document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_aorb #removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb #removeb").removeEventListener("click", clickRemoveB);
    }
    // if removeA
    function clickRemoveA() {
      removePrefect(prefectA);
      assignPrefect(selectedStudent);
      buildList();
      closeDialog();
    }

    // else - if removeB
    function clickRemoveB() {
      removePrefect(prefectB);
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
  row.querySelector("[data-field='bloodtype']").textContent = studentCard.blood;
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
