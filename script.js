const historico = ["Estudar React Native", "Leitura diária", "Descanso longo"]



function truncateText(text, maxLength = 20) {
    return text.length > maxLength ? text.substring(0, maxLength) + " ..." : text;
}

function MappingList (items, elementId) {
    const ListElement = document.getElementById(elementId);
    ListElement.innerHTML = "";

    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = truncateText(item, 25);
        li.classList.add("text-truncate");
        ListElement.appendChild(li)   
    });
}

MappingList(historico, "historico-list");

function addToHistorico() {
    const input = document.getElementById("floatingInput");
    if(input.value.trim() !== "") {
        historico.push(input.value);
        MappingList(historico, "historico-list");
        input.value = "";
    }
}

let Contador = 25*60;
let intervalo;
let contadorAtivo = false;

function atualizarContador () {
    const minutos = Math.floor(Contador/60);
    const segundos = Contador % 60;

    document.querySelector("#contador h3").innerText = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    
    if (Contador > 0) {
        Contador--;
    } else {
        clearInterval(intervalo);
        document.getElementById("alarme").play();
    }
}

function iniciarContador () {
    if(!contadorAtivo) {
        intervalo = setInterval(atualizarContador, 1000);
        contadorAtivo = true;
    }
}

function pausarContador () {
    clearInterval(intervalo);
    contadorAtivo = true;
    iniciarContador();
}

function pararContador () {
    clearInterval(intervalo);
    Contador = 25*60;
    atualizarContador();
    contadorAtivo = false;
}

