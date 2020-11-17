// TODO: define request schema (eg. request validation, auth pre handler etc.)

import fastify from 'fastify'

import Configuration from './config/Configuration'
import Database from './db/Database'
import Whitelist from './db/Whitelist'
import Authenticator from './auth/Authenticator'

import ExecuteTransaction from './transactions/ExecuteTransaction'
import ChallengeTransaction from './transactions/ChallengeTransaction'
import ScheduleTransaction from './transactions/ScheduleTransaction'

import AddItemAction from './whitelist/AddItemAction'
import DeleteItemAction from './whitelist/DeleteItemAction'
import GetListAction from './whitelist/GetListAction'

const config = new Configuration()
const whitelist = new Whitelist(new Database(config));

const server = fastify({
    logger: {
        level: 'debug' // Make this configurable with a process ENV
    },
    ignoreTrailingSlash: true
    //https: {} TODO: Configure TLS
})

const schema = {
    body: {
        type: 'object',
        required: ['message', 'signature'],
        properties: {
            message: { type: 'string' },
            signature: { type: 'string' }
        }
    },      
    //response: {} TODO: Define response validation for each action/command
}

/* -------------------- *
*     Setup Auth        *
* -------------------- */
const authenticator = new Authenticator(server, whitelist, 'secret', 'govern_token') // TODO: Pass JWT options
server.addHook('preHandler', authenticator.authenticate.bind(authenticator))


/* -------------------- *
*     Transactions     *
* -------------------- */
server.post('/execute', {}, (request, reply): Promise<TransactionReceipt> => {
    return new ExecuteTransaction(config, request.params).execute()
})

server.post('/schedule', {}, (request, reply): Promise<TransactionReceipt> => {
    return new ScheduleTransaction(config, request.params).execute()
})

server.post('/challenge', {}, (request, reply): Promise<TransactionReceipt> => {
    return new ChallengeTransaction(config, request.params).execute()
})


/* -------------------- *
*      Whitelist       *
* -------------------- */
server.post('/whitelist', {}, (request, reply): Promise<boolean> => {
    return new AddItemAction(whitelist, request.params).execute()
})

server.delete('/whitelist', {}, (request, reply): Promise<boolean> => {
    return new DeleteItemAction(whitelist, request.params).execute()
})

server.get('/whitelist', {}, (request, reply): Promise<ListItem[]> => {
    return new GetListAction(whitelist).execute()
})


/* -------------------- *
*      Start Server     *
* -------------------- */
server.listen(4040, '0.0.0.0', (error: Error, address: string): void => {
    if (error) {
        console.error(error)
        process.exit(0)
    }

    console.log(`Server is listening at ${address}`)
})
