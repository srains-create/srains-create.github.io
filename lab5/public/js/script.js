document.querySelectorAll(".author-link").forEach(link => {
    link.addEventListener("click", getAuthorInfo);
});

async function getAuthorInfo(event) {
    event.preventDefault();
    const authorModal = new bootstrap.Modal(
        document.getElementById("authorModal")
    );

    authorModal.show();

    const authorId = event.currentTarget.id;

    try {
        const response = await fetch(`/api/author/${authorId}`);
        const authors = await response.json();

        const author = authors[0];
        const authorInfo = document.querySelector("#authorInfo");

        // Format the dates
        const dob = new Date(author.dob).toLocaleDateString();

        const dod = author.dod
            ? new Date(author.dod).toLocaleDateString()
            : "N/A";

        authorInfo.innerHTML = `
            <hr>
            <h2>${author.firstName} ${author.lastName}</h2>

            <img
                src="${author.portrait}"
                alt="${author.firstName} ${author.lastName}"
                width="180"
            >

            <p><strong>Profession:</strong> ${author.profession}</p>
            <p><strong>Country:</strong> ${author.country}</p>
            <p><strong>Date of birth:</strong> ${dob}</p>
            <p><strong>Date of death:</strong> ${dod}</p>
            <p><strong>Biography:</strong> ${author.biography}</p>
        `;
    } catch (error) {
        console.error("Unable to retrieve author:", error);
    }
}