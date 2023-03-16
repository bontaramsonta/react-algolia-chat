import express from 'express'
import AT from 'agora-token'

const ChatTokenBuilder = AT.ChatTokenBuilder;
// get these variables from agora dashboard > chat config
const appId = "33ef1ec7972349c58a117cabb77320b8";
const appCertificate = "849dd929164a4eceb8e8ccf5baf16cda";
const appName = "1049564"
const orgName = "41859694"
const agoraBaseUrl = "a41.chat.agora.io"
const expirationInSeconds = 600;


const app = express()

app.use(express.json())

app.get('/',(_,res)=>{
  console.log('[ping]')
  return res.json({msg: 'ok'})
})

app.post('/register', async (req,res)=>{
  console.log('[register]',req.body)
  const {username, password, nickname} = req.body

  // generate token
  let appToken
  try {
    appToken = ChatTokenBuilder.buildAppToken(appId, appCertificate, expirationInSeconds)
    console.log("Chat App Token: " + appToken);
  } catch(err) {
    console.log('[err creating app token]',err)
    return res.status(500).json({msg: 'error creating token'})
  }
  
  // make registration request
  try {
    const response = await fetch(`https://${agoraBaseUrl}/${orgName}/${appName}/users`,{
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        nickname
      }),
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${appToken}`
      }
    })
    if(!response.ok) {
      throw response
    }
    const responseBody = await response.json()
    console.log('[register user response]',responseBody)
  } catch(err) {
    console.log('[err registring user]',err)
    return res.status(500).json({msg: 'error registring user'})
  }
  return res.json({msg: 'user registered'})
})

app.listen(3000,'0.0.0.0',()=>{
  console.log('server running...')
})
