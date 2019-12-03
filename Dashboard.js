import React, { Component } from 'react'
import { Paper, Chip, Typography, List, ListItem, ListItemText, ListItemIcon, Button, TextField } from '@material-ui/core'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { setUserName, updateChat } from './Actions/dataAction'
import GroupIcon from '@material-ui/icons/Group';
import SendIcon from '@material-ui/icons/Send';
import ChatIcon from '@material-ui/icons/Chat';
import CheckIcon from '@material-ui/icons/Check';
import GifIcon from '@material-ui/icons/Gif';
import CloseIcon from '@material-ui/icons/Close';
import PersonIcon from '@material-ui/icons/Person';
import ImageSearchTwoToneIcon from '@material-ui/icons/ImageSearchTwoTone';
import Giphy from './Components/Giphy'
import { getGifAction } from './Actions/dataAction'
import { connect } from "react-redux";
import { socket } from './Components/Socket'
import { styles } from './Components/Dashboard.styles'

let mapStateToProps = (store) => {
    return {
        allchats: store.data,
        userName: store.userName,
        gifDisplay: store.gifDisplay,
        chatDisplay: store.chatDisplay,
        userId: store.userId
    }
}

class Dashboard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            newUserName: this.props.userName,
            oldUserName: this.props.userName,
            newMsg: '',
            newGifSearch: '',
            gifData: this.props.gifData,
            msgData: this.props.allchats,
            userList: [],
            incomingMsg: false,
            userDisplay: 'none',
        }
        this.endMessage = React.createRef();

    }

    componentDidMount() {
        var self = this; //saving this value as self. "This" inside the socket function can cause a confusion to the function.
        this.scrollToBottom(); //moving scroll to the bottom when opening

        socket.emit('userConnected', {
            userName: this.state.newUserName
        })

        socket.on('userList', function (userList) {
            self.setState({ userList: userList })
        })

        socket.on('chat message', function (msg) {

            let len = self.state.msgData.length

            self.setState({ incomingMsg: true })
            self.state.msgData[len] = {}
            self.state.msgData[len].allchats = msg

            self.setState({ incomingMsg: false })

            if (self.props.userId === '' && msg.userName === self.state.newUserName) {

                self.updateUserId(msg.userId)
            }
        })


    }

    componentDidUpdate() {
        this.scrollToBottom(); //moving scroll to the bottom when new msg appears

    }

    scrollToBottom = () => {
        this.endMessage.current.scrollIntoView();
    }

    setUserName = () => {
        let flag = true;
        // verify if username is already in use
        for (let i = 0; i < this.state.userList.length; i++) {
            if (this.state.newUserName === this.state.userList[i]) {
                alert(`Username < ${this.state.newUserName} > is already in use`)
                flag = false;
                break
            }
            //verify if input username is not a blank
            else if (this.state.newUserName === '') {
                alert(`Username can't be blank`)
                flag = false;
                break
            }
        }
        //if not in use, flag will be still true and this continues.
        if (flag) {
            this.props.dispatch(setUserName({
                userName: this.state.newUserName,
                userId: this.props.userId
            }))

            // console.log(this.props.userId)
            socket.emit('userNameChange', {
                oldUserName: this.state.oldUserName,
                newUserName: this.state.newUserName,
                userId: this.props.userId
            }
            )
            this.setState({ oldUserName: this.state.newUserName })

            //closing the userList display
            this.setState({
                userDisplay: 'none'
            })
            this.props.dispatch({
                type: 'CHAT_DISPLAY_ON'
            })
        }
    }

    updateUserId = (userId) => {
        // this.setState({ userId })

        this.props.dispatch(setUserName({
            userName: this.state.newUserName,
            userId: this.props.userId
        }))
        // console.log(`user ID was updated to${this.props.userId}`)
    }

    sendChatAction() {

        if (this.state.newMsg !== '') {

            let newChat = {
                from: this.state.newUserName,
                msg: this.state.newMsg,
                topic: 'General',
                userName: this.state.newUserName,
                userId: this.props.userId
            }
            socket.emit('chat message', newChat)

            //update redux
            this.props.dispatch(updateChat(this.state.msgData))
            //clear the chatting input box
            this.setState({ newMsg: '' })
        }
    }

    sendGifAction = () => {
        if (this.state.newGifSearch !== '') {
            this.props.dispatch(getGifAction(this.state.newGifSearch))
            this.setState({newGifSearch:''})
        }

    }

    enterKeySubmit = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            if (this.state.userDisplay !== 'none') {
                this.setUserName();
                //enter key submitting for username change

            }
            else if (this.props.chatDisplay !== 'none') {
                //enter key submitting for new chat message
                this.sendChatAction();

            }
            else if (this.props.gifDisplay !== 'none') {
                //enter key submitting for new chat message
                this.sendGifAction();

            }
        }
    }

    handleNameChange(event) {
        this.setState({ newUserName: event.target.value })
    }

    handleMsgChange(event) {
        this.setState({ newMsg: event.target.value })
    }

    handleGifSearch(event) {
        this.setState({ newGifSearch: event.target.value })
    }

    updateChatWindows() {
        // console.log(this.state.msgData)
        const { classes } = this.props
        return (
            <div>
                {
                    this.state.msgData.map((chat, i) => (
                        <div className={classes.userChat} key={i} >

                            {chat.allchats.from === 'Main Server' ?
                                <div style={{
                                    display: 'flex',
                                    color: 'grey',
                                    fontSize: '13px',
                                    margin: 'auto'
                                }}>
                                    <p>{chat.allchats.msg}</p>
                                </div>
                                :
                                chat.allchats.userId === this.props.userId ?
                                    <div style={{ display: 'flex' }}>
                                        <Chip label={chat.allchats.from} color="primary" />
                                        <div style={{ marginLeft: '10px' }}>
                                            {chat.allchats.url ?
                                                <img
                                                    alt="gifImg"
                                                    src={chat.allchats.url}
                                                    style={{
                                                        width: '100px',
                                                        height: '100px',
                                                    }}
                                                />
                                                :
                                                <Typography variant='body1' gutterBottom component="p">
                                                    {chat.allchats.msg}
                                                </Typography>
                                            }

                                        </div>
                                    </div> :
                                    <div style={{ display: 'flex' }}>
                                        <Chip label={chat.allchats.from} />
                                        <div style={{ marginLeft: '10px' }}>
                                            {chat.allchats.url ?
                                                <img
                                                    alt="gifImg"
                                                    src={chat.allchats.url}
                                                    style={{
                                                        width: '100px',
                                                        height: '100px',
                                                    }}
                                                />
                                                :
                                                <Typography variant='body1' gutterBottom component="p">
                                                    {chat.allchats.msg}
                                                </Typography>
                                            }
                                        </div>
                                    </div>
                            }
                        </div>
                    ))
                }
                <div ref={this.endMessage} />

            </div>
        )
    }

    updateUserListWindow = () => {
        const { classes } = this.props
        return (
            <div className={classes.userListWindow}>
                <List>
                    {
                        this.state.userList.map((user, i) => (
                            <ListItem
                                key={i}
                                button
                                dense={true}
                            >
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <ListItemText primary={user} />

                            </ListItem>
                        )
                        )

                    }
                </List>
            </div>
        )
    }

    updateGifWindow = () => {
        return (
            <div>
                {
                    this.state.gifData.map(image => (
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'blue'
                        }}>

                        </div>
                    ))
                }
            </div>
        )
    }

    ActivateUserListScreen = () => {
        if (this.state.userDisplay === 'none') {
            this.setState({
                userDisplay: '',
            })
            this.props.dispatch({
                type: 'CHAT_DISPLAY_OFF'
            })
        }
        else {
            this.setState({
                userDisplay: 'none',
            })
            this.props.dispatch({
                type: 'CHAT_DISPLAY_ON'
            })
        }
    }

    ActivateGifScreen = () => {
        if (this.props.gifDisplay === 'none') {
            this.setState({
                userDisplay: 'none',
            })
            this.props.dispatch({
                type: 'GIF_DISPLAY_ON'
            })
            this.props.dispatch({
                type: 'CHAT_DISPLAY_OFF'
            })
        }
        else {
            this.setState({
                userDisplay: 'none',
            })
            this.props.dispatch({
                type: 'GIF_DISPLAY_OFF'
            })
            this.props.dispatch({
                type: 'CHAT_DISPLAY_ON'
            })
        }
    }


    gifBar = () => {
        return (
            <div>
                <Button
                    className={this.props.button}
                    onClick={() => {
                        this.ActivateGifScreen()
                    }}
                >
                    <CloseIcon
                        color="primary"
                    />
                </Button>

                <Button
                    className={this.props.button}
                    onClick={() => {
                        this.props.dispatch({
                            type: 'REMOVE_GIF'
                        })
                    }}
                >
                    CLEAR
                </Button>

            </div>

        )
    }

    chatBar = () => {

        return (
            <div>
                <Button
                    className={this.props.userListButton}
                    onClick={() => this.ActivateUserListScreen()}
                >
                    {this.state.userDisplay === 'none' ?
                        <GroupIcon color="primary" /> :
                        <ChatIcon color="primary" />
                    }
                </Button>

                <Button
                    className={this.props.Button}
                    onClick={() => this.ActivateGifScreen()}
                    style={{ display: this.props.chatDisplay }}
                >
                    <GifIcon
                        color="primary"
                    />
                </Button>
            </div>
        )
    }



    render() {

        const { classes } = this.props

        return (
            <div>
                <Paper className={classes.root}>
                    {/* Top bar */}
                    <div className={classes.topText}>
                        {this.props.gifDisplay === '' ?
                            this.gifBar() :
                            this.chatBar()
                        }

                    </div>

                    {/* active user screen */}
                    <div
                        className={classes.mainBox}
                        style={{ display: `${this.state.userDisplay}`, }}>

                        <Typography component="h5" color="primary">
                            Active Users
                        </Typography>

                        <div>
                            {this.updateUserListWindow()}
                        </div>

                        <Paper
                            className={classes.inputBox}
                            onKeyDown={(event) => this.enterKeySubmit(event)}>

                            <TextField
                                label="username"
                                defaultValue={this.props.userName}
                                className={classes.chatBox}
                                value={this.props.userName}
                                onChange={(event) => this.handleNameChange(event)}
                            />

                            <Button
                                className={classes.button}
                                onClick={() =>
                                    this.setUserName()
                                }
                            >
                                <CheckIcon
                                    color="primary"
                                />
                            </Button>
                        </Paper>
                    </div>

                    {/* GIF screen */}
                    <div style={{ display: this.props.gifDisplay }}
                        className={classes.mainBox}
                    >

                        <div className={classes.gifWindow}
                        >
                            <Giphy />
                        </div>
                        <Paper
                            className={classes.inputBox}
                            onKeyDown={(event) => this.enterKeySubmit(event)}
                        >
                            <TextField
                                label="Search Gif"
                                className={classes.chatBox}
                                value={this.state.newGifSearch}
                                onChange={(event) => this.handleGifSearch(event)}
                            />

                            <Button
                                className={this.props.button}
                                onClick={() =>
                                    this.sendGifAction()
                                }
                            >
                                <ImageSearchTwoToneIcon
                                    color="primary"
                                />
                            </Button>
                        </Paper>
                    </div>
                    {/* Chatting screen */}
                    <div className={classes.mainBox}
                        style={
                            { display: `${this.props.chatDisplay}`, }
                        }>

                        <div className={classes.chatWindow}
                        >
                            {this.updateChatWindows()}
                        </div>

                        <Paper
                            className={classes.inputBox}
                            onKeyDown={(event) => this.enterKeySubmit(event)}
                        >

                            <TextField
                                label="Type your message"
                                className={classes.chatBox}
                                value={this.state.newMsg}
                                onChange={(event) => this.handleMsgChange(event)}
                            />

                            <Button
                                className={classes.button}
                                onClick={() =>
                                    this.sendChatAction()}
                            >
                                <SendIcon
                                    color="primary"
                                />
                            </Button>
                        </Paper>
                    </div>

                </Paper>
            </div >
        )
    }
    // }

}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
};

// export default withStyles(styles)(Dashboard);
export default connect(mapStateToProps)(withStyles(styles)(Dashboard));

