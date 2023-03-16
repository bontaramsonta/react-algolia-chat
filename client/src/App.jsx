import { useState } from 'react'
import { useChat } from './hooks/useChat'
import PaperAirplaneIcon from '@heroicons/react/24/solid/PaperAirplaneIcon'
import PaperClipIcon from '@heroicons/react/24/solid/PaperClipIcon'
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon'
import TestImg from './assets/react.svg'
// import ChatWidget from './components/ChatWidget'
// import { useVirtualizer } from '@tanstack/react-virtual';
// import { faker } from '@faker-js/faker'

// const messages = new Array(1000).fill(true).map(()=>({
//   to: '',
//   from: '',

// }))

const PresenceBadge = ({isOnline=true,isAnimating=true}) => (
  <span className="absolute top-0 -right-4 flex h-3 w-3">
    <span className={"relative inline-flex rounded-full h-3 w-3 "+(isOnline?'bg-green-500':'bg-red-500')}>
      {isAnimating && (
        <span className={"animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 "+(isOnline?'bg-green-400':'bg-red-400')}></span>
      )}
    </span>
  </span>
)

function App() {
  // for register
  const [newUsername,setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  // for login
  const [username,setUsername] = useState('sourav')
  const [password, setPassword] = useState('sd#1234MS')
  // for message widget
  const [to,setTo] = useState('bonny')
  const [message,setMessage] = useState('')

  const {
    sendMessage,
    registerUser,
    loginUser,
    chats,
    refetchChatsWith,
    loadMore,
    connected,
    activeUsername,
    attachImage,
    attachFile,
    image,
    file
  } = useChat()

  // chat virtual list
  // const parentRef = useRef()
  // const rowVirtualizer = useVirtualizer({
  //   count: 10000,
  //   getScrollElement: () => parentRef.current,
  //   estimateSize: () => 35,
  // })

  return (
    <>
      {/* <ChatWidget/> */}
      <div className="py-10 mx-auto w-full md:w-3/4 lg:w-2/4 flex flex-col items-stretch justify-center space-y-5">
        {/* title */}
        <p className="relative text-3xl mx-auto">{connected?activeUsername:'login to chat'}
        <PresenceBadge isOnline={connected} isAnimating={connected}/>
        </p>
        {/* end title */}
        <div className="w-full space-x-3 flex justify-center">
          <div className="flex flex-col p-5 border-2 border-slate-100 rounded-md space-y-3 relative">
            <h2 className='text-slate-600'>register</h2>
            <input className='p-2 bg-slate-100 rounded-md' type="text" placeholder='username' value={newUsername} onChange={(e)=>setNewUsername(e.target.value)} />
            <input className='p-2 bg-slate-100 rounded-md' type="text" placeholder='password' value={newPassword} onChange={(e)=>setNewPassword(e.target.value)}/>
            <button
              className='p-3 bg-amber-200 rounded-full mx-auto'
              onClick={async()=>{
                console.log('[add user]')
                await registerUser(newUsername,newPassword)
              }}>
                Add User
            </button>
          </div>
          <div className="flex flex-col p-5 border-2 border-slate-100 rounded-md space-y-3">
            <h2 className='text-slate-600'>login</h2>
            <input className='p-2 bg-slate-100 rounded-md' type="text" placeholder='username' value={username} onChange={(e)=>setUsername(e.target.value)} />
            <input className='p-2 bg-slate-100 rounded-md' type="text" placeholder='password' value={password} onChange={(e)=>setPassword(e.target.value)}/>
            <button
              className='p-3 bg-green-200 rounded-full mx-auto'
              onClick={async()=>{
                console.log('[login user]')
                await loginUser(username,password)
              }}>
                Login
            </button>
          </div>
        </div>
        {/* message box */}
        <div className="w-full flex flex-col p-5 border-2 border-slate-100 rounded-md space-y-3">
          <div className="w-full flex">
            <input className='w-full p-2 pl-5 bg-slate-100 rounded-md' type="text" placeholder='to username' value={to} onChange={(e)=>setTo(e.target.value)}/>
            <button
              onClick={async()=>{
                console.log('[connect to]',to)
                await refetchChatsWith(to)
              }}
              className='-ml-[4.75rem] px-2 rounded-md bg-blue-500 text-blue-100'>
              Connect
            </button>
          </div>
          <div className="flex flex-col px-2 space-y-2 max-h-80 overflow-auto">
            {chats.length > 0 && (
              <button
                className="bg-slate-700 text-slate-300 hover:text-white hover:underline mx-auto px-3 py-1 rounded-2xl"
                onClick={()=>{
                  loadMore(to)
                }}>
                  load more
              </button>
            )}
            {chats.map((chat,i)=>(
              <div
                key={chat.id}
                className={'w-fit max-w-prose rounded-md py-1 px-2 '+ (chat.from === username ? 'bg-blue-600 text-white self-end': 'bg-slate-300')}>
                <p className={'text-xs '+(chat.from === username ? 'text-cyan-200 w-full text-end': 'text-slate-600')}>{chat.from}</p>
                {chat.msg && chat.msg.split('\n').map((line,i)=>(
                  <p key={`${chat.id}.${i}`} className={(chat.from === username ? 'text-end': '')}>{line}</p>
                ))}
                {(chat?.url && chat?.type==='img') && (
                  <a target="_blank" href={chat.url}>
                    <img className='h-28 py-1 rounded-md' src={chat.url}/>
                  </a>
                )}
              </div>
            ))}
          </div>
          <form className='w-full relative' action="#" onSubmit={async (e)=>{
            e.preventDefault()
            console.log('[submit message]',message)
            await sendMessage({to,message,from:username})
            setMessage('')
          }}>
            {image && (
              <div className="border-t-2 h-24 border-slate-200 flex space-x-4 items-stretch p-2">
                <img src={image?.url} alt="image not found"/>
              </div>
            )}
            <textarea
              rows={1}
              placeholder='send message'
              value={message}
              onChange={(e)=>setMessage(e.target.value)} 
              className='w-full p-2 pl-5 overflow-y-visible bg-slate-100 rounded-md resize-none'/>
            <button
              type='submit'
              className='p-2 bg-blue-500 rounded-full absolute bottom-2 right-0'>
                <PaperAirplaneIcon className='h-6 text-white'/>
            </button>
            <div className="group/attachment bg-slate-100 flex flex-col hover:space-y-3 pt-2 pb-2 px-1 rounded-2xl absolute bottom-1 right-12">
              <div className="hidden group-hover/attachment:block">
                <label className='p-2 bg-slate-400 hover:bg-slate-500 rounded-full' type='submit'>
                  <PhotoIcon className='h-4 text-white'/>
                  <input
                    type="file"
                    className='hidden'
                    accept='.jpg,.gif,.png,.bmp'
                    onChange={(e)=>{
                      console.log('[image selected]')
                      attachImage(e.target.files.item(0))
                      e.target.value = ''
                    }}/>
                </label>
              </div>
              <label className='p-2 bg-slate-400 hover:bg-slate-500 rounded-full' type='submit'>
                <PaperClipIcon className='h-4 text-white'/>
                <input
                  type="file"
                  className='hidden'
                  onChange={(e)=>{
                    console.log('[file selected]')
                    // attachFile(e.target.files[0])
                  }}/>
              </label>
            </div>
          </form>
        </div>
        {/* end message box */}
      </div>
    </>
  )
}

export default App
