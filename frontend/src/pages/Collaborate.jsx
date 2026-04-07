import { useEffect, useRef, useState } from 'react'
import { WS_BASE_COLLAB } from '../config'

function Collaborate({ user }) {
  const [roomName, setRoomName] = useState('community-planning')
  const [draftUpdate, setDraftUpdate] = useState('')
  const [connectedRoom, setConnectedRoom] = useState('')
  const [participants, setParticipants] = useState([])
  const [updates, setUpdates] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [errorMessage, setErrorMessage] = useState('')

  const socketRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const manualCloseRef = useRef(false)
  const reconnectAttemptsRef = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 8

  const displayName = user?.username || 'Guest Planner'

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }

  const closeSocket = () => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
  }

  const connectToRoom = (room) => {
    if (!WS_BASE_COLLAB) {
      setErrorMessage('No collaboration WebSocket URL is configured.')
      return
    }

    clearReconnectTimer()
    manualCloseRef.current = false
    setConnectionStatus('connecting')
    setErrorMessage('')

    const socket = new WebSocket(WS_BASE_COLLAB)
    socketRef.current = socket

    socket.onopen = () => {
      setConnectionStatus('connected')
      reconnectAttemptsRef.current = 0
      socket.send(JSON.stringify({
        type: 'join',
        room,
        displayName
      }))
    }

    socket.onmessage = (event) => {
      let payload
      try {
        payload = JSON.parse(event.data)
      } catch {
        return
      }

      if (payload.type === 'error') {
        setErrorMessage(payload.message)
        return
      }

      if (payload.type === 'state') {
        setConnectedRoom(payload.room)
        setParticipants(payload.participants || [])
        setUpdates(payload.updates || [])
      }
    }

    socket.onerror = () => {
      setErrorMessage('The collaboration connection encountered an error.')
    }

    socket.onclose = () => {
      setConnectionStatus('disconnected')

      if (!manualCloseRef.current && room && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttemptsRef.current))
        reconnectAttemptsRef.current += 1
        reconnectTimerRef.current = window.setTimeout(() => {
          connectToRoom(room)
        }, delay)
      }
    }
  }

  const disconnect = () => {
    manualCloseRef.current = true
    clearReconnectTimer()
    closeSocket()
    setConnectionStatus('disconnected')
  }

  const handleJoinRoom = () => {
    const normalizedRoom = roomName.trim()
    if (!normalizedRoom) {
      setErrorMessage('Enter a session name to join collaboration.')
      return
    }

    manualCloseRef.current = true
    clearReconnectTimer()
    closeSocket()

    window.setTimeout(() => {
      connectToRoom(normalizedRoom)
    }, 50)
  }

  const handleSendUpdate = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !draftUpdate.trim()) {
      return
    }

    socketRef.current.send(JSON.stringify({
      type: 'annotation',
      content: draftUpdate.trim()
    }))
    setDraftUpdate('')
  }

  useEffect(() => {
    return () => {
      manualCloseRef.current = true
      clearReconnectTimer()
      closeSocket()
    }
  }, [])

  const statusTone = {
    connected: 'text-emerald-700',
    connecting: 'text-amber-700',
    disconnected: 'text-slate-600'
  }[connectionStatus]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Collaboration</h1>
        <p className="text-slate-600 mb-6">
          Coordinate energy planning work with communities, NGOs, and policymakers in a shared session.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <label htmlFor="collaboration-room-name" className="block text-sm font-medium text-slate-700 mb-2">
                Session name
              </label>
              <input
                id="collaboration-room-name"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                aria-describedby="collaboration-connection-status"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="community-planning"
              />

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleJoinRoom}
                  className="flex-1 py-2 rounded-md font-semibold text-white bg-emerald-700 hover:bg-emerald-800"
                >
                  Join Session
                </button>
                <button
                  type="button"
                  onClick={disconnect}
                  className="px-4 py-2 rounded-md font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Leave
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="font-semibold mb-2">Connection</h2>
              <p id="collaboration-connection-status" aria-live="polite" className={`text-sm ${statusTone}`}>
                Status: {connectionStatus}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Signed in as {displayName}
              </p>
              {connectedRoom && (
                <p className="text-sm text-slate-600 mt-1">
                  Active session: {connectedRoom}
                </p>
              )}
              {errorMessage && (
                <p role="alert" className="text-sm text-red-600 mt-3">{errorMessage}</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="font-semibold mb-3">Participants</h2>
              {participants.length === 0 ? (
                <p className="text-sm text-slate-500">No active participants yet.</p>
              ) : (
                <ul className="space-y-2">
                  {participants.map((participant) => (
                    <li key={participant} className="text-sm text-slate-700">
                      {participant}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Shared Planning Feed</h2>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                Live updates
              </span>
            </div>

            <div
              className="min-h-[260px] max-h-[360px] overflow-y-auto rounded-lg bg-slate-50 p-4 space-y-3"
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              aria-busy={connectionStatus === 'connecting'}
            >
              {updates.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Join a session and post the first planning note, annotation, or decision update.
                </p>
              ) : (
                updates.map((update, index) => (
                  <div key={`${update.timestamp}-${index}`} className="rounded-lg bg-white border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">{update.author}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(update.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{update.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 space-y-3">
              <label htmlFor="collaboration-update" className="block text-sm font-medium text-slate-700">
                Add update
              </label>
              <textarea
                id="collaboration-update"
                value={draftUpdate}
                onChange={(e) => setDraftUpdate(e.target.value)}
                aria-describedby="collaboration-connection-status"
                className="w-full px-3 py-2 border border-slate-300 rounded-md h-28 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="Share an annotation, decision, blocker, or next step..."
                disabled={connectionStatus !== 'connected'}
              />
              <button
                type="button"
                onClick={handleSendUpdate}
                disabled={connectionStatus !== 'connected' || !draftUpdate.trim()}
                className={`py-2 px-4 rounded-md font-semibold text-white ${
                  connectionStatus !== 'connected' || !draftUpdate.trim()
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-cyan-700 hover:bg-cyan-800'
                }`}
              >
                Send Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collaborate
