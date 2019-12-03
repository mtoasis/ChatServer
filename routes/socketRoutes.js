const db = require('../models')
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);


module.exports = function (io) {

    const masterMsg = (msg) => {
        let masterMsg = {
            from: 'Main Server',
            msg: msg,
            topic: 'General',
        }

        io.emit('chat message', masterMsg)
    }

    const sendUserList = () => {
        db.User.find({}).then((res) => {
            let userList = [];
            for (i = 0, len = res.length; i < len; i++) {
                userList.push(res[i].userName)
            }
            io.emit('userList', userList)
        })
    }

    io.on('connection', function (socket) {

        let userId = socket.id

        socket.on('userConnected', function (user) {
            console.log(user)
            // let userName = "User" + Math.floor(Math.random() * 1000)
            const {userName} = user;
            db.User.create({
                userId,
                userName
            })
                .then((res) => {
                    let masterMsg = {
                        from: 'Main Server',
                        msg: `< ${userName} > join the chat`,
                        topic: 'General',
                        userName: userName,
                        userId: userId
                    }
                    if(!userName){
                        console.log("sending userId")
                        io.emit('userId', {userId}) 
                    }
                    if(userName){
                        io.emit('chat message', masterMsg)
                    }                           

                    console.log(`${userId} db was created`)
                    sendUserList()
                })           

        })

        socket.on('userNameChange', function (userName) {

            console.log(userName)

            db.User.findOneAndUpdate({
                userId: userName.userId
            },
                { $set: { userName: userName.newUserName } }
            ).then((res) => {

                console.log('userDB updated')                
                let msg = `< ${userName.oldUserName} > changed the username to < ${userName.newUserName} >`
                masterMsg(msg)
                sendUserList()
            })
        })

        socket.on('disconnect', function () {

            db.User.find({ userId: socket.id })
                .then((res) => {
                    let msg = `<${res[0].userName}> left the chat`
                    masterMsg(msg)

                    db.User.deleteOne({
                        userId: socket.id
                    }).then(() =>{ 
                    console.log(`socket id: ${socket.id} was deleted from DB`)
                    sendUserList()
                    })
                })

        })

        socket.on('chat message', function (msg) {
            io.emit('chat message', msg);

            db.Post.create({
                allchats: msg
            })
                .then((result) => {
                    // console.log(result)
                    console.log('creating msg')
                })
                .catch((err) => {
                    console.log(`error${err}`)
                })

        })
    })
}
