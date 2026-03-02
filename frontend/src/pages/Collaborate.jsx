function Collaborate({ mbtiType, user }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Real-Time Collaboration</h1>
        <p className="text-gray-600 mb-6">
          Work together with communities, NGOs, and policymakers to develop energy solutions.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-lg mb-2">Active Collaboration Sessions</h3>
          <p className="text-gray-600">
            WebSocket-based real-time collaboration will be available here.
            Users can share energy plans, annotations, and strategic discussions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Create New Session</h4>
            <input
              type="text"
              placeholder="Session name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <button className={`w-full py-2 rounded-md font-semibold text-white mbti-${mbtiType.toLowerCase()}`}>
              Create Session
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Join Existing Session</h4>
            <input
              type="text"
              placeholder="Session ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <button className={`w-full py-2 rounded-md font-semibold text-white mbti-${mbtiType.toLowerCase()}`}>
              Join Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collaborate
