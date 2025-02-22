export const CLICKSOUND = new Audio("assets/audio/click.wav"); 
export const EATSOUND = new Audio("assets/audio/eat.wav");
export const BGMUSIC = document.getElementById("bgMusic");

export function playEatSound() {
    this.EATSOUND.play().catch(error => console.error("Playback error:", error));
}

export function playClickSound() {
    this.CLICKSOUND.play().catch(error => console.error("Playback error:", error));
}

export function check(paused, running){
    if(paused || !running || this.BGMUSIC.muted){
        this.BGMUSIC.pause();
    }
    else{
        this.BGMUSIC.play();
    }
}