# Redis-Streams

The code uses ECMAScript module syntax to import required modules ioredis .
```
import { Redis } from "ioredis";
```

# Setting up Redis Client:

Redis connection configuration is fetched from environment variables.
Redis client is created using the ioredis module.

```
const redisConfig: any = {
    host: process.env.REDISHOST,
    port: process.env.REDISPORT,
    password: process.env.REDISPASSWORD
};
const client = new Redis(redisConfig);
```

# Add  Stream data 
XADD command is used to append a new entry to a Redis Stream data structure. Redis Streams are like a log data structure where each entry has a unique ID and is stored in the order it was added
```
    // Data for the entry
    const data = {
        sensor_id: 1001,
        temperature: 25.5,
        humidity: 60
    };

    // Using XADD to add the entry to the stream
    client.xadd('mystream', '*', 'sensor', JSON.stringify(data))

```
In this example:

<li> <b>mystream </b>is the name of the stream. </li> 
<li> <b>* </b> indicates that Redis should auto-generate an ID for the new entry. </li> 
<li> <b>sensor</b> is field.</li>
<li> <b>Data</b> is corresponding value.</li>

# Fetching Consumer Information:

Information about existing consumers in the specified consumer group is fetched using the xinfo command with the <b>"CONSUMERS"</b> option.
```
const info: any = await client.xinfo('CONSUMERS', StreamName, GroupName);
```
# Consumer Group Creation:
If no consumers exist, it creates a new consumer in given group.
to create the consumer group using the <b>xgroup</b> command with the <b>"CREATECONSUMER"</b> option.
```
await client.xgroup("CREATECONSUMER", StreamName, GroupName, consumerName);
```
# Read streams group.
If consumers exist. it's Read stream group. uses the <b>xreadgroup</b> command to fetch messages from the specified stream group 
Upon receiving messages,

```
 await client.xreadgroup( "GROUP", GroupName, Consumer, "COUNT", 1,"BLOCK", "1000","STREAMS", StreamName,'>');
```
<b>GROUP</b>: Specifies the consumer group name. <br>
<b>consumername</b>: Specifies the consumer name.<br>
<b>COUNT</b>: Specifies the maximum number of messages to return.<br>
<b>BLOCK</b>: Specifies the timeout to wait for new messages.<br>

# Acknowledgment for recived Streams
for each recived Stream, extracts its content, acknowledges the message using <b>xack</b>, and logs the acknowledgment status along with the message content.

```
 await client.xack(StreamName, groupName, messageId);
```

