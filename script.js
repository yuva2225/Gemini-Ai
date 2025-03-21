const container = document.querySelector('.container')
const chatContainer = document.querySelector('.chats-container')
const promptForm = document.querySelector('.prompt-form')
const promptInput = document.querySelector('.prompt-input')
const themeToggle = document.querySelector('#theme-toggle-btn')

//API Setup
const API_KEY = "AIzaSyAkmFYBAmaZdJJDKdSdQ8aVAPb9wpPNy6E";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

let userMessage = "";
const chatHistory = []

//Function to Create message elements
const createMsgElement = (content,...classes) => {
    const div = document.createElement("div");
    div.classList.add("message",...classes)
    div.innerHTML = content;
    return div;
}

//Scroll to the bottom of the container
const scrollToBottom  = () => container.scrollTo({top: container.scrollHeight, behavior: "smooth" })

//Simulate typing effect for bot response
const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent=""
    const words = text.split(" ");
    let wordIndex=0

    //Set an interval to type each word
    const typingInterval = setInterval(()=>{
        if(wordIndex<words.length)
        {
            textElement.textContent+=(wordIndex===0 ? "":" ") + words[wordIndex++];
            botMsgDiv.classList.remove("loading")
            scrollToBottom();
        }
        else
        {
            clearInterval(typingInterval)
        }
    }, 40)
}

// Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv) => {

    const textElement = botMsgDiv.querySelector('.message-text')


    //Add user message to the chat history
    chatHistory.push({
        role: "user",
        parts: [{text:userMessage}],
    });

    try{
        const response = await fetch(API_URL,{
            method: "POST",
            header: {"Content-Type":"application/json"},
            body: JSON.stringify({contents: chatHistory})
        });

        const data = await response.json()
        if(!response.ok) throw new Error(data.error.message);
        
        //Process the response text and display with typing effect
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g,"$1").trim();
        typingEffect(responseText, textElement, botMsgDiv)
    } catch(error) {
        console.log(error)
    }
}

//Handle the form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage) return;

    promptInput.value = "";
    document.body.classList.add("chats-active")

    // Generate user message HTML and Add in the chats container
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML,"user-message")

    userMsgDiv.querySelector('.message-text').textContent = userMessage;
    chatContainer.appendChild(userMsgDiv)
    scrollToBottom()

    setTimeout(()=>{
        // Generate bot message HTML and Add in the chats container in 600ms
    const botMsgHTML = `<img src="gemini-chatbot-logo.svg"  class="avatar"><p class="message-text">Just a sec...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML,"bot-message", "loading")
    chatContainer.appendChild(botMsgDiv)
    scrollToBottom()
    generateResponse(botMsgDiv)
    },600)
}

document.querySelectorAll('.suggestions-item').forEach(item => {
    item.addEventListener('click', () =>{
        promptInput.value = item.querySelector(".text").textContent;
        promptForm.dispatchEvent(new Event("submit"))
    })
})

//Toggle dark/light theme
themeToggle.addEventListener('click', () => {
    const isLightTheme = document.body.classList.toggle('light-theme')
    localStorage.setItem("themeColor", isLightTheme? "light_mode" : "dark_mode")
    themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode"
});

//Set initial theme from local storage
const isLightTheme = localStorage.getItem("themeColor") === "light_mode"
document.body.classList.toggle('light-theme', isLightTheme)
themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode"

promptForm.addEventListener("submit",handleFormSubmit)
