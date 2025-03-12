const CLIENT_ID = Config.CLIENT_ID_SPOTIFY;
const REDIRECT_URL = Config.URL_PAGE;
const auth_url = Config.AUTH_URL;
const SCOPES = Config.SCOPES;

let ListPlaylist = [];

function login() {
    const url = `${auth_url}?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${SCOPES.join('%20')}`;
    window.location.href = url;
}

function getAccessToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get("access_token");
}

const token = getAccessToken();
if (!token) {
    console.error("Nenhum token encontrado. Faça login primeiro.");
    document.getElementById("login").addEventListener("click", login);
} else {
    console.log("Token obtido com sucesso!");
}

// 🔥 Corrigir carregamento do SDK
function loadSpotifySDK() {
    return new Promise((resolve, reject) => {
        if (window.Spotify) {
            console.log("SDK já carregado.");
            return resolve();
        }

        window.onSpotifyWebPlaybackSDKReady = () => {
            console.log("Spotify Web Playback SDK pronto!");
            resolve();
        };

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        script.onload = () => console.log("Spotify Web Playback SDK carregado!");
        script.onerror = () => {
            console.error("Erro ao carregar o SDK do Spotify.");
            reject();
        };

        document.body.appendChild(script);
    });
}

// 🔥 Inicializar o Spotify Player corretamente
async function initSpotify() {
    await loadSpotifySDK();

    const player = new Spotify.Player({
        name: "Meu Player",
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });

    player.addListener("ready", async ({ device_id }) => {
        console.log("Player pronto! Device ID:", device_id);
        await transferPlayback(device_id);
    });

    player.addListener("not_ready", ({ device_id }) => {
        console.error("Dispositivo não encontrado:", device_id);
    });

    player.connect().then(success => {
        if (success) {
            console.log("Conectado ao Spotify com sucesso!");
        } else {
            console.error("Falha ao conectar ao Spotify.");
        }
    });
}

// 🔥 Transferir reprodução para o Web Player
async function transferPlayback(device_id) {
    try {
        const response = await fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                device_ids: [device_id],
                play: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao transferir playback:", errorData);
            return;
        }

        console.log("Playback transferido com sucesso!");
        await playMusic(device_id);
    } catch (error) {
        console.error("Erro ao transferir playback:", error);
    }
}


// 🔥 Tocar música
async function playMusic(device_id) {
    try {
        const response = await fetch("https://api.spotify.com/v1/me/player/play", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uris: ["spotify:track:4cOdK2wGLETKBW3PvgPWqT"], // Troque pela URI da música desejada
                device_id: device_id
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao iniciar a reprodução:", errorData);
        } else {
            console.log("Música iniciada com sucesso!");
        }
    } catch (error) {
        console.error("Erro ao reproduzir música:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchAndPlay");
    const searchButton = document.getElementById("searchButton");
    const playButton = document.getElementById("playButton");
    const pauseButton = document.getElementById("pauseButton");

    searchButton.addEventListener("click", async () => {
        const query = searchInput.value.trim();
        if (!query) {
            console.log("Digite o nome da música antes de buscar.");
            return;
        }
        await searchAndPlay(query);
    });

    playButton.addEventListener("click", async () => {
        await resumeMusic();
    });

    pauseButton.addEventListener("click", async () => {
        await pauseMusic();
    });
});


async function searchAndPlay(query) {
    if (!token) {
        console.error("Nenhum token encontrado. Faça login primeiro.");
        return;
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.tracks.items.length > 0) {
            const trackUri = data.tracks.items[0].uri;
            console.log("Música encontrada:", trackUri);
            playMusic(trackUri);
        } else {
            console.log("Nenhuma música encontrada para:", query);
        }
    } catch (error) {
        console.error("Erro na busca de músicas:", error);
    }
}

async function playMusic(trackUri) {
    if (!token) {
        console.error("Token inválido. Faça login novamente.");
        return;
    }

    try {
        const response = await fetch("https://api.spotify.com/v1/me/player/play", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uris: [trackUri]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao iniciar a reprodução:", errorData);
        } else {
            console.log("Música iniciada com sucesso!");
        }
    } catch (error) {
        console.error("Erro ao reproduzir música:", error);
    }
}

async function pauseMusic() {
    if (!token) {
        console.error("Token inválido. Faça login novamente.");
        return;
    }

    try {
        const response = await fetch("https://api.spotify.com/v1/me/player/pause", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao pausar a música:", errorData);
        } else {
            console.log("Música pausada com sucesso!");
        }
    } catch (error) {
        console.error("Erro ao pausar música:", error);
    }
}

async function resumeMusic() {
    if (!token) {
        console.error("Token inválido. Faça login novamente.");
        return;
    }

    try {
        const response = await fetch("https://api.spotify.com/v1/me/player/play", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao retomar a música:", errorData);
        } else {
            console.log("Música retomada com sucesso!");
        }
    } catch (error) {
        console.error("Erro ao retomar música:", error);
    }
}

async function getCurrentTrack() {
    if(!token) {
        console.error("Token inválido. Faça login novamente.");
        return;
    }

    try {
        const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.warn("Nenhuma música está tocando no momento.");
            return;
        }

        const data = await response.json();
        if (data && data.item) {
            const nomeMusica = data.item.name;
            const nomeArtista = data.item.artists.map(artist => artist.name).join(", ");
            adicionarAoHistorico(nomeMusica, nomeArtista);
        }
    } catch (error) {
        console.error("Erro ao buscar música tocada:", error);
    }
}

function adicionarAoHistorico(nomeMusica, nomeArtista) {
    const entrada = `${nomeMusica} - ${nomeArtista}`


    if (entrada && !ListPlaylist.includes(entrada)) {
        ListPlaylist.push(entrada);
        atualizarHistorico();
    }
}

function atualizarHistorico() {
    const playlistList = document.getElementById("playlist-list");
    playlistList.innerHTML = ""; // Limpa a lista antes de atualizar

    ListPlaylist.forEach(musica => {
        const li = document.createElement("li");
        li.textContent = musica;
        playlistList.appendChild(li);
    });
}

// 🔥 Iniciar Spotify Player quando a página carregar
window.onload = async () => {
    if (token) {
        await initSpotify();
        setInterval(getCurrentTrack, 5000);
    }
};
