function downloadCV(){
    const link = document.createElement('a');
    link.href = "../../cv/Magsipoc, RonLouie.pdf";
    link.download = "Magsipoc, RonLouie.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}