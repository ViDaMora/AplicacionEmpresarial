import makeAddComment from './add-comment'
import makeEditComment from './edit-comment'
import makeRemoveComment from './remove-comment'
import makeListComments from './list-comments'
import makeHandleModeration from './handle-moderation'
import makeListMainComments from './list-main-comments'
import commentsDb from '../data-access'

const handleModeration = makeHandleModeration({
  initiateReview: async () => {} // TODO: Make real initiate review function.
})
const addComment = makeAddComment({ commentsDb, handleModeration })
const editComment = makeEditComment({ commentsDb, handleModeration })
const listComments = makeListComments({ commentsDb })
const removeComment = makeRemoveComment({ commentsDb })
const listMainComments = makeListMainComments({ commentsDb })

const commentService = Object.freeze({
  addComment,
  editComment,
  handleModeration,
  listComments,
  removeComment,
  listMainComments
})

export default commentService
export { addComment, editComment, listComments, removeComment, listMainComments }
