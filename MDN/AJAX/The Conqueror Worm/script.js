window.onload=function() {
    const verseChoose = document.querySelector("select");
    const poemDisplay = document.querySelector("pre");

    updateDisplay("Verse 1");
    verseChoose.value = "Verse 1";

    verseChoose.addEventListener("change", () => {
        const verse = verseChoose.value;
        updateDisplay(verse);
    });

    function updateDisplay(verse) {
        verse = verse.replace(" ", "").toLowerCase()
        const url = `${verse}.txt`
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    console.log(response)
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.text();
            }).then((text) => {
            poemDisplay.textContent = text;
        }).catch((error) => {
            poemDisplay.textContent = `Could not fetch verse: ${error}`;
        });
    }

}