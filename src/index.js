const express = require('express')
const axios = require('axios')

const { createClient } = require("redis");
const responseTime = require('response-time')

const app = express()

//connexion con redis
const client = createClient({
    host: "127.0.0.1",
    port: 6379,
});



app.use(responseTime())

//obtener todos los personajes
app.get('/character', async(req, res) =>{
    try {
        // Buscar los datos en redis
        const reply = await client.get("character");
    
        // Si existen los datos en redis  finaliza con el response
        if (reply) return res.send(JSON.parse(reply));
    
        // Obtiene los datos del API 
        const response = await axios.get(
          "https://rickandmortyapi.com/api/character"
        );

        // Almacena los resultados en redis con expiracion en 10 segundos
        const saveResult = await client.set(
            "character",
            JSON.stringify(response.data),
            {
            EX: 10,
            }
        );
        console.log(saveResult)
    
        //Envia de respuesta al cliente
        res.send(response.data);
    } catch (error) {
        res.send(error.message);
    }
})

async function main() {
    await client.connect();
    app.listen(3000);
    console.log("server listen on port 3000");
}
  
main();