const scoreBoard = document.querySelector('#score-board');
const janices = document.querySelectorAll('.janice');
const holes = document.querySelectorAll('.hole');
const startBtn = document.querySelector('#start-btn');

let score = 0;
let lastHole;
let timeUp = false;
let peepTimeout; 
let nextSpawnTimeout; 

// Track the single Janice that is currently active/hittable
let currentActiveJanice = null; 

function randomHole(holesList) {
  const idx = Math.floor(Math.random() * holesList.length);
  const hole = holesList[idx];
  
  if (hole === lastHole) {
    return randomHole(holesList);
  }
  lastHole = hole;
  return hole;
}

function peep() {
  if (timeUp) return;

  // Clean up any lingering active elements before choosing a new one
  if (currentActiveJanice) {
    currentActiveJanice.classList.remove('up');
  }

  const currentHole = randomHole(holes);
  currentActiveJanice = currentHole.querySelector('.janice');
  
  currentActiveJanice.classList.add('up'); 

  // Play the entrance laugh sound
  let jangleLaugh = new Audio('sounds/kick-bass.mp3');
  jangleLaugh.play().catch(err => console.log("Audio blocked or file missing:", err));

  // Janice stays up for 800ms
  peepTimeout = setTimeout(() => {
    if (currentActiveJanice) {
      currentActiveJanice.classList.remove('up');
      currentActiveJanice = null; // No longer active
    }
    
    // Generate a random rest break before the next pop
    const randomDelay = Math.floor(Math.random() * 600) + 400; 
    
    nextSpawnTimeout = setTimeout(() => {
      peep(); 
    }, randomDelay);

  }, 800); 
}

function startGame() {
  // Clear absolutely everything to guarantee a clean slate
  clearTimeout(peepTimeout);
  clearTimeout(nextSpawnTimeout);
  janices.forEach(j => j.classList.remove('up')); 
  currentActiveJanice = null;
  
  score = 0;
  scoreBoard.textContent = score;
  timeUp = false;
  startBtn.disabled = true; // Prevent clicking start multiple times mid-game
  
  peep();

  // Master 15-second game session timer
  setTimeout(() => {
    timeUp = true;
    clearTimeout(peepTimeout);
    clearTimeout(nextSpawnTimeout);
    
    if (currentActiveJanice) {
      currentActiveJanice.classList.remove('up');
    }
    
    // 📣 PLAY THE "OH MY GOD" AUDIO HERE
    let ohMyGodSound = new Audio('sounds/omg.mp3'); 
    ohMyGodSound.play().catch(err => console.log("Audio skipped:", err));

    // Delay the alert box by 1.5 seconds so the audio can play finish first
    setTimeout(() => {
      startBtn.disabled = false;
      alert("Game Over! You shut down Janice " + score + " times.");
    }, 1500);

  }, 15000);
}

// Ultra-Responsive Hit Scanner
janices.forEach(janiceInstance => {
  janiceInstance.addEventListener('pointerdown', (e) => {
    e.preventDefault(); // Prevents ghost clicks and dragging behavior
    e.stopPropagation();

    // Only count the hit if this Janice is currently up and active
    if (janiceInstance === currentActiveJanice && janiceInstance.classList.contains('up')) {
      
      // Stop the timer immediately so she doesn't hide mid-click
      clearTimeout(peepTimeout);
      clearTimeout(nextSpawnTimeout);

      // Instantly drop her down out of sight
      janiceInstance.classList.remove('up');
      currentActiveJanice = null; 
      
      // Update score board
      score++;
      scoreBoard.textContent = score;
      
      // Play whack sound cleanly
      let whackSound = new Audio('sounds/tom-3.mp3');
      whackSound.play().catch(err => console.log("Audio skipped:", err));
      
      // Queue up the next spawn sequence smoothly
      const quickDelay = Math.floor(Math.random() * 400) + 200;
      nextSpawnTimeout = setTimeout(() => {
        peep();
      }, quickDelay);
    }
  });
});

startBtn.addEventListener('click', startGame);