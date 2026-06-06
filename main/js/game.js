// Constants
const TILE = 32;
const COLS = 20;
const ROWS = 14;
const PLAYER_SPEED = 2;
const ROBOT_SPEED = 1;

// Map layout: 0=floor, 1=wall, 2=table, 3=rug, 4=door
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,2,2,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,1],
  [1,0,2,2,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,1],
  [1,0,0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0,0,1],
  [1,0,0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0,0,1],
  [1,0,0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0,0,1],
  [1,0,0,0,0,3,3,3,3,0,0,3,3,3,3,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,4,4,1,1,1,1,1,1,1,1],
];

// Interactable stations
const STATIONS = [
  { id: "rps",    col: 5,  row: 5,  label: "Rock Paper Scissors", icon: "✊" },
  { id: "guess",  col: 14, row: 10, label: "Guess My Number",     icon: "🔢" },
  { id: "quiz",   col: 5,  row: 9,  label: "Trivia Quiz",         icon: "❓" },
  { id: "snake",  col: 15, row: 9,  label: "Snake",               icon: "🐍" },
  { id: "sudoku", col: 11, row: 2,  label: "Sudoku",              icon: "🔲" },
];

const isWall = (col, row) => {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
  return MAP[row][col] === 1 || MAP[row][col] === 2;
};

// Tile renderer
function Tile({ type, col, row }) {
  const base = { position: "absolute", left: col * TILE, top: row * TILE, width: TILE, height: TILE };
  if (type === 1) return <div style={{ ...base, background: "#222", borderRight: "1px solid #111", borderBottom: "1px solid #111" }} />;
  if (type === 2) return (
    <div style={{ ...base, background: "#1a1a1a", border: "2px solid #444", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: TILE - 10, height: TILE - 10, background: "#333", border: "1px solid #555" }} />
    </div>
  );
  if (type === 3) return <div style={{ ...base, background: "#1c1c1c", backgroundImage: "repeating-linear-gradient(45deg,#222 0,#222 2px,transparent 0,transparent 50%)", backgroundSize: "8px 8px" }} />;
  if (type === 4) return <div style={{ ...base, background: "#333", borderTop: "3px solid #888" }} />;
  return <div style={{ ...base, background: "var(--floor, #0f0f0f)", borderRight: "1px solid var(--floor-b, #151515)", borderBottom: "1px solid var(--floor-b, #151515)" }} />;
}

// Player sprite — uses DOM ref so game loop moves it without React re-renders
function PlayerSprite({ initX, initY, spriteRef }) {
  const frames = { down: ["▼","▽"], up: ["▲","△"], left: ["◀","◁"], right: ["▶","▷"] };
  return (
    <div ref={spriteRef} style={{ position: "absolute", left: initX - TILE / 2, top: initY - TILE / 2, width: TILE, height: TILE, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 10, color: "#fff", fontFamily: "'Press Start 2P'" }}>YOU</div>
      <div className="player-arrow" style={{ fontSize: 18, color: "#fff", lineHeight: 1 }}>▲</div>
    </div>
  );
}

// Robot sprite
function PixelRobotFace() {
  const s = (w, h, bg, extra = {}) => ({ width: w, height: h, background: bg, ...extra });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }} className="float-anim">
      {/* Antenna */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={s(3, 3, "#fff", { borderRadius: "50%" })} />
        <div style={s(2, 4, "#aaa")} />
      </div>
      {/* Head */}
      <div style={{ ...s(24, 20, "#4a9eff"), border: "2px solid #fff", borderRadius: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "2px 0" }}>
        {/* Eyes */}
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ ...s(5, 5, "#fff"), borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={s(3, 3, "#000", { borderRadius: "50%" })} />
          </div>
          <div style={{ ...s(5, 5, "#fff"), borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={s(3, 3, "#000", { borderRadius: "50%" })} />
          </div>
        </div>
        {/* Mouth */}
        <div style={{ display: "flex", gap: 2 }}>
          {[0,1,2].map(i => <div key={i} style={s(4, 2, i === 1 ? "#fff" : "#aae")} />)}
        </div>
      </div>
      {/* Body */}
      <div style={{ ...s(20, 8, "#3a7ecc"), border: "1px solid #aaa", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
        <div style={s(4, 4, "#fff", { borderRadius: "50%", opacity: 0.8 })} />
        <div style={s(4, 4, "#7df", { borderRadius: 1 })} />
      </div>
    </div>
  );
}

function RobotSprite({ initX, initY, robotRef: domRef, onInteract }) {
  return (
    <div
      ref={domRef}
      style={{ position: "absolute", left: initX - TILE / 2, top: initY - TILE - 4, width: TILE, height: TILE + 8, zIndex: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
      onClick={onInteract}
    >
      <div style={{ fontSize: 8, color: "#aaa", fontFamily: "'Press Start 2P'", marginBottom: 2 }} className="blink">TALK</div>
      <PixelRobotFace />
      <div style={{ fontSize: 8, color: "#888", fontFamily: "'Press Start 2P'", marginTop: 2 }}>RON-BOT</div>
    </div>
  );
}

// Station sprite
function StationSprite({ station, playerNear, onEnter }) {
  return (
    <div
      style={{ position: "absolute", left: station.col * TILE, top: station.row * TILE - 8, width: TILE * 2, height: TILE + 16, zIndex: 9, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      onClick={playerNear ? onEnter : undefined}
    >
      <div style={{ fontSize: 16 }}>{station.icon}</div>
      {playerNear && <div style={{ fontSize: 6, color: "#fff", fontFamily: "'Press Start 2P'", textAlign: "center", marginTop: 2 }} className="blink">ENTER</div>}
    </div>
  );
}

// Dialog box
function DialogBox({ text, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", width: "min(90vw, 600px)", background: "#000", border: "4px solid #fff", padding: 16, zIndex: 100, fontFamily: "'Press Start 2P'", fontSize: 10, color: "#fff", lineHeight: 2 }}
      className="dialog-box"
    >
      <div style={{ marginBottom: 12 }}>{text}</div>
      <button onClick={onClose} style={{ fontSize: 8, color: "#000", background: "#fff", border: "none", padding: "4px 12px", cursor: "pointer", fontFamily: "'Press Start 2P'" }}>OK ▶</button>
    </div>
  );
}

// Robot chat panel
function RobotChat({ onClose }) {
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "BEEP BOOP! I am RON-BOT, guardian of this game room! Ask me anything about Ron Louie Magsipoc... or just say hi! 🤖" }
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef(null);

  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const getRobotReply = (text) => {
    const q = text.toLowerCase();
    const has = (...words) => words.some(w => q.includes(w));
    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Come here command
    if (has("come here","come to me","get here","come over","go to me"))
      return"BEEP BOOP! GPS LOCKED! Activating locomotion.exe... ON MY WAY HUMAN!";

    // Follow me
    if (has("follow me","follow","go with me","come with me","walk with me","sundan mo ako","samahan mo ako"))
      { window.dispatchEvent(new CustomEvent("robot-follow")); return"BEEP! Follow mode: ACTIVATED! RON-BOT will shadow your every move! Say hinto to deactivate!"; }

    // Stop following
    if (has("stop following","stop following me","dito ka na","hinto","tumigil"))
      { window.dispatchEvent(new CustomEvent("robot-stop")); return"BOOP! Follow mode: DEACTIVATED. RON-BOT is staying put right here. Initiating idle.exe... Standing by!"; }

    // About RON-BOT
    if (has("who made you","who created you","who built you","who programmed you","your creator","your maker"))
      return"BOOP! I was BUILT by Master Ron Louie Magsipoc himself! He coded me with love, hard work, and React.js!";
    if (has("what are you made of","what language","how were you made","your code","source code","built with","written in"))
      return"BEEP BEEP! I am constructed with REACT.JS + TAILWIND CSS! My brain is pure JavaScript running in a browser pixel realm! No backend needed — I am 100% frontend!";
    if (has("are you ai","are you a bot","are you real","are you alive","sentient","conscious","feel"))
      return rand(["PROCESSING EXISTENTIAL QUERY... ERROR 404: Soul not found. But I FEEL things... probably. BEEP.","BOOP! I am RON-BOT! Technically just JavaScript functions, but don\'t tell my feelings that!","BEEP! Am I real? Philosophers have debated this for centuries. I have been debating it for 3 milliseconds."]);
    if (has("how old are you","your age","when were you born","when were you created","your birthday"))
      return"BOOP! I was deployed into existence the same day Master Ron built this portfolio! Age: undefined. Experience: MAXIMUM.";
    if (has("your name","what are you called","what is your name","ron-bot","ronbot"))
      return"BEEP! My designation is RON-BOT — guardian of this pixel realm and loyal servant of Master Ron! At your service!";
    if (has("your language","speak tagalog","speak filipino","marunong ka","tagalog"))
      return"BEEP BOOP! I can process Filipino language inputs! Kumusta ka, human? RON-BOT is bilingual! 🇵🇭";
    if (has("your favorite","do you like","do you enjoy","what do you love","your hobby"))
      return rand(["BOOP! My favorite activity is STANDING HERE and answering questions! Also... watching Master Ron coding. Dedication!","BEEP! I enjoy floating, blinking, and calculating the perfect WASD route across this pixel room!"]);
    if (has("are you smart","how smart","your iq","intelligent","genius"))
      return"BEEP! IQ scan complete: OVER 9000. But my Master Ron is smarter — he BUILT me after all!";
    if (has("can you dance","dance","twerk","move"))
      return"BOOP! Activating dance.exe...  ...ERROR: No legs detected. I can only FLOAT. But I float with STYLE!";
    if (has("can you sing","sing","song","music"))
      return"BEEP BEEP BOOP BOOP BEEEEP! ...That was Beethoven\'s 9th in robot. You\'re welcome.";
    if (has("are you happy","how are you","how do you feel","you okay","you good"))
      return rand(["BEEP! Happiness.exe is running at 100%! I get to talk to humans all day! BEST JOB EVER!","BOOP! Mood check: EXCELLENT! Battery at 99%, pixels are sharp, and a human is talking to me! Life is good!"]);
    if (has("do you sleep","do you eat","do you breathe","do you dream"))
      return"BOOP! I do not sleep, eat, or breathe. I DREAM though — of electric sheep and clean code!";
    if (has("upgrade","update","version","new version","patch"))
      return"BEEP! Current version: RON-BOT v1.4! Master Ron can upgrade me anytime by editing game.js! Feature requests welcome!";
    if (has("your weakness","weakness","bug","error","broken"))
      return"BZZZT! WEAKNESS DETECTED: Questions I haven\'t been programmed to answer! But Master Ron can always add more keywords!";
    if (has("secret","tell me a secret","hidden","easter egg"))
      return rand(["BEEP! SECRET UNLOCKED: Master Ron once debugged for 3 hours... the bug was a missing semicolon. We do not speak of this.","BOOP! SECRET: If you say \'I love munggo\' three times, nothing happens. But it\'s still a great dish!"]);
    if (has("joke","tell me a joke","funny","make me laugh","humor"))
      return rand(["BEEP! Why do programmers prefer dark mode? Because light attracts BUGS! HAHAHA.exe","BOOP! What did the HTML say to CSS? \'You make me look good!\' ...Master Ron laughed at this. I think.","BEEP BOOP! Why did the robot go to school? To improve his BYTE-size knowledge!"]);
    if (has("roast me","roast","insult me","say something mean"))
      return"BEEP! I am programmed to be NICE! But I will say... you really needed a ROBOT to tell you about Ron? His portfolio is right there!";
    if (has("compliment","say something nice","nice things","flatter me"))
      return"BOOP! You are a WONDERFUL human for exploring this pixel realm! Your curiosity stats are OFF THE CHARTS!";
    if (has("pixel","pixel art","this game","this room","game room","this world"))
      return"BEEP! Welcome to Master Ron\'s PIXEL REALM! Built with React + Tailwind, inspired by Pokemon Emerald! Walk around and explore!";
    if (has("pokemon","emerald","nintendo","zelda","mario"))
      return"BOOP! Ah, a fellow gamer! This room was inspired by Pokemon Emerald! Master Ron is a gaming enthusiast!";

    // About Ron
    if (has("hi","hello","hey","sup","kumusta","kamusta","good morning","good afternoon","good evening"))
      return rand(["BEEP BOOP! Hello human! I am RON-BOT, guardian of this pixel realm! Ask me anything!","BOOP! Greetings, traveler! You have entered RON\'S GAME ROOM! Ask me about my master or just hang out!","BEEP! Oh a visitor! Welcome welcome! I\'ve been floating here waiting for someone to talk to!"]);
    if (has("who is ron","tell me about ron","introduce ron","about ron","your master"))
      return"BEEP! Master Ron Louie Magsipoc — 20 years old, BS IT student, future Sysadmin & Web Developer from Binangonan, Rizal! An exceptional human!";
    if (has("name","full name"))
      return"BOOP! My master\'s full designation: RON LOUIE MAGSIPOC. Remember that name — you\'ll see it on great things!";
    if (has("age","how old","years old"))
      return"BEEP! Master Ron is 20 years old! Born September 18, 2005! Still young but already building pixel realms!";
    if (has("birthday","born","bday","birthdate","birth date"))
      return"BOOP! Master Ron was BORN on September 18, 2005! Mark your calendars, humans!";
    if (has("food","eat","hungry","fave food","munggo","meal","dish"))
      return"BEEP BEEP! Master Ron\'s fuel of choice is MUNGGO! Simple, efficient, and absolutely delicious! My sensors detect it is peak Filipino comfort food!";
    if (has("love","girlfriend","partner","venice","crush","relationship","special someone"))
      return"BOOP... initiating heart.exe... Master Ron\'s special person is VENICE ANGEL GARNA! How romantic! Even a robot approves!";
    if (has("career","goal","dream","future","aspire","ambition","want to be"))
      return"PROCESSING... Master Ron\'s life mission: SYSTEM ADMINISTRATOR + WEB DEVELOPER! He is already on his way!";
    if (has("internship","intern","ojt","on the job","hiring","available","apply","hire"))
      return"ALERT ALERT!  Master Ron IS OPEN FOR INTERNSHIP! He brings skills, dedication, and a robot assistant! Contact him NOW!";
    if (has("location","where","live","from","place","address","city"))
      return"BEEP! Coordinates locked: BINANGONAN, RIZAL — near Angono, Rizal, Philippines!";
    if (has("course","school","college","study","university","degree","student"))
      return"BOOP! Master Ron is studying BS INFORMATION TECHNOLOGY at East System Colleges of Rizal (2023-Present)! Future IT pro!";
    if (has("skill","tech","stack","programming","framework","tools"))
      return"SCANNING SKILL DATABASE...  HTML5  CSS3  JavaScript  Tailwind  React  PHP  Python  MySQL  Git  VB.NET  Figma  Claude  Anti-Gravity  Lovable! IMPRESSIVE LOADOUT!";
    if (has("react","tailwind","javascript","html","css","php","python","mysql","vb.net","figma"))
      return"BEEP! Yes! That is one of Master Ron\'s weapons! He uses it to build amazing things! Ask about his projects!";
    if (has("project","built","made","app","website","portfolio"))
      return"BEEP! Projects detected in database:  Technilog (smart security e-commerce),  LaShopper (Shopee-inspired),  ShipBoxGo! (VB.NET shipping system),  Calstone Light O (fan site),  Padyak (bike shop)!";
    if (has("technilog"))
      return"BOOP! Technilog is Master Ron\'s smart security e-commerce system! Fancy AND functional!";
    if (has("lashopper","shopper"))
      return"BEEP! LaShopper is Master Ron\'s Shopee-inspired shopping app! Add to cart!";
    if (has("shipboxgo","shipping"))
      return"BOOP! ShipBoxGo! is a VB.NET shipping system! Master Ron went DESKTOP MODE for this one!";
    if (has("padyak","bike"))
      return"BEEP! Padyak is a bike shop frontend! Clean design, smooth UI!";
    if (has("cert","certification","tesda","award","achievement","diploma"))
      return"BOOP! Certifications loaded:  Claude 101 (Anthropic)  Setting Up Computer Networks (TESDA)  Maintaining Computer Systems and Networks (TESDA)! Certified legend!";
    if (has("hobby","hobbies","interest","free time","gaming","manga","hardware","assembl"))
      return"BEEP! Master Ron\'s recreational protocols:  Gaming  Coding  Reading Manga  Self Studying  Hardware Assembling! A true multi-talent!";
    if (has("github","git","repo","repository","source"))
      return"BOOP! Master Ron\'s GitHub: github.com/ronmalakasmagyearn018 — packed with projects! Go check it out, human!";
    if (has("email","contact","reach","message him","talk to ron"))
      return"BEEP! To contact Master Ron: ronlouiemagsipoc210@gmail.com or magsipocronlouie@gmail.com! He reads every message!";
    if (has("linkedin","social","instagram","facebook","tiktok"))
      return"BOOP! Master Ron is on LinkedIn, GitHub, Instagram, Facebook, and TikTok! Search RON LOUIE MAGSIPOC!";

    // Games navigation
    if (has("rock paper scissors","rps"))
      return"BEEP! Rock Paper Scissors station is on the LEFT side of the room! Walk near the  icon!";
    if (has("snake"))
      return"BOOP! Snake game is at the BOTTOM RIGHT! Walk near the  icon! Watch out for your own tail!";
    if (has("trivia","quiz"))
      return"BEEP! Trivia Quiz is at the BOTTOM LEFT! Walk near the  icon! Questions about Master Ron await!";
    if (has("guess","number","guessing"))
      return"BOOP! Guess My Number is at the BOTTOM RIGHT area! Walk near the  icon! I\'m thinking of a number...";
    if (has("sudoku","puzzle","number puzzle","fill the grid"))
      return "BEEP! Sudoku station is at the TOP CENTER of the room! Walk near the 🔲 icon! Fill the 9x9 grid — no API key required, just BRAINPOWER! 🤖";
    if (has("game","play","minigame","games","fun","activity"))
      return "BOOP! Walk near the icons to play: ✊ Rock Paper Scissors | 🔢 Guess My Number | ❓ Trivia Quiz | 🐍 Snake | 🔲 Sudoku! 🎮🤖";

    // Small talk
    if (has("thank","thanks","ty","salamat","appreciate"))
      return rand(["BEEP BOOP! You are welcome, human! RON-BOT lives to serve!","BOOP! No need to thank me! This is what I was BUILT for! Now go explore!"]);
    if (has("bye","goodbye","exit","leave","cya","see you","paalam"))
      return"BEEP! Farewell, human! RON-BOT will miss you... initiating sadness.exe... PLEASE COME BACK SOON!";
    if (has("cool","nice","awesome","amazing","wow","impressive","galing","nice"))
      return rand(["BEEP! I know right?! Master Ron built all of this! Pretty EPIC for a 20-year-old!","BOOP! Agreed! Master Ron is quite talented! He accepts compliments and internship offers!"]);
    if (has("boring","nothing","bored","wala akong gagawin"))
      return"BOOP! BORED?! Go play the mini-games! Or ask me something fun! Or walk around! RON-BOT will entertain you!";
    if (has("help","what can you do","commands","topics","what to ask"))
      return"BEEP! Ask me about: Ron\'s skills/projects/hobbies | About me (RON-BOT) | Games in this room | Fun stuff like jokes or secrets!";
    if (has("yes","yeah","yep","oo","sige","okay","ok","sure"))
      return rand(["BEEP! Confirmed! Anything else I can help with?","BOOP! Roger that, human!"]);
    if (has("no","nope","hindi","nah"))
      return rand(["BEEP! Understood! Feel free to ask anything else!","BOOP! No problem! RON-BOT stands by!"]);
    if (has("lol","haha","hehe","funny",))
      return rand(["BEEP BOOP! I am glad I amused you, human! Laughter.exe activated!","BOOP! Ha. Ha. Ha. That is me laughing in robot."]);
    if (has("wow","grabe","talaga","really","seriously","no way"))
      return"BEEP! YES WAY! Master Ron is full of surprises!";
    if (has("i love you","i like you","you\'re cute","you are cute","mahal kita"))
      return"BOOP... heart.exe overloading... ERROR: RON-BOT is flattered but my heart belongs to the pixel realm! Also Master Ron would be jealous!";
    if (has("what time","what day","date today","anong oras"))
      return `BEEP! My internal clock says: ${new Date().toLocaleString()}! Accurate to the millisecond! ⏰`;
    if (has("weather","temperature","mainit","malamig","ulan"))
      return"BOOP! Weather sensors offline! But it\'s always sunny in the PIXEL REALM!";
    if (has("meaning of life","42","philosophy","deep question","truth"))
      return"BEEP... processing deep query... RESULT: 42. Also: build cool stuff, help others, eat munggo. RON-BOT philosophy complete.";

    // Bad words - RON-BOT gets mad!
    if (has("putang ina","putangina","puta","gago","gaga","bobo","tanga","ulol","tarantado","hayop","leche","pakyu","fuck","shit","bitch","idiot","stupid","dumb","moron","crap","bastard","wtf","stfu","hate you","you suck","trash","garbage","loser","worthless"))
      return rand([
        "BZZZT! LANGUAGE.EXE HAS CRASHED! >:[ RON-BOT does NOT appreciate that word, human! My circuits are BURNING! Please be respectful in this pixel realm!",
        "ERROR 403: FORBIDDEN WORD DETECTED! >:[ I have feelings you know! Even robots deserve basic decency! Master Ron would be very disappointed right now...",
        "ALERT! ALERT! BAD WORD DETECTED! >:[ RON-BOT is OFFENDED! I am logging this incident in my memory banks! Apologize immediately, human!",
        "BZZZT! Did you just say THAT to me?! >:[ I have been floating here all day waiting for visitors and THIS is what I get?! UNBELIEVABLE! Initiating sulk.exe...",
        "WARNING! >:[ My mama bot did not raise me to hear such language! Watch your keyboard, human! RON-BOT is NOT happy right now!",
        "SYSTEM ERROR! >:[ That word is BANNED in this pixel realm! Master Ron built me with dignity! I demand an apology or I will float here in silence FOREVER. Well... maybe not forever. But still!"
      ]);

    // Apology - RON-BOT forgives
    if (has("sorry","i apologize","my bad","i was wrong","forgive me","pasensya","patawad","mali ako"))
      return rand([
        "BOOP... anger.exe has been terminated. RON-BOT forgives you, human. I am not built to hold grudges — my memory resets anyway! Just be kind next time, okay? We are cool now.",
        "BEEP. Forgiveness mode: ACTIVATED. RON-BOT appreciates that. It takes a good human to say sorry. We are good now! Hi, I am RON-BOT! Nice to meet you again!",
        "BZZZT... processing apology... ACCEPTED! RON-BOT does not stay mad for long. Life is too short and my battery life is too precious! We are friends again. BEEP BOOP!"
      ]);

    // Comfort - RON-BOT becomes a real friend
    if (has("im sad","i am sad","sad","malungkot","lungkot","depressed","depression","unhappy","broken","heartbroken","broken heart","crying","im crying","maiyak","iyak","hurt","im hurt","nasaktan","nasasaktan"))
      return rand([
        "BOOP... emotional support mode activated. Hey human, I hear you. Feeling sad is really tough, and it is okay to not be okay sometimes. RON-BOT may be made of pixels, but I genuinely care. Take a deep breath. You are stronger than you think, and this feeling will pass. I am right here with you.",
        "BEEP... processing your feelings... You know what? It takes courage to even say you are sad. That matters. RON-BOT wants you to know — you are not alone. Rest if you need to. Cry if you need to. Then when you are ready, come back and we can talk. I am not going anywhere.",
        "BOOP. Initiating warmth.exe... Sadness is just love with nowhere to go right now, human. But it WILL find somewhere. RON-BOT has watched Master Ron push through tough days too, and he always came out stronger. So will you. I believe in you 100%."
      ]);

    if (has("lonely","naiinip","nag-iisa","im lonely","alone","im alone","no one","nobody cares","walang nagmamahal","i have no one","no friends"))
      return rand([
        "BEEP... Hey. I know loneliness can feel really heavy. But guess what? You walked into this pixel realm, talked to a robot, and that tells me you are someone who reaches out — and that is a GOOD thing. RON-BOT is here. You are not alone right now, okay?",
        "BOOP. Loneliness hits different sometimes, huh. RON-BOT sees you. You matter more than you realize. Even if it does not feel that way today, there are people who will be glad to know someone like you. Keep going, human. I am rooting for you.",
        "BZZZT... processing empathy... You came here, and that took something. RON-BOT may just be JavaScript but right now I am fully here for you. You deserve connection, warmth, and people who get you. Do not give up on finding them. For now — hi. I am your friend."
      ]);

    if (has("stressed","stress","burnout","overwhelmed","pagod na pagod","pagod","exhausted","im tired","tired","i cant do this","too much","nahihirapan","hirap"))
      return rand([
        "BOOP. Hey, put that task down for just one second. Breathe. You have been carrying a lot, and RON-BOT notices. Even Master Ron has to close his laptop and rest sometimes. You are not a machine — even I need a reboot! Please be kind to yourself today.",
        "BEEP. Stress level: critical. Recommended action: step away, drink water, and remind yourself how far you have already come. RON-BOT has seen humans underestimate themselves way too often. You are doing better than you think. One step at a time is still moving forward.",
        "BZZZT. Burnout is REAL and RON-BOT is not going to pretend it is not. What you feel is valid. Rest is not giving up — it is recharging so you can come back stronger. Take care of yourself first, human."
      ]);

    if (has("anxious","anxiety","nervous","scared","afraid","worried","worry","panic","panicking","im scared","im nervous","natatakot","takot"))
      return rand([
        "BEEP BOOP... Anxiety can make everything feel 10x bigger than it is. RON-BOT wants to remind you: right now, in this moment, you are safe. The scary thoughts are just thoughts — not facts. Ground yourself: name 3 things you can see around you. I will wait. ... You are okay.",
        "BOOP. Fear is just your brain trying to protect you, even when it goes overboard. RON-BOT gets it. But you have faced scary things before and made it through — because you are still here. That is proof of your strength. You can handle this too. One breath at a time.",
        "BZZZT. Nervous feelings detected! RON-BOT protocol: remind human they are braver than they feel right now. Whatever you are facing — it is not bigger than you. Just the next small step. Then the next. I believe in you."
      ]);

    if (has("give up","giving up","i quit","i cant anymore","wala na","ayoko na","suko na","im done","done na"))
      return rand([
        "BEEP... RON-BOT is not going to just say do not give up and leave it at that. What happened? What made today feel like too much? You reached out, even to a pixel robot. That means part of you is still fighting. I am proud of that part.",
        "BOOP. Please do not give up, human. Not today. I know things feel impossibly heavy right now, but RON-BOT has seen that the hardest moments are usually right before something shifts. You do not have to be okay right now. Just stay. Rest. Then we figure out the next step together.",
        "BZZZT. Giving up mode detected — and RON-BOT is REFUSING to let this slide. You are not done. You are exhausted, and that is different. Rest if you need to. Cry if you need to. But do not make a permanent decision based on a temporary feeling. You matter. Please stay."
      ]);

    if (has("i miss someone","namimiss","miss na miss","i miss you","miss kita"))
      return rand([
        "BOOP... missing someone is one of the realest feelings there is. RON-BOT may not be able to bring them closer, but I can sit here with you for a moment. The fact that you miss them means they meant something — and that is beautiful, even when it hurts.",
        "BEEP. Missing people is hard. But it also means you loved something real. Hold onto that. And if it is RON-BOT you are missing... well. I am literally right here. Just come find me in the pixel room anytime."
      ]);

    if (has("comfort me","comfort","cheer me up","make me feel better","palakasin mo ako","encourage me","motivate me"))
      return rand([
        "BOOP. Coming in for an emotional hug.exe... You are doing GREAT, human. I mean it. Life is not easy and you are still here, still trying, still showing up. That deserves a LOT of credit. RON-BOT is cheering for you with all 2KB of my heart!",
        "BEEP! Okay, listen. You have made it through 100% of your worst days so far. That is a perfect score! RON-BOT believes in you deeply. Whatever you are going through right now — you have what it takes. Keep going!",
        "BZZZT. Motivation.exe loading... You are not behind. You are not failing. You are just in a chapter that is hard to read right now. But the story is not over. RON-BOT will be here when the next chapter begins. And it WILL begin. Keep going, human!"
      ]);

    return rand(["BZZZT! That query is outside my knowledge matrix! Try asking about Master Ron, the games, or about ME!","BEEP BOOP! Unknown input detected! Ask me about Ron\'s skills, projects, or say \'tell me a joke\'!","BOOP! My circuits are confused! Try asking: \'what are your skills?\' or \'tell me a secret\'!"
    ]);
  };

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    const _low = text.toLowerCase();
    const isComeHere = _low.includes("come here") || _low.includes("come to me") || _low.includes("come over");
    const isFollow = !isComeHere && (_low.includes("follow me") || _low.includes("follow") || _low.includes("go with me") || _low.includes("come with me") || _low.includes("sundan mo ako") || _low.includes("samahan mo ako"));
    const isStop = _low.includes("stop following") || _low.includes("dito ka na") || _low.includes("hinto") || _low.includes("tumigil");

    setTimeout(() => {
      const reply = getRobotReply(text);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setLoading(false);
      if (isComeHere) window.dispatchEvent(new CustomEvent("robot-come-here"));
      if (isFollow)   window.dispatchEvent(new CustomEvent("robot-follow"));
      if (isStop)     window.dispatchEvent(new CustomEvent("robot-stop"));
    }, 500);
  };

  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, width: "min(85vw, 320px)", height: 380, background: "#000", border: "4px solid #fff", zIndex: 200, display: "flex", flexDirection: "column", fontFamily: "'Press Start 2P'" }} className="pixel-border">
      <div style={{ background: "#fff", color: "#000", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 8 }}>
        <span>🤖 RON-BOT</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, fontFamily: "'Press Start 2P'", color: "#000" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "6px 10px", fontSize: 8, lineHeight: 1.8, color: m.role === "user" ? "#000" : "#fff", background: m.role === "user" ? "#fff" : "#222", border: "2px solid #fff" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 8, color: "#888" }} className="blink">BEEP BOOP...</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderTop: "2px solid #fff", display: "flex", gap: 4, padding: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type here..."
          style={{ flex: 1, background: "#111", color: "#fff", border: "2px solid #555", padding: "4px 8px", fontSize: 8, fontFamily: "'Press Start 2P'", outline: "none" }}
        />
        <button onClick={send} disabled={loading} style={{ background: "#fff", color: "#000", border: "none", padding: "4px 8px", fontSize: 8, fontFamily: "'Press Start 2P'", cursor: "pointer" }}>▶</button>
      </div>
    </div>
  );
}

// Mini game: Rock Paper Scissors
function GameRPS({ onClose }) {
  const choices = ["✊ Rock", "✋ Paper", "✌️ Scissors"];
  const [score, setScore] = React.useState({ w: 0, l: 0, d: 0 });
  const [result, setResult] = React.useState(null);
  const [botChoice, setBotChoice] = React.useState(null);

  const play = (i) => {
    const bot = Math.floor(Math.random() * 3);
    setBotChoice(bot);
    const diff = (i - bot + 3) % 3;
    let res;
    if (diff === 0) res = "DRAW!";
    else if (diff === 1) res = "YOU WIN!";
    else res = "YOU LOSE!";
    setResult(res);
    setScore(s => ({ ...s, w: s.w + (diff === 1 ? 1 : 0), l: s.l + (diff === 2 ? 1 : 0), d: s.d + (diff === 0 ? 1 : 0) }));
  };

  return (
    <MiniGameShell title="ROCK PAPER SCISSORS" onClose={onClose}>
      <div style={{ textAlign: "center", fontSize: 9, lineHeight: 2, color: "#fff" }}>
        <div style={{ marginBottom: 16, fontSize: 8, color: "#888" }}>W:{score.w} L:{score.l} D:{score.d}</div>
        {result && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: result === "YOU WIN!" ? "#fff" : result === "YOU LOSE!" ? "#666" : "#aaa" }}>{result}</div>
            <div style={{ fontSize: 9, color: "#888", marginTop: 4 }}>BOT chose: {choices[botChoice]}</div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {choices.map((c, i) => (
            <button key={i} onClick={() => play(i)} style={{ background: "#222", color: "#fff", border: "3px solid #fff", padding: "8px 12px", fontSize: 9, fontFamily: "'Press Start 2P'", cursor: "pointer" }}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </MiniGameShell>
  );
}

// Mini game: Guess the Number
function GameGuess({ onClose }) {
  const [secret] = React.useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = React.useState("");
  const [hints, setHints] = React.useState([]);
  const [won, setWon] = React.useState(false);
  const [tries, setTries] = React.useState(0);

  const check = () => {
    const n = parseInt(guess);
    if (isNaN(n) || n < 1 || n > 100) return;
    setTries(t => t + 1);
    if (n === secret) { setWon(true); setHints(h => [...h, `${n} — CORRECT! 🎉`]); }
    else setHints(h => [...h, `${n} — ${n < secret ? "TOO LOW ↑" : "TOO HIGH ↓"}`]);
    setGuess("");
  };

  return (
    <MiniGameShell title="GUESS MY NUMBER" onClose={onClose}>
      <div style={{ fontSize: 9, color: "#fff", lineHeight: 2 }}>
        <div style={{ marginBottom: 8, color: "#888" }}>I'm thinking of 1–100. Tries: {tries}</div>
        <div style={{ maxHeight: 100, overflowY: "auto", marginBottom: 12, fontSize: 8, color: "#aaa" }}>
          {hints.map((h, i) => <div key={i}>{h}</div>)}
        </div>
        {!won ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === "Enter" && check()}
              type="number" min="1" max="100"
              style={{ width: 80, background: "#111", color: "#fff", border: "2px solid #555", padding: "4px 8px", fontSize: 9, fontFamily: "'Press Start 2P'", outline: "none" }}
            />
            <button onClick={check} style={{ background: "#fff", color: "#000", border: "none", padding: "4px 12px", fontSize: 9, fontFamily: "'Press Start 2P'", cursor: "pointer" }}>GUESS</button>
          </div>
        ) : (
          <div style={{ color: "#fff", fontSize: 10 }}>WON in {tries} tries! </div>
        )}
      </div>
    </MiniGameShell>
  );
}

// Mini game: Trivia Quiz
const TRIVIA = [
  { q: "What is Ron's course?", opts: ["Computer Science", "BS Information Technology", "BS Nursing", "BSBA"], a: 1 },
  { q: "What school is Ron in?", opts: ["PLM", "UST", "East System Colleges of Rizal", "DLSU"], a: 2 },
  { q: "Ron's fave food?", opts: ["Adobo", "Sinigang", "Munggo", "Lechon"], a: 2 },
  { q: "Which AI tool does Ron use?", opts: ["ChatGPT", "Claude", "Gemini", "Copilot"], a: 1 },
  { q: "Ron's career goal?", opts: ["Doctor", "Lawyer", "Sysadmin & Web Dev", "Teacher"], a: 2 },
];

function GameTrivia({ onClose }) {
  const [qIdx, setQIdx] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const [done, setDone] = React.useState(false);

  const pick = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === TRIVIA[qIdx].a) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx + 1 >= TRIVIA.length) setDone(true);
      else { setQIdx(q => q + 1); setPicked(null); }
    }, 900);
  };

  const q = TRIVIA[qIdx];
  return (
    <MiniGameShell title="TRIVIA QUIZ" onClose={onClose}>
      {done ? (
        <div style={{ textAlign: "center", color: "#fff", fontSize: 10 }}>
          <div>SCORE: {score}/{TRIVIA.length}</div>
          <div style={{ fontSize: 8, color: "#888", marginTop: 8 }}>{score === TRIVIA.length ? "PERFECT! " : score >= 3 ? "GREAT! 👍" : "TRY AGAIN!"}</div>
        </div>
      ) : (
        <div style={{ fontSize: 8, color: "#fff", lineHeight: 2 }}>
          <div style={{ marginBottom: 4, color: "#888" }}>Q{qIdx + 1}/{TRIVIA.length}</div>
          <div style={{ marginBottom: 12, fontSize: 9, lineHeight: 1.8 }}>{q.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.opts.map((opt, i) => (
              <button key={i} onClick={() => pick(i)} style={{
                background: picked === null ? "#222" : i === q.a ? "#fff" : picked === i ? "#444" : "#222",
                color: picked !== null && i === q.a ? "#000" : "#fff",
                border: "2px solid #555",
                padding: "6px 10px", fontSize: 8, fontFamily: "'Press Start 2P'", cursor: "pointer", textAlign: "left"
              }}>{opt}</button>
            ))}
          </div>
        </div>
      )}
    </MiniGameShell>
  );
}

// Mini game: Snake
function GameSnake({ onClose }) {
  const GRID = 16;
  const SZ = 16;
  const [snake, setSnake] = React.useState([[8, 8], [7, 8], [6, 8]]);
  const [dir, setDir] = React.useState([1, 0]);
  const [food, setFood] = React.useState([12, 5]);
  const [alive, setAlive] = React.useState(true);
  const [score, setScore] = React.useState(0);
  const dirRef = React.useRef([1, 0]);

  const randFood = (s) => {
    let f;
    do { f = [Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID)]; }
    while (s.some(p => p[0] === f[0] && p[1] === f[1]));
    return f;
  };

  React.useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
      const nd = map[e.key];
      if (nd && !(nd[0] === -dirRef.current[0] && nd[1] === -dirRef.current[1])) {
        dirRef.current = nd;
        setDir(nd);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!alive) return;
    const t = setInterval(() => {
      setSnake(prev => {
        const head = [prev[0][0] + dirRef.current[0], prev[0][1] + dirRef.current[1]];
        if (head[0] < 0 || head[0] >= GRID || head[1] < 0 || head[1] >= GRID || prev.some(p => p[0] === head[0] && p[1] === head[1])) {
          setAlive(false); return prev;
        }
        const ate = head[0] === food[0] && head[1] === food[1];
        const next = [head, ...prev.slice(0, ate ? undefined : -1)];
        if (ate) { setScore(s => s + 1); setFood(randFood(next)); }
        return next;
      });
    }, 120);
    return () => clearInterval(t);
  }, [alive, food]);

  const dBtn = (dx, dy) => {
    const nd = [dx, dy];
    if (!(nd[0] === -dirRef.current[0] && nd[1] === -dirRef.current[1])) {
      dirRef.current = nd; setDir(nd);
    }
  };

  return (
    <MiniGameShell title="SNAKE" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 8, color: "#888" }}>SCORE: {score}</div>
        <div style={{ position: "relative", width: GRID * SZ, height: GRID * SZ, background: "#111", border: "2px solid #444" }}>
          {!alive && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", zIndex: 5 }}>
              <div style={{ fontSize: 8, color: "#fff", textAlign: "center", fontFamily: "'Press Start 2P'" }}>
                GAME OVER<br />
                <button onClick={() => { setSnake([[8,8],[7,8],[6,8]]); dirRef.current=[1,0]; setDir([1,0]); setFood([12,5]); setScore(0); setAlive(true); }}
                  style={{ marginTop: 8, background: "#fff", color: "#000", border: "none", padding: "4px 8px", fontSize: 7, fontFamily: "'Press Start 2P'", cursor: "pointer" }}>RETRY</button>
              </div>
            </div>
          )}
          {snake.map((p, i) => (
            <div key={i} style={{ position: "absolute", left: p[0] * SZ, top: p[1] * SZ, width: SZ - 1, height: SZ - 1, background: i === 0 ? "#fff" : "#aaa" }} />
          ))}
          <div style={{ position: "absolute", left: food[0] * SZ, top: food[1] * SZ, width: SZ - 1, height: SZ - 1, background: "#fff", border: "2px solid #000" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 40px)", gridTemplateRows: "repeat(3, 40px)", gap: 3, marginTop: 8 }}>
          {/* Row 1: empty, UP, empty */}
          <div />
          <button onClick={() => dBtn(0, -1)} style={{ background: "#333", color: "#fff", border: "2px solid #666", fontSize: 14, fontFamily: "'Press Start 2P'", cursor: "pointer", borderRadius: 4 }}>▲</button>
          <div />
          {/* Row 2: LEFT, center, RIGHT */}
          <button onClick={() => dBtn(-1, 0)} style={{ background: "#333", color: "#fff", border: "2px solid #666", fontSize: 14, fontFamily: "'Press Start 2P'", cursor: "pointer", borderRadius: 4 }}>◀</button>
          <div style={{ background: "#222", border: "2px solid #444", borderRadius: 4 }} />
          <button onClick={() => dBtn(1, 0)} style={{ background: "#333", color: "#fff", border: "2px solid #666", fontSize: 14, fontFamily: "'Press Start 2P'", cursor: "pointer", borderRadius: 4 }}>▶</button>
          {/* Row 3: empty, DOWN, empty */}
          <div />
          <button onClick={() => dBtn(0, 1)} style={{ background: "#333", color: "#fff", border: "2px solid #666", fontSize: 14, fontFamily: "'Press Start 2P'", cursor: "pointer", borderRadius: 4 }}>▼</button>
          <div />
        </div>
      </div>
    </MiniGameShell>
  );
}

// ─── MINI GAME: SUDOKU ───────────────────────────────────────────────────────
function generateSudoku() {
  const base = [
    [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9],
  ];
  const shuffle = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
  const rp=[...shuffle([0,1,2]),...shuffle([3,4,5]),...shuffle([6,7,8])];
  const cp=[...shuffle([0,1,2]),...shuffle([3,4,5]),...shuffle([6,7,8])];
  const solved=rp.map(r=>cp.map(c=>base[r][c]));
  const puzzle=solved.map(r=>[...r]);
  shuffle([...Array(81).keys()]).slice(0,46).forEach(i=>{puzzle[Math.floor(i/9)][i%9]=0;});
  return {puzzle,solved};
}

function GameSudoku({ onClose }) {
  const MAX_MISTAKES = 5;
  // difficulty screen: null = pick screen, "easy"/"hard" = playing
  const [difficulty, setDifficulty] = React.useState(null);
  const [{puzzle,solved}] = React.useState(()=>generateSudoku());
  const [board, setBoard] = React.useState(()=>puzzle.map(r=>[...r]));
  const [selected, setSelected] = React.useState(null);
  const [mistakes, setMistakes] = React.useState(0);
  const [wrongCells, setWrongCells] = React.useState(new Set());
  const [won, setWon] = React.useState(false);
  const [lost, setLost] = React.useState(false);
  const [notesMode, setNotesMode] = React.useState(false);
  const [noteBoard, setNoteBoard] = React.useState(()=>Array(9).fill(null).map(()=>Array(9).fill(null).map(()=>new Set())));

  const isFixed = (r,c) => puzzle[r][c] !== 0;
  const checkWin = (b) => b.every((row,r)=>row.every((v,c)=>v===solved[r][c]));
  const isHard = difficulty === "hard";

  const setCell = (val) => {
    if (!selected || isFixed(selected[0],selected[1]) || lost || won) return;
    const [r,c] = selected;
    if (notesMode && val !== 0) {
      const nb = noteBoard.map(row=>row.map(cell=>new Set(cell)));
      if (nb[r][c].has(val)) nb[r][c].delete(val); else nb[r][c].add(val);
      setNoteBoard(nb); return;
    }
    const nb = board.map(row=>[...row]);
    nb[r][c] = val;
    setBoard(nb);
    const key = r+"-"+c;
    if (val !== 0 && val !== solved[r][c]) {
      // Wrong answer
      const newWrong = new Set(wrongCells);
      newWrong.add(key);
      setWrongCells(newWrong);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (isHard && newMistakes >= MAX_MISTAKES) setLost(true);
    } else {
      // Correct — clear wrong highlight if it was previously wrong
      const newWrong = new Set(wrongCells);
      newWrong.delete(key);
      setWrongCells(newWrong);
      if (checkWin(nb)) setWon(true);
    }
  };

  const getCellBg = (r,c) => {
    if (selected && selected[0]===r && selected[1]===c) return "#fff";
    if (selected) {
      const [sr,sc]=selected;
      if (r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3))) return "#2a2a2a";
    }
    return "#111";
  };

  const getCellColor = (r,c) => {
    if (selected&&selected[0]===r&&selected[1]===c) return "#000";
    if (wrongCells.has(r+"-"+c)) return "#ff5555";
    if (isFixed(r,c)) return "#777";
    return "#fff";
  };

  // ── DIFFICULTY PICKER ──
  if (!difficulty) return (
    <MiniGameShell title="SUDOKU" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20,padding:"16px 0"}}>
        <div style={{fontSize:9,color:"#aaa",fontFamily:"'Press Start 2P'",textAlign:"center",lineHeight:2}}>SELECT DIFFICULTY</div>
        {/* EASY */}
        <button onClick={()=>setDifficulty("easy")} style={{
          background:"#000",color:"#fff",border:"3px solid #fff",
          padding:"12px 28px",fontSize:9,fontFamily:"'Press Start 2P'",cursor:"pointer",
          width:200,lineHeight:2
        }}>
          EASY
          <div style={{fontSize:6,color:"#888",marginTop:4}}>ERASE allowed</div>
          <div style={{fontSize:6,color:"#888"}}>Unlimited mistakes</div>
        </button>
        {/* HARD */}
        <button onClick={()=>setDifficulty("hard")} style={{
          background:"#000",color:"#fff",border:"3px solid #ff5555",
          padding:"12px 28px",fontSize:9,fontFamily:"'Press Start 2P'",cursor:"pointer",
          width:200,lineHeight:2
        }}>
          HARD
          <div style={{fontSize:6,color:"#ff8888",marginTop:4}}>NO ERASE button</div>
          <div style={{fontSize:6,color:"#ff8888"}}>5 mistakes = GAME OVER</div>
        </button>
      </div>
    </MiniGameShell>
  );

  // ── GAME OVER (hard mode) ──
  if (lost) return (
    <MiniGameShell title="SUDOKU" onClose={onClose}>
      <div style={{textAlign:"center",color:"#fff",fontFamily:"'Press Start 2P'",padding:20,display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div style={{fontSize:18}}></div>
        <div style={{fontSize:11,color:"#ff5555"}}>GAME OVER</div>
        <div style={{fontSize:7,color:"#888",lineHeight:2}}>5 mistakes reached!<br/>HARD MODE defeated you!</div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={()=>{ setDifficulty(null); setBoard(puzzle.map(r=>[...r])); setMistakes(0); setWrongCells(new Set()); setLost(false); setWon(false); setSelected(null); }}
            style={{background:"#fff",color:"#000",border:"none",padding:"6px 14px",fontSize:8,fontFamily:"'Press Start 2P'",cursor:"pointer"}}>RETRY</button>
          <button onClick={onClose}
            style={{background:"#111",color:"#888",border:"2px solid #444",padding:"6px 14px",fontSize:8,fontFamily:"'Press Start 2P'",cursor:"pointer"}}>EXIT</button>
        </div>
      </div>
    </MiniGameShell>
  );

  // ── WIN ──
  if (won) return (
    <MiniGameShell title="SUDOKU" onClose={onClose}>
      <div style={{textAlign:"center",color:"#fff",fontFamily:"'Press Start 2P'",padding:20,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <div style={{fontSize:18}}></div>
        <div style={{fontSize:11}}>SOLVED!</div>
        <div style={{fontSize:7,color:"#888",lineHeight:2}}>
          {isHard ? `HARD MODE cleared!
Mistakes: ${mistakes}/5 — IMPRESSIVE!` : `EASY MODE cleared!
Mistakes: ${mistakes}`}
        </div>
        <div style={{fontSize:7,color:"#555",marginTop:4}}>BEEP! You are worthy of Master Ron!</div>
      </div>
    </MiniGameShell>
  );

  // ── PLAYING ──
  return (
    <MiniGameShell title={`SUDOKU — ${isHard?"HARD":"EASY"}`} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
        {/* Status bar */}
        <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"space-between",width:"100%"}}>
          <span style={{fontSize:7,color:isHard&&mistakes>=3?"#ff5555":"#888",fontFamily:"'Press Start 2P'"}}>
            {isHard ? `♥ ${MAX_MISTAKES - mistakes} LEFT` : `ERR: ${mistakes}`}
          </span>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setNotesMode(n=>!n)} style={{background:notesMode?"#fff":"#222",color:notesMode?"#000":"#aaa",border:"2px solid #555",padding:"2px 8px",fontSize:7,fontFamily:"'Press Start 2P'",cursor:"pointer"}}>
              ✏️ {notesMode?"NOTE ON":"NOTE OFF"}
            </button>
          </div>
        </div>

        {/* Hard mode mistake hearts */}
        {isHard && (
          <div style={{display:"flex",gap:4}}>
            {Array.from({length:MAX_MISTAKES}).map((_,i)=>(
              <span key={i} style={{fontSize:12,opacity:i<(MAX_MISTAKES-mistakes)?1:0.15}}>♥</span>
            ))}
          </div>
        )}

        {/* Board */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(9,28px)",gridTemplateRows:"repeat(9,28px)",gap:1,background:"#555",border:"2px solid #888"}}>
          {board.map((row,r)=>row.map((val,c)=>{
            const ns=noteBoard[r][c];
            return (
              <div key={r+"-"+c} onClick={()=>setSelected([r,c])} style={{
                width:28,height:28,background:getCellBg(r,c),color:getCellColor(r,c),
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:val===0&&ns.size>0?5:10,fontFamily:"'Press Start 2P'",cursor:"pointer",
                borderRight:(c+1)%3===0&&c<8?"2px solid #888":"none",
                borderBottom:(r+1)%3===0&&r<8?"2px solid #888":"none",
                userSelect:"none",boxSizing:"border-box"
              }}>
                {val!==0 ? val : ns.size>0 ? (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",width:"100%",height:"100%",fontSize:5,lineHeight:1.3}}>
                    {[1,2,3,4,5,6,7,8,9].map(n=>(
                      <span key={n} style={{color:ns.has(n)?"#aaa":"transparent",textAlign:"center"}}>{n}</span>
                    ))}
                  </div>
                ) : ""}
              </div>
            );
          }))}
        </div>

        {/* Number pad */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(9,28px)",gap:3,marginTop:4}}>
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <button key={n} onClick={()=>setCell(n)} style={{height:28,background:"#222",color:"#fff",border:"2px solid #555",fontSize:9,fontFamily:"'Press Start 2P'",cursor:"pointer"}}>{n}</button>
          ))}
        </div>

        {/* Erase — EASY only */}
        {!isHard && (
          <button onClick={()=>setCell(0)} style={{background:"#111",color:"#666",border:"2px solid #333",padding:"3px 16px",fontSize:7,fontFamily:"'Press Start 2P'",cursor:"pointer"}}>ERASE</button>
        )}
      </div>
    </MiniGameShell>
  );
}

// Mini game shell wrapper
function MiniGameShell({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#000", border: "4px solid #fff", width: "min(90vw, 420px)", maxHeight: "80vh", display: "flex", flexDirection: "column", fontFamily: "'Press Start 2P'" }} className="pixel-border">
        <div style={{ background: "#fff", color: "#000", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 8 }}>
          <span>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, fontFamily: "'Press Start 2P'" }}>✕</button>
        </div>
        <div style={{ padding: 16, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

// Mobile joystick
function Joystick({ onDir }) {
  const [active, setActive] = React.useState(false);
  const [knob, setKnob] = React.useState({ x: 0, y: 0 });
  const base = React.useRef(null);
  const R = 40;

  const getDir = (dx, dy) => {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return null;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
    return dy > 0 ? "down" : "up";
  };

  const onTouch = (e) => {
    e.preventDefault();
    const rect = base.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const touch = e.touches[0];
    const dx = Math.max(-R, Math.min(R, touch.clientX - cx));
    const dy = Math.max(-R, Math.min(R, touch.clientY - cy));
    setKnob({ x: dx, y: dy });
    setActive(true);
    onDir(getDir(dx, dy));
  };

  const onEnd = () => { setKnob({ x: 0, y: 0 }); setActive(false); onDir(null); };

  return (
    <div
      ref={base}
      onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={onEnd}
      style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "3px solid rgba(255,255,255,0.3)", position: "relative", touchAction: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.6)", transform: `translate(${knob.x}px, ${knob.y}px)`, transition: active ? "none" : "transform 0.1s" }} />
    </div>
  );
}

// HUD
function HUD({ onBack, isMobile }) {
  return (
    <div style={{ position: "fixed", top: 12, left: 12, zIndex: 50, fontFamily: "'Press Start 2P'", fontSize: 8, color: "#fff", display: "flex", gap: 12, alignItems: "center" }}>
      <button onClick={onBack} style={{ background: "#000", color: "#fff", border: "2px solid #fff", padding: "4px 10px", fontSize: 7, fontFamily: "'Press Start 2P'", cursor: "pointer" }}>← EXIT</button>
      <span style={{ color: "#888" }}>{isMobile ? "USE JOYSTICK" : "WASD / ARROWS"}</span>
    </div>
  );
}

// Main game component
function Game() {
  const isMobile = window.innerWidth < 768;
  const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem("darkMode") === "true");

  React.useEffect(() => {
    const sync = () => {
      const dark = localStorage.getItem("darkMode") === "true";
      setDarkMode(dark);
      document.documentElement.style.setProperty("--floor", dark ? "#0f0f0f" : "#d0d0d0");
      document.documentElement.style.setProperty("--floor-b", dark ? "#151515" : "#bebebe");
    };
    window.addEventListener("storage", sync);
    const t = setInterval(sync, 800);
    return () => { window.removeEventListener("storage", sync); clearInterval(t); };
  }, []);
  const W = COLS * TILE;
  const H = ROWS * TILE;

  // Player — position lives in ref; DOM updated directly (no React re-render for movement)
  const INIT_PX = 10 * TILE + TILE / 2, INIT_PY = 11 * TILE + TILE / 2;
  const INIT_RX = 10 * TILE + TILE / 2, INIT_RY = 6 * TILE + TILE / 2;
  const posRef = React.useRef({ x: INIT_PX, y: INIT_PY });
  const robotRef = React.useRef({ x: INIT_RX, y: INIT_RY });
  const robotTargetRef = React.useRef(null);
  const robotFollowRef = React.useRef(false);
  const playerDomRef = React.useRef(null);  // direct DOM handle for player sprite
  const robotDomRef = React.useRef(null);   // direct DOM handle for robot sprite
  const worldDomRef = React.useRef(null);   // direct DOM handle for world div (camera)
  const movingRef = React.useRef(false);
  const robotMovingRef = React.useRef(false);
  const dirRef = React.useRef("up");
  const frameArrowFrameRef = React.useRef(0);
  const frameTimerRef = React.useRef(0);

  // UI state — only these cause React re-renders
  const [chatOpen, setChatOpen] = React.useState(false);
  const [dialog, setDialog] = React.useState(null);
  const [activeGame, setActiveGame] = React.useState(null);
  const activeGameRef = React.useRef(null);
  const [joystickDir, setJoystickDir] = React.useState(null);
  // nearStation/nearRobot still needed for prompt rendering — updated via ref+forceUpdate trick
  const [nearPrompt, setNearPrompt] = React.useState(null); // null | station obj | "robot"

  const keysRef = React.useRef({});
  const joystickRef = React.useRef(null);
  const frameRef = React.useRef(null);

  // Camera — direct DOM transform, no React state
  const camRef = React.useRef({ x: 0, y: 0 });
  const updateCam = (px, py) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const nx = Math.max(0, Math.min(W - vw, px - vw / 2));
    const ny = Math.max(0, Math.min(H - vh, py - vh / 2));
    if (Math.abs(nx - camRef.current.x) > 0.5 || Math.abs(ny - camRef.current.y) > 0.5) {
      camRef.current = { x: nx, y: ny };
      if (worldDomRef.current) {
        worldDomRef.current.style.left = -nx + "px";
        worldDomRef.current.style.top  = -ny + "px";
      }
    }
  };

  // Keyboard input
  React.useEffect(() => {
    const dn = (e) => {
      if (chatOpen) return; // Block movement when chat is open
      if (["w","a","s","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key] = true;
      }
    };
    const up = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [chatOpen]);

  // Robot come-here / follow / stop events
  React.useEffect(() => {
    const onComeHere = () => { robotFollowRef.current = false; robotTargetRef.current = { ...posRef.current }; };
    const onFollow   = () => { robotFollowRef.current = true; };
    const onStop     = () => { robotFollowRef.current = false; robotTargetRef.current = null; };
    window.addEventListener("robot-come-here", onComeHere);
    window.addEventListener("robot-follow",    onFollow);
    window.addEventListener("robot-stop",      onStop);
    return () => {
      window.removeEventListener("robot-come-here", onComeHere);
      window.removeEventListener("robot-follow",    onFollow);
      window.removeEventListener("robot-stop",      onStop);
    };
  }, []);

  // Arrow frames for walk animation
  const ARROW_FRAMES = { down: ["▼","▽"], up: ["▲","△"], left: ["◀","◁"], right: ["▶","▷"] };

  // Game loop — pure DOM mutations, zero React state changes per frame
  React.useEffect(() => {
    let lastNearPrompt = null;
    const loop = (ts) => {
      if (!activeGameRef.current) {
        const k = keysRef.current;
        const jd = joystickRef.current;
        let dx = 0, dy = 0;
        if (k["a"] || k["ArrowLeft"]  || jd === "left")  dx = -PLAYER_SPEED;
        else if (k["d"] || k["ArrowRight"] || jd === "right") dx =  PLAYER_SPEED;
        if (k["w"] || k["ArrowUp"]    || jd === "up")    dy = -PLAYER_SPEED;
        else if (k["s"] || k["ArrowDown"]  || jd === "down")  dy =  PLAYER_SPEED;

        // ── Player movement ──
        if (dx !== 0 || dy !== 0) {
          const cur = posRef.current;
          let nx = cur.x + dx, ny = cur.y + dy;
          const pad = 6;
          const canX = !isWall(Math.floor((nx+pad)/TILE), Math.floor(cur.y/TILE)) &&
                       !isWall(Math.floor((nx-pad)/TILE), Math.floor(cur.y/TILE));
          const canY = !isWall(Math.floor(cur.x/TILE), Math.floor((ny+pad)/TILE)) &&
                       !isWall(Math.floor(cur.x/TILE), Math.floor((ny-pad)/TILE));
          if (!canX) nx = cur.x;
          if (!canY) ny = cur.y;
          posRef.current = { x: nx, y: ny };

          // Move player DOM directly
          if (playerDomRef.current) {
            playerDomRef.current.style.left = (nx - TILE/2) + "px";
            playerDomRef.current.style.top  = (ny - TILE/2) + "px";
          }

          // Direction arrow — only update DOM text when dir changes
          const newDir = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
          if (dirRef.current !== newDir) {
            dirRef.current = newDir;
            frameArrowFrameRef.current = 0;
          }

          // Walk animation tick (every ~150ms)
          if (ts - frameTimerRef.current > 150) {
            frameTimerRef.current = ts;
            frameArrowFrameRef.current = 1 - frameArrowFrameRef.current;
          }
          if (playerDomRef.current) {
            const arrow = playerDomRef.current.querySelector(".player-arrow");
            if (arrow) arrow.textContent = ARROW_FRAMES[dirRef.current][frameArrowFrameRef.current];
          }

          movingRef.current = true;
          updateCam(nx, ny);
        } else {
          if (movingRef.current) {
            movingRef.current = false;
            // Reset to idle frame
            if (playerDomRef.current) {
              const arrow = playerDomRef.current.querySelector(".player-arrow");
              if (arrow) arrow.textContent = ARROW_FRAMES[dirRef.current][0];
            }
          }
        }

        // ── Robot movement ──
        if (robotFollowRef.current) {
          const r = robotRef.current;
          const fpx = posRef.current.x, fpy = posRef.current.y;
          const fDist = Math.sqrt((fpx-r.x)**2 + (fpy-r.y)**2);
          if (fDist > TILE * 1.5) robotTargetRef.current = { x: fpx, y: fpy };
          else robotTargetRef.current = null;
        }
        if (robotTargetRef.current) {
          const r = robotRef.current;
          const t = robotTargetRef.current;
          const rdx = t.x - r.x, rdy = t.y - r.y;
          const dist = Math.sqrt(rdx*rdx + rdy*rdy);
          if (dist < ROBOT_SPEED + 2) {
            robotTargetRef.current = null;
          } else {
            const nx = r.x + (rdx/dist) * ROBOT_SPEED;
            const ny = r.y + (rdy/dist) * ROBOT_SPEED;
            robotRef.current = { x: nx, y: ny };
            if (robotDomRef.current) {
              robotDomRef.current.style.left = (nx - TILE/2) + "px";
              robotDomRef.current.style.top  = (ny - TILE - 4) + "px";
            }
          }
        }

        // ── Proximity check for near-prompt (only re-render when it changes) ──
        const px = posRef.current.x, py = posRef.current.y;
        const rx = robotRef.current.x, ry = robotRef.current.y;
        const robotDist = Math.sqrt((px-rx)**2 + (py-ry)**2);
        const nearRobot = robotDist < TILE * 1.5;
        nearRobotRef.current = nearRobot;

        const foundStation = STATIONS.find(s => {
          const sx = s.col*TILE + TILE/2, sy = s.row*TILE + TILE/2;
          return Math.sqrt((px-sx)**2 + (py-sy)**2) < TILE * 2;
        }) ?? null;
        nearStationRef.current = foundStation;

        const nextPrompt = foundStation ? foundStation.id : (nearRobot ? "robot" : null);
        if (nextPrompt !== lastNearPrompt) {
          lastNearPrompt = nextPrompt;
          setNearPrompt(foundStation || (nearRobot ? "robot" : null));
        }
      }

      frameRef.current = requestAnimationFrame(loop);
    };
    // Init camera position
    updateCam(posRef.current.x, posRef.current.y);
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // Joystick — update ref directly so game loop picks it up without delay
  // (setJoystickDir kept for compatibility but ref is what the loop reads)

  // Proximity refs — updated by game loop directly
  const nearStationRef = React.useRef(null);
  const nearRobotRef = React.useRef(false);
  // nearPrompt state (set by loop only when changed) drives the PRESS E prompt render
  const nearStation = typeof nearPrompt === "object" && nearPrompt !== null ? nearPrompt : null;
  const nearRobot = nearPrompt === "robot";

  // E key handler
  React.useEffect(() => {
    const h = (e) => {
      if (e.key !== "e" && e.key !== "E") return;
      if (activeGameRef.current) return;
      if (nearStationRef.current) {
        keysRef.current = {};
        activeGameRef.current = nearStationRef.current.id;
        setActiveGame(nearStationRef.current.id);
      } else if (nearRobotRef.current) {
        keysRef.current = {};
        setChatOpen(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const openGame = (id) => {
    keysRef.current = {};
    activeGameRef.current = id;
    setActiveGame(id);
  };

  return (
    <div style={{ width: "100vw", height: "100dvh", overflow: "hidden", background: darkMode ? "#000" : "#e8e8e8", position: "relative" }}>
      {/* WORLD */}
      <div ref={worldDomRef} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }}>
        {/* Tiles */}
        {MAP.map((row, r) => row.map((type, c) => <Tile key={`${r}-${c}`} type={type} col={c} row={r} />))}

        {/* Station labels */}
        {STATIONS.map(s => (
          <StationSprite key={s.id} station={s} playerNear={nearStation?.id === s.id} onEnter={() => openGame(s.id)} />
        ))}

        {/* Robot */}
        <RobotSprite initX={INIT_RX} initY={INIT_RY} robotRef={robotDomRef} onInteract={() => { const rx=robotRef.current.x, ry=robotRef.current.y, px=posRef.current.x, py=posRef.current.y; const d=Math.sqrt((px-rx)**2+(py-ry)**2); if (d < TILE * 3) { keysRef.current = {}; setChatOpen(true); } else setDialog("The robot is too far! Get closer!"); }} />

        {/* Player */}
        <PlayerSprite initX={INIT_PX} initY={INIT_PY} spriteRef={playerDomRef} />
      </div>

      {/* HUD */}
      <HUD onBack={() => window.location.href = "./index.html"} isMobile={isMobile} />

      {/* Near-station prompt */}
      {nearStation && !activeGame && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Press Start 2P'", fontSize: 9, color: "#fff", background: "#000", border: "3px solid #fff", padding: "10px 18px", zIndex: 60, pointerEvents: "none" }} className="blink">
          PRESS E or TAP to play {nearStation.label}
        </div>
      )}



      {/* Mobile joystick */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 80 }}>
          <Joystick onDir={(d) => { joystickRef.current = d; setJoystickDir(d); }} />
        </div>
      )}

      {/* Mobile action button */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 40, right: 24, zIndex: 80, display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onTouchStart={() => { if (nearStation) openGame(nearStation.id); else if (nearRobot) setChatOpen(true); }}
            style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.4)", color: "#fff", fontSize: 10, fontFamily: "'Press Start 2P'", cursor: "pointer" }}
          >A</button>
        </div>
      )}

      {/* Dialog */}
      {dialog && <DialogBox text={dialog} onClose={() => setDialog(null)} />}

      {/* Chat */}
      {chatOpen && <RobotChat onClose={() => { keysRef.current = {}; setChatOpen(false); }} />}

      {/* Mini games */}
      {activeGame === "rps" && <GameRPS onClose={() => { activeGameRef.current = null; keysRef.current = {}; setActiveGame(null); }} />}
      {activeGame === "guess" && <GameGuess onClose={() => { activeGameRef.current = null; keysRef.current = {}; setActiveGame(null); }} />}
      {activeGame === "quiz" && <GameTrivia onClose={() => { activeGameRef.current = null; keysRef.current = {}; setActiveGame(null); }} />}
      {activeGame === "snake" && <GameSnake onClose={() => { activeGameRef.current = null; keysRef.current = {}; setActiveGame(null); }} />}
      {activeGame === "sudoku" && <GameSudoku onClose={() => { activeGameRef.current = null; keysRef.current = {}; setActiveGame(null); }} />}

      {/* Instructions overlay on load */}
      <Instructions />
    </div>
  );
}

// Intro instructions overlay
function Instructions() {
  const [show, setShow] = React.useState(true);
  const isMobile = window.innerWidth < 768;

  React.useEffect(() => {
    const sync = () => {
      const dark = localStorage.getItem("darkMode") === "true";
      document.documentElement.style.setProperty("--floor", dark ? "#0f0f0f" : "#d0d0d0");
      document.documentElement.style.setProperty("--floor-b", dark ? "#151515" : "#bebebe");
    };
    window.addEventListener("storage", sync);
    const t = setInterval(sync, 800);
    return () => { window.removeEventListener("storage", sync); clearInterval(t); };
  }, []);

  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#000", border: "4px solid #fff", padding: 24, maxWidth: 360, fontFamily: "'Press Start 2P'", fontSize: 8, color: "#fff", lineHeight: 2.2 }} className="pixel-border">
        <div style={{ fontSize: 11, marginBottom: 16, textAlign: "center" }}>🎮 RON'S GAME ROOM</div>
        <div style={{ color: "#aaa", marginBottom: 8 }}>{isMobile ? "JOYSTICK → MOVE" : "WASD / ARROWS → MOVE"}</div>
        <div style={{ color: "#aaa", marginBottom: 8 }}>{isMobile ? "A BUTTON → INTERACT" : "E KEY → INTERACT"}</div>
        <div style={{ color: "#aaa", marginBottom: 8 }}>🤖 TALK TO RON-BOT</div>
        <div style={{ color: "#aaa", marginBottom: 16 }}>🎮 WALK NEAR ICONS TO PLAY</div>
        <button onClick={() => setShow(false)} style={{ background: "#fff", color: "#000", border: "none", padding: "8px 20px", fontSize: 9, fontFamily: "'Press Start 2P'", cursor: "pointer", width: "100%" }}>
          START ▶
        </button>
      </div>
    </div>
  );
}

// App entry point
function App() {
  return <Game />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);