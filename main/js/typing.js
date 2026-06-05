const texts = [
    "Frontend Developer",
    "Backend Developer",
    "API Integration",
    "UI/UX Designer",
    "Computer Hardware Troubleshooting",
    "Network Troubleshooting",
]

let currentIndex = 0;
let currentText = "";
let isDeleting = false;
let typingSpeed = 100;

function type(){
    const target = texts[currentIndex];

    if(isDeleting){
        currentText = target.substring(0, currentText.length - 1);
    } else{
        currentText = target.substring(0, currentText.length + 1);
    }

    document.getElementById("typing-text").textContent = currentText;

    if (!isDeleting && currentText === target){
        setTimeout(() => { isDeleting = true; type(); }, 1500);
        return;
    }

    if (isDeleting && currentText === ""){
        isDeleting = false;
        currentIndex = (currentIndex + 1) % texts.length;
        typingSpeed = 100;
    }
    setTimeout(type, isDeleting? 50 : typingSpeed);
}
setTimeout(type, 500);