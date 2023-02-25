import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const chatHistoryButton = document.querySelector('#chat_history_button');
const chatHistoryContainer = document.querySelector('#chat_history_container');
let chatHistoryCount = 0;
let chatHistory = [];

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
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

function chatStripe(isAi, value, uniqueId) {
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

  if (promptValue.toLowerCase() === 'what is your name' || promptValue.toLowerCase() === 'tell me your name') {
    chatContainer.innerHTML += chatStripe(true, "My name is Pinto! How can I assist you?", generateUniqueId());

    form.reset();

  } else {
    // user's chatstripe
    const userChatStripe = chatStripe(false, promptValue, generateUniqueId());
    chatContainer.innerHTML += userChatStripe;
    form.reset();

    // Add user's chat stripe to chat history
    chatHistory.push(userChatStripe);
    chatHistoryCount++;

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

      // bot's chatstripe
      const botChatStripe = chatStripe(true, parsedData, generateUniqueId());
      chatContainer.innerHTML += botChatStripe;

      // Add bot's chat stripe to chat history
      chatHistory.push(botChatStripe);
      chatHistoryCount++;

      typeText(messageDiv, parsedData);
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

// Function to save chat message history to local storage
function saveChatHistory() {
    const chatHistoryList = document.querySelector('#chat-history-list');
    const chatHistoryItems = chatHistoryList.querySelectorAll('li');
    const chatHistory = [];
  
    // Iterate through the chat history items and add them to the chatHistory array
    chatHistoryItems.forEach(item => {
      chatHistory.push(item.innerText);
    });
  
    // Save the chat history array to local storage as a string
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }
  
  // Function to start a new chat window
  function startNewChat() {
    // Save the chat history before clearing the chat container
    saveChatHistory();
  
    const chatContainer = document.querySelector('#chat_container');
    chatContainer.innerHTML = '';
  }
  
  // Other functions and code...


const historyBtn = document.getElementById('history-btn');

historyBtn.addEventListener('click', () => {
  // get chat history from localStorage
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory'));
  
  // check if chat history exists
  if (chatHistory && chatHistory.length > 0) {
    // create chat history HTML
    const chatHistoryHtml = chatHistory.map(chat => {
      return chatStripe(chat.isAi, chat.value, chat.id);
    }).join('');
    
    // display chat history in chat container
    chatContainer.innerHTML = chatHistoryHtml;
  } else {
    alert('No chat history available');
  }
});

const deleteChatHistory = () => {
    localStorage.removeItem('chatHistory');
    const chatContainer = document.getElementById('chat_container');
    chatContainer.innerHTML = '';
    alert('Chat history deleted');
  }
  
  const deleteHistoryBtn = document.getElementById('delete-history-btn');
  deleteHistoryBtn.addEventListener('click', deleteChatHistory);
  