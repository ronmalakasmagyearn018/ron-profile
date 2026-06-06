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
  { id: "rps",   col: 5,  row: 5,  label: "Rock Paper Scissors", icon: "✊" },
  { id: "guess", col: 14, row: 10, label: "Guess My Number",      icon: "🔢" },
  { id: "quiz",  col: 5,  row: 9,  label: "Trivia Quiz",          icon: "❓" },
  { id: "snake", col: 15, row: 9,  label: "Snake",                icon: "🐍" },
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

// Player sprite
function PlayerSprite({ x, y, dir, moving }) {
  const frames = { down: ["▼","▽"], up: ["▲","△"], left: ["◀","◁"], right: ["▶","▷"] };
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    if (!moving) return;
    const t = setInterval(() => setFrame(f => 1 - f), 150);
    return () => clearInterval(t);
  }, [moving]);
  return (
    <div style={{ position: "absolute", left: x - TILE / 2, top: y - TILE / 2, width: TILE, height: TILE, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "left 0.05s, top 0.05s" }}>
      <div style={{ fontSize: 10, color: "#fff", fontFamily: "'Press Start 2P'" }}>YOU</div>
      <div style={{ fontSize: 18, color: "#fff", lineHeight: 1 }}>{frames[dir][frame]}</div>
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

function RobotSprite({ x, y, chatOpen, onInteract }) {
  return (
    <div
      style={{ position: "absolute", left: x - TILE / 2, top: y - TILE - 4, width: TILE, height: TILE + 8, zIndex: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}
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
      return rand(["BOOP! My favorite activity is STANDING HERE and answering questions! Also... watching Master Ron code at 2AM. Dedication!","BEEP! I enjoy floating, blinking, and calculating the perfect WASD route across this pixel room!"]);
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
      return"BEEP! Current version: RON-BOT v1.0! Master Ron can upgrade me anytime by editing game.js! Feature requests welcome!";
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
    if (has("game","play","minigame","games","fun","activity"))
      return"BOOP! Walk near the icons to play:  Rock Paper Scissors |  Guess My Number |  Trivia Quiz |  Snake!";

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

    return rand(["BZZZT! That query is outside my knowledge matrix! Try asking about Master Ron, the games, or about ME!","BEEP BOOP! Unknown input detected! Ask me about Ron\'s skills, projects, or say \'tell me a joke\'!","BOOP! My circuits are confused! Try asking: \'what are your skills?\' or \'tell me a secret\'!"
    ]);
  };

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    const isComeHere = text.toLowerCase().includes("come here") || text.toLowerCase().includes("come to me") || text.toLowerCase().includes("come over");

    setTimeout(() => {
      const reply = getRobotReply(text);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setLoading(false);
      if (isComeHere) window.dispatchEvent(new CustomEvent("robot-come-here"));
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
          <div style={{ color: "#fff", fontSize: 10 }}>WON in {tries} tries! 🏆</div>
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
          <div style={{ fontSize: 8, color: "#888", marginTop: 8 }}>{score === TRIVIA.length ? "PERFECT! 🏆" : score >= 3 ? "GREAT! 👍" : "TRY AGAIN!"}</div>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 36px)", gap: 4, marginTop: 4 }}>
          {[["", [0,-1], "▲"], ["", null, ""], ["", [0,1], "▼"], ["", [-1,0], "◀"], ["", null, ""], ["", [1,0], "▶"]].map(([, nd, label], i) => (
            nd ? <button key={i} onClick={() => dBtn(nd[0], nd[1])} style={{ height: 36, background: "#222", color: "#fff", border: "2px solid #555", fontSize: 12, fontFamily: "'Press Start 2P'", cursor: "pointer" }}>{label}</button>
              : <div key={i} />
          ))}
        </div>
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

  // Player state
  const [playerPos, setPlayerPos] = React.useState({ x: 10 * TILE + TILE / 2, y: 11 * TILE + TILE / 2 });
  const [playerDir, setPlayerDir] = React.useState("up");
  const [moving, setMoving] = React.useState(false);
  const posRef = React.useRef({ x: 10 * TILE + TILE / 2, y: 11 * TILE + TILE / 2 });

  // Robot state
  const [robotPos, setRobotPos] = React.useState({ x: 10 * TILE + TILE / 2, y: 6 * TILE + TILE / 2 });
  const robotRef = React.useRef({ x: 10 * TILE + TILE / 2, y: 6 * TILE + TILE / 2 });
  const [robotMoving, setRobotMoving] = React.useState(false);
  const robotTargetRef = React.useRef(null);

  // UI state
  const [chatOpen, setChatOpen] = React.useState(false);
  const [dialog, setDialog] = React.useState(null);
  const [activeGame, setActiveGame] = React.useState(null);
  const [joystickDir, setJoystickDir] = React.useState(null);

  const keysRef = React.useRef({});
  const joystickRef = React.useRef(null);
  const frameRef = React.useRef(null);

  // Camera (center on player)
  const initCam = () => {
    const px = 10 * TILE + TILE / 2, py = 11 * TILE + TILE / 2;
    const vw = window.innerWidth, vh = window.innerHeight;
    return {
      x: Math.max(0, Math.min(W - vw, px - vw / 2)),
      y: Math.max(0, Math.min(H - vh, py - vh / 2))
    };
  };
  const [cam, setCam] = React.useState(() => initCam());
  const updateCam = (px, py) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setCam({
      x: Math.max(0, Math.min(W - vw, px - vw / 2)),
      y: Math.max(0, Math.min(H - vh, py - vh / 2))
    });
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

  // Robot come-here event
  React.useEffect(() => {
    const handler = () => { robotTargetRef.current = { ...posRef.current }; };
    window.addEventListener("robot-come-here", handler);
    return () => window.removeEventListener("robot-come-here", handler);
  }, []);

  // Game loop
  React.useEffect(() => {
    const loop = () => {
      // Move player
      const k = keysRef.current;
      const jd = joystickRef.current;
      let dx = 0, dy = 0;
      if (k["a"] || k["ArrowLeft"] || jd === "left") { dx = -PLAYER_SPEED; }
      else if (k["d"] || k["ArrowRight"] || jd === "right") { dx = PLAYER_SPEED; }
      if (k["w"] || k["ArrowUp"] || jd === "up") { dy = -PLAYER_SPEED; }
      else if (k["s"] || k["ArrowDown"] || jd === "down") { dy = PLAYER_SPEED; }

      if (dx !== 0 || dy !== 0) {
        const cur = posRef.current;
        let nx = cur.x + dx, ny = cur.y + dy;
        const tc = Math.floor(nx / TILE), tr = Math.floor(ny / TILE);
        const pad = 6;
        const canX = !isWall(Math.floor((nx + pad) / TILE), Math.floor((cur.y) / TILE)) && !isWall(Math.floor((nx - pad) / TILE), Math.floor((cur.y) / TILE));
        const canY = !isWall(Math.floor((cur.x) / TILE), Math.floor((ny + pad) / TILE)) && !isWall(Math.floor((cur.x) / TILE), Math.floor((ny - pad) / TILE));
        if (!canX) nx = cur.x;
        if (!canY) ny = cur.y;
        posRef.current = { x: nx, y: ny };
        setPlayerPos({ x: nx, y: ny });
        setMoving(true);
        if (dx < 0) setPlayerDir("left");
        else if (dx > 0) setPlayerDir("right");
        else if (dy < 0) setPlayerDir("up");
        else setPlayerDir("down");
        updateCam(nx, ny);
      } else {
        setMoving(false);
      }

      // Move robot toward target
      if (robotTargetRef.current) {
        const r = robotRef.current;
        const t = robotTargetRef.current;
        const rdx = t.x - r.x, rdy = t.y - r.y;
        const dist = Math.sqrt(rdx * rdx + rdy * rdy);
        if (dist < ROBOT_SPEED + 2) {
          robotTargetRef.current = null;
          setRobotMoving(false);
        } else {
          const nx = r.x + (rdx / dist) * ROBOT_SPEED;
          const ny = r.y + (rdy / dist) * ROBOT_SPEED;
          robotRef.current = { x: nx, y: ny };
          setRobotPos({ x: nx, y: ny });
          setRobotMoving(true);
        }
      } else {
        setRobotMoving(false);
      }

      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // Joystick sync
  React.useEffect(() => { joystickRef.current = joystickDir; }, [joystickDir]);

  // E key interaction (ref-based to avoid stale closure)
  const nearStationRef = React.useRef(null);
  const nearRobotRef = React.useRef(false);
  React.useEffect(() => { nearStationRef.current = nearStation; }, [nearStation]);
  React.useEffect(() => { nearRobotRef.current = nearRobot; }, [nearRobot]);
  React.useEffect(() => {
    const h = (e) => {
      if (e.key === "e" || e.key === "E") {
        if (nearStationRef.current) openGame(nearStationRef.current.id);
        else if (nearRobotRef.current) { keysRef.current = {}; setChatOpen(true); }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Robot proximity check
  const robotDist = Math.sqrt((playerPos.x - robotPos.x) ** 2 + (playerPos.y - robotPos.y) ** 2);
  const nearRobot = robotDist < TILE * 1.5;

  // Station proximity check
  const nearStation = STATIONS.find(s => {
    const sx = s.col * TILE + TILE / 2, sy = s.row * TILE + TILE / 2;
    return Math.sqrt((playerPos.x - sx) ** 2 + (playerPos.y - sy) ** 2) < TILE * 2;
  });

  const openGame = (id) => {
    setActiveGame(id);
  };

  return (
    <div style={{ width: "100vw", height: "100dvh", overflow: "hidden", background: darkMode ? "#000" : "#e8e8e8", position: "relative" }}>
      {/* WORLD */}
      <div style={{ position: "absolute", left: -cam.x, top: -cam.y, width: W, height: H }}>
        {/* Tiles */}
        {MAP.map((row, r) => row.map((type, c) => <Tile key={`${r}-${c}`} type={type} col={c} row={r} />))}

        {/* Station labels */}
        {STATIONS.map(s => (
          <StationSprite key={s.id} station={s} playerNear={nearStation?.id === s.id} onEnter={() => openGame(s.id)} />
        ))}

        {/* Robot */}
        <RobotSprite x={robotPos.x} y={robotPos.y} chatOpen={chatOpen} onInteract={() => { if (nearRobot || robotDist < TILE * 3) { keysRef.current = {}; setChatOpen(true); } else setDialog("The robot is too far! Get closer!"); }} />

        {/* Player */}
        <PlayerSprite x={playerPos.x} y={playerPos.y} dir={playerDir} moving={moving} />
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
          <Joystick onDir={setJoystickDir} />
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
      {chatOpen && <RobotChat onClose={() => setChatOpen(false)} />}

      {/* Mini games */}
      {activeGame === "rps" && <GameRPS onClose={() => setActiveGame(null)} />}
      {activeGame === "guess" && <GameGuess onClose={() => setActiveGame(null)} />}
      {activeGame === "quiz" && <GameTrivia onClose={() => setActiveGame(null)} />}
      {activeGame === "snake" && <GameSnake onClose={() => setActiveGame(null)} />}

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