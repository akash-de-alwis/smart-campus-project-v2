import { useState } from 'react'
import { toast } from 'sonner'
import { MessageSquare, Send } from 'lucide-react'
import { ticketAPI } from '../services/api'

export default function TicketComments({ ticketId, comments = [], onCommentAdded }) {
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setSubmitting(true)
      await ticketAPI.addComment(ticketId, comment)
      setComment('')
      toast.success('Comment added successfully')
      onCommentAdded?.()
    } catch (err) {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <MessageSquare size={20} className="mr-2 text-orange-500" />
        Comments ({comments.length})
      </h2>

      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((c, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">{c.author || 'User'}</p>
                <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-gray-700">{c.text}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No comments yet</p>
        )}
      </div>

      {/* Add Comment */}
      <form onSubmit={handleAddComment} className="border-t border-gray-100 pt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add a comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your comment here..."
            className="input-field resize-none rounded-xl"
            rows="3"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send size={16} />
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  )
}
