import {useEffect, useMemo, useState} from 'react'
import AC from 'agora-chat'
const allowedChatTypes = ['txt','img']
const attachmentTypes = ['image','document']
const allowedImgTypes = ['jpg','gif','png','bmp']

const fileToDataUrl = async (file) => {
  return new Promise((resolve, reject) => {
    console.log(file)
    const reader = new FileReader()
    reader.readAsBinaryString(file)
    reader.onloadend = (e) => {
      console.log('[result]',e)
      // const url = `data:${file.type};base64,${btoa(e?.target?.result)}`
      const url = `https://baaz-marketplace-media.s3.us-east-2.amazonaws.com/data%3Aimage/1664100463274.jpeg`
      let img = new Image()
      img.onload = () => {
        const result = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          url,
          mimeType: file.type,
          size: file.size,
          rawFile: file
        }
        console.log({result})
        resolve(result)
      }
      img.src = url
    }
    reader.onerror = (e) => {
      console.log('[image parse failed]',e)
      reject('image parse failed')
    }
  })
}

export function useChat() {

  const [chats,setChats] = useState([])
  const [nextCursor,setNextCursor] = useState('')
  const [pageIndex,setPageIndex] = useState(0)
  const [connected, setConnected] = useState(false)
  const [activeUsername, setActiveUsername] = useState('')
  const [useAttachment, setUseAttachment] = useState(false)
  const [attachmentType,setAttachmentType] = useState('image')
  const [img, setImg] = useState(null)
  const [file, setFile] = useState(null)

  //!debug chats
  useEffect(()=>log('Agora','[debug chats]',chats),[chats])
  
  const conn = useMemo(()=> new AC.connection({
    appKey: '41859694#1049564',
    useOwnUploadFun: true
  }),[])

  const _appendChat = (chat) => {
    if(!allowedChatTypes.includes(chat?.type)) {
      log('Agora','[un handled chat type]',chat?.type)
      return
    }
    setChats((chats)=>[...chats,chat])
  }
  const _resetChatsTo = (chats) => {
    const filteredChats = chats.filter(chat=>{
      if(!allowedChatTypes.includes(chat?.type)) {
        log('Agora','[un handled chat type]',chat?.type)
        return false
      } 
      return true
    })
    setChats(filteredChats.reverse())
  }

  const _prependChats = (chats) => {
    const filteredChats = chats.filter(chat=>{
      if(!allowedChatTypes.includes(chat?.type)) {
        log('Agora','[un handled chat type]',chat?.type)
        return false
      } 
      return true
    })
    setChats((chats)=>[...filteredChats,...chats])
  }

  const loadMore = async (otherPersonUsername) => {
    log('Agora','[load more called] on ',nextCursor,pageIndex)
    try{
      const response = await conn.getHistoryMessages({
        targetId: otherPersonUsername,
        chatType: 'singleChat',
        cursor: nextCursor,
        pageSize: 5,
        searchDirection: 'up'
      })
      console.dir(response)
      setNextCursor(response.cursor)
      setPageIndex(pageIndex+1)
      if(!response.messages) {
        throw new Error('messages array not available')
      }
      // latest messages at last
      _prependChats(response.messages)
      
      return true
    } catch(err) {
      log('Agora','[message fetch failure]',err)
      return false
    }
  }

  const refetchChatsWith = async (otherPersonUsername) => {
    try{
      const response = await conn.getHistoryMessages({
        targetId: otherPersonUsername,
        chatType: 'singleChat',
        cursor: -1,
        pageSize: 5,
        searchDirection: 'up'
      })
      console.dir(response)
      setNextCursor(response.cursor)
      setPageIndex(0)
      if(!response.messages) {
        throw new Error('messages array not available')
      }
      // latest messages at last
      _resetChatsTo(response.messages)

      return true
    } catch(err) {
      log('Agora','[message fetch failure]')
      return false
    }
  }

  const attachImage = async (file) => {
    const fileObject = await fileToDataUrl(file)
    setUseAttachment(true)
    setAttachmentType('image')
    setImg(fileObject)
  }
  const attachFile = async (file) => {
    const fileObject = await fileToDataUrl(file)
    setUseAttachment(true)
    setAttachmentType('document')
    setFile(fileObject)
  }

  const sendMessage = async ({to, from, message}) => {
    // init default message options
    let messageoptions = {
      chatType: 'singleChat',
      to,
      from,
      type: 'img',
      width: img?.width,
      height: img?.height,
      body: 'example body',
      msg: 'example msg',
      url: 'https://baaz-marketplace-media.s3.us-east-2.amazonaws.com/data%3Aimage/1664100463274.jpeg'
    }
    // handle attachments
    // if(useAttachment) {
    //   if(attachmentType === 'image') {
    //     messageoptions.type = 'img'
    //     messageoptions.file = img.imgFile
    //     messageoptions.file_length = img.size
    //     messageoptions.width = img.width
    //     messageoptions.height = img.height
    //   }
    //   else if(attachmentType === 'document') {
    //     messageoptions.type = 'file'  
    //     messageoptions.file = file.rawFile
    //     messageoptions.file_length = file.size
    //   }
    //   messageoptions.onFileUploadError = (err) => {
    //     log('Agora',"onFileUploadError",err);
    //   }
    //   // Reports the progress of uploading the image file.
    //   messageoptions.onFileUploadProgress = (e) => {
    //     log('Agora',' file progress: ',e);
    //   }
    //   // Occurs when the image file is successfully uploaded.
    //   messageoptions.onFileUploadComplete = () => {
    //     log('Agora',"onFileUploadComplete");
    //   }
    // }
    // else {
    //   messageoptions.type = 'txt'
    //   messageoptions.msg = message
    // }
    log('Agora','[MESSAGE OPTIONS BUILT]',messageoptions)
		let msg = AC.message.create(messageoptions);
    // image example
		// AC.message.create({
    //   chatType: 'singleChat',
    //   to: '',
    //   type: 'img',
    //   height: 0,
    //   width: 0,
    //   file: new File(),
    // });
    log('Agora','[generated message to be sent]',msg)
    try {
      const response = await conn.send(msg)
      log('Agora','[response send message]',response)
      _appendChat(response)
    } catch(err) {
      log('Agora',"send private text fail",err);
    }
  }

  const registerUser = async (username, password) => {
    log('Agora','[registerUser]')
    try {
      const response = await fetch('/api/register',{
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          nickname: username //TODO: should be something meaningful
        }),
        headers: {
          'Content-type': 'application/json'
        }
      })
      if(!response.ok)
        throw response
      const responseBody = await response.json()
      log('Agora','[register user response]',responseBody)
      // auto login
      await loginUser(username,password)
    } catch(err) {
      log('Agora',"[err register user]",err);
    }
  }
  
  const loginUser = async (username,password) => {
    log('Agora','[loginUser]')
    const loginResponse = await conn.open({
      user: username,
      pwd: password,
      error: (response) => {
        log('Agora','[chat connection error]',response)
        setActiveUsername('')
      },
      success: (response) => {
        setActiveUsername(username)
        log('Agora','[chat connection success]',response)
      }
    })
    log('Agora','[chat login reponse]',loginResponse)
  }

  useEffect(() => {
    console.count('[chat hook called]')
    log('Agora','[chat connection]',conn.isOpened())
    // 2nd way to hook up handlers
    conn.addEventHandler("connection&message", {
      // Occurs when the app is connected to Agora Chat.
      onConnected: () => {
        log('Agora','[chat online]')
        setConnected(true)
      },
      // Occurs when the app is disconnected from Agora Chat.
      onDisconnected: () => {
        log('Agora','[chat offline]')
        setConnected(false)
      },
      // Occurs when a text message is received.
      onTextMessage: (response) => {
        log('Agora','[message recieved]',response)
        _appendChat(response)
      },
      // Occurs when the token is about to expire.
      onTokenWillExpire: (params) => {
      },
      // Occurs when the token has expired. 
      onTokenExpired: (params) => {
      },
      onCmdMessage: (cmdMsg) => {
        log('Agora','[cmd message]',cmdMsg)
      },
      onError: (error) => {
        log('Agora',"on error", error);
      },
    });
    return () => {
      conn.removeEventHandler('connection&message')
      setConnected(false)
      conn.close()
      console.countReset('[chat hook called]')
    }
  },[])
  return {
    algoliaConnection: conn,
    sendMessage,
    registerUser,
    loginUser,
    chats,
    pageIndex,
    loadMore,
    refetchChatsWith,
    connected,
    activeUsername,
    attachImage,
    attachFile,
    image: img,
    file
  }
}