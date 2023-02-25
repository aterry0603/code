import bot from './assets/bot.svg';
import user from './assets/user.svg';


const chatHistoryButton = document.querySelector('#chat_history_button');
const chatHistoryContainer = document.querySelector('#chat_history_container');
let chatHistoryCount = 0;
let chatHistory = [];

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....'){
            element.textContent = '';
        }
    }, 300)
}

function typeText(element, text){
    let index = 0;

    let interval = setInterval(() => {
        if(index < text.length){
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img
                        src="${isAi ? bot : user}"
                        alt="${isAi ? 'bot' : 'user'}"
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
        `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = new FormData(form);
    const promptValue = data.get('prompt').trim();
  
    if (promptValue.toLowerCase() === 'what is your name' || promptValue.toLowerCase() === 'tell me your name'){
      chatContainer.innerHTML += chatStripe(true, "My name is Pinto! How can I assist you?", generateUniqueId());

      
      form.reset();
      
    } else {
      // user's chatstripe
      chatContainer.innerHTML += chatStripe(false, promptValue, generateUniqueId());
      form.reset();
  
      // bot's chatstripe
      const uniqueId = generateUniqueId();
      chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  
      chatContainer.scrollTop = chatContainer.scrollHeight;
  
      const messageDiv = document.getElementById(uniqueId);
  
      loader(messageDiv);
  
      // fetch data from server -> bot's response
      const response = await fetch('https://pinto-ri0f.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptValue
        })
      })
  
      clearInterval(loadInterval);
      messageDiv.innerHTML = '';
  
      if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();
  
        typeText(messageDiv, parsedData);

       // scroll chat container to the bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
      } else {
        const err = await response.text();
  
        messageDiv.innerHTML = "Something went terribly wrong";
  
        alert(err);
      }
    }
  }
  
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
})


function startNewChat() {
    const chatContainer = document.querySelector('#chat_container');
    chatContainer.innerHTML = '';
    
    // create a new chat window
    const newChatWindow = document.createElement('div');
    newChatWindow.classList.add('chat-window');
    
    // add the new chat window to the chat container
    chatContainer.appendChild(newChatWindow);
    
    // save the new chat window in localStorage
    const timestamp = new Date().getTime();
    localStorage.setItem(timestamp, newChatWindow.outerHTML);
    
    // set the active chat window to the new chat window
    setActiveChatWindow(newChatWindow);
  }

  function retrieveChatHistory() {
    const chatContainer = document.querySelector('#chat_container');
    
    // get all saved chat windows from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // check if the key is a timestamp (to filter out other data saved in localStorage)
      if (!isNaN(key)) {
        const chatWindowHTML = localStorage.getItem(key);
        
        // create a new chat window and add it to the chat container
        const chatWindow = document.createElement('div');
        chatWindow.classList.add('chat-window');
        chatWindow.innerHTML = chatWindowHTML;
        chatContainer.appendChild(chatWindow);
      }
    }
  }

  function deleteChatHistory() {
    const chatContainer = document.querySelector('#chat_container');
    
    // remove all chat windows from the chat container
    while (chatContainer.firstChild) {
      chatContainer.removeChild(chatContainer.firstChild);
    }
    
    // remove all saved chat windows from localStorage
    localStorage.clear();
    
    // show a message to indicate that the chat history has been deleted
    alert('Chat history has been deleted!');
  }
  