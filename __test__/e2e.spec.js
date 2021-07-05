import axios from 'axios'
import commentsDb, { makeDb } from '../src/data-access'
import makeFakeComment from './fixtures/comment'
import dotenv from 'dotenv'
dotenv.config()

describe('Comments API', () => {
  beforeAll(() => {
    axios.defaults.baseURL = process.env.DM_BASE_URL
    console.log(axios.defaults.baseURL)
    axios.defaults.headers.common['Content-Type'] = 'application/json'
    axios.defaults.validateStatus = function (status) {
      // Throw only if the status code is greater than or equal to 500
      return status < 500
    }
  })
  afterAll(async () => {
    const db = await makeDb()
    return db.collection('comments').drop()
  })

  describe('agregando comentarios', () => {
    // Content moderator API only allows 1 request per second.
    beforeEach(done => setTimeout(() => done(), 1100))

    //TEST POST
    it('agregar a comentario a la base de datos', async () => {
      const response = await axios.post(
        '/comments/',
        makeFakeComment({
          id: undefined,
          text: 'Something safe and intelligible.'
        })
      )
      expect(response.status).toBe(201)
      const { posted } = response.data
      const doc = await commentsDb.findById(posted)
      expect(doc).toEqual(posted)
      expect(doc.published).toBe(true)
      return commentsDb.remove(posted)
    })
    it('se requiere comentario para contener autor', async () => {
      const response = await axios.post(
        '/comments',
        makeFakeComment({ id: undefined, author: undefined })
      )
      expect(response.status).toBe(400)
      expect(response.data.error).toBeDefined()
    })
    it('se requiere comentario para contener texto', async () => {
      const response = await axios.post(
        '/comments',
        makeFakeComment({ id: undefined, text: undefined })
      )
      expect(response.status).toBe(400)
      expect(response.data.error).toBeDefined()
    })
    it('se requiere comentario para contener un postId valido', async () => {
      const response = await axios.post(
        '/comments',
        makeFakeComment({ id: undefined, postId: undefined })
      )
      expect(response.status).toBe(400)
      expect(response.data.error).toBeDefined()
    })
    it('scrubs contenido malicioso', async () => {
      const response = await axios.post(
        '/comments',
        makeFakeComment({
          id: undefined,
          text: '<script>attack!</script><p>hello!</p>'
        })
      )
      expect(response.status).toBe(201)
      expect(response.data.posted.text).toBe('<p>hello!</p>')
      return commentsDb.remove(response.data.posted)
    })

    it.todo("won't publish spam")
  })

  

    //PUT O PATCH
  describe('modificar comentarios', () => {
    // Content moderator API only allows 1 request per second.
    beforeEach(done => setTimeout(() => done(), 1100))

    it('modificar un comentario', async () => {
      const comment = makeFakeComment({
        text: '<p>changed!</p>'
      })
      await commentsDb.insert(comment)
      const response = await axios.patch(`/comments/${comment.id}`, comment)
      expect(response.status).toBe(200)
      expect(response.data.patched.text).toBe('<p>changed!</p>')
      return commentsDb.remove(comment)
    })
    it('scrubs contenido malicioso', async () => {
      const comment = makeFakeComment({
        text: '<script>attack!</script><p>hello!</p>'
      })
      await commentsDb.insert(comment)
      const response = await axios.patch(`/comments/${comment.id}`, comment)
      expect(response.status).toBe(200)
      expect(response.data.patched.text).toBe('<p>hello!</p>')
      return commentsDb.remove(comment)
    })
  })

  //GET 
  describe('lista comentarios', () => {
    it('lista comentarios para un post', async () => {
      const comment1 = makeFakeComment({ replyToId: null })
      const comment2 = makeFakeComment({
        postId: comment1.postId,
        replyToId: null
      })
      const comments = [comment1, comment2]
      const inserts = await Promise.all(comments.map(commentsDb.insert))
      const expected = [
        {
          ...comment1,
          replies: [],
          createdOn: inserts[0].createdOn
        },
        {
          ...comment2,
          replies: [],
          createdOn: inserts[1].createdOn
        }
      ]
      const response = await axios.get('/comments/', {
        params: { postId: comment1.postId }
      })
      expect(response.data).toContainEqual(expected[0])
      expect(response.data).toContainEqual(expected[1])
      return comments.map(commentsDb.remove)
    })
    it('hilod e comentarios', async done => {
      const comment1 = makeFakeComment({ replyToId: null })
      const reply1 = makeFakeComment({
        postId: comment1.postId,
        replyToId: comment1.id
      })
      const reply2 = makeFakeComment({
        postId: comment1.postId,
        replyToId: reply1.id
      })
      const comment2 = makeFakeComment({
        postId: comment1.postId,
        replyToId: null
      })
      const comments = [comment1, reply1, reply2, comment2]
      const inserts = await Promise.all(comments.map(commentsDb.insert))
      const expected = [
        {
          ...comment1,
          replies: [
            {
              ...reply1,
              createdOn: inserts[1].createdOn,
              replies: [
                {
                  ...reply2,
                  createdOn: inserts[2].createdOn,
                  replies: []
                }
              ]
            }
          ],
          createdOn: inserts[0].createdOn
        },
        {
          ...comment2,
          replies: [],
          createdOn: inserts[3].createdOn
        }
      ]
      const response = await axios.get('/comments/', {
        params: { postId: comment1.postId }
      })
      // FIXME: Fix flake. Why timeout? Mongo or promise?
      setTimeout(async () => {
        expect(response.data[0].replies.length).toBe(1)
        expect(response.data[0].replies[0].replies.length).toBe(1)
        expect(response.data).toContainEqual(expected[1])
        expect(response.data).toContainEqual(expected[0])
        done()
      }, 100)
    })

    it('lista comentarios principales', async () => {
      const comment1 = makeFakeComment({ replyToId: null })
      const comment2 = makeFakeComment({
        postId: comment1.postId,
        replyToId: null
      })
      const comments = [comment1, comment2]
      const inserts = await Promise.all(comments.map(commentsDb.insert))
      const expected = [
        {
          ...comment1,
          replies: [],
          createdOn: inserts[0].createdOn
        },
        {
          ...comment2,
          replies: [],
          createdOn: inserts[1].createdOn
        }
      ]
      const response = await axios.get('/main-comments',)
      expect(response.data).toContainEqual(expected[0])
      expect(response.data).toContainEqual(expected[1])
      return comments.map(commentsDb.remove)
    })


  })


  //DELETE
  describe('borrar comentarios', () => {
    it('obligar borrado', async () => {
      const comment = makeFakeComment()
      await commentsDb.insert(comment)
      const result = await axios.delete(`/comments/${comment.id}`)
      expect(result.data.deleted.deletedCount).toBe(1)
      expect(result.data.deleted.softDelete).toBe(false)
    })
    it('borrado simple', async () => {
      const comment = makeFakeComment()
      const reply = makeFakeComment({ replyToId: comment.id })
      await commentsDb.insert(comment)
      await commentsDb.insert(reply)
      const result = await axios.delete(`/comments/${comment.id}`)
      expect(result.data.deleted.deletedCount).toBe(1)
      expect(result.data.deleted.softDelete).toBe(true)
    })
  })
})
