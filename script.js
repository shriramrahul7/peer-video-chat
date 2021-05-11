const peer = new Peer(''+Math.floor(Math.random()*2**18).toString(36).padStart(4,0), {
    host: location.hostname,
    debug: 1,
    path: '/myapp'
});

window.peer = peer;

const getLocalStream = async () =>  {

    try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        
        window.localStream = stream;
        window.localVideo.srcObject = stream;
        window.localVideo.autoplay = true; 
    }
    catch (e){
        console.log('error occured')
    }
}

getLocalStream()

peer.on('open', function () {
    window.caststatus.textContent = `Your device ID is: ${peer.id}`;
});

const videoContainer = document.querySelector('.call-container');

function showCallContent() {
    window.caststatus.textContent = `Your device ID is: ${peer.id}`;
    callBtn.hidden = false;
    videoContainer.hidden = true;
}

function showConnectedContent() {
    window.caststatus.textContent = `You're connected`;
    callBtn.hidden = true;
    videoContainer.hidden = false;
}

let code;
function getStreamCode() {
    code = window.prompt('Please enter the sharing code');
}

let conn;
function connectPeers() {
    conn = peer.connect(code);
    conn.on('close', () => {
        showCallContent()
    })
}

peer.on('connection', function(connection){
    conn = connection;
});

const callBtn = document.querySelector('.call-btn');

callBtn.addEventListener('click', () => {
    getStreamCode();
    connectPeers();
    const call = peer.call(code, window.localStream);

    call.on('stream', function(stream) { 
        window.remoteVideo.srcObject = stream; 
        window.remoteVideo.autoplay = true;
        window.peerStream = stream; 
        showConnectedContent(); 
    })
})

peer.on('call', call => {
    const answerCall = confirm('Do you want answer?');
    
    if (answerCall) {

        call.answer(window.localStream);
        
        call.on('stream', stream => {
            window.remoteVideo.srcObject = stream;
            window.remoteVideo.autoplay = true;
            window.peerStream = stream;
            showConnectedContent();
        })

        conn.on('close', () => {
            showCallContent()
        })
        
    } else {
        alert('call denied')
    }

})

const hangUpBtn = document.querySelector('.hangup-btn');
hangUpBtn.addEventListener('click', function (){
    conn.close();
    showCallContent();
})


