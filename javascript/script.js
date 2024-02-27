console.log("Hello World");

let currentSong = new Audio(); 

let songs;

let currFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    
    currFolder = folder;

    let a = await fetch(`/${folder}/`); //last update

    
    let response = await a.text();

    let div = document.createElement("div");

    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];

    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                                    <img class="invert" src="./images/music.svg" alt="music icon">
                                    <div class="info">
                                        <div>${song.replaceAll("%20"," ")} </div>
                                        <div>Siddharth </div>
                                    </div>
                                    <div class="playNow">
                                        <span>Play Now</span>
                                        <img class="invert" src="./images/play.svg" alt="">
                                    </div>
                                </li>`;
    }

    //Now adding event Listeners to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e)=>{
        e.addEventListener("click", (element)=>{

            console.log(e.querySelector(".info").firstElementChild.innerHTML);

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}
// ${song.replaceAll("%20"," ")} 


function playMusic(track, pause=false){
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;

    if(!pause){
        currentSong.play();
        play.src = "./images/pause.svg";
    }

    document.querySelector(".songInfo").innerHTML =  decodeURI(track);
    document.querySelector(".songTime").innerHTML =  "00:00 / 00:00";

}

async function displayAlbums(){
    let a = await fetch(`/songs/`);
    
    let response = await a.text();

    let div = document.createElement("div");

    div.innerHTML = response;


    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="cover image">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    //load the current library on clicking the card
    Array.from(document.getElementsByClassName("card")).forEach((e)=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
    
}


async function main(){

   

    //gets all the songs
    await getSongs("songs/cs");

    playMusic(songs[0], true)



    //Display all the albums on the page
    displayAlbums();


    //Now adding event Listerns to previous, play and next buttons
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "./images/pause.svg";
        }

        else{
            currentSong.pause();
            play.src = "./images/play.svg";
        }
    });


    //Time Updation
    currentSong.addEventListener("timeupdate", ()=>{
        
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });


    //Seeking 
    document.querySelector(".seekbar").addEventListener("click", (e)=>{

        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration)*percent)/100;
    });


    //Event listener for Hamburger icon
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0";
    })

    //Event listener for close button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%";
    })

    //Event listeners for previous and next
    previous.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        
        if((index-1)>=0){   
            playMusic(songs[index-1]);
        }
    })
    
    next.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        
        if((index+1) < songs.length){   
            playMusic(songs[index+1]);
        }
    })

    
}


main();