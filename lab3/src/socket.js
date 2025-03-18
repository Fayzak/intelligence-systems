const dgram = require('dgram')

module.exports = function(agent, teamName, version, isGoalie) {

    const socket = dgram.createSocket({type: 'udp4', reuseAddr: true})

    agent.setSocket(socket)

    socket.on('message', (message, info) => {
        agent.recieveMessage(message)
    })

    socket.sendMessage = function(message) {
        socket.send(Buffer.from(message), 6000, 'localhost', (error, bytes) => {
            if (error) {
                throw error
            }
        })
    }

    if (!isGoalie) {
        socket.sendMessage(`(init ${teamName} (version ${version}))`)
    } else {
        socket.sendMessage(`(init ${teamName} (version ${version}) (goalie))`)
    }

}
