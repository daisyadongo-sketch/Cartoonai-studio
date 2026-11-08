
const promptInput = document.getElementById("prompt");
const styleInput = document.getElementById("style");
const ratioInput = document.getElementById("aspectRatio");
const generateBtn = document.getElementById("generateBtn");
const statusText = document.getElementById("status");
const resultImage = document.getElementById("resultImage");
const downloadBtn = document.getElementById("downloadBtn");

generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    statusText.textContent = "Please describe the cartoon you want.";
    return;
  }

  generateBtn.disabled = true;
  statusText.textContent = "Creating your cartoon. Please wait...";
  resultImage.style.display = "none";
  downloadBtn.style.display = "none";

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        style: styleInput.value,
        aspectRatio: ratioInput.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Image generation failed.");
    }

    resultImage.src = data.image.startsWith("data:")
      ? data.image
      : `data:image/png;base64,${data.image}`;

    resultImage.style.display = "block";
    downloadBtn.href = resultImage.src;
    downloadBtn.style.display = "inline-block";

    statusText.textContent = "Your cartoon is ready!";
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    generateBtn.disabled = false;
  }
});
