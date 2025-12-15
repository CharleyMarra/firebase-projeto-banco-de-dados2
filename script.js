// 🔥 CONFIG FIREBASE (COLE O SEU)
const firebaseConfig = {
  apiKey: "AIzaSyCgSr0mNMnq12xdZ6rZhtvPjL4Eiuzhfws",
  authDomain: "projeto-cristiane.firebaseapp.com",
  databaseURL: "https://projeto-cristiane-default-rtdb.firebaseio.com",
  projectId: "projeto-cristiane",
  storageBucket: "projeto-cristiane.firebasestorage.app",
  messagingSenderId: "186542584130",
  appId: "1:186542584130:web:18ac4bd1fa2f6ee5f5d8db",
  measurementId: "G-ZYYRRL5842"
};

// serve para INICIALIZAr o firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// acessando ELEMENTOS
const form = document.getElementById("formMaquina");
const lista = document.getElementById("listaMaquinas");

// CREATE e UPDATE
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("idMaquina").value;
    const nome = document.getElementById("nome").value;
    const valor = Number(document.getElementById("valor").value);
    const quantidade = Number(document.getElementById("quantidade").value);

    if (id) {
        await db.collection("maquinas").doc(id).update({
            nome,
            valor,
            quantidade
        });
    } else {
        await db.collection("maquinas").add({
            nome,
            valor,
            quantidade
        });
    }

    form.reset();
    document.getElementById("idMaquina").value = "";
});

db.collection("maquinas").onSnapshot(snapshot => {
    lista.innerHTML = "";

    snapshot.forEach(doc => {
        const m = doc.data();

        lista.innerHTML += `
            <tr>
                <td>${m.nome}</td>
                <td>R$ ${m.valor}/dia</td>
                <td>${m.quantidade}</td>
                <td>
                    <button class="btn btn-warning btn-sm"
                        onclick="editar('${doc.id}','${m.nome}','${m.valor}','${m.quantidade}')">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="excluir('${doc.id}')">
                        Excluir
                    </button>
                    <button class="btn btn-primary btn-sm"
                        onclick="alugar('${doc.id}','${m.nome}',${m.valor},${m.quantidade})">
                        Alugar
                    </button>
                </td>
            </tr>
        `;
    });
});


// EDITAR

function editar(id, nome, valor, quantidade) {
    document.getElementById("idMaquina").value = id;
    document.getElementById("nome").value = nome;
    document.getElementById("valor").value = valor;
    document.getElementById("quantidade").value = quantidade;
}


//funçao para deletar

async function excluir(id) {
    if (confirm("Deseja excluir esta máquina?")) {
        await db.collection("maquinas").doc(id).delete();
    }
}


// funçao para ALUGAR com base em datas

function alugar(id, nome, valorDia, quantidade) {

    if (quantidade <= 0) {
        alert("Sem estoque!");
        return;
    }

    var inicio = prompt("Data início (AAAA-MM-DD):");
    var fim = prompt("Data final (AAAA-MM-DD):");

    if (!inicio || !fim) {
        alert("Operação cancelada!");
        return;
    }

    // Remove espaços
    inicio = inicio.trim();
    fim = fim.trim();

    // para dividir dias, meses e anos na data
    var partesInicio = inicio.split("-");
    var partesFim = fim.split("-");

    if (partesInicio.length != 3 || partesFim.length != 3) {
        alert("Use o formato AAAA-MM-DD");
        return;
    }

    var diaInicio = Number(partesInicio[2]);
    var diaFim = Number(partesFim[2]);

    if (isNaN(diaInicio) || isNaN(diaFim)) {
        alert("Data inválida!");
        return;
    }

    var dias = diaFim - diaInicio + 1;

    if (dias <= 0) {
        alert("Data final deve ser maior ou igual à inicial!");
        return;
    }

    valorDia = Number(valorDia);
    var valorTotal = dias * valorDia;

    // seria a parte de salvar os alugueis
    db.collection("alugueis").add({
        maquina: nome,
        inicio: inicio,
        fim: fim,
        dias: dias,
        valorDia: valorDia,
        valorTotal: valorTotal
    }).then(function () {

        db.collection("maquinas").doc(id).update({
            quantidade: quantidade - 1
        });
// alerta de resultado da locaçao da maquina
        alert(
            "Aluguel realizado!\n\n" +
            "Máquina: " + nome + "\n" +
            "Dias: " + dias + "\n" +
            "Valor total: R$ " + valorTotal
        );
    });
}