 const chat = document.getElementById("chat");

const input = document.getElementById("commandInput");

const form = document.getElementById("commandForm");

const micro = document.getElementById("micro");

const systemStatus =
    document.getElementById("systemStatus");


/* =========================
   MESSAGES
========================= */

function addMessage(type, text) {

    const message = document.createElement("div");

    message.className =
        "message " +
        (type === "VOUS" ? "user" : "friday");

    const title = document.createElement("strong");

    title.textContent = type;

    const paragraph = document.createElement("p");

    paragraph.textContent = text;

    message.appendChild(title);

    message.appendChild(paragraph);

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}


/* =========================
   VOICE
========================= */

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    speechSynthesis.cancel();

    const voice = new SpeechSynthesisUtterance(text);

    voice.lang = "fr-FR";

    voice.rate = 0.95;

    voice.pitch = 1;

    speechSynthesis.speak(voice);
}


/* =========================
   BATTERY
========================= */

async function getBattery() {

    if (!navigator.getBattery) {

        return "Les informations de batterie ne sont pas disponibles dans ce navigateur.";

    }

    const battery =
        await navigator.getBattery();

    const percentage =
        Math.round(battery.level * 100);

    if (battery.charging) {

        return `Batterie : ${percentage} %. Appareil en charge.`;

    }

    return `Batterie : ${percentage} %.`;
}


/* =========================
   COMMAND ENGINE
========================= */

async function command(text) {

    text = text.trim();

    if (!text) {
        return;
    }

    addMessage("VOUS", text);

    const cmd =
        text.toLowerCase();

    let response = "";


    /* STATUS */

    if (cmd === "status") {

        response =
`STATUS SYSTÈME

FRIDAY : ONLINE
Interface : OK
Mémoire : OK
Synthèse vocale : OK
PWA : OK
API IA : NON CONFIGURÉE`;

    }


    /* HEURE */

    else if (
        cmd === "heure" ||
        cmd.includes("quelle heure")
    ) {

        const now =
            new Date();

        response =
            "Il est " +
            now.toLocaleTimeString(
                "fr-FR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            ) +
            ".";

    }


    /* DATE */

    else if (cmd === "date") {

        response =
            new Intl.DateTimeFormat(
                "fr-FR",
                {
                    dateStyle: "full"
                }
            ).format(new Date());

    }


    /* BATTERIE */

    else if (
        cmd === "batterie" ||
        cmd.includes("batterie")
    ) {

        response =
            await getBattery();

    }


    /* DIAGNOSTIC */

    else if (cmd === "diagnostic") {

        response =
`DIAGNOSTIC COMPLET

✓ Interface
✓ JavaScript
✓ Stockage local
✓ Synthèse vocale
✓ PWA
✓ Navigateur

⚠ API IA non connectée.`;

    }


    /* AIDE */

    else if (
        cmd === "aide" ||
        cmd === "help"
    ) {

        response =
`COMMANDES FRIDAY

status
heure
date
batterie
diagnostic
effacer
aide`;

    }


    /* EFFACER */

    else if (cmd === "effacer") {

        localStorage.removeItem(
            "fridayHistory"
        );

        chat.innerHTML = "";

        response =
            "Historique supprimé.";

    }


    /* AUTRE */

    else {

        response =
`Commande reçue.

Je suis actuellement en mode FRIDAY V1 local.

L'IA avancée n'est pas encore connectée.`;

    }


    addMessage(
        "FRIDAY",
        response
    );


    saveHistory(
        text,
        response
    );


    systemStatus.textContent =
        "COMMAND EXECUTED";


    speak(
        response.replace(/\n/g, ". ")
    );
}


/* =========================
   FORM
========================= */

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const text =
            input.value;

        input.value = "";

        command(text);
    }
);


/* =========================
   MEMORY
========================= */

function saveHistory(
    question,
    answer
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "fridayHistory"
            ) || "[]"
        );

    history.push({

        question: question,

        answer: answer,

        timestamp: Date.now()

    });

    localStorage.setItem(
        "fridayHistory",
        JSON.stringify(
            history.slice(-50)
        )
    );
}


/* =========================
   MICROPHONE
========================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    const recognition =
        new SpeechRecognition();

    recognition.lang =
        "fr-FR";

    recognition.interimResults =
        false;

    recognition.onstart =
        function() {

            systemStatus.textContent =
                "LISTENING...";

        };


    recognition.onresult =
        function(event) {

            const text =
                event.results[0][0].transcript;

            input.value = text;

            command(text);

            input.value = "";

        };


    recognition.onerror =
        function() {

            systemStatus.textContent =
                "MIC ERROR";

        };


    recognition.onend =
        function() {

            systemStatus.textContent =
                "SYSTEM READY";

        };


    micro.onclick =
        function() {

            recognition.start();

        };

} else {

    micro.onclick =
        function() {

            systemStatus.textContent =
                "VOICE INPUT UNAVAILABLE";

        };

}


/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register("sw.js")
                .catch(
                    console.error
                );

        }
    );

}