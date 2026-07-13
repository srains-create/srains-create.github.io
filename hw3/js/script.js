const form = document.querySelector("#space-form");
const dateInput = document.querySelector("#date-input");
const message = document.querySelector("#message");
const result = document.querySelector("#result");
const title = document.querySelector("#title");
const date = document.querySelector("#date");
const mediaContainer = document.querySelector("#media-container");
const copyright = document.querySelector("#copyright");
const explanation = document.querySelector("#explanation");

const today = new Date().toISOString().split("T")[0];
dateInput.max = today;

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const selectedDate = dateInput.value;

  message.textContent = "";
  result.classList.add("hidden");
  mediaContainer.innerHTML = "";

  if (selectedDate === "") {
    message.textContent = "Please choose a date.";
    return;
  }

  if (selectedDate > today) {
    message.textContent = "Please choose today or an earlier date.";
    return;
  }

  message.textContent = "Searching the galaxy...";

  try {
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${selectedDate}`
    );

    if (!response.ok) {
      throw new Error("NASA data could not be retrieved.");
    }

    const data = await response.json();

    title.textContent = data.title;
    date.textContent = data.date;
    explanation.textContent = data.explanation;

    if (data.copyright) {
      copyright.textContent = `Image credit: ${data.copyright}`;
    } else {
      copyright.textContent = "Image credit: NASA";
    }

    if (data.media_type === "image") {
      const image = document.createElement("img");
      image.src = data.url;
      image.alt = data.title;
      mediaContainer.appendChild(image);
    } else if (data.media_type === "video") {
      const video = document.createElement("iframe");
      video.src = data.url;
      video.title = data.title;
      video.allowFullscreen = true;
      mediaContainer.appendChild(video);
    } else {
      mediaContainer.textContent = "This media type cannot be displayed.";
    }

    message.textContent = "";
    result.classList.remove("hidden");
  } catch (error) {
    message.textContent =
      "Something went wrong while contacting NASA. Please try again.";
    console.error(error);
  }
});