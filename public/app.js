
const promptInput = document.getElementById("prompt");
const styleInput = document.getElementById("style");
const ratioInput = document.getElementById("aspectRatio");
const generateButton = document.getElementById("generateBtn");
const statusText = document.getElementById("status");
const resultImage = document.getElementById("resultImage");
const downloadButton = document.getElementById("downloadBtn");

generateButton.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    statusText.textContent = "Please describe your cartoon first.";
    promptInput.focus();
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "Creating your cartoon...";
  statusText.textContent = "AI is creating your cartoon. Please wait...";

  resultImage.style.display = "none";
  downloadButton.style.display = "none";

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        style: styleInput.value,
        aspectRatio: ratioInput.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Image generation failed.");
    }

    if (!data.image) {
      throw new Error("No image was returned by the server.");
    }

    resultImage.onload = () => {
      resultImage.style.display = "block";
      downloadButton.href = data.image;
      downloadButton.style.display = "inline-block";
      statusText.textContent = "Your cartoon is ready!";
    };

    resultImage.onerror = () => {
      statusText.textContent = "The generated image could not be displayed.";
    };

    resultImage.src = data.image;

  } catch (error) {
    statusText.textContent = "Error: " + error.message;
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "✨ Generate Cartoon";
  }
});
