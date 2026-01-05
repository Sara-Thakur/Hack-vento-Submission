
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- 1. CONFIGURATION & VARIABLES ---
const API_KEY = "AIzaSyBEZ9DexknmMyzCY5Ap_lrjjjJ2ffZ3qMg";
const genAI = new GoogleGenerativeAI(API_KEY);

// Sounds
const hitSound = new Audio("https://actions.google.com/sounds/v1/science_fiction/rubble_breaking.ogg");
const winSound = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3");
const errorSound = new Audio("https://actions.google.com/sounds/v1/cartoon/cartoon_cowbell.ogg");
const startSound = new Audio("https://actions.google.com/sounds/v1/science_fiction/alien_beam.ogg");


// DOM Elements
const storyText = document.getElementById('storyText');
const bossHealthBar = document.getElementById('bossHealth');
const bossImg = document.getElementById('bossImg');
const attackBtn = document.getElementById('attackBtn');
const codeArea = document.getElementById('codeArea');
const timerDisplay = document.getElementById('timer');
const consoleOut = document.getElementById('consoleOut');

let timeLeft = 100;

// --- 2. STARTUP LOGIC ---
async function findWorkingModel() {
    storyText.innerText = "Connecting to Server...";
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        const allModels = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace("models/", ""));

        // Smart selection: Prioritize 1.5-flash
        let bestModel = allModels.find(m => m.includes("gemini-1.5-flash")) || allModels[0];
        startGame(bestModel);
    } catch (err) {
        console.error("Network Error:", err);
        startGame("offline-backup"); 
    }
}

async function startGame(modelName) {
    if (modelName === "offline-backup") {
        runBackupStory();
        return;
    }

    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `Act as a Technical Dungeon Master.
    Generate a coding challenge for a Java developer.
    Format the response EXACTLY like this:
    [SCENARIO]: (A one-sentence story about the Memory Leak Mantis)
    [TASK]: (A specific coding task, e.g., 'Print a system status message')
    [CONSTRAINT]: (A technical requirement, e.g., 'Must use a main method')`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        storyText.innerText = response.text();
        setTimeout(() => addTeamChat("Alex (Backend)", "⚠️ RAM usage is spiking! Deploy the fix!"), 2000);
    } catch (error) {
        console.error("Gemini Error:", error);
        runBackupStory();
    }
}

function runBackupStory() {
    storyText.innerText = "[SCENARIO]: The Memory Leak Mantis is eating the heap!\n[TASK]: Use System.out.println to alert the admin.\n[CONSTRAINT]: Must use a 'public class' and 'main' method.";
    setTimeout(() => addTeamChat("Alex (Backend)", "⚠️ Critical Error! We need that Java patch!"), 1000);
}

// --- 3. BATTLE LOGIC ---
attackBtn.addEventListener('click', () => {
    const code = codeArea.value.trim();
    const hasPublicClass = code.includes("public class");
    const hasMain = code.includes("public static void main");
    const hasPrint = code.includes("System.out.println");

    consoleOut.innerHTML = "> Initiating compiler...<br>";
    consoleOut.style.color = "#00ff41"; 

    if (code === "") {
        consoleOut.innerHTML += "> [ERROR]: Input buffer empty.";
        consoleOut.style.color = "#ff4444";
        storyText.innerText = "Write your code before casting the spell!";
        return;
    }

    if (hasPublicClass && hasMain && hasPrint) {
        handleHit();
    } else {
        handleMiss(hasPublicClass, hasMain, hasPrint);
    }
});

function handleHit() {
    hitSound.currentTime = 2;
    hitSound.play();
    setTimeout(() => {
        hitSound.pause();
    }, 2000);
    
    let currentWidth = parseFloat(bossHealthBar.style.width);
    if (isNaN(currentWidth)) currentWidth = 100;

    let newWidth = currentWidth - 25;
    bossHealthBar.style.width = newWidth + "%";
    
    consoleOut.innerHTML += "> [SUCCESS]: Syntax Validated.<br>> [INFO]: Executing attack...";
    bossImg.classList.add("shake");
    setTimeout(() => bossImg.classList.remove("shake"), 200);
    
    storyText.innerText = "CRITICAL HIT! Your logic is sound!";
    addTeamChat("Serah", "Direct hit! Keep the patches coming!");
let width=newWidth;
    if (newWidth <= 0) {
        winSound.play();
        storyText.innerText = "SYSTEM RESTORED! The Mantis has been garbage collected.";
        bossImg.style.opacity = "0"; 
        consoleOut.innerHTML += "<br>> [SYSTEM]: TARGET NEUTRALIZED.";
    }if (width <= 0) {
        // Clear AI cache for a fresh challenge
        setTimeout(()=>{
        localStorage.removeItem('dailyChallenge');
        winSound.play();
        
            const winScreen = document.getElementById('winScreen');
            winScreen.style.display = "flex";
            
            // Update level in UI
            let currentLvl = parseInt(document.querySelector(".stats span:last-child").innerText.replace("LVL: ", ""));
            document.querySelector(".stats span:last-child").innerText = "LVL: " + (currentLvl + 1);
        },1500);
        // Show Win Screen
        
    }
}

function handleMiss(c, m, p) {
    errorSound.play();
    consoleOut.style.color = "#ff4444";
    let logs = "> [BUILD FAILED]:<br>";
    if (!c) logs += ">> Error: Missing 'public class'<br>";
    if (!m) logs += ">> Error: Missing entry point 'main'<br>";
    if (!p) logs += ">> Error: Missing output 'System.out.println'<br>";
    
    consoleOut.innerHTML += logs;
    storyText.innerText = "SYNTAX ERROR! The Mantis dodged your attack.";
    document.body.style.backgroundColor = "#330000";
    setTimeout(() => document.body.style.backgroundColor = "#0d0d0d", 200);
}

function addTeamChat(name, msg) {
    storyText.innerText += `\n\n[TEAM] ${name}: ${msg}`;
}

// --- 4. TIMER LOGIC ---
function startTimer() {
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = "TIME LEFT: " + timeLeft + "s";
        
        if (timeLeft <= 10) {
            timerDisplay.style.color = "yellow"; 
            timerDisplay.classList.add("shake"); 
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('gameOverScreen').style.display = "flex";
            attackBtn.disabled = true; 
        }
    }, 1000);
}
document.getElementById('nextLevelBtn').addEventListener('click', () => {
    // Hide win screen
    document.getElementById('winScreen').style.display = "none";
    
    // Reset Health and UI
    bossHealthBar.style.width = "100%";
    bossImg.style.opacity = "1";
    codeArea.value = "";
    consoleOut.innerHTML = "> Level Advanced. Awaiting new AI Challenge...";
    
    // Reset Timer for new level
    timeLeft = 90;
    
    // Fetch a new, potentially harder challenge
    findWorkingModel();
});

window.onload = () => {
    findWorkingModel(); 
    startTimer();  
    startSound.play() ;    
};
