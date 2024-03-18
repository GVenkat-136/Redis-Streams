import  express  from "express";
import {Redis} from "ioredis";
import dotenv from 'dotenv'
dotenv.config()

const app:any= express()
const port: String | Number = process.env.PORT || 5001

const redisConfig:any = {
    host:process.env.REDISHOST,
    port:process.env.REDISPORT,
    password:process.env.REDISPASSWORD
}

const client = new Redis(redisConfig)
let availableConsumer:any;


async function readMessage(payload:any) {
    const newMessage = await  client.xreadgroup("GROUP", payload?.Group, availableConsumer, "COUNT", 1, "BLOCK", "1000", "STREAMS", payload?.Stream, '>');
    if(newMessage !== null){
        const messagesData = newMessage[0][1];
        for (const [messageId, messageData] of messagesData) {
            let parsedData = messageData[1];
            const messeage = parsedData[1]
            let ack = await client.xack(payload?.Stream, payload?.Group, messageId);
            console.log(ack,messeage)
        }
    }
}

async function processMessage(Stream:String) {
    const payload:any={
        Stream:Stream,
        Group:'Messages'
    }
    const info:any= await client.xinfo('CONSUMERS',payload?.Stream,payload?.Group)
    if(info.length == 0 ){
        const groupDetails: any = await client.xinfo("GROUPS", payload?.Stream);
        console.log(groupDetails)
        const consumerName:any= `Consumer:1` 
        try {
            await client.xgroup("CREATECONSUMER", payload?.Stream, payload?.Group, consumerName);
            console.log(`Consumer '${consumerName}' created successfully.`);
        } catch (error) {
            console.error("Error creating consumer:", error);
        }
    }else{
        for (const consumer of info) {
            const [_, consumerName, pendingCount, __, ___] = consumer;
            if( pendingCount <= 0 && consumerName.length!=0){
                availableConsumer = consumerName
            }
        }
    }

    await readMessage(payload)
}

async function MongoServer(Stream:String) {
        let i = 1
        while(i){
               try {
                    await processMessage(Stream)
               } catch (error) {
                   console.error(error)
               } 
        }
}

app.listen(port,()=>{
    console.log(`
    server listen on : 
    http://localhost:${port} 
    `)
    MongoServer('Chat')
})


