import { Trash2, MessageSquare, Clock } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { deleteMessage } from '../../lib/firestore'
import { useToast } from '../../components/shared/Toast'

export default function AdminMessages() {
  const { messages } = useData()
  const notify = useToast()

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    try { await deleteMessage(id); notify('Message deleted!') }
    catch { notify('Failed.', 'error') }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-outfit text-3xl font-black text-dark">Messages</h1>
        <p className="text-gray-400 text-sm mt-1">{messages.length} total messages</p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center text-gray-400 shadow-sm">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No messages yet</p>
          <p className="text-sm mt-1">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(m => (
            <div key={m.id} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-dark">{m.name}</p>
                    <span className="text-gray-300">·</span>
                    <p className="text-sm text-gray-500">{m.phone}</p>
                    {m.email && <><span className="text-gray-300">·</span><p className="text-sm text-gray-500">{m.email}</p></>}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{m.msg}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                    <Clock size={11} />
                    {m.createdAt?.toDate?.()?.toLocaleString?.() || 'Just now'}
                  </div>
                </div>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
