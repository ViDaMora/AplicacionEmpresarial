import {
  addComment,
  editComment,
  listComments,
  removeComment,
  listMainComments
} from '../use-cases'
import makeDeleteComment from './delete-comment'
import makeGetComments from './get-comments'
import makePostComment from './post-comment'
import makePatchComment from './patch-comment'
import notFound from './not-found'
import makeGetMainComments from './get-main-comments'

const deleteComment = makeDeleteComment({ removeComment })
const getComments = makeGetComments({
  listComments
})
const postComment = makePostComment({ addComment })
const patchComment = makePatchComment({ editComment })

const getMainComments = makeGetMainComments({listMainComments })

const commentController = Object.freeze({
  deleteComment,
  getComments,
  notFound,
  postComment,
  patchComment,
  getMainComments
})

export default commentController
export { deleteComment, getComments, notFound, postComment, patchComment, getMainComments }

/*@startuml
actor user
boundary service
control controller
entity comment
boundary dataAcces
database mongoDB

user ->  service : Http postComment
service -> controller: add-comment
controller -> comment: create-comment
comment  -> controller: comment
controller -> dataAcces: save-comment
dataAcces-> mongoDB: save
mongoDB -> dataAcces : return-result
dataAcces -> controller: return-result
controller->service: return-result
service -> user : return result
@enduml



@startuml
actor user
boundary service
control controller
entity comment
boundary dataAcces
database mongoDB

user ->  service : Http getMainComments
service -> controller: get-main-comments
controller -> dataAcces: getMainComments
dataAcces-> mongoDB: getComments
mongoDB -> dataAcces : return-result
dataAcces -> controller: return-result
controller->service: return-result
service -> user : return result
@enduml*/