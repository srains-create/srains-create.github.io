// Display Question 4 choices when the page loads
displayQ4Choices();

function shuffleArray(array) {

    for (let i = array.length - 1; i > 0; i--) {

        let j = Math.floor(Math.random() * (i + 1));

        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;

    }

}

function displayQ4Choices() {

    let q4ChoicesArray = [
        "Maine",
        "Rhode Island",
        "Maryland",
        "Delaware"
    ];

    shuffleArray(q4ChoicesArray);

    let choicesContainer = document.querySelector("#q4Choices");

    choicesContainer.textContent = "";

    for (let choice of q4ChoicesArray) {

        let input = document.createElement("input");

        input.type = "radio";
        input.name = "q4";
        input.id = choice;
        input.value = choice;

        let label = document.createElement("label");

        label.htmlFor = choice;
        label.textContent = choice;

        choicesContainer.appendChild(input);
        choicesContainer.appendChild(label);
        choicesContainer.appendChild(document.createElement("br"));

    }

}

// Event listener
document.querySelector("button").addEventListener("click", gradeQuiz);

let score = 0;

let attempts = localStorage.getItem("total_attempts");

if (attempts === null) {
    attempts = 0;
} else {
    attempts = Number(attempts);
}

function setMarkImage(index, imageName, altText) {
    let markContainer = document.querySelector(`#markImg${index}`);
    markContainer.textContent = "";

    let img = document.createElement("img");
    img.src = `img/${imageName}`;
    img.alt = altText;
    markContainer.appendChild(img);
}

function rightAnswer(index) {
    let feedback = document.querySelector(`#q${index}Feedback`);
    feedback.textContent = "Correct!";
    feedback.className = "bg-success text-white p-2 rounded";
    setMarkImage(index, "checkmark.png", "Checkmark");
    score += 10;
}

function wrongAnswer(index) {
    let feedback = document.querySelector(`#q${index}Feedback`);
    feedback.textContent = "Incorrect!";
    feedback.className = "bg-warning text-dark p-2 rounded";
    setMarkImage(index, "xmark.png", "X mark");
}

function gradeQuiz() {
    score = 0;

    let q1Response = document.querySelector("#q1").value.toLowerCase().trim();
    let q2Response = document.querySelector("#q2").value;

    if (q1Response === "sacramento") {
        rightAnswer(1);
    } else {
        wrongAnswer(1);
    }

    if (q2Response === "mo") {
        rightAnswer(2);
    } else {
        wrongAnswer(2);
    }

    if (document.querySelector("#Jefferson").checked &&
        document.querySelector("#Roosevelt").checked &&
        !document.querySelector("#Jackson").checked &&
        !document.querySelector("#Franklin").checked) {
        rightAnswer(3);
    } else {
        wrongAnswer(3);
    }

    let selectedQ4 = document.querySelector("input[name=q4]:checked");

    if (selectedQ4 !== null && selectedQ4.value === "Rhode Island") {
        rightAnswer(4);
    } else {
        wrongAnswer(4);
    }

    let selectedQ5 = document.querySelector("input[name=q5]:checked");

    if (selectedQ5 !== null && selectedQ5.value === "Alaska") {
        rightAnswer(5);
    } else {
        wrongAnswer(5);
    }

    let q6Response = document.querySelector("#q6").value.toLowerCase().trim();

    if (q6Response === "arizona") {
        rightAnswer(6);
    } else {
        wrongAnswer(6);
    }

    let q7Response = document.querySelector("#q7").value;

    if (q7Response === "Superior") {
        rightAnswer(7);
    } else {
        wrongAnswer(7);
    }

    if (document.querySelector("#Texas").checked &&
        document.querySelector("#Louisiana").checked &&
        document.querySelector("#Mississippi").checked &&
        document.querySelector("#Alabama").checked &&
        document.querySelector("#Florida").checked &&
        !document.querySelector("#Tennessee").checked) {

        rightAnswer(8);

    } else {

        wrongAnswer(8);

    }

    let q9Response = document.querySelector("#q9").value.toLowerCase().trim();

    if (q9Response === "rio grande") {
        rightAnswer(9);
    } else {
        wrongAnswer(9);
    }

    let selectedQ10 = document.querySelector("input[name=q10]:checked");

    if (selectedQ10 !== null &&
        selectedQ10.value === "Rocky Mountains") {

        rightAnswer(10);

    } else {

        wrongAnswer(10);

    }

    let totalScore = document.querySelector("#totalScore");

    if (score >= 80) {
        totalScore.textContent = `Total Score: ${score} - Great job! You passed!`;
        totalScore.className = "text-success";
    } else {
        totalScore.textContent = `Total Score: ${score} - Keep practicing!`;
        totalScore.className = "text-danger";
    }

    attempts++;

    document.querySelector("#totalAttempts").textContent =
        `Total Attempts: ${attempts}`;

    localStorage.setItem("total_attempts", attempts);
}